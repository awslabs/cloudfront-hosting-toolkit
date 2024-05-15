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

import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { HostingStack } from "../lib/hosting_stack";
import { RepositoryStack } from "../lib/repository_stack";

import * as path from "path";
import {
  BUILD_FILE_NAME,
  CONFIG_FILE_NAME,
  CFF_FILE_NAME,
  TOOL_NAME,
} from "./cli/shared/constants";
import { AwsSolutionsChecks } from "cdk-nag";
import { Aspects } from "aws-cdk-lib";
import { calculateConnectionStackName, calculateMainStackName, isRepoConfig, loadHostingConfiguration } from "./cli/utils/helper";

const app = new App();

//Aspects.of(app).add(new AwsSolutionsChecks());

(async () => {
  var configFilePath, configFile, certificateArn;

  if (app.node.tryGetContext("config-path")) {
    configFilePath = app.node.tryGetContext("config-path");
  }
   else {
    configFilePath = path.join(__dirname, "..", TOOL_NAME);
  }

  
  if (app.node.tryGetContext("certificate-arn")) {
    certificateArn = app.node.tryGetContext("certificate-arn");
  }

  configFile = configFilePath + "/" + CONFIG_FILE_NAME;

  const hostingConfiguration = await loadHostingConfiguration(configFile);

  const buildFilePath = configFilePath + "/" + BUILD_FILE_NAME;

  const cffSourceFilePath = configFilePath + "/" + CFF_FILE_NAME;

  var connectionStack;

  const mainStackName = calculateMainStackName(hostingConfiguration);

  if (isRepoConfig(hostingConfiguration)) {

    const connectionStackName = calculateConnectionStackName(hostingConfiguration.repoUrl, hostingConfiguration.branchName!);

    connectionStack = new RepositoryStack(
      app,
      connectionStackName,
      hostingConfiguration,
      {
        description: 'Cloudfront Hosting Toolkit Repository Stack',
        env: {
          region: process.env.CDK_DEFAULT_REGION,
          account: process.env.CDK_DEFAULT_ACCOUNT,
        },
      }
    );
  }

  new HostingStack(
    app,
    mainStackName,
    {
      connectionArn: connectionStack?.repositoryConnection.connectionArn,
      hostingConfiguration: hostingConfiguration,
      buildFilePath: buildFilePath,
      cffSourceFilePath: cffSourceFilePath,
      certificateArn: certificateArn,
    },
    {
      description: 'Cloudfront Hosting Toolkit Hosting Stack (uksb-1tupboc37)',
      env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
      },
      crossRegionReferences: true,
    }
  );
})();
