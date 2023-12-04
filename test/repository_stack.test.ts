import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";
import { RepositoryStack } from "../lib/repository_stack";
import { calculateCodeStarConnectionStackName, calculateConnectionStackName } from "../bin/cli/utils/helper";

test("Repository Stack", () => {
  // WHEN
  const app = new App();

  const hostingConfiguration = {
    repoUrl: "https://github.com/cornelcroi/static-frontend-vuejs.git",
    branchName: "dev",
    framework: "vuejs"
  };

  const repositoryStack = new RepositoryStack(
    app,
    "RepositoryStack",
    hostingConfiguration
  );

  const autoTemplate = Template.fromStack(repositoryStack);
  console.log(JSON.stringify(autoTemplate))
  
  const connectionName = calculateCodeStarConnectionStackName(hostingConfiguration.repoUrl, hostingConfiguration.branchName);

  autoTemplate.resourceCountIs("AWS::CodeStarConnections::Connection", 1);
  autoTemplate.resourceCountIs("AWS::SSM::Parameter", 3);
  autoTemplate.hasResourceProperties('AWS::CodeStarConnections::Connection', {
    ProviderType: 'GitHub',
    ConnectionName: connectionName
  });

  
});
