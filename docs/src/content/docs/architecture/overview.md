---
title: Architecture Overview
---

CloudFront Hosting Toolkit leverages several AWS services to create a robust, scalable, and efficient hosting infrastructure for your web applications. The architecture is designed to support both GitHub-based and S3-based source code repositories, ensuring flexibility in your deployment workflow.

<img src="/cloudfront-hosting-toolkit/img/architecture.jpg" alt="CloudFront Hosting Toolkit Architecture Diagram">

## Key Components

1. **Source Code Management**:
   - **GitHub Repository**: For Git-based workflows.
   - **Amazon S3 (Source Code Repository)**: For S3-based workflows, allowing ZIP file uploads.

2. **Deployment Pipeline**:
   - **AWS CodePipeline**: Manages the overall deployment process, orchestrating the flow from source to production.
   - **AWS CodeBuild**: Handles the build process for your web application, compiling code and creating artifacts.
   - **Amazon S3 (Artifacts)**: Stores deployment artifacts during the pipeline process.

3. **Hosting Infrastructure**:
   - **Amazon S3 (Static files)**: Stores your website files for serving.
   - **Amazon CloudFront**: Serves as the content delivery network (CDN) for your website, ensuring fast global access.
   - **CloudFront Function**: Handles request routing to serve the latest version of your site.
   - **Amazon Route 53**: Manages DNS routing for your custom domain (if configured).

4. **Security and SSL**:
   - **AWS Certificate Manager (ACM)**: Provisions and manages SSL/TLS certificates for secure HTTPS connections.

5. **Deployment Orchestration**:
   - **AWS Step Functions**: Orchestrates the deployment process, ensuring proper sequencing of tasks.
   - **AWS Lambda**: Triggers the pipeline for S3-based deployments and potentially other serverless operations.

6. **State Management**:
   - **Key Value Store (DynamoDB)**: Stores routing information to direct traffic to the latest deployed version.

## Workflow Overview

1. **Code Push/Upload**:
   - Developers push code to GitHub or upload a ZIP file to the S3 source code repository.

2. **Pipeline Triggering**:
   - GitHub pushes or S3 uploads trigger the AWS CodePipeline, either directly or via AWS Lambda.

3. **Build and Artifact Creation**:
   - AWS CodeBuild compiles the code and creates deployment artifacts.
   - Artifacts are stored in an S3 bucket.

4. **Deployment**:
   - AWS Step Functions orchestrate the deployment process.
   - Static files are copied to the hosting S3 bucket.
   - The Key Value Store is updated with the latest deployment information.

5. **Content Delivery**:
   - CloudFront serves the website content globally.
   - CloudFront Functions use the Key Value Store to route requests to the latest version.
   - Amazon Route 53 handles DNS routing for custom domains.

6. **Security**:
   - AWS Certificate Manager provides SSL/TLS certificates for secure connections.

This architecture ensures rapid, consistent deployments, optimal performance, and high availability for your web applications. It leverages AWS's global infrastructure to deliver content quickly to users worldwide while maintaining the flexibility to deploy from various source repositories.