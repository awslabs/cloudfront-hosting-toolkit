---
title: Architecture Overview
---

CloudFront Hosting Toolkit leverages several AWS services to create a robust, scalable, and efficient hosting infrastructure for your web applications.

![Technical diagram](img/architecture.jpg)

## Key Components
1. **AWS CodePipeline**: Manages the overall deployment process.
2. **AWS CodeBuild**: Handles the build process for your web application.
3. **Amazon S3**: Stores your website files and deployment artifacts.
4. **Amazon CloudFront**: Serves as the content delivery network (CDN) for your website.
5. **AWS Lambda**: Powers the CloudFront Functions for request handling.
6. **AWS Step Functions**: Orchestrates the deployment process.
7. **Amazon DynamoDB**: Stores key-value pairs for routing information.

This architecture ensures rapid, consistent deployments and optimal performance for your web applications.

