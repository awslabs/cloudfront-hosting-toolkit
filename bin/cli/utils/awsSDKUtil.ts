#!/usr/bin/env node
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

import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import {
  GetPipelineStateCommand,
  CodePipelineClient,
  StartPipelineExecutionCommand,
} from "@aws-sdk/client-codepipeline";
import {
  CodeStarConnectionsClient,
  GetConnectionCommand,
} from "@aws-sdk/client-codestar-connections";
import {
  ACMClient,
  ListCertificatesCommand,
  DescribeCertificateCommand,
  RequestCertificateCommand,
  DeleteCertificateCommand,
  RequestCertificateCommandInput
} from "@aws-sdk/client-acm";
import {
  Route53Client,
  ListResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommandInput,
  ListResourceRecordSetsCommandInput,
  
} from "@aws-sdk/client-route-53";

import {
  S3Client,
  HeadBucketCommand,
  GetBucketLocationCommand,
} from "@aws-sdk/client-s3";

const clientSSM = new SSMClient();
const clientACM = new ACMClient({ region: "us-east-1" });
const clientR53 = new Route53Client({ region: "us-east-1" });
const clientS3 = new S3Client({});

const clientCodeStar = new CodeStarConnectionsClient();
const clientCodePipeline = new CodePipelineClient();

import {
  CLOUDFRONT_HOSTEDZONE_ID,
  ERROR_PREFIX,
  SSM_CONNECTION_ARN_STR,
  SSM_CONNECTION_NAME_STR,
  SSM_CONNECTION_REGION_STR,
  SSM_PIPELINENAME_STR,
} from "../shared/constants";
import { CNAMES } from "../shared/types";
import { continueConfirmationQuestion } from "./prompt_questions";
import {
  calculateConnectionStackName,
  calculateMainStackName,
  getDomainNames,
  isRepoConfig,
  loadHostingConfiguration,
  startPrompt,
} from "./helper";

const util = require("util");

import {loadConfig} from "@aws-sdk/node-config-provider";
import {NODE_REGION_CONFIG_FILE_OPTIONS, NODE_REGION_CONFIG_OPTIONS} from "@aws-sdk/config-resolver";


/**
 * Checks the connection to the AWS account using AWS STS (Security Token Service).
 * Returns true if the connection is successful, otherwise displays an error and exits.
 */
export default async function checkAWSConnection() {
  const stsClient = new STSClient({});
  const getCallerIdentityCommand = new GetCallerIdentityCommand({});
  try {
    await stsClient.send(getCallerIdentityCommand);
    const currentRegion = await loadConfig(NODE_REGION_CONFIG_OPTIONS, NODE_REGION_CONFIG_FILE_OPTIONS)();

    return true;
  } catch (error) {
    
    console.error(
      `${ERROR_PREFIX} Impossible to connect to your the AWS account. Try to authenticate and try again.`
    );
    process.exit(1);
  }
}

/**
 * Checks if a specified bucket exists in Amazon S3.
 *
 * @param {string} bucketName - The name of the bucket to check.
 * @returns {Promise<boolean>} - Returns `true` if the bucket exists, `false` otherwise.
 */
export async function checkBucketExists(bucketName: string) {
  try {
    const headBucketCommand = new HeadBucketCommand({ Bucket: bucketName });

    // Check if the bucket exists
    await clientS3.send(headBucketCommand);

    // Get the current region of the bucket
    const getBucketLocationCommand = new GetBucketLocationCommand({
      Bucket: bucketName,
    });

    await clientS3.send(getBucketLocationCommand);
    return true;
  } catch (error) {
    const typedError = error as Error;

    if (typedError.name === "NotFound") {
      //console.log(`Bucket '${bucketName}' does not exist.`);
      return false;
    } else {
      //console.error("Error:", error);
      return false;
    }
  }
}

/**
 * Checks if an ACM (AWS Certificate Manager) certificate exists for the specified domain name.
 *
 * @param {string} domainName - The primary domain name for which to check certificate existence.
 * @returns {Promise<string | null>} - The ARN of the existing certificate, or null if not found.
 */
