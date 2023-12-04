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
const s3 = new S3();

const bucketName = process.env.BUCKET_NAME; // Use the environment variable

exports.handler = async (event, context) => {
    try {
        const listObjectsParams = {
            Bucket: bucketName,
            Delimiter: '/'
        };

        const listResponse = await s3.listObjectsV2(listObjectsParams);
        const folderObjects = listResponse.CommonPrefixes.map(prefix => ({ Prefix: prefix.Prefix }));
        
        // Sort the folder objects based on LastModified in descending order
        folderObjects.sort((a, b) => b.LastModified - a.LastModified);

        const foldersToKeep = folderObjects.slice(-2);

        let deletedItemCount = 0;

        for (const folder of folderObjects) {
            if (!foldersToKeep.some(keepFolder => keepFolder.Prefix === folder.Prefix)) {
                const listFilesParams = {
                    Bucket: bucketName,
                    Prefix: folder.Prefix
                };

                const files = await s3.listObjectsV2(listFilesParams);

                if (files.Contents.length === 0) {
                    console.log(`No files to delete in folder: ${folder.Prefix}`);
                    continue;
                }
                
                for (const file of files.Contents) {
                    const deleteFileParams = {
                        Bucket: bucketName,
                        Key: file.Key
                    };

                    await s3.deleteObject(deleteFileParams);
                    console.log(`Deleted file: ${file.Key}`);
                    deletedItemCount++;
                }
            }
        }
        if (deletedItemCount === 0) {
            console.log('No files or folders to delete.');
        }else{
            console.log('Old files and folders deleted successfully.');
        }
        
        return 'Execution completed successfully';
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`Error deleting old files and folders: ${error.message}`);
    }
};