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

import fs from "fs";

import {
  getFrameworkSelectionQuestions,
  domainNameDetailsQuestions,
  getGithubRepositoryQuestions,
  getS3BucketConfigurationQuestions,
  getDomainNameQuestion,
  hostedZoneIdQuestion,
} from "../utils/prompt_questions";

import {
  getCLIExecutionFolder,
  getToolFolder,
  getConfigFilePath,
  getBuildConfigFilePath,
  getBuildConfigTemplatesFolder,
  startPrompt,
  loadHostingConfiguration,
  isRepoConfig,
  isS3Config,
  getGitRemote,
  getGitBranch,
  doesHostingConfigurationFileExist,
  detectFrontendFramework,
  getCffTemplatesFolder,
  getCffConfigFilePath,
} from "../utils/helper";
import { CONFIG_FILE_NAME, TOOL_NAME } from "../shared/constants";
import { HostingConfiguration } from "../shared/types";

export default async function handleInitCommand(s3: boolean) {
  s3 ? await init_s3() : await init_repository();
}

export async function init_repository() {
  console.log(
    "\n--------------------- Static hosting configuration wizard : GitHub Source Code Repository Based -------------------\n"
  );

  let currentHostingConfig: HostingConfiguration = {
    repoUrl: "",
    branchName: "",
    framework: "",
    domainName: undefined,
    hostedZoneId: undefined,
  };

  if (doesHostingConfigurationFileExist()) {
    const loadedConfig = await loadHostingConfiguration();

    if (isRepoConfig(loadedConfig)) {
      currentHostingConfig = loadedConfig;
    }
  }

  console.log(
    `\n\n To facilitate the deployment of the necessary infrastructure for website hosting, certain information is required.\n ${TOOL_NAME} will aim to find as much relevant data as possible.\n\n`
  );

  let identifiedRepositoryUrl: string,
    identifiedBranchName: string,
    identifiedFrameworkName: string;

  //check github configuration
  console.log(
    "Collecting information about the GitHub repository from " +
      getCLIExecutionFolder()
  );
  identifiedRepositoryUrl = getGitRemote();

  identifiedBranchName = getGitBranch();

  const repoQuestions = await startPrompt(
    getGithubRepositoryQuestions(
      currentHostingConfig.repoUrl
        ? currentHostingConfig.repoUrl
        : identifiedRepositoryUrl,
      currentHostingConfig.branchName
        ? currentHostingConfig.branchName
        : identifiedBranchName
    )
  );

  console.log(
    "\nCollecting information about the frontend framework used to enable the provision of the appropriate build configuration."
  );
  identifiedFrameworkName = await detectFrontendFramework(
    getCLIExecutionFolder()
  );


     

  const frameworkSelection = await startPrompt(
    getFrameworkSelectionQuestions(
      currentHostingConfig.framework
        ? currentHostingConfig.framework
        : identifiedFrameworkName
    )
  );

  const repositoryUrl = repoQuestions.repoUrl;
  const branchName = repoQuestions.branchName;
  const frameworkName = frameworkSelection.framework;

  console.log("\n");
  const { domainName, hostedZoneId } = await getUserDomainPreference(
    currentHostingConfig
  );

  console.log("\n----------------------------------------------------");
  console.log(
    `Here is the configuration that has been generated and saved to ${TOOL_NAME}/${CONFIG_FILE_NAME} file.:`
  );
  console.log(">       GitHub repository: " + repositoryUrl + "/" + branchName);
  console.log(">       Framework: " + frameworkName);
  console.log(">       Domain name: " + (domainName ? domainName : "No"));
  console.log(hostedZoneId ? ">       Hosted zone ID: " + hostedZoneId : "");

  console.log("\n--");

  copyBuildConfigIfNotExists("hosting_" + frameworkName + ".yml");
  copyCffIfNotExists("index_" + frameworkName + ".js")


  const newHostingConfiguration: HostingConfiguration = {
    repoUrl: repositoryUrl,
    branchName: branchName,
    framework: frameworkName,
    ...(domainName ? { domainName } : {}),
    ...(hostedZoneId ? { hostedZoneId } : {}),
  };

  saveAndLogConfiguration(newHostingConfiguration);
}

