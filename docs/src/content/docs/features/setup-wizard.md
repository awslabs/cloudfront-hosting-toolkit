---
title: Self-paced Setup Wizard
---

The Self-paced Setup Wizard is a core feature of CloudFront Hosting Toolkit, designed to make the initialization process as smooth and user-friendly as possible.

## Key Benefits

- **Intuitive Command-Line Interface**: Easy-to-follow prompts guide you through each step of the setup process.
- **Automatic Project Detection**: The wizard automatically detects your project settings, including framework and repository details.
- **Customizable Configuration**: While providing smart defaults, the wizard allows you to customize every aspect of your setup.
- **AWS Resource Setup**: Guides you through the process of setting up necessary AWS resources, ensuring proper configuration.

## How It Works

1. **Initiation**: Run `cloudfront-hosting-toolkit init` to start the wizard.
2. **Project Analysis**: The wizard scans your project directory to detect the framework, repository, and other relevant details.
3. **Guided Configuration**: You're prompted to confirm or modify detected settings and provide additional information as needed.
4. **AWS Setup**: The wizard helps you configure AWS-specific settings, including region selection and resource naming.
5. **Configuration Save**: All settings are saved to a configuration file for future use and easy updates.

## Best Practices

- Run the wizard in your project's root directory for the most accurate automatic detection.
- Review each step carefully to ensure all settings align with your project requirements.
- Use meaningful names for your resources to easily identify them in the AWS console.

The Self-paced Setup Wizard simplifies the often complex process of configuring a cloud hosting environment, allowing you to get your project up and running quickly and efficiently.