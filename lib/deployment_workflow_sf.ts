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
  Duration,
  aws_iam as iam,
  aws_cloudfront as cloudfront,
  aws_stepfunctions as sfn,
  aws_lambda as lambda,
  aws_stepfunctions_tasks as tasks,
  aws_logs as logs,
  aws_ssm as ssm,
  RemovalPolicy,
  Stack,
} from "aws-cdk-lib";

import { Construct } from "constructs";
import * as path from "path";
import { IChainable, JsonPath, LogLevel } from "aws-cdk-lib/aws-stepfunctions";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { addCfnSuppressRules } from "./cfn_nag/cfn_nag_utils";
import { NagSuppressions } from "cdk-nag";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LayerVersion, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';


interface IParamProps {
  changeUri: cloudfront.Function;
  kvsArn: string,
  hostingBucket: IBucket;
  ssmCommitIdParam?: ssm.StringParameter;
  ssmS3KeyParam?: ssm.StringParameter;
}

const commonProps: Partial<lambda.FunctionProps> = {
  runtime: lambda.Runtime.NODEJS_20_X,
  tracing: lambda.Tracing.ACTIVE,
  timeout: Duration.seconds(30),
  logRetention: RetentionDays.ONE_MONTH,
  environment: {
    NODE_OPTIONS: '--enable-source-maps', // see https://docs.aws.amazon.com/lambda/latest/dg/typescript-exceptions.html
    POWERTOOLS_SERVICE_NAME: 'pipeline',
    POWERTOOLS_METRICS_NAMESPACE: 'cloudfront-hosting-toolkit',
    POWERTOOLS_LOG_LEVEL: 'DEBUG',
  },
};


export class DeploymentWorkflowStepFunction extends Construct {
  public readonly stepFunction: sfn.IStateMachine;

  constructor(scope: Construct, id: string, params: IParamProps) {
    super(scope, id);

   
    const basicLambdaRole = new iam.Role(this, "BasicLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    const awsSdkLayer = new lambda.LayerVersion(this, "AwsSdkLayer", {
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      code: lambda.Code.fromAsset("lambda/layers/aws_sdk"),
      description: "AWS SDK lib including client-cloudfront-keyvaluestore",
    });

    const powerToolLayer = LayerVersion.fromLayerVersionArn(
      this,
      'powertools-layer',
      `arn:aws:lambda:${
        Stack.of(this).region
      }:094274105915:layer:AWSLambdaPowertoolsTypeScript:28`
    )

