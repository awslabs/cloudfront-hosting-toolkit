---
title: CDK Construct Guide
---

The CloudFront Hosting Toolkit can be easily integrated into your existing CDK projects as a construct.

## Installation

Install the CloudFront Hosting Toolkit in your CDK project:

```bash
npm install @aws/cloudfront-hosting-toolkit
```

## Configuration

Before using the construct, you need to set up some configuration files. See our [CDK Configuration Guide](/cloudfront-hosting-toolkit/user-guide/cdk-configuration) for detailed instructions.

## Usage

After setting up the required configuration, you can use the CloudFront Hosting Toolkit construct in your CDK code:

### For GitHub Repository Deployment

```typescript
import { RepositoryConnection, Hosting } from '@aws/cloudfront-hosting-toolkit';

const config = {
    repoUrl: "https://github.com/USERNAME/REPOSITORY.git",
    branchName: "main",
    framework: "nextjs"
};

const repositoryConnection = new RepositoryConnection(this, "MyRepositoryConnection", config);

new Hosting(this, "MyHosting", {
    hostingConfiguration: config,
    buildFilePath: "cloudfront-hosting-toolkit/buildConfigurationFile.yml",
    connectionArn: repositoryConnection.connectionArn,
    cffSourceFilePath: "cloudfront-hosting-toolkit/url-rewriting.js"
});
```

### For S3 Repository Deployment

```typescript
import { Hosting } from '@aws/cloudfront-hosting-toolkit';

const config = {
    s3bucket: "frontend-hosting-source",
    s3path: ""
};

new Hosting(this, "MyHosting", {
    hostingConfiguration: config,
    buildFilePath: "cloudfront-hosting-toolkit/buildConfigurationFile.yml",
    cffSourceFilePath: "cloudfront-hosting-toolkit/url-rewriting.js"
});
```

## Deployment

Deploy your CDK project as usual. The CloudFront Hosting Toolkit infrastructure will be deployed as part of your stack.

