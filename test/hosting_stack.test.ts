import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";
import { HostingStack } from "../lib/hosting_stack";
import * as path from "path";

describe("hosting stack", () => {
  test("No domain name", () => {
    const app = new App();

    const hostingConfiguration = {
      repoUrl: "https://github.com/cornelcroi/static-frontend-vuejs.git",
      branchName: "dev",
      framework: "vuejs",
    };

    const hostingStack = new HostingStack(app, "HostingStack", {
      connectionArn:
        "arn:aws:codestar-connections:eu-west-1:123456:connection/abc",
      hostingConfiguration: hostingConfiguration,
      buildFilePath: path.join(__dirname, "./cloudfront-hosting-toolkit/cloudfront-hosting-toolkit-build.yml"),
      certificateArn: "",
    });

    const autoTemplate = Template.fromStack(hostingStack);

    autoTemplate.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
    autoTemplate.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
    autoTemplate.resourceCountIs("AWS::Lambda::Function", 5);

    autoTemplate.resourceCountIs("AWS::CloudFront::Function", 1);
    autoTemplate.resourceCountIs("AWS::S3::Bucket", 2);
    autoTemplate.resourceCountIs("AWS::CloudFront::OriginAccessControl", 1);

    autoTemplate.resourceCountIs("AWS::CloudFront::Distribution", 1);
  });

  test("with domain name", () => {
    const app = new App();

    const hostingConfiguration = {
      repoUrl: "https://github.com/cornelcroi/static-frontend-vuejs.git",
      branchName: "dev",
      framework: "vuejs",
      domainName: "example.com",
    };

    const hostingStack = new HostingStack(app, "HostingStack", {
      connectionArn:
        "arn:aws:codestar-connections:eu-west-1:123456:connection/abc",
      hostingConfiguration: hostingConfiguration,
      buildFilePath: path.join(__dirname, "./cloudfront-hosting-toolkit/cloudfront-hosting-toolkit-build.yml"),
      certificateArn:
        "arn:aws:acm:us-east-1:123456:certificate/abc",
    });

    const autoTemplate = Template.fromStack(hostingStack);
    const distributions = autoTemplate.findResources(
      "AWS::CloudFront::Distribution"
    );
    console.log(JSON.stringify(distributions, null, 2));

    autoTemplate.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
    autoTemplate.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
    autoTemplate.resourceCountIs("AWS::Lambda::Function", 5);

    autoTemplate.resourceCountIs("AWS::CloudFront::Function", 1);
    autoTemplate.resourceCountIs("AWS::S3::Bucket", 2);
    autoTemplate.resourceCountIs("AWS::CloudFront::OriginAccessControl", 1);

    autoTemplate.resourceCountIs("AWS::CloudFront::Distribution", 1);

    autoTemplate.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        Aliases: ["example.com", "www.example.com"],
        ViewerCertificate: {
          AcmCertificateArn:
            "arn:aws:acm:us-east-1:123456:certificate/abc",
        },
      },
    });
  });
});