export const checkCertificateExists = async (
  domainName: string
): Promise<{
  certificateArn: string | undefined;
  status: string | undefined;
}> => {
  try {
    const command = new ListCertificatesCommand({});
    const response = await clientACM.send(command);

    let certificateArn;
    let certificateStatus;

    const domainNames = getDomainNames(domainName);
    if (response.CertificateSummaryList) {
      for (const certificate of response.CertificateSummaryList) {
        if (
          certificate.DomainName === domainNames[0] &&
          certificate.SubjectAlternativeNameSummaries?.includes(domainNames[1])
        ) {
          certificateArn = certificate.CertificateArn;
          certificateStatus = certificate.Status;

          break;
        }
      }
    }

    return { certificateArn: certificateArn, status: certificateStatus };
  } catch (error) {
    console.error("Error checking ACM Certificate", error);
    throw error;
  }
};

/**
 * Waits for an ACM (AWS Certificate Manager) certificate to be issued before proceeding.
 *
 * @param {string} certificateArn - The ARN (Amazon Resource Name) of the certificate to wait for.
 * @param {string | undefined} hostedZoneId - The optional hosted zone ID associated with the certificate.
 */

export async function waitCertificateToBeIssued(
  certificateArn: string,
  hostedZoneId: string | undefined
) {
  try {
    await validateCertificate(certificateArn, hostedZoneId);

    let certificateStatus;
    const input = {
      CertificateArn: certificateArn,
    };

    const command = new DescribeCertificateCommand(input);
    let response = await clientACM.send(command);

    certificateStatus = response.Certificate?.Status;
    while (certificateStatus != "ISSUED") {
      response = await clientACM.send(command);
      certificateStatus = response.Certificate?.Status;
      console.log(`\nCertificate is not ready to be used. Waiting ...`);
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 10000);
      });
    }
    if (certificateStatus == "ISSUED") {
      console.log("\nThe certificate is ready to be used.");
    } else {
      console.log(
        "\nThe certificate is still not ready. Wait a few minutes and then execute this command again."
      );
    }
  } catch (error) {
    console.error("Error waiting certificate to be issued", error);
    throw error;
  }
}

/**
 * Creates or updates an Alias resource record set in Amazon Route 53 to associate a custom domain with a CloudFront distribution.
 *
 * @param {string} domainName - The custom domain name (CNAME) to be associated with the CloudFront distribution.
 * @param {string} cloudFrontDomainName - The DNS name of the CloudFront distribution.
 * @param {string} hostedZoneId - The ID of the Route 53 hosted zone where the Alias resource record will be created/updated.
 */
export async function createCFCNAME(
  domainName: string,
  cloudFrontDomainName: string,
  hostedZoneId: string
) {
  const input: ChangeResourceRecordSetsCommandInput = {
    ChangeBatch: {
      Changes: [
        {
          Action: "CREATE",
          ResourceRecordSet: {
            Name: domainName,
            Type: "A",
            AliasTarget: {
              HostedZoneId: CLOUDFRONT_HOSTEDZONE_ID,
              DNSName: cloudFrontDomainName,
              EvaluateTargetHealth: false,
            },
          },
        },
      ],
    },
    HostedZoneId: hostedZoneId,
  };

  try {
    //await clientR53.changeResourceRecordSets(params);
    const command = new ChangeResourceRecordSetsCommand(input);
    await clientR53.send(command);
    console.log(
      `\nA new CNAME record has been added/updated to your DNS records that points to your CloudFront distribution: \n`
    );
    console.log(`>       ${domainName} -> ${cloudFrontDomainName}\n`);
    console.log(`It may take a few minutes to reflect the change.`);
  } catch (error) {
    console.error("Error creating CloudFront CNAME", error);
    throw error;
  }
}

export async function deleteCFCNAME(
  domainName: string,
  cloudFrontDomainName: string,
  hostedZoneId: string
) {
  const input: ChangeResourceRecordSetsCommandInput = {
    ChangeBatch: {
      Changes: [
        {
          Action: "DELETE",
          ResourceRecordSet: {
            Name: domainName,
            Type: "A",
            AliasTarget: {
              HostedZoneId: CLOUDFRONT_HOSTEDZONE_ID,
              DNSName: cloudFrontDomainName,
              EvaluateTargetHealth: false,
            },
          },
        },
      ],
    },
    HostedZoneId: hostedZoneId,
  };
  try {
    const command = new ChangeResourceRecordSetsCommand(input);
    await clientR53.send(command);

    console.log(
      `\nThe CNAME record has been deleted from your DNS records: \n`
    );
    console.log(`>       ${domainName} -> ${cloudFrontDomainName}\n`);
    console.log(`It may take a few minutes to reflect the change.`);
  } catch (error) {
    console.error("Error deleting CloudFront CNAME", error);
    throw error;
  }
}

