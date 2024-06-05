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
  getToolFolder,
  getCLIInstallationFolder,
  loadHostingConfiguration,
} from "../utils/helper";
import { CDKCommand} from "../shared/types";
import { hostingInfrastructureDeletionConfirmation } from "../utils/prompt_questions";
import checkAWSConnection, {
  checkCertificateExists,
  checkCFCNAMEExists,
  deleteACMCertificate,
  deleteCFCNAME,
  getSSMParameter,
} from "../utils/awsSDKUtil";
import { SSM_DOMAIN_STR } from "../shared/constants";

export async function handleDeleteCommand() {
  await checkAWSConnection();

  var counter = 1;
  const confirm = await startPrompt(hostingInfrastructureDeletionConfirmation);
  if (confirm.value == "exit") {
    process.exit(0);
  }

  var certificateArnCmdParam = "";
  var certificateArn;
  const hostingConfiguration = await loadHostingConfiguration();


  if (hostingConfiguration.domainName) {
    const certificateInfo = await checkCertificateExists(hostingConfiguration.domainName);
    certificateArn = certificateInfo.certificateArn;
    if (certificateArn) {
      certificateArnCmdParam = `--context certificate-arn=${certificateArn}`;
    }
  }

  console.log(`\n --> ${counter++}. Deleting the hosting infrastructure \n`);

  console.log(
    "Please wait while deleting the infrastructure, it may take a few minutes."
  );
  const deleteCmd= `npx cdk destroy --all --force --context config-path=${getToolFolder()} ${certificateArnCmdParam}`;

  await executeCommands(deleteCmd, getCLIInstallationFolder());

  if (hostingConfiguration.domainName && hostingConfiguration.hostedZoneId) {
    const domainName = await getSSMParameter(SSM_DOMAIN_STR);

    if(domainName){
      const cFCNAMEExists = await checkCFCNAMEExists(
        hostingConfiguration.domainName,
        domainName,
        hostingConfiguration.hostedZoneId
      );
      if (cFCNAMEExists) {
        console.log(
          `\n --> ${counter++}. Removing entries from the Route53 Hosted Zone \n`
        );
  
        await deleteCFCNAME(
          hostingConfiguration.domainName,
          domainName,
          hostingConfiguration.hostedZoneId
        );
      }
    }
    
  }

  if (certificateArn) {
    console.log(
      `\n --> ${counter++}. Deleting the SSL/TLS certificate from AWS Certificate Manager (ACM)\n`
    );

    await deleteACMCertificate(certificateArn);
  }

  console.log(
    "\nThe hosting infrastructure has been completely removed from your AWS account."
  );
}
