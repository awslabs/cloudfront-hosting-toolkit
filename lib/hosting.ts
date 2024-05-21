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
  Aws,
  aws_cloudfront as cloudfront,
} from "aws-cdk-lib";
import * as path from "path";
import * as fs from "fs";

import { Construct } from "constructs";
import { HostingInfrastructure } from "./hosting_infrastructure";
import { PipelineInfrastructure } from "./pipeline_infrastructure";
import { HostingConfiguration } from "../bin/cli/shared/types";
import { truncateString } from "./utility";
interface IParamProps {
  hostingConfiguration: HostingConfiguration;
  buildFilePath: string;
  cffSourceFilePath: string;
  connectionArn?: string ;
  certificateArn?: string;
}

/**
 * Custom CDK Construct for hosting resources.
 *
 * This construct sets up hosting based on the provided configuration,
 * build file path, and optional connection and certificate ARNs.
 *
 * @param scope - The Construct scope in which this construct is defined.
 * @param id - The identifier for this construct within the scope.
 * @param params - Parameters for configuring hosting resources.
 *   - `configuration` (required): The IConfiguration object representing the hosting configuration.
 *   - `buildFilePath` (required): The path to the build file for the hosting resources.
 *   - `connectionArn` (optional): The ARN of the connection resource (if applicable).
 *   - `certificateArn` (optional): The ARN of the certificate resource (if applicable).
 */
export class Hosting extends Construct {
  constructor(scope: Construct, id: string, params: IParamProps) {
    super(scope, id);

    const uriStore = new cloudfront.KeyValueStore(this, 'UriStore', {
      keyValueStoreName: truncateString(Aws.STACK_NAME + "-" + Aws.REGION, 65)
    });

    let cloudFrontFunctionCode = fs.readFileSync(params.cffSourceFilePath, 'utf-8');

    cloudFrontFunctionCode = cloudFrontFunctionCode.replace(/__KVS_ID__/g, uriStore.keyValueStoreId);

    const changeUri = new cloudfront.Function(this, "ChangeUri", {
      code: cloudfront.FunctionCode.fromInline(cloudFrontFunctionCode),
      runtime: cloudfront.FunctionRuntime.JS_2_0,          
      comment: "Change uri",
      
    });

    
    (changeUri.node.defaultChild as cloudfront.CfnFunction).addPropertyOverride("FunctionConfig.KeyValueStoreAssociations",
     [{ 
      "KeyValueStoreARN": uriStore.keyValueStoreArn
    }]);
    

    const hostingInfrastructure = new HostingInfrastructure(this, "HostingInfrastructure", {
      changeUri: changeUri,
      certificateArn: params.certificateArn,
      hostingConfiguration: params.hostingConfiguration,
    });

    new PipelineInfrastructure(this, "PipelineInfrastructure", {
      hostingConfiguration: params.hostingConfiguration,
      connectionArn: params.connectionArn,
      kvsArn: uriStore.keyValueStoreArn,
      hostingBucket: hostingInfrastructure.hostingBucket,
      changeUri: changeUri,
      buildFilePath: params.buildFilePath,
    });
  }
}
