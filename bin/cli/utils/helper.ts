#!/usr/bin/env node
/*
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import * as path from "path";
import fs from "fs";

import { createWriteStream } from "fs";

const cliProgress = require("cli-progress");
const { spawn } = require("child_process");
const prompts = require("prompts");

import {
  FrontendFramework,
  PromptItems,
  HostingConfiguration,
  CommonAttributes,
} from "../shared/types";
import {
  BUILD_FILE_NAME,
  CFF_FILE_NAME,
  CONFIG_FILE_NAME,
  CONNECTION_STACK_NAME,
  DOMAIN_NAME_REGEX,
  ERROR_PREFIX,
  FRAMEWORKS,
  GITHUB_REGEX,
  MAIN_STACK_NAME,
  SSM_PIPELINENAME_STR,
  TOOL_NAME,
} from "../shared/constants";
import { getPipelineStatus, getSSMParameter } from "./awsSDKUtil";

const MAX_STACK_NAME_LENGTH = 128;
const MAX_PIPELINE_NAME_LENGTH = 100;
const MAX_BUILD_NAME_LENGTH = 150;
const MAX_ACTION_NAME_LENGTH = 100;

/**
 * Retrieves the absolute path of the current working directory.
 * @returns The absolute path of the current working directory as a string.
 */
export function getCLIExecutionFolder() {
  return process.cwd();
}

/**
 * Detects the root folder of the CDK project based on the presence of 'package.json'
 * and the 'name' property in the project's package.json file.
 * The function checks the current directory and the 'cloudfront-hosting-toolkit' subdirectory to find the project root.
 * @returns The path to the root folder of the CloudFront Pages CDK project, if found, or the absolute path to the current directory if not found.
 */
export function getCLIInstallationFolder(): string {
  return path.resolve(__dirname, "..", "..", "..");
}

/**
 * Retrieves the file path of the build configuration used to construct the website before deployment.
 * The function combines the current working directory path and the relevant file names to construct the path.
 * @returns The absolute file path of the build configuration used for website construction.
 */
export function getBuildConfigFilePath() {
  return path.join(getCLIExecutionFolder(), TOOL_NAME) + "/" + BUILD_FILE_NAME;
}

export function getCffConfigFilePath() {
  return path.join(getCLIExecutionFolder(), TOOL_NAME) + "/" + CFF_FILE_NAME;
}

/**
 * Retrieves the file path of the configuration file used for the deployment of the hosting infrastructure.
 * The function combines the current working directory path and the relevant file names to construct the path.
 * @returns The absolute file path of the deployment configuration file.
 */
export function getConfigFilePath() {
  return path.join(getCLIExecutionFolder(), TOOL_NAME) + "/" + CONFIG_FILE_NAME;
}

/**
 * Retrieves the absolute path of the folder where the hosting infrastructure tool is located.
 * The function combines the current working directory path and the name of the tool folder to construct the path.
 * @returns The absolute path of the hosting infrastructure tool folder.
 */
export function getToolFolder() {
  return path.join(getCLIExecutionFolder(), TOOL_NAME);
}

//return the folder where all the build configuration are stored: [CDK]/resources/build_config_templates
export function getBuildConfigTemplatesFolder() {
  return path.join(
    getCLIInstallationFolder(),
    "resources",
    "build_config_templates"
  );
}

export function getCffTemplatesFolder() {
  return path.join(
    getCLIInstallationFolder(),
    "resources",
    "cff_templates"
  );
}

export function getBuildConfigS3Folder() {
  return path.join(getCLIInstallationFolder(), "resources", "s3_trigger");
}

