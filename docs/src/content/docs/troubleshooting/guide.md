---
title: Troubleshooting guide
---

If you encounter issues while using CloudFront Hosting Toolkit, follow this guide to diagnose and resolve common problems.

## 1. General debugging steps

1. Use `cloudfront-hosting-toolkit status` to check the current state of your deployment.
2. Review the logs in the `cloudfront-hosting-toolkit` folder (named with the format `YYYY-MM-DD_HH-MM-SS.log`) for detailed operation logs.
3. Use AWS Management Console to inspect the state of individual resources (S3, CloudFront, CodePipeline, CodeBuild).

## 2. Deployment fails

- **Check AWS Credentials**: Ensure your AWS CLI is correctly configured with the right permissions.
- **Verify Build Configuration**: Ensure your `cloudfront-hosting-toolkit-config.yml` is correctly formatted and contains all necessary commands.
- **Review CodeBuild Logs**: Check the CodeBuild project in AWS Console for specific build failure reasons.
- **GitHub Connection Issues**: For GitHub-based deployments, ensure the AWS CodeStar connection is properly set up and authorized.
- **Project Structure and Framework Compatibility**: Verify that your project structure is correct and compatible with the chosen framework. If the framework specified in the JSON file is incorrect, you can:
  - Manually change it in the `cloudfront-hosting-toolkit-config.json` file to one of the supported values.
  - Customize the build configuration in `cloudfront-hosting-toolkit-config.yml` to use the correct commands for building your website.

## 3. Website not updating after deployment

- **Review CodeBuild Logs**: Often, the issue lies in the build configuration. Inspect the CodeBuild logs in the AWS Console to understand if the build process completed successfully and if all expected files were generated.
- **Verify Build Configuration**: Ensure your `cloudfront-hosting-toolkit-config.yml` is correctly configured for your framework and project structure. Pay special attention to build commands and output directories.
- **Review CloudFront Function**: Ensure the function is correctly routing to the new folder. Check the function logs in CloudFront console.
- **Check Key-Value Store (KVS)**: Verify that the KVS was updated with the new deployment information (commit ID). You can check this in the CloudFront console under the Functions section.

## 4. Custom domain issues

- **Certificate Validation**: If using a custom domain, ensure the SSL/TLS certificate is properly validated in AWS Certificate Manager.
- **DNS Configuration**: Verify that your domain's DNS settings are correctly pointing to the CloudFront distribution.


## Getting Help

- **Documentation**: Refer to our comprehensive documentation for detailed information on each feature and process.
- **GitHub Issues**: Check existing issues or create a new one on our [GitHub repository](https://github.com/awslabs/cloudfront-hosting-toolkit).

