---
title: Troubleshooting Guide
---


Encountering issues with CloudFront Hosting Toolkit? This guide will help you diagnose and resolve common problems.

## Common Issues and Solutions

### 1. Deployment Fails

- **Check AWS Credentials**: Ensure your AWS CLI is correctly configured with the right permissions.
- **Review CloudWatch Logs**: Check the CodeBuild project logs for specific error messages.
- **Verify Build Configuration**: Ensure your `cloudfront-hosting-toolkit-config.yml` is correctly formatted.

### 2. Website Not Updating After Deployment

- **Check Cache Invalidation**: Verify that CloudFront cache invalidation completed successfully.
- **Review CloudFront Function**: Ensure the function is correctly routing to the new folder.
- **Check DynamoDB**: Verify that the Key-Value store was updated with the new deployment information.

### 3. Custom Domain Issues

- **SSL/TLS Certificate**: Ensure the certificate is correctly issued and associated with your distribution.
- **DNS Configuration**: Verify your DNS settings are pointing to the CloudFront distribution.

### 4. Performance Issues

- **Review CloudFront Settings**: Check caching behaviors and origin settings.
- **Optimize Assets**: Ensure your assets are properly optimized for web delivery.

## Debugging Steps

1. Use `cloudfront-hosting-toolkit status` to check the current state of your deployment.
2. Review the logs in the `cloudfront-hosting-toolkit` folder for detailed operation logs.
3. Use AWS Management Console to inspect the state of individual resources (S3, CloudFront, CodePipeline).

## Getting Help

- **Documentation**: Refer to our comprehensive documentation for detailed information.
- **GitHub Issues**: Check existing issues or create a new one on our GitHub repository.
- **Community Forums**: Engage with the community for help with specific issues.

Remember to provide as much detail as possible when seeking help, including error messages, logs, and steps to reproduce the issue.