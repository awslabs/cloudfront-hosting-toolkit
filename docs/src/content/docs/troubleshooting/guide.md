---
title: Troubleshooting Guide
---

### 1. Debugging Steps

1. Use `cloudfront-hosting-toolkit status` to check the current state of your deployment.
2. Review the logs in the `cloudfront-hosting-toolkit` folder for detailed operation logs.
3. Use AWS Management Console to inspect the state of individual resources (S3, CloudFront, CodePipeline).


### 2. Deployment Fails

- **Check AWS Credentials**: Ensure your AWS CLI is correctly configured with the right permissions.
- **Verify Build Configuration**: Ensure your `cloudfront-hosting-toolkit-config.yml` is correctly formatted.

### 2. Website not updating after deployment

- **Check Cache Invalidation**: Verify that CloudFront cache invalidation completed successfully.
- **Review CloudFront Function**: Ensure the function is correctly routing to the new folder.
- **Check DynamoDB**: Verify that the Key-Value store was updated with the new deployment information.

## Getting Help

- **Documentation**: Refer to our comprehensive documentation for detailed information.
- **GitHub Issues**: Check existing issues or create a new one on our GitHub repository.

