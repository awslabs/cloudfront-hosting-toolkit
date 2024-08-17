---
title: GitHub Integration
---

The GitHub Integration feature of CloudFront Hosting Toolkit provides seamless connectivity between your GitHub repository and your AWS hosting infrastructure, enabling efficient version control and collaborative development.

## Key Features

- **Automatic Deployments**: Triggers deployments automatically when code is pushed to the specified branch.
- **Branch-Based Deployments**: Supports deployments from different branches for staging and production environments.
- **Pull Request Previews**: (Coming Soon) Automatically deploy preview environments for pull requests.
- **Simplified Collaboration**: Enables team members to contribute to the project using familiar GitHub workflows.

## How It Works

1. **Repository Connection**: During setup, you provide your GitHub repository details.
2. **AWS CodeStar Connection**: The toolkit sets up an AWS CodeStar connection to your GitHub repository.
3. **Webhook Configuration**: A webhook is configured in your GitHub repository to notify AWS of code changes.
4. **Automated Pipeline**: When code is pushed, it triggers the AWS CodePipeline to start the deployment process.

## Benefits

- **Streamlined Workflow**: Integrates directly with your existing Git-based development process.
- **Version Control**: Each deployment is associated with a specific commit, enabling easy tracking and potential rollbacks.
- **Collaboration**: Team members can contribute to the project using familiar GitHub features like branches and pull requests.
- **Transparency**: The deployment status is visible both in the AWS console and through GitHub's commit status API.

## Best Practices

- Use meaningful branch names and commit messages for better tracking of deployments.
- Implement a branching strategy (e.g., GitFlow) to manage feature development and releases effectively.
- Regularly merge the main branch into feature branches to minimize integration conflicts.
- Utilize GitHub Actions in conjunction with the toolkit for additional CI/CD capabilities.

GitHub Integration bridges the gap between your development workflow and your hosting infrastructure, providing a cohesive and efficient deployment process that aligns with modern development practices.