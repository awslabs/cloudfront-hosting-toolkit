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
} from "aws-cdk-lib";

import { Construct } from "constructs";
import * as path from "path";
import { IChainable, JsonPath, LogLevel } from "aws-cdk-lib/aws-stepfunctions";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { addCfnSuppressRules } from "./cfn_nag/cfn_nag_utils";
import { NagSuppressions } from "cdk-nag";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";

interface IParamProps {
  changeUri: cloudfront.Function;
  hostingBucket: IBucket;
  ssmCommitIdParam?: ssm.StringParameter;
  ssmS3KeyParam?: ssm.StringParameter;
}

export class UpdateCFFStepFunction extends Construct {
  public readonly stepFunction: sfn.IStateMachine;

  constructor(scope: Construct, id: string, params: IParamProps) {
    super(scope, id);

    const basicLambdaRole = new iam.Role(this, "BasicLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    const updateCff = new lambda.Function(this, "UpdateCff", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/update_cff")),
      timeout: Duration.seconds(300),
      handler: "index.handler",
      environment: {
        CFF_NAME: params.changeUri.functionName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      role: basicLambdaRole,
    });

    updateCff.addToRolePolicy(
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

    updateCff.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cloudfront:DescribeFunction",
          "cloudfront:UpdateFunction",
          "cloudfront:PublishFunction",
        ],
        resources: [params.changeUri.functionArn],
      })
    );

    addCfnSuppressRules(updateCff, [
      {
        id: "W58",
        reason:
          "Lambda has CloudWatch permissions by using service role AWSLambdaBasicExecutionRole",
      },
    ]);
    addCfnSuppressRules(updateCff, [
      {
        id: "W89",
        reason:
          "We don t have any VPC in the stack, we only use serverless services",
      },
    ]);
    addCfnSuppressRules(updateCff, [
      {
        id: "W92",
        reason:
          "No need for ReservedConcurrentExecutions, some are used only for the demo website, and others are not used in a concurrent mode.",
      },
    ]);

    const deleteOldDeployments = new lambda.Function(
      this,
      "DeleteOldDeployments",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../lambda/delete_old_deployments")
        ),
        timeout: Duration.seconds(300),
        handler: "index.handler",
        environment: {
          BUCKET_NAME: params.hostingBucket.bucketName,
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
        role: basicLambdaRole,
      }
    );

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
      "Update CloudFront Function",
      {
        lambdaFunction: updateCff,
        resultPath: JsonPath.DISCARD,
      }
    );

    const deleteOldDeploymentsJob = new tasks.LambdaInvoke(
      this,
      "Delete Old Deployments",
      {
        lambdaFunction: deleteOldDeployments,
        resultPath: JsonPath.DISCARD,
      }
    );

    const getCFFStatus = new tasks.CallAwsService(
      this,
      "Get CloudFront Function Status",
      {
        service: "cloudfront",
        action: "describeFunction",
        parameters: {
          Name: params.changeUri.functionName,
          Stage: "LIVE",
        },
        iamResources: [
          `arn:aws:cloudfront::${Aws.ACCOUNT_ID}:function/${params.changeUri.functionName}`,
        ],
        iamAction: "cloudfront:describeFunction",
      }
    );

    const wait = new sfn.Wait(this, "Wait 20 seconds", {
      time: sfn.WaitTime.duration(Duration.seconds(20)),
    });

    const end = new sfn.Succeed(this, "Done");

    const updatePropagated = new sfn.Choice(this, "Status = DEPLOYED ?")
      .when(
        sfn.Condition.stringEquals("$.FunctionSummary.Status", "IN_PROGRESS"),
        wait.next(getCFFStatus)
      )
      .otherwise(deleteOldDeploymentsJob.next(end));

    const communDefinition = updateCloudFrontFunctionJob
      .next(getCFFStatus)
      .next(updatePropagated);

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