export async function checkCFCNAMEExists(
  domainName: string,
  cloudFrontDomainName: string,
  hostedZoneId: string
) {
  const input: ListResourceRecordSetsCommandInput = {
    HostedZoneId: hostedZoneId,
    StartRecordName: domainName,
    StartRecordType: "A",
  };

  let matchingRecords = [];
  try {
    const command = new ListResourceRecordSetsCommand(input);
    const response = await clientR53.send(command);

    if (response.ResourceRecordSets) {
      matchingRecords = response.ResourceRecordSets.filter(
        (recordSet) =>
          (recordSet.Name === domainName ||
            recordSet.Name === domainName + ".") &&
          recordSet.Type === "A"
      );

      if (matchingRecords.length > 0) {
        const existingDNSName = matchingRecords[0].AliasTarget?.DNSName;
        if (
          existingDNSName &&
          existingDNSName !== cloudFrontDomainName &&
          existingDNSName !== cloudFrontDomainName + "."
        ) {
          console.error(
            `${ERROR_PREFIX} An A record already exists for "${domainName}" with a different CloudFront DNS name: "${existingDNSName}". Delete it manually and try again.`
          );
        }
      }
    }

    return matchingRecords.length > 0;
  } catch (error) {
    console.error(
      "Error checking or creating Alias resource record set:",
      error
    );
    throw error;
  }
}

/**
 * Creates an ACM (AWS Certificate Manager) certificate request for the specified domain name.
 *
 * @param {string} domainName - The primary domain name for which the certificate is requested.
 * @returns {Promise<string>} - The ARN (Amazon Resource Name) of the created ACM certificate.
 */
export const createACMCertificate = async (
  domainName: string
): Promise<string> => {
  try {
    const domainNames = getDomainNames(domainName);
    const input: RequestCertificateCommandInput = {
      DomainName: domainNames[0],
      ValidationMethod: "DNS",
      SubjectAlternativeNames: [domainNames[1]],
    };

    const command = new RequestCertificateCommand(input);
    const response = await clientACM.send(command);
    let certificateArn;
    if (response) {
      certificateArn = response.CertificateArn;
    } else {
      console.error(
        `${ERROR_PREFIX} An error occured when creating the ACM Certificate`
      );
      process.exit(1);
    }

    return certificateArn!;
  } catch (error) {
    console.error("Error creating ACM certificate", error);
    throw error;
  }
};

/**
 * Deletes an AWS ACM (Amazon Certificate Manager) certificate using its ARN (Amazon Resource Name).
 *
 * @param {string} certificateArn - The ARN of the ACM certificate to be deleted.
 * @returns {Promise<void>} A Promise that resolves when the certificate is successfully deleted, or rejects on error.
 *
 * @throws {Error} If an error occurs during the deletion process.
 */

export const deleteACMCertificate = async (
  certificateArn: string
): Promise<void> => {
  const input = {
    CertificateArn: certificateArn,
  };

  try {
    const command = new DeleteCertificateCommand(input);
    await clientACM.send(command);
    console.log(`ACM Certificate with ARN ${certificateArn} has been deleted.`);
  } catch (error) {
    console.error(
      util.format(
        "%d An error occurred when deleting the ACM Certificate",
        ERROR_PREFIX
      ),
      error
    );
    process.exit(1);
  }
};

/**
 * Validates an ACM (AWS Certificate Manager) certificate by ensuring the presence of a CNAME record.
 * If the hostedZoneId is provided, it adds the CNAME record to the hosted zone for domain validation.
 *
 * @param {string} certificateArn - The ARN of the certificate to be validated.
 * @param {string | undefined} hostedZoneId - The ID of the hosted zone where the CNAME record should be added.
 */
