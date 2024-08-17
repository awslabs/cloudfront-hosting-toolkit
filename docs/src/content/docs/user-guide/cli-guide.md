---
title: CLI Guide
---

The CloudFront Hosting Toolkit CLI is designed to simplify the process of deploying and managing your frontend applications on AWS.

## Available Commands

### Init
Initialize your deployment configuration:
```bash
cloudfront-hosting-toolkit init
```
Options:
- `--s3`: Initialize an S3 repository deployment instead of GitHub.

### Deploy
Deploy your website:
```bash
cloudfront-hosting-toolkit deploy
```

### Show
Display the domain name linked to your deployed source code repository:
```bash
cloudfront-hosting-toolkit show
```

### Status
Check the current status of your pipeline deployment:
```bash
cloudfront-hosting-toolkit status
```

### Delete
Remove the hosting infrastructure from your AWS account:
```bash
cloudfront-hosting-toolkit delete
```

## Best Practices
1. Always run `init` in your project root directory for accurate detection of project settings.
2. Use meaningful names for your projects to easily identify them in AWS console.
3. Regularly check the status of your deployments using the `status` command.
4. Before deleting your infrastructure, ensure you have backups of your code and any important data.
