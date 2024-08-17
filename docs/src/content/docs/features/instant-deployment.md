---
title: Instant Deployment
---

The Instant Deployment feature of CloudFront Hosting Toolkit enables rapid and efficient updates to your live website, significantly reducing deployment times and accelerating your development cycle.

## Key Features

- **Automated Deployment Pipeline**: Leverages AWS CodePipeline for a streamlined deployment process.
- **Quick Updates**: Changes are reflected on your live site within minutes of pushing code.
- **Automatic Cache Invalidation**: Ensures visitors always see the latest version of your site.
- **Versioned Deployments**: Each deployment creates a new version, allowing for easy rollbacks if needed.

## How It Works

1. **Code Push**: You push your changes to the configured Git repository or upload a new ZIP file to S3.
2. **Pipeline Trigger**: This action automatically triggers the AWS CodePipeline.
3. **Build Process**: AWS CodeBuild compiles your code and creates deployment artifacts.
4. **Artifact Upload**: The built artifacts are uploaded to a new folder in the hosting S3 bucket.
5. **Traffic Routing**: A CloudFront Function is updated to route traffic to the new folder.
6. **Cache Invalidation**: CloudFront cache is invalidated to ensure immediate visibility of changes.

## Benefits

- **Reduced Time-to-Live**: Get your changes in front of users faster.
- **Consistent Deployments**: The automated process ensures consistency across all deployments.
- **Minimal Downtime**: The process is designed to minimize or eliminate downtime during updates.
- **Easy Rollbacks**: If issues are detected, you can quickly revert to a previous version.

## Best Practices

- Regularly push small, incremental changes rather than large, infrequent updates.
- Use meaningful commit messages to easily track what each deployment contains.
- Monitor your deployments using the `cloudfront-hosting-toolkit status` command.

Instant Deployment streamlines your development workflow, allowing you to focus on building features rather than managing complex deployment processes.