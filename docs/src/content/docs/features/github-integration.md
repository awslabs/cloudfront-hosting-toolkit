---
title: GitHub Integration
---

The GitHub Integration feature of CloudFront Hosting Toolkit provides seamless connectivity between your GitHub repository and your AWS hosting infrastructure, enabling efficient version control and collaborative development.

## Key Features

- **Automatic deployments**: Triggers deployments automatically when code is pushed to the specified branch.
- **Branch-based deployments**: Supports deployments from different branches for staging and production environments.
- **Simplified collaboration**: Enables team members to contribute to the project using familiar GitHub workflows.
- **Secure connection**: Utilizes AWS CodeStar connections for secure, OAuth-based authentication with GitHub.

## How It Works

1. **Repository connection**: During setup, you provide your GitHub repository details.
2. **AWS CodeStar Connection**: The toolkit creates an AWS CodeStar connection to your GitHub repository.
   - This connection uses OAuth to securely authenticate with GitHub.
   - You'll need to authorize the AWS Connector for GitHub app during the setup process.
3. **Repository access**: You can select specific repositories to make accessible to CodePipeline.
4. **Automated pipeline**: When code is pushed, it triggers the AWS CodePipeline to start the deployment process.

## Connection Setup Process

1. **Initiate connection**: The toolkit initiates the creation of a CodeStar connection to GitHub.
2. **Authorization**: You'll be prompted to authorize the AWS Connector for GitHub app.
3. **App installation**: If not already installed, you'll need to install the AWS Connector for GitHub app for your account or organization.
4. **Repository selection**: Choose the specific repositories you want to make accessible to AWS.
5. **Connection completion**: Once authorized and configured, the connection becomes active, enabling CodePipeline to access your GitHub repository.

## Benefits

- **Streamlined workflow**: Integrates directly with your existing Git-based development process.
- **Security**: OAuth-based authentication ensures secure access without the need for personal access tokens.

> **Important**
> 
>   - To create the connection, you must be the GitHub organization owner. For repositories not under an organization, you must be the repository owner.
>   - The GitHub Integration feature is not available in certain AWS regions. Check the AWS documentation for the latest information on regional availability.
>   - If your CodePipeline service role was created before December 18, 2019, you might need to update its permissions to use `codestar-connections:UseConnection` for AWS CodeStar connections.

GitHub Integration bridges the gap between your development workflow and your hosting infrastructure, providing a cohesive and efficient deployment process that aligns with modern development practices while maintaining security and ease of use.