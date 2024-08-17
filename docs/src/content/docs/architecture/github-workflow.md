---
title: GitHub Workflow
---

The GitHub workflow in CloudFront Hosting Toolkit provides a seamless integration between your GitHub repository and AWS deployment infrastructure.

## Process Overview
1. **Source Stage**: Code changes pushed to the GitHub repository trigger AWS CodePipeline.
2. **Build Stage**: CodeBuild compiles the code and creates deployment artifacts using the buildspec YAML.
3. **Deploy Stage**: 
   - Artifacts are uploaded to the hosting S3 bucket in a new folder (identified by the commit ID).
   - A Step Function updates the DynamoDB Key-Value Store with the new folder information.
   - The CloudFront Function is updated to route traffic to the new folder.

## Benefits
- Automated deployments triggered by code pushes
- Version control integration
- Consistent build and deployment process


