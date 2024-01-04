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

const {
  CloudFrontKeyValueStoreClient,
  DescribeKeyValueStoreCommand,
  PutKeyCommand,
} = require("@aws-sdk/client-cloudfront-keyvaluestore");

const {
  SignatureV4MultiRegion,
} = require("@aws-sdk/signature-v4-multi-region");
require("@aws-sdk/signature-v4-crt");

const client = new CloudFrontKeyValueStoreClient({
  region: "us-east-1",
  signerConstructor: SignatureV4MultiRegion,
});

const kvsARN = process.env.KVS_ARN;

async function updateKvs(path) {
  console.log("Get ETAG for KVS " + process.env.KVS_ARN);

  const { ETag } = await client.send(new DescribeKeyValueStoreCommand({ KvsARN: kvsARN }));
  
  console.log("Update KVS using ETAG " + ETag);

  await client.send(new PutKeyCommand({
      Key: "path",
      Value: path,
      KvsARN: kvsARN,
      IfMatch: ETag,
    }));

  console.log("KVS updated");
}

exports.handler = async (event, context) => {
  console.log("event=" + JSON.stringify(event));

  try {
    await updateKvs(event.commitId);
    return {};

  } catch (error) {
    console.error("Error updating KVS:", error);
    throw error;
  }
};
