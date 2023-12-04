import checkAWSConnection from "../bin/cli/utils/awsSDKUtil";
import { mockClient } from "aws-sdk-client-mock";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import {
  Route53Client,
  ListResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";
import {
  GetPipelineStateCommand,
  CodePipelineClient,
} from "@aws-sdk/client-codepipeline";
import {
  CodeStarConnectionsClient,
  GetConnectionCommand,
} from "@aws-sdk/client-codestar-connections";
import {
  ACMClient,
  ListCertificatesCommand,
  RequestCertificateCommand,
  DescribeCertificateCommand,
} from "@aws-sdk/client-acm";

import {
  S3Client,
  HeadBucketCommand,
  GetBucketLocationCommand,
} from "@aws-sdk/client-s3";

const prompts = require("prompts"); // Use require instead of import

import handleDeployCommand from "../bin/cli/actions/deploy";
import * as fs from "fs";
import { HostingConfiguration } from "../bin/cli/shared/types";
const helpers = require("../bin/cli/utils/helper");

const stsMock = mockClient(STSClient);
const ssmMock = mockClient(SSMClient);
const pipelineMock = mockClient(CodePipelineClient);
const codestarConnectionMock = mockClient(CodeStarConnectionsClient);
const acmMock = mockClient(ACMClient);
const r53Mock = mockClient(Route53Client);
const s3Mock = mockClient(S3Client);

jest.mock("adm-zip", () => {
  const mockAdmZip = {
    addLocalFile: jest.fn(),
    writeZip: jest.fn(),
  };
  return jest.fn(() => mockAdmZip);
});

jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs");
  return {
    ...actualFs,
    existsSync: jest.fn(),
  };
});

const spyExistsSync = jest.spyOn(fs, "existsSync");
const spyExecuteCommands = jest.spyOn(helpers, "executeCommands");

beforeEach(() => {
  stsMock.reset();
  ssmMock.reset();
  pipelineMock.reset();
  codestarConnectionMock.reset();
  acmMock.reset();
  r53Mock.reset();
  s3Mock.reset();
});

const spyLoadConfigurationCommands = jest.spyOn(
  helpers,
  "loadHostingConfiguration"
);

process.exit = jest.fn(() => {
  throw "mockExit";
});

