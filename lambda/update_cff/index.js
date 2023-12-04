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

const { CloudFront } = require("@aws-sdk/client-cloudfront");
const cloudfront = new CloudFront();
const fs = require('fs');
 
 
 async function getCffUpdatedCode(pathToAppend) {
 
     var newContent = "";
     const allFileContents = fs.readFileSync('cff.js', 'utf-8');
     allFileContents.split(/\r?\n/).forEach(line => {
         var newLine = "";
         if (line.startsWith('var pathToAdd'))
            newLine = `var pathToAdd = \"${pathToAppend}\"; `;
         else
             newLine = line; 
         newContent = newContent + newLine + "\n";
 
     });
     console.log("updateCff="+newContent);
     return updateCff(newContent);
 
 }
 
 async function updateCff(functionCodeAsStr) {
 
     console.log("Get ETAG for CloudFront Function " + process.env.CFF_NAME);
 
     var params = {
         Name: process.env.CFF_NAME
     };
 
     var response = await cloudfront.describeFunction(params);
     console.log("Update CloudFront Function Code");
     params = {
         FunctionCode: Buffer.from(functionCodeAsStr),
         FunctionConfig: {
             'Comment': 'Change uri',
             'Runtime': 'cloudfront-js-1.0'
         },
         IfMatch: response['ETag'],
         Name: process.env.CFF_NAME
     };
 
     response = await cloudfront.updateFunction(params);
     console.log("response = "+JSON.stringify(response));
     
     console.log("Publish CloudFront Function");
     params = {
         IfMatch: response['ETag'],
         Name: process.env.CFF_NAME
     };
     await cloudfront.publishFunction(params);
 
 
     console.log("Cloudfront Function updated");
 
 }
 
 exports.handler = async (event, context) => {
    console.log("event=" + JSON.stringify(event));
    await getCffUpdatedCode(event.commitId);
 
    return "OK";
 
 };