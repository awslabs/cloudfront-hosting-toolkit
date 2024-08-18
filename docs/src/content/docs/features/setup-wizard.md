---
title: Self-paced Setup Wizard
---

The Self-paced setup wizard is a feature of CloudFront Hosting Toolkit that allows you to quickly deploy your website without needing in-depth knowledge of individual AWS services. It guides you through the process, handling the complexities of AWS infrastructure setup behind the scenes.


## Key Benefits

- **Intuitive command-line interface**: Easy-to-follow prompts guide you through each step of the setup process.
- **Automatic project detection**: The wizard automatically detects your project settings, including framework and repository details.
- **Customizable configuration**: While providing smart defaults, the wizard allows you to customize every aspect of your setup.
- **AWS resource setup**: Guides you through the process of setting up necessary AWS resources, ensuring proper configuration.

## How It Works

1. **Initiation**: Run `cloudfront-hosting-toolkit init` to start the wizard.
2. **Project analysis**: The wizard scans your project directory to detect the framework, repository, and other relevant details.
3. **Guided configuration**: You're prompted to confirm or modify detected settings and provide additional information as needed.
5. **Configuration save**: All settings are saved to a configuration file.

## Best Practices

- Run the wizard in your project's root directory for the most accurate automatic detection.
- Review each step carefully to ensure all settings align with your project requirements.

The Self-paced setup wizard simplifies the often complex process of configuring a cloud hosting environment, allowing you to get your project up and running quickly and efficiently.