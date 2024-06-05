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

import {
  startPrompt,
  executeCommands,
  getBuildConfigS3Folder,
  getCLIInstallationFolder,
  getCLIExecutionFolder,
  checkPipelineStatus,
  loadHostingConfiguration,
  isRepoConfig,
  isS3Config,
  calculateConnectionStackName,
  calculateMainStackName,
} from "../utils/helper";
import checkAWSConnection, {
  checkBucketExists,
  checkCertificateExists,
  checkCFCNAMEExists,
  createACMCertificate,
  createCFCNAME,
  getPipelineStatus,
  getSSMParameter,
  pendingConnections,
  startPipelineExecution,
  waitCertificateToBeIssued,
} from "../utils/awsSDKUtil";
import fs from "fs";
import {
  BUILD_FILE_NAME,
  CONFIG_FILE_NAME,
  ERROR_PREFIX,
  SSM_CONNECTION_NAME_STR,
  SSM_CONNECTION_REGION_STR,
  SSM_DOMAIN_STR,
  SSM_PIPELINENAME_STR,
  TOOL_NAME,
} from "../shared/constants";
import {
  cloudFrontAssociationQuestion,
  continueConfirmationQuestion,
} from "../utils/prompt_questions";
const AdmZip = require("adm-zip");

interface Command {
  label: string;
  cmd: any;
}


export default async function handleDeployCommand() {
  await checkAWSConnection();

  const configFile = process.cwd() + "/" + TOOL_NAME + "/" + CONFIG_FILE_NAME;
  const buildFile = process.cwd() + "/" + TOOL_NAME + "/" + BUILD_FILE_NAME;

  if (!fs.existsSync(configFile) || !fs.existsSync(buildFile)) {
    console.error(
      `${ERROR_PREFIX} Oops. It appears that you haven't executed the "${TOOL_NAME} init" command, resulting in the absence of any configuration files:`
    );
    console.error(`>       ${configFile}`);
    console.error(`>       ${buildFile}`);
    console.log(`\nPlease run '${TOOL_NAME} init' first.\n`);
    process.exit(1);
  }

  var counter = 1;
  const hostingConfiguration = await loadHostingConfiguration();

  var certificateArnCmdParam = "";
  if (hostingConfiguration.domainName) {
    console.log(
      `\n --> ${counter++}. Setting up a SSL/TLS certificate with AWS Certificate Manager (ACM) \n`
    );

    let { certificateArn, status } = await checkCertificateExists(
      hostingConfiguration.domainName
    );
      console.log("status="+status)
    if (!certificateArn) {
      certificateArn = await createACMCertificate(
        hostingConfiguration.domainName
      );

      if (certificateArn) {
        await waitCertificateToBeIssued(
          certificateArn,
          hostingConfiguration.hostedZoneId
        );
      }
    } else {
      console.log("The certificate for this domain has already been created. ");

      if (status != "ISSUED") {
        console.log("Certificate is not ready to be used. Waiting ...");
        await waitCertificateToBeIssued(
          certificateArn,
          hostingConfiguration.hostedZoneId
        );
      } else {
        console.log("\nThe certificate is ready to be used.");
      }
    }

    certificateArnCmdParam = `--context certificate-arn=${certificateArn}`;
  }

  console.log(`\n --> ${counter++}. Bootstrapping your AWS account \n`);
  const configFilePath = getCLIExecutionFolder() + "/" + TOOL_NAME;

  const bootstrapCmd =`npx cdk bootstrap --context config-path=${configFilePath} ${certificateArnCmdParam}`;
  await executeCommands(bootstrapCmd, getCLIInstallationFolder());

  if (isRepoConfig(hostingConfiguration)) {
    console.log(
      `\n --> ${counter++}. Create resources for connecting your AWS account to your GitHub repository. \n`
    );
    const createConnectionCmd= `npx cdk deploy  ${calculateConnectionStackName(
        hostingConfiguration.repoUrl,
        hostingConfiguration.branchName
      )} --context config-path=${configFilePath}  ${certificateArnCmdParam} `;
    await executeCommands(createConnectionCmd, getCLIInstallationFolder());

    const getPendingConnections = await pendingConnections();

    if (getPendingConnections) {
      //there are connection in PENDING STATE, wait for the user to validate them
      await connection_prompt(counter++);
    }
    
  } else if (isS3Config(hostingConfiguration)) {
    //check if the S3 bucket exists
    const bucketExists = await checkBucketExists(hostingConfiguration.s3bucket);
    if (!bucketExists) {
      console.error(
        `\n${ERROR_PREFIX} The specified bucket '${hostingConfiguration.s3bucket}' doesn't exist in the current region. Please rerun '${TOOL_NAME} init' or create a bucket with that name in the current region.\n`
      );
      process.exit(1);
    }
  } else {
    console.error(
      `${ERROR_PREFIX} Exiting due to an invalid configuration file.`
    );
    process.exit(1);
  }

  console.log(
    `\n --> ${counter++}. Deploy the hosting infrastructure within your AWS account \n`
  );

  console.log(
    "Please wait while deploying the infrastructure, it may take a few minutes."
  );

  const createInfrastructureCmd = `npx cdk deploy ${calculateMainStackName(
      hostingConfiguration
    )}  --context config-path=${configFilePath} --require-approval never ${certificateArnCmdParam}`;
  await executeCommands(createInfrastructureCmd, getCLIInstallationFolder());
  console.log(
    "\n_____________________________________________________________________\n"
  );

  const domainName = await getSSMParameter(SSM_DOMAIN_STR);
  const pipelineName = await getSSMParameter(SSM_PIPELINENAME_STR);

  if (domainName) {
    console.log(
      "\nThe Origin paired with its associated CloudFront domain name:\n"
    );
    console.log(
      `>       ${
        isRepoConfig(hostingConfiguration)
          ? "Code Repository"
          : "S3 Source Code"
      }: ${
        isRepoConfig(hostingConfiguration)
          ? hostingConfiguration.repoUrl
          : hostingConfiguration.s3bucket + "/" + hostingConfiguration.s3path
      }`
    );

    console.log(`>       Hosting: https://${domainName} \n`);

    if (hostingConfiguration.domainName) {
      if (hostingConfiguration.hostedZoneId) {
        const cFCNAMEExists = await checkCFCNAMEExists(
          hostingConfiguration.domainName,
          domainName.substring(8),
          hostingConfiguration.hostedZoneId
        );

        if (!cFCNAMEExists) {
          const associate = await startPrompt(cloudFrontAssociationQuestion);
          if (associate.value == "yes") {
            await createCFCNAME(
              hostingConfiguration.domainName,
              domainName.substring(8),
              hostingConfiguration.hostedZoneId
            );
          }
        } else {
          console.log(
            `>       Domain name '${hostingConfiguration.domainName}' is already associated with the CloudFront distribution.\n`
          );
        }

        console.log(
          `>       ${hostingConfiguration.domainName} --> https://${domainName} \n`
        );
      } else {
        console.log(
          `\nJust a few more steps to get your domain name up and running!`
        );
        console.log(
          `\nTo make your domain name point to your CloudFront distribution, you need to configure a CNAME entry in the authoritative DNS server of your domain. This is a simple process that usually takes just a few minutes.`
        );
        console.log("Here's what you need to do:");

        console.log(">       Log in to your DNS provider.");
        console.log(">       Find the section for creating new DNS records.");
        console.log(
          ">       Create a new CNAME record with the following information:"
        );
        console.log(
          `>           Host name: ${hostingConfiguration.domainName}`
        );
        console.log(`>           Target: ${domainName.substring(8)}`);
        console.log(">       Save your changes.");

        console.log("\n");
        console.log(
          ">       That's it! Once you've saved your changes, your domain name will start pointing to your CloudFront distribution."
        );
        console.log("\n\n");
      }
    }
    if (isRepoConfig(hostingConfiguration)) {
      console.log(
        "\nIn the future, whenever you push changes to Github, an automatic pipeline will be triggered to deploy the new version."
      );
    } else {
      console.log(
        "\nIn the future, whenever you upload a zip file to the designated S3 Bucket, an automated process will be initiated to deploy the latest version."
      );
    }

    console.log(
      "\n_____________________________________________________________________\n\n"
    );

    console.log(
      "The hosting infrastructure for your project has been successfully deployed on your AWS account"
    );
    console.log("\n");

    console.log(
      "The deployment consists of the following AWS CloudFormation stack(s):"
    );
    if (isRepoConfig(hostingConfiguration)) {
      console.log(
        `>           ${calculateConnectionStackName(
          hostingConfiguration.repoUrl,
          hostingConfiguration.branchName
        )}`
      );
    }
    console.log(`>           ${calculateMainStackName(hostingConfiguration)}\n`);

    console.log(
      `The following AWS CodePipeline has been created for automatic deployment upon Git push execution:`
    );
    console.log(`>           ${pipelineName}\n`);

    console.log(
      "You can review the resources deployed by logging into the AWS Management Console at https://aws.amazon.com/console \n"
    );
    await startPipelineExecution();
    await checkPipelineStatus();
  } else {
    console.error(
      `${ERROR_PREFIX} No domain names available due to missing information in SSM.`
    );
    process.exit(1);
  }
}

