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
  getSSMParameter,
} from "../utils/awsSDKUtil";
import * as AWS_CodePipeline from "@aws-sdk/client-codepipeline";
import { SSM_CONNECTION_ARN_STR, SSM_CONNECTION_NAME_STR } from "../shared/constants";
import { checkPipelineStatus } from "../utils/helper";
const clientCodePipeline = new AWS_CodePipeline.CodePipeline({});

/**
 * Retrieves the status of an AWS CodePipeline and displays the status of its stages.
 *
 * @async
 * @function getPipelineStatus
 * @throws {Error} Throws an error if there is a problem retrieving the pipeline state.
 */

export async function handleStatusCommand() {
  await checkAWSConnection();
  await checkPipelineStatus();
  
  /*const connectionArn = await getSSMParameter(SSM_CONNECTION_ARN_STR);
  const connectionName = await getSSMParameter(SSM_CONNECTION_NAME_STR);

  if (connectionArn && connectionName) {
    try {
      // Call the GetPipelineStateCommand with the pipeline name
      const response = await clientCodePipeline.getPipelineState({
        name: connectionArn,
      });

      // Extract the stage states from the response
      const stageStates = response.stageStates;
      console.log("stageStates="+JSON.stringify(stageStates));

      if (stageStates && stageStates.length > 0) {
        console.log(`\n\nDeployment pipeline (${connectionName}) status`);
        console.log("-----------------------------");
        // Create an array to hold all the table data
        const tableData: TableDataRow[] = [];

        type TableDataRow = {
          Stage: string;
          Status: string;
          "Last Status Change": string;
        };
        // Iterate over the stage states and get the status for each stage
        stageStates.forEach((stageState) => {
          const stageName = stageState.stageName;
          const stageStatus = stageState.latestExecution?.status;

          // Iterate over action states within the stage and display their lastStatusChange
          stageState.actionStates?.forEach((actionState) => {
            const lastStatusChange =
              actionState.latestExecution?.lastStatusChange !== undefined
                ? actionState.latestExecution?.lastStatusChange.toString()
                : "N/A";

            // Add each row as an object to the tableData array
            tableData.push({
              Stage: stageName || "N/A",
              Status: stageStatus || "N/A",
              "Last Status Change": lastStatusChange,
            });
          });
        });
        // Display the table with all the data after the loop is complete
        console.table(tableData);
      }
    } catch (error) {
      console.error("Error getting pipeline state:", error);
    }

    console.log("\n");
  }*/
}