export function saveAndLogConfiguration(
  newHostingConfiguration: HostingConfiguration
): void {
  const jsonHostingConfiguration = JSON.stringify(
    newHostingConfiguration,
    null,
    2
  );

  fs.writeFileSync(getConfigFilePath(), jsonHostingConfiguration);

  console.log(`>       Configuration file generated ${getConfigFilePath()}`);
  console.log(
    `>       Build configuration generated ${getBuildConfigFilePath()}`
  );
  console.log(
    `>       CloudFront Function source code generated ${getCffConfigFilePath()}`
  );

  console.log(
    `\n\nThe initialization process has been completed. You may now execute '${TOOL_NAME} deploy' to deploy the infrastructure.\n`
  );

  
}

export async function init_s3() {
  console.log(
    "\n--------------------- Static hosting configuration wizard: S3 Source Code Repository Based -------------------\n"
  );
  let currentHostingConfig: HostingConfiguration = {
    s3bucket: "",
    s3path: "",
    domainName: undefined,
    hostedZoneId: undefined,
  };

  if (doesHostingConfigurationFileExist()) {
    const loadedConfig = await loadHostingConfiguration();

    if (isS3Config(loadedConfig)) {
      currentHostingConfig = loadedConfig;
    }
  }

  const s3questions = await startPrompt(
    getS3BucketConfigurationQuestions(
      currentHostingConfig.s3bucket,
      currentHostingConfig.s3path
    )
  );

  const { domainName, hostedZoneId } = await getUserDomainPreference(
    currentHostingConfig
  );

  console.log("\n----------------------------------------------------");
  console.log("Please review the following captured information:");
  console.log(">       S3 Bucket: " + s3questions.s3bucket);
  console.log(">       S3 Prefix: " + s3questions.s3path);
  console.log(">       Domain name: " + (domainName ? domainName : "No"));
  console.log(hostedZoneId ? ">       Hosted zone ID: " + hostedZoneId : "");

  console.log("\n--");

  copyBuildConfigIfNotExists("s3_build_config.yml");
  copyCffIfNotExists("index_basic.js")

  const newHostingConfiguration: HostingConfiguration = {
    s3bucket: s3questions.s3bucket,
    s3path: s3questions.s3path,
    ...(domainName ? { domainName } : {}),
    ...(hostedZoneId ? { hostedZoneId } : {}),
  };

  saveAndLogConfiguration(newHostingConfiguration);
}

/**
 * Copies a build configuration template to the tool folder if it does not already exist.
 *
 * @param frameworkName - The name of the framework to determine the source build configuration file.
 */
export function copyBuildConfigIfNotExists(fileName: string): void {
  const srcBuildConfigFile: string =
    getBuildConfigTemplatesFolder() + "/" + fileName;

  if (!fs.existsSync(getToolFolder())) {
    fs.mkdirSync(getToolFolder());
  }

  if (!fs.existsSync(getBuildConfigFilePath())) {
    fs.copyFileSync(srcBuildConfigFile, getBuildConfigFilePath());
  }
}

export function copyCffIfNotExists(fileName: string): void {

  const srcBuildConfigFile: string =
    getCffTemplatesFolder() + "/" + fileName;

  if (!fs.existsSync(getToolFolder())) {
    fs.mkdirSync(getToolFolder());
  }

  if (!fs.existsSync(getCffConfigFilePath())) {
    fs.copyFileSync(srcBuildConfigFile, getCffConfigFilePath());
  }
}

export async function getUserDomainPreference(
  currentHostingConfig: HostingConfiguration
) {
  const withDomainName = await startPrompt(
    getDomainNameQuestion(currentHostingConfig.domainName)
  );

  if (withDomainName.value === "yes") {
    const domainNamePrompt = await startPrompt(
      domainNameDetailsQuestions(currentHostingConfig.domainName)
    );

    if (domainNamePrompt.registrar === "current") {
      const hostedZone = await startPrompt(
        hostedZoneIdQuestion(currentHostingConfig.hostedZoneId)
      );

      return {
        domainName: domainNamePrompt.domainName,
        hostedZoneId: hostedZone.hostedZoneId,
      };
    } else {
      return {
        domainName: domainNamePrompt.domainName,
        hostedZoneId: undefined,
      };
    }
  } else {
    return {
      domainName: undefined,
      hostedZoneId: undefined,
    };
  }
}
