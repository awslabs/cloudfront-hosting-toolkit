---
title: How It Works
---

CloudFront Hosting Toolkit simplifies the process of deploying and managing frontend applications on AWS. The toolkit operates in three main steps:

1. **Initialization**: Set up your project and configure the toolkit.
2. **Deployment**: Deploy your frontend application infrastructure to AWS.
3. **Updates**: Automatic updates and content delivery after deployment.

Let's explore each step in detail:

## Initialization

When you run `cloudfront-hosting-toolkit init`:

1. The CLI detects your project's configuration, including GitHub repository details (if applicable).
2. It guides you through a setup process, allowing you to confirm or override detected information.
3. The command creates configuration files in a `cloudfront-hosting-toolkit` folder.

## Deployment

When you run `cloudfront-hosting-toolkit deploy`:

1. The toolkit deploys the hosting infrastructure on AWS, including:
   - Amazon S3 bucket for storing your website files
   - Amazon CloudFront distribution for content delivery
   - AWS CodePipeline for continuous deployment
   - AWS CodeBuild project for building your application
   - Amazon DynamoDB table for storing deployment metadata
   - AWS Step Functions for orchestrating the deployment process
   - CloudFront Functions for request handling
2. Once the infrastructure is set up, the toolkit triggers the initial deployment of your website content (see "Updates" section for details on this process).

## Updates

After the initial deployment, no further use of the CloudFront Hosting Toolkit is required for routine updates. The update process works as follows:

1. For every new commit and push to your configured branch, the AWS CodePipeline is automatically triggered.
2. The pipeline pulls the latest code from the repository (or uses the uploaded ZIP file for S3 sources).
3. AWS CodeBuild compiles your code and creates deployment artifacts.
4. Artifacts are uploaded to the hosting S3 bucket in a new folder identified by the commit ID.
5. Once the new version is deployed, the pipeline triggers an AWS Step Function.
6. The Step Function updates the DynamoDB Key-Value Store with the new commit ID.
7. This update to the Key-Value Store instructs the CloudFront Function to route traffic to the newly deployed folder.
8. This process bypasses cached content from the previous version, ensuring immediate updates.

### Content Delivery

The CloudFront Hosting Toolkit implements a robust system for handling requests and ensuring **atomic deployments**:

1. When a user requests your website, the request hits Amazon CloudFront.
2. A CloudFront Function intercepts the request and checks the DynamoDB Key-Value Store for the latest deployed folder (commit ID).
3. The function rewrites the request URL to point to the correct S3 folder corresponding to the latest commit ID.
4. CloudFront serves the content from the appropriate S3 folder.

This approach enables atomic deployments, providing several key benefits:

- All requests are immediately directed to the new version once it's deployed.
- There's no risk of users seeing a mix of old and new content.
- The transition is seamless and instantaneous for all users globally.
- It eliminates the "partial update" problem, ensuring consistency across your entire user base.
- It prevents potential issues that could arise from inconsistent state between old and new versions.

By leveraging CloudFront's global content delivery network and this intelligent routing mechanism, visitors always see the most recent version of your website, regardless of their location or when they accessed the site. This ensures a consistent, up-to-date experience for all users while benefiting from the performance advantages of a CDN.