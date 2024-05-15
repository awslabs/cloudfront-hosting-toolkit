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
import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { PutParameterCommandInput, SSM } from "@aws-sdk/client-ssm";
import { CodePipeline } from "@aws-sdk/client-codepipeline";
import { LogLevel } from "@aws-lambda-powertools/logger/lib/types";

const logger = new Logger({
  logLevel: process.env.POWERTOOLS_LOG_LEVEL as LogLevel,
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
});

const tracer = new Tracer({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
});

const ssm = tracer.captureAWSv3Client(new SSM());
const codepipeline = tracer.captureAWSv3Client(new CodePipeline());

export const handler = async (event: any): Promise<any> => {
  logger.info("Incoming Request:", { event });
  try {
    const key = event.detail.object.key;

    const parts = key.split("/");
    const file_name_parts = parts[parts.length - 1].split(".").slice(0, -1);
    const commitId = file_name_parts.join(".");
    logger.debug("commitId", commitId);

    const ssmCommitIdName = process.env.SSM_PARAM_COMMITID;
    const ssms3KeyName = process.env.SSM_PARAM_S3_KEY;
    const pipelineName = process.env.PIPELINE_NAME;

    if (!ssmCommitIdName || !ssms3KeyName || !pipelineName) {
      logger.error("SSM parameters not set");
      throw new Error("SSM parameters not set");
    }
    await setSsmParameter(ssmCommitIdName, commitId);
    await setSsmParameter(ssms3KeyName, key);
    await startPipeline(pipelineName);

    logger.debug("Successfuly started the pipeline");
  } catch (err) {
    logger.error(`Error`, err as Error);
    throw err;
  }
};

async function setSsmParameter(paramName: string, paramValue: string) {
  const params: PutParameterCommandInput = {
    Name: paramName,
    Value: paramValue,
    Type: "String",
    Overwrite: true,
  };

  try {
    await ssm.putParameter(params);
    logger.debug(`Parameter ${paramName} set to ${paramValue}`);
  } catch (err) {
    logger.error(`Error setting parameter ${paramName}`, err as Error);
    throw err;
  }
}

async function startPipeline(pipelineName: string) {
  const params = {
    name: pipelineName,
  };

  try {
    await codepipeline.startPipelineExecution(params);
    logger.debug(`Pipeline ${pipelineName} started`);
  } catch (err) {
    logger.error(`Error starting pipeline ${pipelineName}`, err as Error);
    throw err;
  }
}
