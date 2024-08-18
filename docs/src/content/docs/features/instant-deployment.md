---
title: Instant deployment
---

The Instant Deployment feature of CloudFront Hosting Toolkit enables rapid and efficient updates to your live website, significantly reducing deployment times and accelerating your development cycle.

## Key Features

- **Automated Deployment Pipeline**: Leverages AWS CodePipeline for a streamlined deployment process.
- **Quick Updates**: Changes are reflected on your live site within minutes of pushing code.
- **Versioned Deployments**: Each deployment creates a new version in a separate S3 folder.
- **Atomic Updates**: Ensures all users see the new version, never a mix of old and new version.
- **No Cache Invalidation Required**: CloudFront Function redirects requests to the new folder in S3.

## How It Works

1. **Code Push**: You push your changes to the configured Git repository or upload a new ZIP file to S3.
2. **Pipeline Trigger**: This action automatically triggers the AWS CodePipeline.
3. **Build Process**: AWS CodeBuild compiles your code and creates deployment artifacts.
4. **Artifact Upload**: The built artifacts are uploaded to a new folder in the hosting S3 bucket.
5. **Key-Value Store Update**: The commit ID of the new deployment is stored in a Key-Value Store (KVS).
6. **Traffic Routing**: A CloudFront Function checks the KVS for the latest commit ID and routes traffic to the corresponding S3 folder.

## Benefits

- **Instant availability**: New versions of your website are available immediately after deployment.
- **Consistent user experience**: All users see the same version of the site at any given time.
- **No mixed content**: Eliminates the risk of serving a mixture of old and new version files to users.
- **Efficient resource usage**: No need for cache invalidation.


Instant Deployment streamlines your development workflow, allowing you to focus on building features rather than managing complex deployment processes. By leveraging CloudFront Functions and Key-Value Store, it ensures that your users always see a consistent, up-to-date version of your website without the need for cache invalidation or concerns about mixed content during deployments.