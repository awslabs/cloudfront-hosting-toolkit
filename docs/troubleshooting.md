# CloudFront Hosting Toolkit - Self-managed Frontend Hosting on AWS

## Troubleshooting Guide

This guide provides solutions to common issues you might encounter while using CloudFront Hosting Toolkit.


### Issue 1: Source Stage Failing


Symptoms: The source stage in the CodePipeline is failing, and your deployment is not proceeding as expected.


1. Verify GitHub App Integration

    Check GitHub Integration: Ensure that your AWS account is properly connected to your GitHub repository. Follow these steps to verify:
        Log in to your AWS account.
        Navigate to the AWS CodePipeline console.
        Locate the pipeline associated with your project.
        Check if the source action in your pipeline is configured to use the GitHub App.

2. GitHub Repository Access: Ensure that the GitHub repository you wish to deploy is accessible to the GitHub App integrated with your AWS account.
        In your GitHub repository, go to "Settings" > "Access" or similar options.
        Confirm that the GitHub App has the necessary permissions to access the repository.
        If required, adjust the GitHub App's access permissions to include read access to the repository.

By following these steps, you can verify the GitHub App integration between your AWS account and the repository you intend to deploy. This should help resolve issues related to the source stage failing in your CodePipeline.

After fixing the permissions, trigger the pipeline again by choosing "Release change" or similar action in the AWS CodePipeline console. This will initiate a new pipeline run with the corrected settings.


### Issue 2: Build Stage Failing

1. Check CodeBuild Logs: To diagnose the issue, start by examining the CodeBuild logs for the build stage. Follow these steps:
    - Log in to your AWS account.
    - Navigate to the AWS CodePipeline console.
    - Locate the pipeline associated with your project.
    - Find the build stage within the pipeline.
    - Access the CodeBuild logs for this stage.

    Review the logs for error messages, warnings, or any other indicators of the issue causing the build to fail.

2. Customize Build Configuration: If the logs indicate that the build configuration needs customization, make the necessary changes following these steps:
    - Locate your build configuration file (e.g., buildConfigurationFile.yml) that defines the build steps and commands.
    - Customize the file as needed, which may involve modifying build commands, dependencies, or environment variables.
    - Save your changes.

3. Deploy Again: After customizing the build configuration, redeploy your project by following these steps:
    - Trigger the pipeline again by choosing "Release change" or a similar action in the AWS CodePipeline console.
    - This will initiate a new pipeline run with the updated build configuration.

By checking the CodeBuild logs and customizing the build configuration as required, you can address issues related to the build stage failing in your AWS CodePipeline. This process helps diagnose and resolve build-related problems, ensuring a smoother deployment process for your project.

### Issue 3: Website display issue

Please ensure to review the CloudFront function being utilized along with its associated rewrite rules, as they might not align correctly with the framework currently in use.
There are two options available: 

1. You can rerun the `init` command and select a different framework if the initially chosen one wasn't suitable. 
2. You have the option to modify the code of the CloudFront function and then execute the deployment command again
The file containing the code for your CloudFront Function can be found at this location. `cloudfront-hosting-toolkit/cloudfront-hosting-toolkit-cff.js`

Inspect the source code of the function in your local directory, make modifications as needed, and then execute the `deploy` command again.