describe("deploy", () => {
  beforeEach(() => {
    spyExistsSync.mockReset();
    spyExecuteCommands.mockReset();
    spyLoadConfigurationCommands.mockReset();
    codestarConnectionMock.reset();
    stsMock.reset();
  ssmMock.reset();
  pipelineMock.reset();
  codestarConnectionMock.reset();
  acmMock.reset();
  r53Mock.reset();
  s3Mock.reset();

  });

 

  it("check AWS Connection", async () => {
    stsMock.on(GetCallerIdentityCommand).resolves({});
    const result = await checkAWSConnection();
    expect(result).toBe(true);
  });

  it("Missing config file", async () => {
    spyExistsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);

    try {
      await handleDeployCommand();
    } catch (error) {
      expect(process.exit).toBeCalledWith(1);
    }
  });

  it("Existing config file, github repo, no domain name, no pending connections", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    spyExecuteCommands.mockImplementation();

    const mockedHostingConfiguration: HostingConfiguration = {
      repoUrl: "https://github.com/cornelcroi/static-frontend-vuejs.git",
      branchName: "test",
      framework: "vuejs",
    };
    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });

    
    
    codestarConnectionMock.on(GetConnectionCommand).resolves({
      Connection: {
        ConnectionName: "STRING_VALUE",
        ConnectionArn: "STRING_VALUE",
        ProviderType:
          "Bitbucket" || "GitHub" || "GitHubEnterpriseServer" || "GitLab",
        OwnerAccountId: "STRING_VALUE",
        ConnectionStatus: "AVAILABLE",
        HostArn: "STRING_VALUE",
      },
    });

    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(3);
  });

  it("Existing config file, github repo, no domain name, no pending connections, user interaction", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    const spyExecuteCommands = jest.spyOn(helpers, "executeCommands");
    spyExecuteCommands.mockImplementation();

    const mockedHostingConfiguration: HostingConfiguration = {
      repoUrl: "https://github.com/cornelcroi/static-frontend-vuejs.git",
      branchName: "test",
      framework: "vuejs",
    };
    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });

    codestarConnectionMock.on(GetConnectionCommand).resolves({
      Connection: {
        ConnectionName: "STRING_VALUE",
        ConnectionArn: "STRING_VALUE",
        ProviderType:
          "Bitbucket" || "GitHub" || "GitHubEnterpriseServer" || "GitLab",
        OwnerAccountId: "STRING_VALUE",
        ConnectionStatus: "AVAILABLE",
        HostArn: "STRING_VALUE",
      },
    });

    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(3);
  });

  it("Existing config file, github repo, with domain name, no hosting zone, with pending connections, user interaction", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    const mockedHostingConfiguration: HostingConfiguration = {
      repoUrl: "https://github.com/cornelcroi/static-frontend-vuejs.git",
      branchName: "test",
      framework: "vuejs",
      domainName: "example.com",
    };
    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    const spyExecuteCommands = jest.spyOn(helpers, "executeCommands");
    spyExecuteCommands.mockImplementation();

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });

    codestarConnectionMock.on(GetConnectionCommand).resolves({
      Connection: {
        ConnectionName: "STRING_VALUE",
        ConnectionArn: "STRING_VALUE",
        ProviderType:
          "Bitbucket" || "GitHub" || "GitHubEnterpriseServer" || "GitLab",
        OwnerAccountId: "STRING_VALUE",
        ConnectionStatus: "PENDING",
        HostArn: "STRING_VALUE",
      },
    });

    prompts.inject(["ok"]);

    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    acmMock.on(ListCertificatesCommand).resolves({
      NextToken: "STRING_VALUE",
      CertificateSummaryList: [
        {
          CertificateArn: "STRING_VALUE",
          DomainName: "example.com",
          SubjectAlternativeNameSummaries: ["STRING_VALUE"],
          HasAdditionalSubjectAlternativeNames: true,
          Status: "ISSUED",
        },
      ],
    });

    acmMock.on(RequestCertificateCommand).resolves({
      CertificateArn: "myArn",
    });

    //certificate issued
    acmMock.on(DescribeCertificateCommand).resolves({
      Certificate: {
        CertificateArn: "myArn",
        DomainName: "STRING_VALUE",
        SubjectAlternativeNames: ["STRING_VALUE"],
        Status: "ISSUED",
        DomainValidationOptions: [
          {
            DomainName: "STRING_VALUE",
            ValidationEmails: ["STRING_VALUE"],
            ValidationDomain: "STRING_VALUE",
            ValidationStatus: "SUCCESS",
            ResourceRecord: {
              Name: "STRING_VALUE",
              Type: "CNAME",
              Value: "STRING_VALUE",
            },
            ValidationMethod: "EMAIL" || "DNS",
          },
        ],
      },
    });

    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(3);
  });

  
  it("Existing config file, github repo, with domain name, with hosting zone, with pending connections, user interaction", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    const mockedHostingConfiguration: HostingConfiguration = {
      repoUrl: "https://github.com/cornelcroi/static-frontend-vuejs.git",
      branchName: "test",
      framework: "vuejs",
      domainName: "example.com",
      hostedZoneId: "myHostedZoneId",
    };
    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    const spyExecuteCommands = jest.spyOn(helpers, "executeCommands");
    spyExecuteCommands.mockImplementation();

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });

    codestarConnectionMock.on(GetConnectionCommand).resolves({
      Connection: {
        ConnectionName: "STRING_VALUE",
        ConnectionArn: "STRING_VALUE",
        ProviderType:
          "Bitbucket" || "GitHub" || "GitHubEnterpriseServer" || "GitLab",
        OwnerAccountId: "STRING_VALUE",
        ConnectionStatus: "PENDING",
        HostArn: "STRING_VALUE",
      },
    });

    prompts.inject(["ok"]);

    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    acmMock.on(ListCertificatesCommand).resolves({
      NextToken: "STRING_VALUE",
      CertificateSummaryList: [
        {
          CertificateArn: "STRING_VALUE",
          DomainName: "example.com",
          SubjectAlternativeNameSummaries: ["STRING_VALUE"],
          HasAdditionalSubjectAlternativeNames: true,
          Status: "ISSUED",
        },
      ],
    });

    acmMock.on(RequestCertificateCommand).resolves({
      CertificateArn: "myArn",
    });

    //certificate issued
    acmMock.on(DescribeCertificateCommand).resolves({
      Certificate: {
        CertificateArn: "myArn",
        DomainName: "STRING_VALUE",
        SubjectAlternativeNames: ["STRING_VALUE"],
        Status: "ISSUED",
        DomainValidationOptions: [
          {
            DomainName: "STRING_VALUE",
            ValidationEmails: ["STRING_VALUE"],
            ValidationDomain: "STRING_VALUE",
            ValidationStatus: "SUCCESS",
            ResourceRecord: {
              Name: "STRING_VALUE",
              Type: "CNAME",
              Value: "STRING_VALUE",
            },
            ValidationMethod: "EMAIL" || "DNS",
          },
        ],
      },
    });

    //ACM records OK
    r53Mock.on(ListResourceRecordSetsCommand).resolves({
      ResourceRecordSets: [
        {
          Name: "example.com",
          Type: "A",
        },
      ],
    });

    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(3);
  });

  


  it("Existing config file, s3 repo, no domain name", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    spyExecuteCommands.mockImplementation();

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });

    const mockedHostingConfiguration: HostingConfiguration = {
      s3bucket: "aaa",
      s3path: "",
    };
    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);


    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    s3Mock.on(HeadBucketCommand).resolves({});

    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(2);
  });

  it("Existing config file, s3 repo, no domain name, user interaction", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    const spyExecuteCommands = jest.spyOn(helpers, "executeCommands");
    spyExecuteCommands.mockImplementation();

    const mockedHostingConfiguration: HostingConfiguration = {
      s3bucket: "aaa",
      s3path: "",
    };

    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });


    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    s3Mock.on(HeadBucketCommand).resolves({});

    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(2);
  });

  it("Existing config file, github repo, with domain name, no hosting zone, user interaction", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    const mockedHostingConfiguration: HostingConfiguration = {
      s3bucket: "aaa",
      s3path: "",
      domainName: "example.com",
    };

    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    const spyExecuteCommands = jest.spyOn(helpers, "executeCommands");
    spyExecuteCommands.mockImplementation();

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });


    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    acmMock.on(ListCertificatesCommand).resolves({
      NextToken: "STRING_VALUE",
      CertificateSummaryList: [
        {
          CertificateArn: "STRING_VALUE",
          DomainName: "example.com",
          SubjectAlternativeNameSummaries: ["STRING_VALUE"],
          HasAdditionalSubjectAlternativeNames: true,
          Status: "ISSUED",
        },
      ],
    });

    acmMock.on(RequestCertificateCommand).resolves({
      CertificateArn: "myArn",
    });

    //certificate issued
    acmMock.on(DescribeCertificateCommand).resolves({
      Certificate: {
        CertificateArn: "myArn",
        DomainName: "STRING_VALUE",
        SubjectAlternativeNames: ["STRING_VALUE"],
        Status: "ISSUED",
        DomainValidationOptions: [
          {
            DomainName: "STRING_VALUE",
            ValidationEmails: ["STRING_VALUE"],
            ValidationDomain: "STRING_VALUE",
            ValidationStatus: "SUCCESS",
            ResourceRecord: {
              Name: "STRING_VALUE",
              Type: "CNAME",
              Value: "STRING_VALUE",
            },
            ValidationMethod: "EMAIL" || "DNS",
          },
        ],
      },
    });

    s3Mock.on(HeadBucketCommand).resolves({});

    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(2);
  });

  it("Existing config file, s3 repo, with domain name, with hosting zone, user interaction", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    const mockedHostingConfiguration: HostingConfiguration = {
      s3bucket: "aaa",
      s3path: "",
      domainName: "example.com",
      hostedZoneId: "myHostedZoneId",
    };
    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    const spyExecuteCommands = jest.spyOn(helpers, "executeCommands");
    spyExecuteCommands.mockImplementation();

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });


    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    acmMock.on(ListCertificatesCommand).resolves({
      NextToken: "STRING_VALUE",
      CertificateSummaryList: [
        {
          CertificateArn: "myArn",
          DomainName: "example.com",
          SubjectAlternativeNameSummaries: ["www.example.com"],
          HasAdditionalSubjectAlternativeNames: true,
          Status: "PENDING_VALIDATION",
        },
      ],
    });

    acmMock.on(RequestCertificateCommand).resolves({
      CertificateArn: "myArn",
    });

    //certificate issued
    acmMock.on(DescribeCertificateCommand).resolves({
      Certificate: {
        CertificateArn: "myArn",
        DomainName: "STRING_VALUE",
        SubjectAlternativeNames: ["STRING_VALUE"],
        Status: "ISSUED",
        DomainValidationOptions: [
          {
            DomainName: "STRING_VALUE",
            ValidationEmails: ["STRING_VALUE"],
            ValidationDomain: "STRING_VALUE",
            ValidationStatus: "SUCCESS",
            ResourceRecord: {
              Name: "STRING_VALUE",
              Type: "CNAME",
              Value: "STRING_VALUE",
            },
            ValidationMethod: "EMAIL" || "DNS",
          },
        ],
      },
    });

    //ACM records OK
    r53Mock.on(ListResourceRecordSetsCommand).resolves({
      ResourceRecordSets: [
        {
          Name: "example.com",
          Type: "A",
        },
      ],
    });

    s3Mock.on(HeadBucketCommand).resolves({});

    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(2);
  });

  it("Existing config file, s3 repo, no domain name,bucket does not exist", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    spyExecuteCommands.mockImplementation();

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });

    const mockedHostingConfiguration: HostingConfiguration = {
      s3bucket: "aaa",
      s3path: "",
    };

    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    s3Mock.on(HeadBucketCommand).rejects({});

    try {
      await handleDeployCommand();
    } catch (error) {
      expect(process.exit).toBeCalledWith(1);
    }
  });

  it("Existing config file, invalid hosting configuration file", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);


    const mockedHostingConfiguration = {
      test: "test",
    };

    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);


    try {
      await handleDeployCommand();
    } catch (error) {
      expect(process.exit).toBeCalledWith(1);
    }
  });

  it("Existing config file, github repo, with domain name, with hosting zone, user interaction, no A record", async () => {
    //config file exists
    spyExistsSync.mockReturnValue(true).mockReturnValueOnce(true);

    const mockedHostingConfiguration: HostingConfiguration = {
      repoUrl: "https://github.com/cornelcroi/static-frontend-vuejs.git",
      branchName: "test",
      framework: "vuejs",
      domainName: "example.com",
      hostedZoneId: "myHostedZoneId",
    };
    spyLoadConfigurationCommands.mockReturnValue(mockedHostingConfiguration);

    const spyExecuteCommands = jest.spyOn(helpers, "executeCommands");
    spyExecuteCommands.mockImplementation();

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: "YourParameterName",
        Value: "YourParameterValue",
      },
    });



    pipelineMock.on(GetPipelineStateCommand).resolves({
      pipelineName: "STRING_VALUE",
      pipelineVersion: Number("int"),
      stageStates: [
        {
          stageName: "STRING_VALUE",
          inboundExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
          inboundTransitionState: {
            enabled: true || false,
            lastChangedBy: "STRING_VALUE",
            lastChangedAt: new Date("TIMESTAMP"),
            disabledReason: "STRING_VALUE",
          },
          actionStates: [
            {
              actionName: "STRING_VALUE",
              currentRevision: {
                revisionId: "STRING_VALUE",
                revisionChangeId: "STRING_VALUE",
                created: new Date("TIMESTAMP"),
              },
              latestExecution: {
                actionExecutionId: "STRING_VALUE",
                status: "InProgress" || "Abandoned" || "Succeeded" || "Failed",
                summary: "STRING_VALUE",
                lastStatusChange: new Date("TIMESTAMP"),
                token: "STRING_VALUE",
                lastUpdatedBy: "STRING_VALUE",
                externalExecutionId: "STRING_VALUE",
                externalExecutionUrl: "STRING_VALUE",
                percentComplete: Number("int"),
                errorDetails: {
                  code: "STRING_VALUE",
                  message: "STRING_VALUE",
                },
              },
              entityUrl: "STRING_VALUE",
              revisionUrl: "STRING_VALUE",
            },
          ],
          latestExecution: {
            pipelineExecutionId: "STRING_VALUE",
            status: "Succeeded",
          },
        },
      ],
      created: new Date("TIMESTAMP"),
      updated: new Date("TIMESTAMP"),
    });

    acmMock.on(ListCertificatesCommand).resolves({
      NextToken: "STRING_VALUE",
      CertificateSummaryList: [
        {
          CertificateArn: "STRING_VALUE",
          DomainName: "example.com",
          SubjectAlternativeNameSummaries: ["STRING_VALUE"],
          HasAdditionalSubjectAlternativeNames: true,
          Status: "ISSUED",
        },
      ],
    });

    acmMock.on(RequestCertificateCommand).resolves({
      CertificateArn: "myArn",
    });

    //certificate issued
    acmMock.on(DescribeCertificateCommand).resolves({
      Certificate: {
        CertificateArn: "myArn",
        DomainName: "STRING_VALUE",
        SubjectAlternativeNames: ["STRING_VALUE"],
        Status: "ISSUED",
        DomainValidationOptions: [
          {
            DomainName: "STRING_VALUE",
            ValidationEmails: ["STRING_VALUE"],
            ValidationDomain: "STRING_VALUE",
            ValidationStatus: "SUCCESS",
            ResourceRecord: {
              Name: "STRING_VALUE",
              Type: "CNAME",
              Value: "STRING_VALUE",
            },
            ValidationMethod: "EMAIL" || "DNS",
          },
        ],
      },
    });

    //ACM records OK
    r53Mock.on(ListResourceRecordSetsCommand).resolves({
      ResourceRecordSets: [
        {
          Name: "my-example.com",
          Type: "A",
        },
      ],
    });
    prompts.inject(["yes"]);


    await handleDeployCommand();

    expect(spyExecuteCommands).toBeCalledTimes(3);
  });

});
