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
  aws_stepfunctions as sfn,
  aws_s3 as s3,
  aws_logs as logs,
  aws_codepipeline as codepipeline,
  aws_codebuild as codebuild,
  aws_events as events,
  aws_events_targets as targets,
  aws_codepipeline_actions as codepipeline_actions,
  aws_s3_deployment as s3deploy,
  aws_s3_notifications as s3n,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_ssm as ssm,
  aws_cloudfront as cloudfront,
  Duration,
  RemovalPolicy,
  Aws,    
  Stack,
  CfnOutput,
} from "aws-cdk-lib";

import { calculateMainStackName, isRepoConfig, isS3Config, parseRepositoryUrl } from "../bin/cli/utils/helper";

import { Construct } from "constructs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import * as yaml from "yaml";
import * as fs from "fs";
import * as path from "path";
import { IAction } from "aws-cdk-lib/aws-codepipeline";
import {
  S3SourceAction,
  S3Trigger,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { BUILD_FILE_NAME, SSM_PIPELINENAME_STR } from "../bin/cli/shared/constants";
import { addCfnSuppressRules } from "./cfn_nag/cfn_nag_utils";
import { NagSuppressions } from "cdk-nag";
import { DeploymentWorkflowStepFunction } from "./deployment_workflow_sf";
import { HostingConfiguration } from "../bin/cli/shared/types";

interface IConfigProps {
  hostingConfiguration: HostingConfiguration;
  connectionArn?: string;
  kvsArn: string;
  hostingBucket: IBucket;
  changeUri: cloudfront.Function;
  buildFilePath: string
}

export class PipelineInfrastructure extends Construct {
  constructor(scope: Construct, id: string, params: IConfigProps) {
    super(scope, id);

    var ssmCommitIdParam, ssmS3KeyParam;

    if(isS3Config(params.hostingConfiguration)){
    
      const ssmCommitId = `/hosting/${params.hostingConfiguration.s3bucket}/buildId`;
      const ssmSrcKey = `/hosting/${params.hostingConfiguration.s3bucket}/s3key`;

      ssmCommitIdParam = new ssm.StringParameter(this, "CommitIdParam", {
        parameterName: ssmCommitId,
        stringValue: "init",
        description: "Commit Id",
        tier: ssm.ParameterTier.STANDARD,
      });

      ssmS3KeyParam = new ssm.StringParameter(this, "S3KeyParam", {
        parameterName: ssmSrcKey,
        stringValue: "init",
        description: "S3 Key",
      });
    }

    const deploymentWorkflowStepFunction = new DeploymentWorkflowStepFunction(this, "UpdateCFF", {
      changeUri: params.changeUri,
      kvsArn: params.kvsArn,
      hostingBucket: params.hostingBucket,
      ssmCommitIdParam: ssmCommitIdParam,
      ssmS3KeyParam: ssmS3KeyParam,
    });

    const sourceOutput = new codepipeline.Artifact();

    var pipelineName, buildName;
    var dummySourceBucket;
    var buildSrcBucket: IBucket | null = null; // Initialize with null

    var sourceAction:
      | codepipeline_actions.CodeStarConnectionsSourceAction
      | S3SourceAction;
    var stepFunctionInput = {};
    var codeBuildEnvVars;
    var s3upload;
    if (isRepoConfig(params.hostingConfiguration)) {
      s3upload = new s3deploy.BucketDeployment(this, "InitialPage", {
        sources: [s3deploy.Source.asset(path.join(__dirname, "..", "resources/initial_repository"))],
        destinationBucket: params.hostingBucket,
      });

      codeBuildEnvVars = {
        DEST_BUCKET_NAME: { value: params.hostingBucket.bucketName },
      };

      const parsedUrl = parseRepositoryUrl(params.hostingConfiguration.repoUrl);

      const { repoOwner, repoName } = parsedUrl;
      //the pipeline is triggered from code repository
      pipelineName = repoOwner + "@" + repoName;
      buildName = "Build-And-Copy-to-S3-" + repoName;

      sourceAction = new codepipeline_actions.CodeStarConnectionsSourceAction({
        actionName: "GitHub-Source-" + repoName,
        owner: repoOwner,
        repo: repoName,
        branch: params.hostingConfiguration.branchName,
        output: sourceOutput,
        connectionArn: params.connectionArn!,
      });

      stepFunctionInput = { commitId: sourceAction.variables.commitId };
    } else if (params.hostingConfiguration.s3bucket) {
      //the pipeline is triggered from s3 bucket

      s3upload = new s3deploy.BucketDeployment(this, "InitialPage", {
        sources: [s3deploy.Source.asset(path.join(__dirname, "..", "resources/initial_s3"))],
        destinationBucket: params.hostingBucket,
      });

      pipelineName = params.hostingConfiguration.s3bucket;
      buildName = "Unzip-And-Copy-to-S3";

      const pipelineArn = `arn:aws:codepipeline:${Aws.REGION}:${Aws.ACCOUNT_ID}:${pipelineName}`;

      const paramPolicyStatement = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ssm:PutParameter"],
        resources: [
          ssmCommitIdParam!.parameterArn,
          ssmS3KeyParam!.parameterArn,
        ],
      });

      const pipelinePolicyStatement = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["codepipeline:StartPipelineExecution"],
        resources: [pipelineArn],
      });

      buildSrcBucket = s3.Bucket.fromBucketName(
        this,
        "BuildSrcBucket",
        params.hostingConfiguration.s3bucket
      );
      buildSrcBucket.enableEventBridgeNotification();

      const newBuild = new lambda.Function(this, "NewBuildProcess", {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../lambda/new_build")
        ),
        handler: "index.handler",
        environment: {
          SSM_PARAM_COMMITID: ssmCommitIdParam!.parameterName,
          SSM_PARAM_S3_KEY: ssmS3KeyParam?.parameterName!,
          PIPELINE_NAME: pipelineName,
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
      });

      newBuild.addToRolePolicy(paramPolicyStatement);
      newBuild.addToRolePolicy(pipelinePolicyStatement);

      const rule = new events.Rule(this, "rule", {
        eventPattern: {
          source: ["aws.s3"],
          detailType: ["Object Created"],
          detail: {
            bucket: {
              name: [buildSrcBucket.bucketName],
            },
            object: {
              key: [
                {
                  prefix: params.hostingConfiguration.s3path + '/',
                },
                {
                  suffix: ".zip",
                },
              ],
            },
          },
        },
      });

      addCfnSuppressRules(newBuild, [
        {
          id: "W58",
          reason:
            "Lambda has CloudWatch permissions by using service role AWSLambdaBasicExecutionRole",
        },
      ]);
      addCfnSuppressRules(newBuild, [
        {
          id: "W89",
          reason:
            "We don t have any VPC in the stack, we only use serverless services",
        },
      ]);
      addCfnSuppressRules(newBuild, [
        {
          id: "W92",
          reason:
            "No need for ReservedConcurrentExecutions, some are used only for the demo website, and others are not used in a concurrent mode.",
        },
      ]);

      rule.addTarget(
        new targets.LambdaFunction(newBuild, {
          maxEventAge: Duration.hours(1),
          retryAttempts: 3,
        })
      );

      codeBuildEnvVars = {
        DEST_BUCKET_NAME: { value: params.hostingBucket.bucketName },
        SSM_PARAM_COMMITID: { value: ssmCommitIdParam!.parameterName },
        SSM_PARAM_S3_KEY: { value: ssmS3KeyParam?.parameterName! },
        SRC_BUCKET_NAME: { value: buildSrcBucket.bucketName },
      };

      dummySourceBucket = new s3.Bucket(this, "DummySourceBucket", {
        versioned: true,
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
        //encryption: s3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
      });

      addCfnSuppressRules(dummySourceBucket, [
        {
          id: "W35",
          reason: "The bucket has a deny all policy, so no access is allowed",
        },
      ]);

      new s3deploy.BucketDeployment(this, "DeployWebsite", {
        sources: [s3deploy.Source.asset(path.join(__dirname, "..", "resources/s3_trigger"))],
        destinationBucket: dummySourceBucket,
      });

      sourceAction = new S3SourceAction({
        bucket: dummySourceBucket,
        bucketKey: "dummy.zip",
        output: sourceOutput,
        actionName: "Dummy-S3-Source",
        trigger: S3Trigger.EVENTS,
      });
    } else {
      console.log("Missing required information. Exit.");
      process.exit(1);
    }

    const artifactBucket = new s3.Bucket(this, "ArtifactBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      enforceSSL: true,
    });

    NagSuppressions.addResourceSuppressions(artifactBucket, [
      {
        id: "AwsSolutions-S1",
        reason: "Bucket used by CodePipeline, no need for access logs.",
      },
    ]);

    const pipeline = new codepipeline.Pipeline(this, "MyPipeline", {
      artifactBucket: artifactBucket,
      pipelineName: pipelineName,
      crossAccountKeys: false,
    });

    NagSuppressions.addResourceSuppressions(pipeline, [
      {
        id: "AwsSolutions-S2",
        reason: "Demonstrate a resource level suppression.",
      },
    ]);

    artifactBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject"],
        resources: [`${artifactBucket.bucketArn}/*`],
        principals: [new iam.ArnPrincipal(pipeline.role.roleArn)],
      })
    );

    addCfnSuppressRules(artifactBucket, [
      {
        id: "W35",
        reason: "The bucket can be read only by the pipeline",
      },
    ]);

    pipeline.node.addDependency(s3upload);

    const stepFunctionAction =
      new codepipeline_actions.StepFunctionInvokeAction({
        actionName: "Invoke",
        stateMachine: deploymentWorkflowStepFunction.stepFunction,
        stateMachineInput:
          codepipeline_actions.StateMachineInput.literal(stepFunctionInput),
      });

    const buildSpecObj = fs.readFileSync(
      params.buildFilePath,
      "utf8"
    );
    const buildSpecYaml = yaml.parse(buildSpecObj);

    const codeBuildLogs = new logs.LogGroup(this, `MyLogGroup`, {
      retention: RetentionDays.ONE_WEEK,
    });

    const myCodeBuild = new codebuild.PipelineProject(this, "Project", {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        computeType: codebuild.ComputeType.MEDIUM,
      },
      buildSpec: codebuild.BuildSpec.fromObject(buildSpecYaml),
      environmentVariables: codeBuildEnvVars,
      logging: {
        cloudWatch: {
          logGroup: codeBuildLogs,
        },
      },
    });

    NagSuppressions.addResourceSuppressions(
      myCodeBuild,
      [
        {
          id: "AwsSolutions-CB4",
          reason:
            "Artifact bucket is using Server-side encryption with a master key managed by S3",
        },
      ],
      true
    );

    NagSuppressions.addResourceSuppressions(
      myCodeBuild,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Read permissions for CodeBuild",
        },
      ],
      true
    );

    addCfnSuppressRules(codeBuildLogs, [
      {
        id: "W84",
        reason: "CloudWatch log group is always encrypted by default.",
      },
    ]);

    if (isS3Config(params.hostingConfiguration)) {
      myCodeBuild.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ssm:Describe*", "ssm:Get*", "ssm:List*"],
          resources: [
            ssmCommitIdParam!.parameterArn,
            ssmS3KeyParam!.parameterArn,
          ],
        })
      );
      buildSrcBucket!.grantRead(myCodeBuild);
    }

    const deploy = new codepipeline_actions.CodeBuildAction({
      actionName: buildName,
      project: myCodeBuild,
      input: sourceOutput,
      runOrder: 2,
    });

    pipeline.addStage({
      stageName: "Sources",
      actions: [sourceAction! as IAction],
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [deploy],
    });

    params.hostingBucket.grantReadWrite(myCodeBuild);
    params.hostingBucket.grantRead(myCodeBuild);

    pipeline.addStage({
      stageName: "ChangeUri",
      actions: [stepFunctionAction],
    });

    NagSuppressions.addResourceSuppressions(
      pipeline,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Read permissions for the Pipeline",
        },
      ],
      true
    );

    new CfnOutput(this, "PipelineName", {
      value: pipeline.pipelineName,
    });

    const stackName = calculateMainStackName(params.hostingConfiguration);


    new ssm.StringParameter(this, 'SSMPipelineName', {
      parameterName: '/' + stackName + '/' + SSM_PIPELINENAME_STR, 
      stringValue: pipeline.pipelineName
    });


  }
}
