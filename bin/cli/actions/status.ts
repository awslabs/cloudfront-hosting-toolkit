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

import checkAWSConnection from "../utils/awsSDKUtil";
import { checkPipelineStatus } from "../utils/helper";

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
  
}
