---
title: CDK Integration
---

CloudFront Hosting Toolkit offers seamless integration with AWS CDK (Cloud Development Kit), allowing you to incorporate the toolkit's functionality into your existing CDK projects.

## Using CloudFront Hosting Toolkit as a CDK Construct

### For GitHub Repository Deployment

```typescript
import { RepositoryConnection, Hosting } from '@aws/cloudfront-hosting-toolkit';

const config = {
    repoUrl: "https://github.com/USERNAME/REPOSITORY.git",
    branchName: "main",
    framework: "frameworkname"
};

const repositoryConnection = new RepositoryConnection(this, "MyRepositoryConnection", config);

new Hosting(this, "MyHosting", {
    hostingConfiguration: config,
    buildFilePath: "buildConfigurationFile.yml",
    connectionArn: repositoryConnection.connectionArn,
    cffSourceFilePath: "index.js"
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
    buildFilePath: "buildConfigurationFile.yml",
    cffSourceFilePath: "index.js"
});
```

## Custom Configuration Files

### Build Configuration File
To create your own `buildConfigurationFile.yml`:
1. Find existing templates in `/installation_folder/resources/build_config_templates/`
2. Create a new file based on a template, keeping the `aws s3 cp` command
3. Customize the file for your framework and requirements

### CloudFront Function File
To create your own `index.js` for URL rewriting:
1. Find existing templates in `/installation_folder/resources/cff_templates/`
2. Create a new file based on a template
3. Customize the URL rewriting logic as needed

Note: Specify `buildConfigurationFile.yml` and `index.js` as relative paths to your existing CodeBuild file.

## Best Practices
1. Use meaningful names for your constructs to easily identify them in the AWS console
2. Keep your build and CloudFront function configurations in version control
3. Consider using environment variables for sensitive information in your CDK code