    const updateKvs = new NodejsFunction(this, "UpdateKvsFunction", {
      ...(commonProps as lambda.FunctionProps),
      entry: path.join(__dirname, "../lambda/update_kvs/index.js"),
      handler: 'index.handler',
      memorySize: 512,
      layers: [awsSdkLayer, powerToolLayer],
      depsLockFilePath: "../lambda/update_kvs/yarn.lock",
      bundling: {
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string) {
            return [
              `cd ${inputDir}`,
              'yarn install --frozen-lockfile',
            ]
          },
          beforeInstall() {
            return []
          },
          afterBundling() {
            return []
          }
        },
        externalModules: [
          '@aws-lambda-powertools/logger',
          '@aws-lambda-powertools/tracer',
          '@aws-lambda-powertools/metrics',
          '@aws-sdk/signature-v4-crt',
          '@aws-sdk/client-cloudfront-keyvaluestore',
          '@aws-sdk/signature-v4-multi-region',
        ]
      },
      role: basicLambdaRole
    });

    updateKvs.addEnvironment("KVS_ARN", params.kvsArn );

    updateKvs.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: ["arn:aws:logs:*:*:*"],
      })
    );

    updateKvs.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cloudfront-keyvaluestore:DescribeKeyValueStore",
          "cloudfront-keyvaluestore:PutKey",
        ],
        resources: [params.kvsArn],
      })
    );

    addCfnSuppressRules(updateKvs, [
      {
        id: "W58",
        reason:
          "Lambda has CloudWatch permissions by using service role AWSLambdaBasicExecutionRole",
      },
    ]);
    addCfnSuppressRules(updateKvs, [
      {
        id: "W89",
        reason:
          "We don t have any VPC in the stack, we only use serverless services",
      },
    ]);
    addCfnSuppressRules(updateKvs, [
      {
        id: "W92",
        reason:
          "No need for ReservedConcurrentExecutions, some are used only for the demo website, and others are not used in a concurrent mode.",
      },
    ]);

    const deleteOldDeployments = new NodejsFunction(this, "DeleteOldDeployments", {
      ...(commonProps as lambda.FunctionProps),
      entry: path.join(__dirname, "../lambda/delete_old_deployments/index.js"),
      handler: 'index.handler',
      memorySize: 512,
      layers: [powerToolLayer],
      depsLockFilePath: "../lambda/delete_old_deployments/yarn.lock",
      bundling: {
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string) {
            return [
              `cd ${inputDir}`,
              'yarn install --frozen-lockfile',
            ]
          },
          beforeInstall() {
            return []
          },
          afterBundling() {
            return []
          }
        },
        externalModules: [
          '@aws-lambda-powertools/logger',
          '@aws-lambda-powertools/tracer',
          '@aws-lambda-powertools/metrics'
        ]
      },
      role: basicLambdaRole
    });

    deleteOldDeployments.addEnvironment("BUCKET_NAME", params.hostingBucket.bucketName);


    deleteOldDeployments.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: ["arn:aws:logs:*:*:*"],
      })
    );

    addCfnSuppressRules(deleteOldDeployments, [
      {
        id: "W58",
        reason:
          "Lambda has CloudWatch permissions by using service role AWSLambdaBasicExecutionRole",
      },
    ]);
    addCfnSuppressRules(deleteOldDeployments, [
      {
        id: "W89",
        reason:
          "We don t have any VPC in the stack, we only use serverless services",
      },
    ]);
    addCfnSuppressRules(deleteOldDeployments, [
      {
        id: "W92",
        reason:
          "No need for ReservedConcurrentExecutions, some are used only for the demo website, and others are not used in a concurrent mode.",
      },
    ]);

    params.hostingBucket.grantReadWrite(deleteOldDeployments);

    NagSuppressions.addResourceSuppressions(
      basicLambdaRole,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Permissions to get objects and delete them is required",
        },
      ],
      true
    );

    const successState = new sfn.Pass(this, "SuccessState");

    const updateCloudFrontFunctionJob = new tasks.LambdaInvoke(
      this,
      "Update KeyValueStore",
      {
        lambdaFunction: updateKvs,
        resultPath: JsonPath.DISCARD,
      }
    );

    const deleteOldDeploymentsJob = new tasks.LambdaInvoke(
      this,
      "Purge previous deployments from S3",
      {
        lambdaFunction: deleteOldDeployments,
        resultPath: JsonPath.DISCARD,
      }
    );


    const communDefinition = updateCloudFrontFunctionJob
      .next(deleteOldDeploymentsJob);

    var stepFunctionDefinition: IChainable;

    if (params.ssmCommitIdParam) {
      const getCommitId = new tasks.CallAwsService(
        this,
        "Get CommitID from Parameter Store",
        {
          service: "ssm",
          action: "getParameter",
          parameters: {
            Name: params.ssmCommitIdParam.parameterName,
          },
          iamResources: [params.ssmCommitIdParam.parameterArn],
          iamAction: "ssm:getParameter",
          resultSelector: {
            commitId: sfn.JsonPath.stringAt("$.Parameter.Value"),
          },
        }
      );

      const ssmHasValue = new sfn.Choice(this, "SSM Param is SET ?")
        .when(sfn.Condition.stringEquals("$.commitId", "init"), successState)
        .otherwise(communDefinition);

      stepFunctionDefinition = getCommitId.next(ssmHasValue);
    } else {
      stepFunctionDefinition = communDefinition;
    }

    const sfnLog = new LogGroup(this, "sfnLog", {
      logGroupName:
      "/aws/vendedlogs/states/" + Aws.STACK_NAME,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK,
    });

    this.stepFunction = new sfn.StateMachine(this, "StaticHostingSF", {
      definitionBody : sfn.DefinitionBody.fromChainable(stepFunctionDefinition),
      tracingEnabled: true,
      logs: {
        destination: sfnLog,
        includeExecutionData: true,
        level: LogLevel.ALL,
      },
    });

    NagSuppressions.addResourceSuppressions(
      this.stepFunction,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Required permissions for this Step Function",
        },
      ],
      true
    );
  }
}
