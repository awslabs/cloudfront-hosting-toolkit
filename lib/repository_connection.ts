import {
  Stack,
  StackProps,
  aws_cloudfront as cloudfront,
  aws_ssm as ssm,
  CfnOutput,
  Aws,
  aws_codestarconnections as codestarconnections,
} from "aws-cdk-lib";

import { Construct } from "constructs";
import {
  calculateCodeStarConnectionStackName,
  calculateConnectionStackName,
  isRepoConfig,
  parseRepositoryUrl,
} from "../bin/cli/utils/helper";
import {
  SSM_CONNECTION_ARN_STR,
  SSM_CONNECTION_NAME_STR,
  SSM_CONNECTION_REGION_STR,
} from "../bin/cli/shared/constants";
import { HostingConfiguration } from "../bin/cli/shared/types";

/**
 * Custom CDK Construct for setting up a repository connection.
 *
 * This construct creates a connection to a hosting repository using the provided configuration.
 *
 * @param scope - The Construct scope in which this construct is defined.
 * @param id - The identifier for this construct within the scope.
 * @param params - Parameters for configuring the repository connection.
 *   - `repoUrl` (optional): The URL of the hosting repository.
 *   - `branchName` (optional): The name of the branch in the repository.
 *   - `framework` (optional): The framework used for hosting.
 *   - `s3bucket` (optional): The name of the Amazon S3 bucket for hosting content.
 *   - `s3path` (optional): The path within the S3 bucket where content is stored.
 *   - `domainName` (optional): The domain name associated with the hosting.
 *   - `hostedZoneId` (optional): The ID of the Route 53 hosted zone associated with the domain.
 */
export class RepositoryConnection extends Construct {
  public readonly connectionArn: string;
  public readonly repoUrl: string;

  constructor(
    scope: Construct,
    id: string,
    hostingConfiguration: HostingConfiguration
  ) {
    super(scope, id);

    if (isRepoConfig(hostingConfiguration)) {
      const repoUrl = hostingConfiguration.repoUrl;
      const parsedUrl = parseRepositoryUrl(repoUrl as string);

      if (parsedUrl) {
        const { repoName } = parsedUrl;
        const conn = new codestarconnections.CfnConnection(
          this,
          "MyCfnConnection" + repoName,
          {
            connectionName: calculateCodeStarConnectionStackName(
              hostingConfiguration.repoUrl,
              hostingConfiguration.branchName
            ),
            providerType: "GitHub",
          }
        );

        this.connectionArn = conn.attrConnectionArn;
        this.repoUrl = hostingConfiguration.repoUrl;

        new CfnOutput(this, "ConnectionArn", {
          value: conn.attrConnectionArn,
        });

        new CfnOutput(this, "ConnectionName", {
          value: conn.connectionName,
        });

        const stackName = calculateConnectionStackName(
          hostingConfiguration.repoUrl,
          hostingConfiguration.branchName
        );

        new ssm.StringParameter(this, "SSMConnectionArn", {
          parameterName: "/" + stackName + "/" + SSM_CONNECTION_ARN_STR,
          stringValue: conn.attrConnectionArn,
        });
        new ssm.StringParameter(this, "SSMConnectionName", {
          parameterName: "/" + stackName + "/" + SSM_CONNECTION_NAME_STR,
          stringValue: conn.connectionName,
        });

        new ssm.StringParameter(this, "SSMConnectionRegion", {
          parameterName: "/" + stackName + "/" + SSM_CONNECTION_REGION_STR,
          stringValue: Aws.REGION,
        });
      }
    } else {
      // Handle case where the URL did not match the expected format
      console.log(`The configuration for repository URL is invalid, exiting.`);
      process.exit(0);
    }
    new CfnOutput(this, "HostingRegion", {
      value: Aws.REGION,
    });
  }
}
