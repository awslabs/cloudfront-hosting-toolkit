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
import { S3 } from "@aws-sdk/client-s3";
import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { LogLevel } from "@aws-lambda-powertools/logger/lib/types";

const logger = new Logger({
  logLevel: process.env.POWERTOOLS_LOG_LEVEL as LogLevel,
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
});

const tracer = new Tracer({ 
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
});

const s3 = tracer.captureAWSv3Client(new S3());

const bucketName = process.env.BUCKET_NAME;

export const handler = async (event: any): Promise<any> => {

  logger.info("Incoming Request:", { event });

  try {
    const commitId = event.commitId;

    const listObjectsParams = {
      Bucket: bucketName,
      Delimiter: "/",
    };

    const listResponse = await s3.listObjectsV2(listObjectsParams);

    if(listResponse.CommonPrefixes){
      const folderObjects = listResponse.CommonPrefixes.map((prefix) => ({
        Prefix: prefix.Prefix,
      }));
  
      const objectsToDelete = folderObjects.filter((object) => {
        const folderPath = object.Prefix;
        if (folderPath) {
          const folderName = folderPath.slice(0, -1);
          return !folderName.startsWith(commitId);
        } else {
          return false;
        }
      });
  
      if (objectsToDelete.length === 0) {
        logger.info("No files or folders to delete.");
      } else {
        let deletedItemCount = 0;
  
        for (const object of objectsToDelete) {
          const deleteFilesParams = {
            Bucket: bucketName,
            Prefix: object.Prefix,
          };
  
          const files = await s3.listObjectsV2(deleteFilesParams);
          if(files.Contents){
            for (const file of files.Contents) {
              const deleteFileParams = {
                Bucket: bucketName,
                Key: file.Key,
              };
    
              await s3.deleteObject(deleteFileParams);
              logger.debug(`Deleted file: ${file.Key}`);
              deletedItemCount++;

            }

            logger.info(`Deleted ${deletedItemCount} objects successfully.`);


          }else{
            logger.info("No files or folders to delete.");
          }
          
        }
  
      }
      logger.info("Execution completed successfully");      
    }else{
      logger.debug("No CommonPrefixes found in listResponse");
      logger.info("Error encountered while searching for directories in S3");
    }
    
  } catch (error) {
    logger.error("Error:", error as Error);
    throw new Error(`Error deleting old files and folders: ${(error as Error).message}`);
  }
};
