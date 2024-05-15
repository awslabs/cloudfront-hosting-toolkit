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

import { Dictionary } from "./types";
import * as Joi from "joi";

export const TOOL_NAME = "cloudfront-hosting-toolkit";
export const CONFIG_FILE_NAME = TOOL_NAME + "-config.json";
export const BUILD_FILE_NAME = TOOL_NAME + "-build.yml";
export const CFF_FILE_NAME = TOOL_NAME + "-cff.js";


/*
export const SOURCE_STR = "HostingHostingInfrastructureDeployTypeSource";
export const DOMAIN_STR = "HostingHostingInfrastructureDomainName";
export const PIPELINENAME_STR = "HostingPipelineInfrastructurePipelineName";

export const CONNECTION_ARN_STR = "RepositoryConnectionConnectionArn";
export const CONNECTION_NAME_STR = "RepositoryConnectionConnectionName";
export const CONNECTION_REGION_STR = "RepositoryConnectionHostingRegion";
*/

export const SSM_SOURCE_STR = "HostingHostingInfrastructureDeployTypeSource";

export const SSM_DOMAIN_STR = "DomainName";
export const SSM_PIPELINENAME_STR = "PipelineName";
export const SSM_CONNECTION_ARN_STR = "ConnectionArn";
export const SSM_CONNECTION_NAME_STR = "ConnectionName";
export const SSM_CONNECTION_REGION_STR = "ConnectionRegion";


export const CONNECTION_STACK_NAME = "hosting-connection";
export const MAIN_STACK_NAME = "hosting-main";

export const CLOUDFRONT_HOSTEDZONE_ID = "Z2FDTNDATAQYW2";

export const GITHUB_REGEX =
  /^((https:\/\/github\.com\/([^/]+)\/([^/]+))|(git@github\.com:([^/]+)\/([^/]+)))\.git$/;
export const DOMAIN_NAME_REGEX =
  /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i;

export const ERROR_PREFIX = "\n\n[ERROR]";

export const FRAMEWORKS: Dictionary<string> = {
  reactjs: "React Framework",
  nextjs: "Next.js Framework",
  angularjs: "AngularJS Framework",
  vuejs: "Vue.js Framework",
  astro: "Astro Framework",
  basic: "No FrontEnd framework used; Basic implementation (no build required)",
};

export const SCHEMA = Joi.object()
  .keys({
    repoUrl: Joi.string().optional(),
    branchName: Joi.string().optional(),
    framework: Joi.string().optional(),
    s3bucket: Joi.string().optional(),
    s3path: Joi.string().allow("").optional(),
    domainNameRegex: Joi.string().allow("").optional(),
    hostedZoneId: Joi.string().allow("").optional(),
  })
  .unknown();