async function connection_prompt(counter: number) {
  const connectionRegion = await getSSMParameter(SSM_CONNECTION_REGION_STR);
  const connectionName = await getSSMParameter(SSM_CONNECTION_NAME_STR);

  console.log(`\n --> ${counter}. Configure github connection\n`);

  console.log(
    "You need to complete Github authentication using the AWS Console."
  );
  console.log("To do so, follow these steps:\n");
  console.log(" 1. Open the following page: ");
  console.log(
    "    https://" +
      connectionRegion +
      ".console.aws.amazon.com/codesuite/settings/connections"
  );

  console.log(
    " 2. In the connection list, look out for connection name: " +
      connectionName
  );
  console.log(
    " 3. For this connection with Status=Pending, complete the connection by following these instructions:"
  );
  console.log("     - Select the pending connection  " + connectionName + ".");
  console.log("     - Click on Update a pending connection.");
  console.log(
    "     - In the new popup window, under Github apps, choose an app installation, or create a new app by selecting Install a new app."
  );
  console.log(
    "     - If you have already installed an app, select the app, click on Connect, and refresh the page if needed. The status of the connection should be Available."
  );
  console.log(
    "     - If you choose to Install a new app, follow the on-screen instructions to authenticate your Github account, click on Connect, and refresh the page if needed. The status of the connection should be Available."
  );
  console.log("\n");

  await startPrompt(continueConfirmationQuestion);
}
