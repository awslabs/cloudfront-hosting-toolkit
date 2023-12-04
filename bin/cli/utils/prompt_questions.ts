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

import { frameworkList, isValidBucketName, isValidDomainName, isValidGithubUrl, validateNoLeadingTrailingSlashes } from "./helper";

//export const getFrameworkSelectionQuestions = (initialValue?: string) => {

export const getGithubRepositoryQuestions = (
  initialUrl?: string,
  initialBranch?: string
) => {
  const question = [
    {
      type: "text",
      name: "repoUrl",
      message: "Please provide your GitHub repository URL",
      ...(initialUrl !== undefined && { initial: initialUrl }), // Conditionally include 'initial'
      validate: (value: string) =>
        isValidGithubUrl(value)
          ? true
          : "GitHub repository format must be https://github.com/USERNAME/REPOSITORY.git or git@github.com:USERNAME/REPOSITORY.git and can be added only once",
    },
    {
      type: "text",
      name: "branchName",
      message:
        "What is the name of the branch you would like to use? Hit Enter to confirm or change the selection.",
      initial: initialBranch || "main",
      validate: (value: string) =>
        value.length > 0 ? true : "Branch name is mandatory",
    },
  ];

  return question;
};

export const getS3BucketConfigurationQuestions = (
  defaultBucket: string,
  defaultPath: string = ""
) => [
  {
    type: "text",
    name: "s3bucket",
    ...(defaultBucket !== undefined && { initial: defaultBucket }),
    message: "Please enter the name of the bucket you would like to use",
    validate: (value: string) =>
    isValidBucketName(value) ? true : "The bucket name must not be empty, and the corresponding bucket must exist",
  },
  {
    type: "text",
    name: "s3path",
    ...(defaultPath !== undefined && { initial: defaultPath }),
    message:
    "If you would like to specify a prefix, please enter it below. Otherwise, leave it blank",
    validate: (value:string) => validateNoLeadingTrailingSlashes(value) ? true :  "The prefix should not have leading or trailing slashes",
  
  },
];

function findIndexByValue(
  objects: { title: string; value: string }[],
  value?: string
) {
  if (!value) return 0;
  for (let i = 0; i < objects.length; i++) {
    if (objects[i].value === value) {
      return i;
    }
  }
  return 0;
}

export const getFrameworkSelectionQuestions = (initialValue?: string) => {
  const index = findIndexByValue(frameworkList(), initialValue);
  const question = {
    type: "select",
    name: "framework",
    message:
      "Which framework did you use for website construction? Press Enter to confirm or change the selection.",
    choices: frameworkList(),
    initial: index,
  };
  return [question];
};

export const getDomainNameQuestion = (defaultDomainName?: string) => [
  {
    type: "select",
    name: "value",
    message: "Do you own a domain name that you would like to use?",
    choices: [
      { title: "Yes", value: "yes" },
      { title: "No", value: "no" },
    ],
    initial: defaultDomainName ? 0 : 1,
  },
];

export const continueConfirmationQuestion = {
  type: "text",
  name: "value",
  message: "Please complete the operation and type 'ok' to continue ",
  validate: (value: string) =>
    value.toLowerCase() == "ok" ? true : "You have to type OK to continue",
};

export const domainNameDetailsQuestions = (defaultDomainName?: string) => [
  {
    type: "text",
    name: "domainName",
    ...(defaultDomainName !== undefined && { initial: defaultDomainName }),

    message:
      "Please provide your domain name in the following formats: www.mydomainname.com or mydomainname.com ?",
    validate: (value: string) =>
      isValidDomainName(value)
        ? true
        : "Domain name format must be www.mydomainname.com or mydomainname.com",
  },
  {
    type: "select",
    name: "registrar",
    message: "Where is the authoritative DNS server of this domain?",
    choices: [
      { title: "Elsewhere", value: "another" },
      { title: "Route 53 in this AWS Account", value: "current" },
    ],
    initial: 1,
  },
];

export const hostedZoneIdQuestion = (defaultHostedZoneId?: string) => [
  {
    type: "text",
    name: "hostedZoneId",
    ...(defaultHostedZoneId !== undefined && { initial: defaultHostedZoneId }),
    message: "Please type the hosted zone ID",
    validate: (value: string) =>
      value.length > 0 ? true : "The hosted zone must not be empty",
  },
];

export const cloudFrontAssociationQuestion = {
  type: "select",
  name: "value",
  message:
    "Would you like to associate the domain name to the CloudFront distribution automatically now, or would you prefer to do it later?",
  choices: [
    { title: "Associate automatically now.", value: "yes" },
    { title: "Do it later.", value: "no" },
  ],
  initial: 0,
};



export const manualGitHubConfigConfirmationQuestion = {
  type: "select",
  name: "value",
  message:
    "Would you like to manually enter your GitHub repository information?",
  choices: [
    { title: "Yes", value: "manual" },
    { title: "No, exit", value: "exit" },
  ],
  initial: 0,
};

export const hostingInfrastructureDeletionConfirmation = {
  type: "select",
  name: "value",
  message:
    "Are you sure you want to completely remove the hosting infrastructure from your AWS account?",
  choices: [
    { title: "Yes", value: "save" },
    { title: "No", value: "exit" },
  ],
  initial: 1,
};

