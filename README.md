# CloudFront Hosting Toolkit

CloudFront Hosting Toolkit is an open-source command-line tool designed to simplify the deployment and management of fast, secure frontend applications on AWS. It offers the convenience of a managed frontend hosting service while giving developers full control over their hosting and deployment infrastructure.

## What is CloudFront Hosting Toolkit?

CloudFront Hosting Toolkit is a comprehensive solution that automates the process of setting up and managing a robust, scalable frontend hosting infrastructure on AWS. It leverages several AWS services, including CloudFront, S3, CodePipeline, and Lambda, to create a powerful hosting environment tailored for modern web applications.

Key features include:
- 🚀 Automated setup of AWS resources for frontend hosting
- 🔄 Continuous deployment pipeline for GitHub and S3-based workflows
- 🌐 Optimized content delivery through CloudFront
- 🔒 Built-in security features including HTTPS and security headers
- 🔗 Custom domain support with automatic SSL/TLS certificate management
- 🛠️ Flexible configuration options for various frontend frameworks

## How It Works

CloudFront Hosting Toolkit streamlines the deployment process through a simple CLI interface. It automatically provisions and configures necessary AWS resources, handles the deployment pipeline, and manages content delivery through CloudFront.

For a detailed explanation of the architecture and workflow, please refer to our [Architecture documentation](https://awslabs.github.io/cloudfront-hosting-toolkit/architecture/overview).

## Why Use CloudFront Hosting Toolkit?

- **Simplicity**: Deploy complex frontend hosting setups with just a few commands.
- **Speed**: Leverage CloudFront's global CDN for fast content delivery.
- **Security**: Automatic HTTPS configuration and security headers.
- **Flexibility**: Support for various frontend frameworks and deployment sources.
- **Cost-Effective**: Utilize AWS services efficiently without unnecessary overhead.
- **Full Control**: Retain the ability to customize and extend your infrastructure.

## Getting Started

Check out our [documentation](https://awslabs.github.io/cloudfront-hosting-toolkit/) for comprehensive guides on setting up and using the Cloudfront Hosting Toolkit!

### Requirements

- Node.js 18+
- AWS CLI 2+ configured with your AWS account
- (Optional) A GitHub account for GitHub-based deployments

### Installation

```bash
npm install -g @aws/cloudfront-hosting-toolkit
```

### Quick Start

1. Initialize your project:
   ```bash
   cloudfront-hosting-toolkit init
   ```
   The animated GIF below demonstrates the initialization process
   ![sample](img/init.gif "CloudFront Hosting Toolkit Init")   

2. Deploy your website:
   ```bash
   cloudfront-hosting-toolkit deploy
   ```
   The animated GIF below demonstrates the deployment process
   ![sample](img/deploy.gif "CloudFront Hosting Toolkit Deploy")


For more detailed instructions and advanced usage, please refer to our [CLI Guide](https://awslabs.github.io/cloudfront-hosting-toolkit/user-guide/cli-guide).

## Example Commands

```bash
# Show domain name
cloudfront-hosting-toolkit show

# Check deployment status
cloudfront-hosting-toolkit status

# Remove hosting infrastructure
cloudfront-hosting-toolkit delete
```

## Architecture

![Technical diagram](img/architecture.jpg)

CloudFront Hosting Toolkit sets up a comprehensive AWS architecture for your frontend hosting:

- **Source Control**: GitHub repository or S3 bucket
- **CI/CD**: AWS CodePipeline for automated builds and deployments
- **Build Process**: AWS CodeBuild for compiling and creating deployment artifacts
- **Storage**: S3 buckets for hosting website files
- **Content Delivery**: CloudFront for global content distribution
- **Routing**: CloudFront Functions for request handling and routing
- **Orchestration**: Step Functions for managing deployment processes
- **State Management**: KVS for storing deployment state information

This architecture ensures a scalable, performant, and maintainable hosting solution for your frontend applications.

## Advanced Usage

CloudFront Hosting Toolkit offers flexibility in how it can be used:

- **CLI**: Use the Command-Line Interface for a straightforward, step-by-step deployment process.
- **CDK Construct**: Leverage the CloudFront Hosting Toolkit as a ready-made L3 CDK construct for seamless integration into your AWS CDK projects.
- **CDK Source Code**: Customize the CDK source code to tailor the infrastructure to your specific requirements.

For more information on how to use CloudFront Hosting Toolkit, including advanced usage scenarios and in-depth customization options, please refer to our extensive documentation in the [Advanced section](https://awslabs.github.io/cloudfront-hosting-toolkit/advanced/overview).

## Documentation

- [How it works](https://awslabs.github.io/cloudfront-hosting-toolkit/getting-started/how-it-works)
- [CLI Guide](https://awslabs.github.io/cloudfront-hosting-toolkit/user-guide/cli-guide)
- [CDK Integration](https://awslabs.github.io/cloudfront-hosting-toolkit/user-guide/cdk-guide)
- [Troubleshooting Guide](https://awslabs.github.io/cloudfront-hosting-toolkit/troubleshooting/guide)
- [FAQ](https://awslabs.github.io/cloudfront-hosting-toolkit/project/faq)
- [Contributing Guidelines](CONTRIBUTING.md)

## Roadmap

For information about upcoming features and improvements, please see our [Roadmap](docs/roadmap.md).

## License

This library is licensed under the Apache-2.0 License.