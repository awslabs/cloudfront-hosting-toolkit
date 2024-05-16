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

const { SSM } = require("@aws-sdk/client-ssm");
const ssm = new SSM();
const { CodePipeline } = require("@aws-sdk/client-codepipeline");
const codepipeline = new CodePipeline();

exports.handler = async (event, context) => {
    console.log('event is 👉', JSON.stringify(event, null, 4));
    const key = event.detail.object.key;

    const parts = key.split("/");
    const file_name_parts = parts[parts.length - 1].split(".").slice(0, -1);
    const commitId = file_name_parts.join(".");
    console.log("commitId="+commitId);

    const ssmCommitIdName = process.env.SSM_PARAM_COMMITID;
    const ssms3KeyName = process.env.SSM_PARAM_S3_KEY;
    await setSsmParameter(ssmCommitIdName, commitId);
    await setSsmParameter(ssms3KeyName, key);
    await startPipeline(process.env.PIPELINE_NAME);

    return {
      body: JSON.stringify({message: 'Success!'}),
      statusCode: 200,
    };
  }

async function setSsmParameter (paramName, paramValue){
    const params = {
        Name: paramName,
        Value: paramValue,
        Type: "String",
        Overwrite: true
      };

      try {
        await ssm.putParameter(params);
        console.log(`Parameter ${paramName} set to ${paramValue}`);
      } catch (err) {
        console.log(`Error setting parameter ${paramName}: ${err}`);
        throw err;
      }

}


async function startPipeline(pipelineName) {

    const params = {
        name: pipelineName
    };

    try {
        await codepipeline.startPipelineExecution(params);
        console.log(`Pipeline ${pipelineName} started`);
    } catch (err) {
        console.log(`Error starting pipeline ${pipelineName}: ${err}`);
        throw err;
    }

}
