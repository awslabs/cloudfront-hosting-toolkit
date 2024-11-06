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
const { S3 } = require("@aws-sdk/client-s3");
const s3 = new S3({customUserAgent: "cht"});

const bucketName = process.env.BUCKET_NAME; // Use the environment variable

exports.handler = async (event, context) => {
  console.log("event=" + JSON.stringify(event));

  try {
    const commitId = event.commitId;

    const listObjectsParams = {
      Bucket: bucketName,
      Delimiter: "/",
    };

    const listResponse = await s3.listObjectsV2(listObjectsParams);

    const folderObjects = listResponse.CommonPrefixes.map((prefix) => ({
      Prefix: prefix.Prefix,
    }));

    const objectsToDelete = folderObjects.filter((object) => {
      const folderPath = object.Prefix;
      const folderName = folderPath.slice(0, -1); // Remove trailing slash

      return (
        !folderName.startsWith(commitId)
      );
    });

    if (objectsToDelete.length === 0) {
      console.log("No files or folders to delete.");
    } else {
      let deletedItemCount = 0;

      for (const object of objectsToDelete) {
        const deleteFilesParams = {
          Bucket: bucketName,
          Prefix: object.Prefix,
        };

        const files = await s3.listObjectsV2(deleteFilesParams);

        for (const file of files.Contents) {
          const deleteFileParams = {
            Bucket: bucketName,
            Key: file.Key,
          };

          await s3.deleteObject(deleteFileParams);
          console.log(`Deleted file: ${file.Key}`);
          deletedItemCount++;
        }
      }

      console.log(`Deleted ${deletedItemCount} objects successfully.`);
    }

    return "Execution completed successfully";
  } catch (error) {
    console.error("Error:", error);
    throw new Error(`Error deleting old files and folders: ${error.message}`);
  }
};
