---
title: How It Works
---

CloudFront Hosting Toolkit simplifies the process of deploying and managing frontend applications on AWS. Here's an overview of how the toolkit operates:

## Initialization Process
When you run `cloudfront-hosting-toolkit init`:
1. The CLI detects your project's configuration, including GitHub repository details (if applicable).
2. It guides you through a setup process, allowing you to confirm or override detected information.
3. The command creates configuration files in a `cloudfront-hosting-toolkit` folder.

## Deployment Process
When you run `cloudfront-hosting-toolkit deploy`:
1. The toolkit triggers an AWS CodePipeline based on your configuration.
2. For GitHub sources, the pipeline pulls the latest code. For S3 sources, it uses the uploaded ZIP file.
3. AWS CodeBuild compiles your code and creates deployment artifacts.
4. Artifacts are uploaded to a hosting S3 bucket in a new folder identified by the commit ID.
5. An AWS Step Function updates a DynamoDB Key-Value Store, instructing the CloudFront Function to route traffic to the new folder.
6. This process bypasses cached content from the previous version, ensuring immediate updates.

## Request Handling
When a user requests your website:
1. The request hits Amazon CloudFront.
2. A CloudFront Function intercepts the request.
3. The function checks the DynamoDB Key-Value Store for the latest deployed folder.
4. It rewrites the request URL to point to the correct S3 folder.
5. CloudFront serves the content from the appropriate S3 folder.

This approach ensures visitors always see the most recent version of your website while benefiting from CloudFront's global content delivery network.