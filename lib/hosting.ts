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
  aws_s3 as s3
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
  connectionArn?: string;
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
 */
export class Hosting extends Construct {
  /**
   * The CloudFront Distribution created by this construct.
   */
  public readonly distribution: cloudfront.Distribution;

  /**
   * The S3 Bucket used for hosting the content.
   */
  public readonly hostingBucket: s3.IBucket;

  /**
   * The CloudFront Function used for URI manipulation.
   */
  public readonly changeUriFunction: cloudfront.Function;

  /**
   * The Key-Value Store used by CloudFront.
   */
  public readonly uriStore: cloudfront.KeyValueStore;

  /**
   * The distribution's domain name.
   */
  public readonly distributionDomainName: string;

  /**
   * The distribution's URL (https://{domainName}).
   */
  public readonly distributionUrl: string;

  /**
   * Reference to the hosting infrastructure construct.
   */
  public readonly hostingInfrastructure: HostingInfrastructure;

  /**
   * Reference to the pipeline infrastructure construct.
   */
  public readonly pipelineInfrastructure: PipelineInfrastructure;

  constructor(scope: Construct, id: string, params: IParamProps) {
    super(scope, id);

    // Create URI Store
    this.uriStore = new cloudfront.KeyValueStore(this, 'UriStore', {
      keyValueStoreName: truncateString(Aws.STACK_NAME + "-" + Aws.REGION, 65)
    });

    // Setup CloudFront Function
    let cloudFrontFunctionCode = fs.readFileSync(params.cffSourceFilePath, 'utf-8');
    cloudFrontFunctionCode = cloudFrontFunctionCode.replace(/__KVS_ID__/g, this.uriStore.keyValueStoreId);

    this.changeUriFunction = new cloudfront.Function(this, "ChangeUri", {
      code: cloudfront.FunctionCode.fromInline(cloudFrontFunctionCode),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      comment: "Change uri",
    });

    (this.changeUriFunction.node.defaultChild as cloudfront.CfnFunction).addPropertyOverride(
      "FunctionConfig.KeyValueStoreAssociations",
      [{
        "KeyValueStoreARN": this.uriStore.keyValueStoreArn
      }]
    );

    // Create Hosting Infrastructure
    this.hostingInfrastructure = new HostingInfrastructure(this, "HostingInfrastructure", {
      changeUri: this.changeUriFunction,
      certificateArn: params.certificateArn,
      hostingConfiguration: params.hostingConfiguration,
    });

    // Set properties from hosting infrastructure
    this.distribution = this.hostingInfrastructure.distribution;
    this.hostingBucket = this.hostingInfrastructure.hostingBucket;
    this.distributionDomainName = this.distribution.distributionDomainName;
    this.distributionUrl = `https://${this.distributionDomainName}`;

    // Create Pipeline Infrastructure
    this.pipelineInfrastructure = new PipelineInfrastructure(this, "PipelineInfrastructure", {
      hostingConfiguration: params.hostingConfiguration,
      connectionArn: params.connectionArn,
      kvsArn: this.uriStore.keyValueStoreArn,
      hostingBucket: this.hostingBucket,
      changeUri: this.changeUriFunction,
      buildFilePath: params.buildFilePath,
    });
  }
}