export async function validateCertificate(
  certificateArn: string,
  hostedZoneId: string | undefined
) {
  let isCNAMERecordPresent = false;
  let count = 0;
  const cnames: CNAMES[] = [];

  try {
    while (!isCNAMERecordPresent && count <= 10) {
      const input = {
        CertificateArn: certificateArn,
      };

      const command = new DescribeCertificateCommand(input);
      const response = await clientACM.send(command);

      if (response.Certificate?.DomainValidationOptions) {
        for (const validationRecord of response.Certificate
          ?.DomainValidationOptions) {
          if (
            validationRecord.ResourceRecord &&
            validationRecord.ResourceRecord.Type === "CNAME" &&
            validationRecord.ResourceRecord.Name &&
            validationRecord.ResourceRecord.Value
          ) {
            isCNAMERecordPresent = true;

            if (hostedZoneId) {
              const cnameExists = await checkCnameExists(
                hostedZoneId,
                validationRecord.ResourceRecord.Name!,
                validationRecord.ResourceRecord.Value
              );

              if (!cnameExists) {
                await createCnameRecord(
                  hostedZoneId,
                  validationRecord.ResourceRecord.Name,
                  validationRecord.ResourceRecord.Value
                );
              }
            } else {
              cnames.push({
                key: validationRecord.ResourceRecord.Name!,
                value: validationRecord.ResourceRecord.Value,
              });
            }
          }
        }
      }

      if (!isCNAMERecordPresent) {
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 10000);
        });
        count++;
      }
    }

    if (!isCNAMERecordPresent) {
      console.error(`${ERROR_PREFIX} Certificate is not yet created`);
      process.exit(1);
    }

    if (cnames.length > 0) {
      console.log(
        "Please ensure you add the CNAME record to your DNS configuration. If you have already added it, please allow some time for the changes to propagate as the ACM service may take up to 30 minutes to validate the domain.\n"
      );
      for (const cname of cnames) {
        console.log(">       CNAME name: " + cname.key);
        console.log(">       CNAME value: " + cname.value);
        console.log("\n");
      }
      await startPrompt(continueConfirmationQuestion);
    }
  } catch (error) {
    console.error("Error validating ACM certificate", error);
    throw error;
  }
}

async function checkCnameExists(
  hostedZoneId: string,
  cnameName: string,
  cnameValue: string
): Promise<boolean> {
  
  const input: ListResourceRecordSetsCommandInput = {
    HostedZoneId: hostedZoneId,
    MaxItems: 1, // Change to number type
    StartRecordName: cnameName,
    StartRecordType: "CNAME",
  };
  try {
    const command = new ListResourceRecordSetsCommand(input);
    const response = await clientR53.send(command);

    if (response.ResourceRecordSets && response.ResourceRecordSets.length > 0) {
      const firstRecord = response.ResourceRecordSets[0];
      if (
        firstRecord.Name === cnameName &&
        firstRecord.Type === "CNAME" &&
        firstRecord.ResourceRecords &&
        firstRecord.ResourceRecords[0].Value === cnameValue
      ) {
        console.log(
          "A CNAME record with the same name and value is already found in your Route 53 settings."
        );
        return true;
      }
    }
    return false; // CNAME record doesn't exist or doesn't match
  } catch (error) {
    console.error("Error checking CNAME record:", error);
    throw error;
  }
}

async function createCnameRecord(
  hostedZoneId: string,
  cnameName: string,
  cnameValue: string
): Promise<void> {
  
  const input: ChangeResourceRecordSetsCommandInput = {
    ChangeBatch: {
      Changes: [
        {
          Action: "CREATE",
          ResourceRecordSet: {
            Name: cnameName,
            ResourceRecords: [
              {
                Value: cnameValue,
              },
            ],
            TTL: 60,
            Type: "CNAME",
          },
        },
      ],
    },
    HostedZoneId: hostedZoneId,
  };

  try {
    const command = new ChangeResourceRecordSetsCommand(input);
    await clientR53.send(command);
    console.log(
      "A CNAME record has been added to your hosted zone. It may take a few minutes for the ACM service to validate your domain. Please wait for the validation process to complete."
    );
  } catch (error) {
    console.error("Error creating CNAME record:", error);
    throw error;
  }
}

/**
 * Checks if there are any pending connections by querying the status of a CodeStar connection.
 *
 * @returns {Promise<boolean>} - True if there are pending connections, false otherwise.
 */