function getLogFilePath() {
  const now = new Date();
  const filename = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}_${now
    .getHours()
    .toString()
    .padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}-${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}.log`;
  return path.join(getCLIExecutionFolder(), TOOL_NAME) + "/" + filename;
}



/**
 * Calculates the main stack name based on the provided hosting configuration.
 * 
 * The stack name is generated using the following criteria:
 * - If the configuration corresponds to a repository, the stack name will be derived 
 *   from the repository's name and the branch name.
 * - If the configuration corresponds to an S3 bucket, the stack name will use the bucket's name.
 * 
 * The resultant stack name will:
 * - Begin with an alphabetic character.
 * - Contain only alphanumeric characters and hyphens.
 * - Be no longer than 128 characters.
 * - Not end with a hyphen.
 * 
 * @param hostingConfiguration - The hosting configuration from which to derive the stack name.
 * @returns A sanitized stack name conforming to the above criteria.
 * @throws {Error} Throws an error if the provided repository URL is invalid.
 */
export function calculateMainStackName(
  hostingConfiguration: HostingConfiguration
): string {
  let result: string;

  if (isRepoConfig(hostingConfiguration)) {
    const parsedUrl = parseRepositoryUrl(
      hostingConfiguration.repoUrl as string
    );
    const { repoName } = parsedUrl;
    result = MAIN_STACK_NAME + "-" + repoName + "-" + hostingConfiguration.branchName;
  } else {
    result = hostingConfiguration.s3bucket;
  }

  result =  cleanStackNameStr(result);



  return result;
}

/**
 * Constructs a main stack name based on repository owner, repository name, and branch name.
 * If the resulting stack name exceeds 128 characters, it truncates to fit within the limit.
 * The generated stack name:
 * - Begins with an alphabetic character.
 * - Contains only alphanumeric characters and hyphens.
 * - Is no longer than 128 characters.
 *
 * @param {string} repoOwner - The owner of the repository.
 * @param {string} repoName - The name of the repository.
 * @param {string} branchName - The name of the branch.
 * @returns {string} The sanitized stack name conforming to the criteria.
 */
export function calculateConnectionStackName(
  repoUrl: string,
  branchName: string
): string {

  const parsedUrl = parseRepositoryUrl(repoUrl);
  const { repoOwner, repoName } = parsedUrl;

  var desiredString = `${CONNECTION_STACK_NAME}-${repoName}-${branchName}-${repoOwner}`;

  return cleanStackNameStr(desiredString)

}


function cleanNameStr(stackName: string, maxLength: number) {
  var desiredString = stackName.replace(/[^a-zA-Z0-9]/g, "-");
  desiredString = truncateString(desiredString, maxLength);
  // Ensure it doesn't end with a hyphen after truncation
  while (desiredString.endsWith("-")) {
    desiredString = desiredString.substring(0, desiredString.length - 1);
  }

  // Ensure it starts with an alphabetic character by prepending 'A' if not.
  if (!/^[a-zA-Z]/.test(desiredString)) {
    desiredString = "A" + desiredString.substring(1);
  }

  return desiredString;
}

function cleanStackNameStr(stackName: string) {
  return cleanNameStr(stackName, MAX_STACK_NAME_LENGTH)
}

export function cleanPipelineNameStr(stackName: string) {
  return cleanNameStr(stackName, MAX_PIPELINE_NAME_LENGTH)
}
export function cleanBuildNameStr(stackName: string) {
  return cleanNameStr(stackName, MAX_BUILD_NAME_LENGTH)
}

export function cleanActionNameStr(stackName: string) {
  return cleanNameStr(stackName, MAX_ACTION_NAME_LENGTH)
}


export function calculateCodeStarConnectionStackName(
  repoUrl: string,
  branchName: string
): string {
  const MAX_CODE_STAR_CONNECTION_LENGTH = 32;
  const parsedUrl = parseRepositoryUrl(repoUrl);
  const { repoOwner, repoName } = parsedUrl;

  const desiredString = `${repoName}-${branchName}-${repoOwner}`;
  return truncateString(desiredString, MAX_CODE_STAR_CONNECTION_LENGTH);
}

/**
 * Parses the input repository URL to extract the repository owner and repository name.
 * The function supports both HTTPS and SSH GitHub repository URL formats.
 * @param url The repository URL to parse.
 * @returns An object with 'repoOwner' and 'repoName' properties if the URL matches the expected GitHub formats,
 */
export function parseRepositoryUrl(url: string): {
  repoOwner: string;
  repoName: string;
} {
  //github url parsing
  const regex =
    /^(https:\/\/github\.com\/([^/]+)\/([^/]+)\.git)|(git@github\.com:([^/]+)\/([^/]+)\.git)$/;
  const matches = url.match(regex);
  if (matches) {
    // HTTPS URL format
    if (matches[2] && matches[3]) {
      return { repoOwner: matches[2], repoName: matches[3] };
    }

    // SSH URL format
    if (matches[5] && matches[6]) {
      return { repoOwner: matches[5], repoName: matches[6] };
    }
  }
  console.log("Invalid repository URL format");
  process.exit(1);
  
}

export function getNiceFrameworkLabel<T>(key: string): T | string {
  return key in FRAMEWORKS ? FRAMEWORKS[key] : key;
}

/**
 * Retrieves a list of available hosting frameworks from the build_config_templates directory.
 * The function reads the hosting configuration template files with names starting with "hosting_" and ending with ".yml".
 * Each detected framework is added to a list as an object with 'title' and 'value' properties.
 * The 'title' represents the nice label for the framework, and the 'value' represents the framework name used internally.
 * The function also adds an "Exit" option to the list to allow users to exit the framework selection.
 * @returns An array of objects containing the available hosting frameworks, each with 'title' and 'value' properties.
 * If no frameworks are found, the array will be empty.
 */
export function frameworkList(): { title: string; value: string }[] {
  const filePathIn = path.resolve(getCLIInstallationFolder(), "resources");
  const inputFolder = path.join(filePathIn, "build_config_templates");

  const files = fs.readdirSync(inputFolder);
  const regex = /^hosting_(.*?)\.yml$/;

  const frameworkList: PromptItems[] = [];
  const fileNames = files
    .filter((file) => regex.test(file))
    .map((file) => file.match(regex)![1]);

  fileNames.forEach((name) => {
    frameworkList.push({ title: getNiceFrameworkLabel(name), value: name });
  });

  frameworkList.push({
    title: "None from the list, exit and add my own",
    value: "exit",
  });
  return frameworkList;
}

/**
 * Checks if the provided string is a valid GitHub URL.
 * @param url The string to be checked for validity as a GitHub URL.
 * @returns true if the input is a valid GitHub URL, false otherwise.
 */
export function isValidGithubUrl(url: string): boolean {
  return GITHUB_REGEX.test(url);
}

/**
 * Checks if the provided string is a valid domain name.
 * @param domainName The string to be checked for validity as a domain name.
 * @returns true if the input is a valid domain name, false otherwise.
 */
export function isValidDomainName(domainName: string): boolean {
  return DOMAIN_NAME_REGEX.test(domainName);
}

/**
 * Find the index of a given search string in an array of objects.
 * @param searchString The string to search for in the array.
 * @param existingConfig The array of objects to search through.
 * @returns The index of the first object in the array whose 'value' property contains the search string (case-insensitive).
 * If no match is found, returns 0.
 */
export function findIndex(
  searchString: string,
  existingConfig: { title: string; value: string }[]
): number {
  const match = existingConfig.find((item) =>
    item.value.toLowerCase().includes(searchString.toLowerCase())
  );
  return match ? existingConfig.indexOf(match) : 0;
}



/**
 * Retrieves the GitHub repository URL from the local git repository configuration at the specified folderPath.
 * The function reads the '.git/config' file in the repository to extract the remote repository URL.
 * @param folderPath The path to the local git repository folder where the '.git' directory is located.
 * @returns The GitHub repository URL (if found and valid) or an empty string if the URL cannot be detected or the repository is not a valid git repository.
 * The repository URL is extracted from the remote repository configuration in the '.git/config' file.
 */
export function getGitRemote(): string {
  try {
    const folderPath = process.cwd();
    const configPath = path.join(folderPath, ".git", "config");
    const config = fs.readFileSync(configPath, "utf8");
    const regex = /\[remote "(.*)"\]\s+url = (.*)/g;
    let match;

    while ((match = regex.exec(config)) !== null) {
      const remoteName = match[1];
      const remoteUrl = match[2];

      if (remoteUrl && isValidGithubUrl(remoteUrl)) {
        return remoteUrl;
      }
    }

    return "";
  } catch (e) {
    return "";
  }
}

/**
 * Retrieves the GitHub branch associated with the local git repository configuration at the specified folderPath.
 * The function reads the '.git/config' file in the repository to extract the remote branch information.
 * @param folderPath The path to the local git repository folder where the '.git' directory is located.
 * @returns The GitHub branch name (if found) or undefined if the branch cannot be detected or the repository is not a valid git repository.
 * The branch name is extracted from the remote branch configuration in the '.git/config' file.
 */
export function getGitBranch(): string {
  try {
    const folderPath = process.cwd();
    const configPath = path.join(folderPath, ".git", "config");
    const config = fs.readFileSync(configPath, "utf8");
    const regex = /\[branch "(.*)"\]\s+remote =.*\s+merge = (.*)/g;
    let match;

    while ((match = regex.exec(config)) !== null) {
      const branchName = match[1];
      const branchRef = match[2];

      if (branchRef && branchRef.startsWith("refs/heads/")) {
        return branchRef.replace("refs/heads/", "");
      }
    }

    return "main";
  } catch (e) {
    return "main";
  }
}

/**
 * Detects the frontend framework utilized by examining the package.json file at the specified packagePath.
 * The function checks the presence of specific scripts and dependencies related to known frontend frameworks.
 * @param packagePath The path to the directory containing the package.json file to analyze.
 * @returns A Promise that resolves with the detected frontend framework (if found) or undefined if no recognized framework is detected.
 * If the package.json file is not found, it indicates that no frontend framework is used, and the return value will be FrontendFramework.NONE.
 */
export async function detectFrontendFramework(
  packagePath: string
): Promise<string> {
  const items = fs.readdirSync(packagePath);
  const files = items.filter((item) => {
    const itemPath = path.join(packagePath, item);
    return fs.statSync(itemPath).isFile();
  });

  if (files.length === 0) {
    return ""; // No files in the folder
  }

  if (!files.includes("package.json")) {
    return FrontendFramework.BASIC;
  }

  const file = await fs.promises.readFile(`${packagePath}/package.json`);

  const packageJson = JSON.parse(file.toString());

  if (packageJson.scripts) {
    const scriptValues = Object.values(packageJson.scripts);
    if (
      scriptValues.some(
        (value: unknown) => typeof value == "string" && value.includes("vue")
      )
    ) {
      return FrontendFramework.VUE;
    }
    if (
      scriptValues.some(
        (value: unknown) => typeof value == "string" && value.includes("next")
      )
    ) {
      return FrontendFramework.NEXT;
    }

    if (
      scriptValues.some(
        (value: unknown) => typeof value == "string" && value.includes("ng")
      )
    ) {
      return FrontendFramework.ANGULAR;
    }

  }
  if (packageJson.dependencies) {
    if (
      "react" in packageJson.dependencies ||
      "react" in packageJson.devDependencies
    ) {
      return FrontendFramework.REACT;
    }
    if (
      "vue" in packageJson.dependencies ||
      "vue" in packageJson.devDependencies
    ) {
      return FrontendFramework.VUE;
    }
    if (
      "@angular/core" in packageJson.dependencies ||
      "@angular/core" in packageJson.devDependencies
    ) {
      return FrontendFramework.ANGULAR;
    }
  }
  return "";
}

/**
 * Reads and returns the configuration data from the build configuration file.
 * The build configuration file is expected to be in JSON format.
 * If the file is found and successfully read, its content is parsed and returned as an object.
 * If the file is not found or an error occurs during reading or parsing, an error message is logged, and the process exits with code 1.
 * @returns An object representing the configuration data read from the build configuration file.
 * @throws {Error} If the file is not found or cannot be read or parsed, an error is thrown.
 */
export function getConfigFileContent() {
  try {
    const rawConfigData = fs.readFileSync(getBuildConfigFilePath());
    console.error(`${getBuildConfigFilePath()} found `);
    return JSON.parse(rawConfigData.toString());
  } catch (e) {
    console.error(`${ERROR_PREFIX} ${getBuildConfigFilePath()} not found xx`);
    process.exit(1);
  }
}


/**

    Loads the hosting configuration from a specified file path.
    The function first attempts to require and load the configuration
    from the given file path. If the configuration file is not found,
    it proceeds without an error but with an empty configuration object.
    The function then validates the loaded configuration object to ensure
    that it contains the required properties for a valid HostingConfiguration.
    Specifically, a valid configuration must either have 'repoUrl', 'branchName',
    and 'framework' properties, or 's3bucket' and 's3path' properties.
    @returns {HostingConfiguration} The loaded and validated hosting configuration.
    @throws {Error} Throws an error if the configuration format is invalid.
    */
export const loadHostingConfiguration =
  async ( configFile?: string): Promise<HostingConfiguration> => {
    let config: Partial<HostingConfiguration> = {}; // Initialize an empty config object
    
    try {
      const pathToUse = configFile || getConfigFilePath();
      config = require(pathToUse);
    } catch (e) {
      console.error("Error", e);
      process.exit(1);
    }

    // Validate that the required properties for each HostingConfiguration shape are present
    if (
      ("repoUrl" in config &&
        "branchName" in config &&
        "framework" in config) ||
      ("s3bucket" in config && "s3path" in config)
    ) {
      // Return the loaded configuration as HostingConfiguration
      return config as HostingConfiguration;
    } else {
      throw new Error("Invalid configuration format."); // Handle invalid configuration format
    }
  };

export const doesHostingConfigurationFileExist = (): boolean => {
  const configFilePath = getConfigFilePath(); // Assuming getConfigFilePath() is a function you have defined elsewhere
  return fs.existsSync(configFilePath);
};

/**
 * Executes a command using the `spawn` function from the `child_process` module.
 * The command's progress and output are logged to a file and displayed as a progress bar.
 * @param command An object representing the command to be executed, containing `label` and `cmd` properties.
 * @param pwd The current working directory where the command should be executed.
 * @returns A Promise that resolves when the command is successfully executed, or rejects if it fails.
 * The function logs the command's output and progress to a file and displays a progress bar on the console.
 * If the command fails (exit code other than 0), an error is thrown with a detailed error message and the process exits with code 1.
 * The log file path is retrieved using `getLogFilePath()` function and is created or appended to as needed.
 * The progress bar is displayed using the `cli-progress` library.
 */
export async function executeCommands(
  cmd: String,
  pwd: string
): Promise<void> {
  const logFile = getLogFilePath();
  const outputStream = createWriteStream(logFile, { flags: "a" });
  const label = "Please wait ...";

  outputStream.write("══════════════════════\n");
  outputStream.write(`${cmd}\n\n\n`);
  outputStream.write("══════════════════════\n\n");

  var progressBar = new cliProgress.SingleBar(
    { format: `${label} | {bar} | {percentage}%` },
    cliProgress.Presets.shades_classic
  );
  progressBar.start(100, 0);
  const child = spawn(cmd, { shell: true, cwd: pwd });

  child.stdout.on("data", (data: any) => {
    outputStream.write(data);

    progressBar.increment(1);
    if (progressBar.value == 100) {
      progressBar.stop();
      progressBar = new cliProgress.SingleBar(
        { format: `${label} | {bar} | {percentage}%` },
        cliProgress.Presets.shades_classic
      );
      progressBar.start(100, 0);
    }
  });

  child.stderr.on("data", (data: any) => {
    outputStream.write(data);

    progressBar.increment(1);
    if (progressBar.value == 100) {
      progressBar.stop();
      progressBar = new cliProgress.SingleBar(
        { format: `${label} | {bar} | {percentage}%` },
        cliProgress.Presets.shades_classic
      );
      progressBar.start(100, 0);
    }
  });

  await new Promise<void>((resolve, reject) => {
    child.on("exit", (code: any) => {
      if (code !== 0) {
        reject(
          new Error(`Command ${cmd} failed with error code ${code}`)
        );

        console.error(
          `${ERROR_PREFIX} Command failed with error code ${code}.`
        );
        console.error(`Command: ${cmd}`);

        console.error(
          `A complete log of this run can be found in: ${logFile} \n\n`
        );
        process.exit(1);
      } else {
        progressBar.update(100);
        progressBar.stop();
        resolve();
      }
    });
  });

  outputStream.end();
}

/**
 * Checks if the given domain name starts with "www.".
 * @param domainName The domain name to check.
 * @returns A boolean value indicating whether the domainName starts with "www." (true) or not (false).
 */
function checkWWW(domainName: string): boolean {
  const regex = /^www\./;
  return regex.test(domainName);
}

/**
 * Generates an array of domain names with and without "www." based on the given domainName.
 * If the domainName starts with "www.", it returns an array with both the original domainName and the one without "www.".
 * If the domainName does not start with "www.", it returns an array with both the original domainName and the one with "www." added.
 * @param domainName The domain name to process.
 * @returns An array of strings containing the original domainName and an alternate version with "www." added or removed.
 */
export function getDomainNames(domainName: string): string[] {
  if (checkWWW(domainName)) {
    return [domainName, domainName.replace("www.", "")];
  } else {
    return [domainName, "www." + domainName];
  }
}



function truncateString(input: string, max_length: number): string {
  if (input.length <= max_length) {
    return input;
  }

  const truncatedString = input.slice(0, max_length);
  return truncatedString;
}

/**
 * Starts a prompt with cancellation handling.
 *
 * This function initiates a user prompt with the specified question and automatically
 * handles cancellation by exiting the Command-Line Interface (CLI) if the user cancels
 * the prompt. It is designed for use cases where graceful handling of cancellation
 * is desired.
 *
 * @param question The prompt question object to be displayed.
 * @returns A promise that resolves with the user's response to the prompt.
 */
export async function startPrompt(question: any) {
  console.log("\n");

  return prompts.prompt(question, {
    onCancel: (prompt: any) => {
      console.log("Exiting the Command-Line Interface (CLI).");
      process.exit(1);
    },
  });
}

export async function checkPipelineStatus() {
  let pipelineStatus;
  //console.log("\nChecking the status of the pipeline...\n");
  let displayInProgressMessage = true;
  var progressBar;
  do {
    pipelineStatus = await getPipelineStatus();

    if (pipelineStatus.status === "InProgress") {
      if (displayInProgressMessage) {
        console.log(
          "The pipeline is in progress, waiting for the pipeline to finish...\n"
        );
        displayInProgressMessage = false;
        progressBar = new cliProgress.SingleBar(
          { format: `Please wait ... | {bar} | {percentage}%` },
          cliProgress.Presets.shades_classic
        );
        progressBar.start(100, 0);
      }
      //console.log("Pipeline is still in progress. Checking again in 20 seconds...");
      progressBar.increment(1);
      if (progressBar.value == 100) {
        progressBar.stop();
        progressBar = new cliProgress.SingleBar(
          { format: `Please wait ... | {bar} | {percentage}%` },
          cliProgress.Presets.shades_classic
        );
        progressBar.start(100, 0);
      }

      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  } while (pipelineStatus.status === "InProgress");

  if(!displayInProgressMessage){
    progressBar.update(100);
    progressBar.stop();
  }
  

  if (pipelineStatus.status === "Failed") {
    const pipelineName = await getSSMParameter(SSM_PIPELINENAME_STR);

    console.log(`\n\n *** ERROR ***\n`);
    console.log(
      `\nThe pipeline execution encountered an error on the stage '${pipelineStatus.stageName}'.`
    );
    console.log(
      "To investigate and resolve the issue, please follow these steps:\n"
    );

    console.log("A. Explore our troubleshooting section https://github.com/awslabs/cloudfront-hosting-toolkit/blob/main/docs/troubleshooting.md\n\n");
    console.log("B. Inspect the pipeline execution details\n");
    console.log("   1. Visit the AWS Management Console.");
    console.log("   2. Navigate to AWS CodePipeline.");
    console.log(`   3. Select the "${pipelineName}" pipeline.`);
    console.log(
      "   4. Inspect the pipeline execution details and logs for error messages."
    );
    console.log("   5. Take the necessary actions to address the error.");
    console.log(
      "   6. Once resolved, you can trigger a new pipeline execution by choosing 'Release change' on the AWS Console. \n\n"
    );

    // You can add additional actions here if needed.
  } else {
    console.log(
      "Current pipeline status: " +
        pipelineStatus.status
    );
    // Now you can handle the non-InProgress status here.
  }
}

export function isRepoConfig(
  config: HostingConfiguration
): config is {
  repoUrl: string;
  branchName: string;
  framework: string;
} & CommonAttributes {
  return "repoUrl" in config && "branchName" in config && "framework" in config;
}

// Type guard for the S3 configuration
export function isS3Config(
  config: HostingConfiguration
): config is { s3bucket: string; s3path: string } & CommonAttributes {
  return "s3bucket" in config && "s3path" in config;
}


export function isValidBucketName(bucketName: string): boolean | string {
  const bucketNamePattern = /^[a-z0-9.-]+$/;
  const minLength = 3;
  const maxLength = 63;

  if (
    bucketName.length < minLength ||
    bucketName.length > maxLength ||
    !bucketName.match(bucketNamePattern) ||
    !bucketName.match(/^[a-z0-9]/) || // Must start with a letter or number
    !bucketName.match(/[a-z0-9]$/) || // Must end with a letter or number
    bucketName.includes('..') || // Must not contain two adjacent periods
    bucketName.match(/^\d+\.\d+\.\d+\.\d+$/) || // Must not be an IP address
    bucketName.startsWith('xn--') || // Must not start with the prefix xn--
    bucketName.startsWith('sthree-') || // Must not start with the prefix sthree-
    bucketName.startsWith('sthree-configurator') || // Must not start with the prefix sthree-configurator
    bucketName.endsWith('-s3alias') || // Must not end with -s3alias
    bucketName.endsWith('--ol-s3') // Must not end with --ol-s3
  ) {
    return 'Invalid bucket name';
  }

  return true;
}

export function validateNoLeadingTrailingSlashes(inputString: string) {
  // Regular expression to match strings that start or end with a slash
  const regex = /^\/|\/$/g;

  // Test the input string against the regex
  return !regex.test(inputString);
}