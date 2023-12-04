#!/usr/bin/env node
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License").
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { handleDeleteCommand } from "./actions/delete";
import handleDeployCommand from "./actions/deploy";
import { handleShowCommand } from "./actions/show";
import handleInitCommand from "./actions/init";
import { ERROR_PREFIX } from "./shared/constants";
import { handleStatusCommand } from "./actions/status";

const yargs = require("yargs");

async function main() {
  const args = yargs
    .usage("Usage: $0 <command> [options]")
    .command(
      "init",
      "Step by step guide for configuring a GitHub source code repository and generate a configuration file",
      (yargs: any) => {
        yargs
          .option("s3", {
            describe:
              "Step by step guide for configuring an S3 source code repository and generate a configuration file",
            type: "boolean",
          })          
      }
    )
    .command(
      "deploy",
      'Initiate a deployment of the infrastructure, utilizing the configuration file generated during the execution of the "init" command'
    )
    .command(
      "show",
      "Show the domain name connected to the deployed source code repository for a website that has been deployed"
    )
    .command(
      "delete",
      "Completely remove the hosting infrastructure from your AWS account"
    )
    .command("status", "Display the current status of the pipeline deployment")
    .help()
    .parse();

  if (args._.length > 1) {
    console.error(`${ERROR_PREFIX} Only one command at a time`);
    process.exit(1);
  }

  await handleCommand(args);
}

async function handleCommand({
  _: [command],
  s3,
}: {
  _: string[];
  s3?: boolean;
}) {
  switch (command) {
    case "deploy":
      await handleDeployCommand();
      break;

    case "show":
      await handleShowCommand();
      break;
    case "init":
      await handleInitCommand(s3 || false);
      break;
    case "delete":
      await handleDeleteCommand();
      break;
    case "status":
      await handleStatusCommand();
      break;
    default:
      yargs.showHelp()
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
