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

import { Stack, StackProps } from "aws-cdk-lib";

import { Construct } from "constructs";
import { HostingConfiguration } from "../bin/cli/shared/types";
import { Hosting } from "./hosting";

interface IParamProps {
  hostingConfiguration: HostingConfiguration;
  buildFilePath: string;
  connectionArn?: string;
  certificateArn?: string;
}

export class HostingStack extends Stack {
  public readonly hosting: Hosting;
  constructor(
    scope: Construct,
    id: string,
    params: IParamProps,
    props?: StackProps
  ) {
    super(scope, id, props);

    this.hosting = new Hosting(this, "Hosting", params);
  }
}
