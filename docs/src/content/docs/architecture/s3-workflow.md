---
title: S3 Workflow
---
The S3 workflow in CloudFront Hosting Toolkit allows for deployments from an S3 bucket, useful for pre-built artifacts or when GitHub integration is not needed.

## Process Overview
1. **Source Stage**: Uploading a ZIP file to a specified S3 bucket triggers AWS CodePipeline.
2. **Build Stage**: The ZIP file is copied from the source S3 bucket, unzipped, and files are copied to the hosting S3 bucket.
3. **Deploy Stage**: Similar to the GitHub process, updating the Key-Value Store and CloudFront Function.

## Benefits
- Suitable for pre-built or static websites
- Flexibility in deployment source
- Consistent deployment process with GitHub workflow