export async function pendingConnections(): Promise<boolean> {
  const connectionArn = await getSSMParameter(SSM_CONNECTION_ARN_STR);
  const connectionRegion = await getSSMParameter(SSM_CONNECTION_REGION_STR);
  let connectionStatus;
  if (!connectionArn || !connectionRegion) return false;

  try {
    const input = {
      ConnectionArn: connectionArn,
    };
    const command = new GetConnectionCommand(input);
    const response = await clientCodeStar.send(command);

    connectionStatus = response.Connection
      ? response.Connection.ConnectionStatus
      : undefined;
      return connectionStatus === "PENDING";
  } catch (error) {
    console.error(
      `Failed to get connection status for ${connectionArn}:`,
      error
    );
    connectionStatus = undefined;
  }
  return connectionStatus === "PENDING";
}

/**
 * Retrieves the value of an AWS Systems Manager (SSM) parameter by name.
 *
 * @param {string} parameterName - The name of the SSM parameter to retrieve.
 * @returns {Promise<string>} A Promise that resolves to the value of the SSM parameter.
 * @throws {Error} If there is an error while retrieving the parameter.
 */
export async function getSSMParameter(parameterName: string) {
  try {
    const hostingConfiguration = await loadHostingConfiguration();

    let stackName;
    
    if (
      (parameterName === SSM_CONNECTION_ARN_STR ||
        parameterName === SSM_CONNECTION_NAME_STR ||
        parameterName === SSM_CONNECTION_REGION_STR) &&
      isRepoConfig(hostingConfiguration)
    ) {
      stackName = calculateConnectionStackName(
        hostingConfiguration.repoUrl,
        hostingConfiguration.branchName
      );
    } else {
      stackName = calculateMainStackName(hostingConfiguration);
    }
    
    const ssmParam = "/" + stackName + "/" + parameterName;
    const command = new GetParameterCommand({
      Name: ssmParam,
    });

    // Execute the command and retrieve the parameter value
    const response = await clientSSM.send(command);
    const paramValue = response.Parameter?.Value;

    return paramValue;
  } catch (err) {
    
    console.error(`Error retrieving parameter ${parameterName}`, err);
    throw err;
  }
}



export async function startPipelineExecution() {
  try {
    
    const pipelineName = await getSSMParameter(SSM_PIPELINENAME_STR);
    const params = {
      name: pipelineName,
    };

    const pipelineStatus = await getPipelineStatus();
    if (pipelineStatus.status !== "InProgress") {
      const command = new StartPipelineExecutionCommand(params);
      const response = await clientCodePipeline.send(command);
      console.log(`Pipeline execution started successfully`);
    }else{
      console.log("Pipeline is already in progress.");
    }
    
  } catch (error) {
    console.error("Error starting pipeline execution:", error);
    throw error;
  }
}

export async function getPipelineStatus() {
  try {
    const pipelineName = await getSSMParameter(SSM_PIPELINENAME_STR);
    //Cancelled | InProgress | Failed | Stopped | Stopping | Succeeded
    if (pipelineName) {
      const input = {
        name: pipelineName,
      };
      const command = new GetPipelineStateCommand(input);
      const response = await clientCodePipeline.send(command);
      // Extract the stage states from the response
      const stageStates = response.stageStates;

      if (stageStates && stageStates.length > 0) {
        let hasInProgress = false;
        let hasFailed = false;
        let lastStageStatus: string | null = null; // Initialize with null
        let lastStageName: string | null = null; // Initialize with null

        for (const stage of stageStates) {
          if (stage.latestExecution && stage.latestExecution.status) {
            lastStageStatus = stage.latestExecution.status;
            lastStageName = stage.stageName ?? "Unknown"; // Use "Unknown" if stageName is undefined

            if (lastStageStatus === "InProgress") {
              hasInProgress = true;
            } else if (lastStageStatus === "Failed") {
              hasFailed = true;
            }
          }
        }

        if (hasInProgress) {
          return {
            status: "InProgress",
            stageName: lastStageName || "Unknown",
          };
        } else if (hasFailed) {
          return { status: "Failed", stageName: lastStageName || "Unknown" };
        } else {
          // No stage in progress and no stage has failed, return the status of the last stage along with its name
          return {
            status: lastStageStatus || "Unknown",
            stageName: lastStageName || "Unknown",
          };
        }
      }
    }

    // If hosting.pipeline is not defined or there are no stages, return a default status and stage name (e.g., "Unknown" for both).
    return { status: "Unknown", stageName: "Unknown" };
  } catch (error) {
    console.error("Error getting Pipeline Status", error);
    throw error;
  }
}
