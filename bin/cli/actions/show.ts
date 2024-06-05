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

import checkAWSConnection, {
  checkCFCNAMEExists,
  checkCertificateExists,
  getSSMParameter,
} from "../utils/awsSDKUtil";
import { IHosting } from "../shared/types";
import { SSM_DOMAIN_STR } from "../shared/constants";
import { isRepoConfig, loadHostingConfiguration } from "../utils/helper";

/**
 * Display the Source and Domain Name of the currently deployed infrastructure.
 * It first checks the AWS connection, then retrieves the details of the hosting configuration.
 * If a hosting configuration exists, it prints the Source and its associated Domain Name.
 * If no hosting configuration is found, it informs the user that there is no domain name available
 * as no infrastructure has been deployed yet.
 */
export async function handleShowCommand() {
  await checkAWSConnection();
  const hostingConfiguration = await loadHostingConfiguration();
  const domainName = await getSSMParameter(SSM_DOMAIN_STR);
  if (domainName) {
    console.log(
      "\nThe Origin paired with its associated CloudFront domain name:\n"
    );

    if (isRepoConfig(hostingConfiguration)) {

      console.log(
        `Code Repository: ${hostingConfiguration.repoUrl}/${hostingConfiguration.branchName} -->  Hosting: https://${domainName}\n`
      );
    } else {
      console.log(
        `S3 Source Code: ${hostingConfiguration.s3bucket}/${hostingConfiguration.s3path} -->  Hosting: https://${domainName}\n`
      );
    }

    if (hostingConfiguration.domainName) {
      let { certificateArn, status } = await checkCertificateExists(
        hostingConfiguration.domainName
      );
      if (certificateArn && status == "ISSUED") {
        if (hostingConfiguration.hostedZoneId) {
          const cFCNAMEExists = await checkCFCNAMEExists(
            hostingConfiguration.domainName,
            domainName,
            hostingConfiguration.hostedZoneId
          );
          if (cFCNAMEExists) {
            console.log(
              `${hostingConfiguration.domainName} -->  Hosting: ${domainName} \n`
            );
          }
        } else {
          console.log(
            `${hostingConfiguration.domainName} -->  Hosting: ${domainName} \n`
          );
        }
      }
    }
  } else {
    console.log(
      "\nAt the moment, there is no hosting infrastructure deployed.\n"
    );
    process.exit(0);
  }
  
}
