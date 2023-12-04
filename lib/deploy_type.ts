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

import { Construct } from "constructs";
import { isRepoConfig, parseRepositoryUrl } from "../bin/cli/utils/helper";
import { CfnOutput, Stack } from "aws-cdk-lib";
import { HostingConfiguration } from "../bin/cli/shared/types";
export class DeployType extends Construct {
  public readonly deployIdentifier: string;
  /**
   * Constructs a deployment stack based on the provided configuration.
   * Handles Git repository and S3 bucket deployment scenarios, setting up
   * deployment identifiers and CloudFormation outputs accordingly.
   * In case of incorrect configuration, logs an error and exits the process.
   *
   * @param stackConfig - Configuration object containing deployment details.
   */
  constructor(
    scope: Construct,
    id: string,
    hostingConfiguration: HostingConfiguration
  ) {
    //export function geteDeployIdentifier(stackConfig: IConfiguration) {
    super(scope, id);

    if (isRepoConfig(hostingConfiguration)) {
      const repoUrl = hostingConfiguration.repoUrl;
      const parsedUrl = parseRepositoryUrl(repoUrl as string);
      this.deployIdentifier = parsedUrl.repoOwner + " - " + parsedUrl.repoName + "-" + Stack.of(this).region;

      new CfnOutput(this, "Source", {
        value: hostingConfiguration.repoUrl,
      });
    } else if (hostingConfiguration.s3bucket) {
      this.deployIdentifier = hostingConfiguration.s3bucket;

      new CfnOutput(this, "Source", {
        value:
          hostingConfiguration.s3bucket + "/" + hostingConfiguration.s3path,
      });
    } else {
      console.log("Wrong configuration found. Exiting.");
      console.log(
        "Configuration found: " + JSON.stringify(hostingConfiguration)
      );
      process.exit(1);
    }
  }
}
