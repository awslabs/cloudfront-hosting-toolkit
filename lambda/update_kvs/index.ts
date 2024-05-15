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
  CloudFrontKeyValueStoreClient,
  DescribeKeyValueStoreCommand,
  PutKeyCommand,
} from "@aws-sdk/client-cloudfront-keyvaluestore";

import { SignatureV4MultiRegion } from "@aws-sdk/signature-v4-multi-region";

import "@aws-sdk/signature-v4-crt";

import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { LogLevel } from "@aws-lambda-powertools/logger/lib/types";

const logger = new Logger({
  logLevel: process.env.POWERTOOLS_LOG_LEVEL as LogLevel,
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
});

const tracer = new Tracer({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
});

const client = tracer.captureAWSv3Client(new CloudFrontKeyValueStoreClient({
  region: "us-east-1",
  signerConstructor: SignatureV4MultiRegion,
}));

const kvsARN = process.env.KVS_ARN;

async function updateKvs(path: string) {
  logger.debug("Get ETAG for KVS " + process.env.KVS_ARN);
  try {
    const { ETag } = await client.send(
      new DescribeKeyValueStoreCommand({ KvsARN: kvsARN })
    );

    logger.debug("Update KVS using ETAG " + ETag);

    await client.send(
      new PutKeyCommand({
        Key: "path",
        Value: path,
        KvsARN: kvsARN,
        IfMatch: ETag,
      })
    );

    logger.debug("KVS updated");
  } catch (error) {
    logger.error("Error while updating the KeyValue Store", error as Error);
    throw error;
  }
}

export const handler = async (event: any): Promise<any> => {
  logger.info("Incoming Request:", { event });

  try {
    await updateKvs(event.commitId);

    return {};
  } catch (error) {
    logger.error("Error", error as Error);
    throw error;
  }
};
