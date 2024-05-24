# CloudFront Hosting Toolkit - Self-managed Frontend Hosting on AWS

## Advanced usage

- [Build Configuration](#build-configuration)
- [Custom Framework Configurations](#custom-framework-configurations)
- [Initialize the Deployment Without Built-In Wizard](#initialize-a-deployment-without-built-in-wizard)



### How it works behind the scene

After running `cloudfront-hosting-toolkit init`, CloudFront Hosting Toolkit will create a folder named `cloudfront-hosting-toolkit` in the directory where the tool is executed. This `cloudfront-hosting-toolkit` folder contains essential files for managing your deployment process:

1. `cloudfront-hosting-toolkit-config.json`: This JSON file stores the configuration settings gathered during the `init` process. You can review and modify these settings as needed.

2. `cloudfront-hosting-toolkit-config.yml`: This YAML file is necessary for CodeBuild to build your website. It contains build configuration information, ensuring that your website is built correctly.

1. `cloudfront-hosting-toolkit-cff.js`: This JSON file stores the configuration settings gathered during the `init` process. You can review and modify these settings as needed.

3. `cloudfront-hosting-toolkit-config.yml`: This JavaScript file encapsulates the code utilized by the CloudFront Function for URL rewriting. Given the variability in rules based on the framework, this file is accessible for modifications at any time, enabling the addition of additional logic required to execute at the edge.

4. During deployment, the CLI generates log files to capture important information and log messages. These log files are named using the format `YYYY-MM-DD_HH-MM-SS.log` and are stored in the `cloudfront-hosting-toolkit` folder. You can review these logs to troubleshoot any deployment issues or monitor the deployment process.

Make sure to keep these files in the `cloudfront-hosting-toolkit` folder for seamless management of your futur deployments.

### Core Project Components: CodeBuild and CloudFront Functions


Two essential components play vital roles in deploying and managing hosted websites:

- **AWS CodeBuild**: CodeBuild serves as the engine responsible for building and deploying websites. It automates the entire process, from assembling files to pushing them to the hosting bucket. This automation streamlines the deployment pipeline, minimizing manual tasks and enabling swift updates.

- **Amazon CloudFront Function**: The CloudFront function is actively deployed for every viewer request, offering two key functionalities:
  - Reads the key-value store to retrieve the folder name, directing users to the latest S3 folder and ensuring consistent access to the most up-to-date content.
  - URL rewriting, enabling efficient service for Single Page Applications (SPAs) and statically generated sites.

A CloudFront Function is allocated for each framework, and it is copied into your current directory during the initialization phase. The reason for having one template per framework is because, for example, between single-page application (SPA) and non-SPA websites, different rewrite rules are required. Additionally, a user may utilize a framework that necessitates specific rewrite rules.

The function templates can be located within this [folder](../resources/cff_templates).

If your website requires customization beyond the out-of-the-box configurations, you'll likely find yourself making modifications to either the CodeBuild spec YAML file or the CloudFront function code.

### CodeBuild in the Deployment Pipeline

CodeBuild plays a critical role in the CloudFront Hosting Toolkit deployment pipeline. It is responsible for building your website's source code and preparing it for deployment. This encompasses tasks like code compilation, the creation of deployment artifacts, and pushing files to the hosting bucket.

### Build configuration

The `cloudfront-hosting-toolkit-config.yml` file is a vital component in the deployment process. It serves as a configuration file for CodeBuild, specifying the exact steps to build your website based on your chosen framework (if applicable) or handling the deployment of static files without any build process.

Here's how the `cloudfront-hosting-toolkit-config.yml` file works:

1. **Framework-Specific Build**: If your website is built using a specific framework (e.g., React, Angular, Vue), the `cloudfront-hosting-toolkit-config.yml` file contains instructions and commands tailored to that framework. CloudFront Hosting Toolkit provides predefined build configurations for several popular frameworks, ensuring that your website is built correctly.

2. **No Build**: If your website does not use a specific framework or requires no build process, the `cloudfront-hosting-toolkit-config.yml` file will specify the necessary commands to copy the static files to the destination bucket directly.

3. **Folder Naming**: After a successful build or file copy, the CloudFront Hosting Toolkit CLI creates a new folder in the destination bucket, named with the commit ID of your latest changes. This ensures that each deployment is uniquely identified, making it easy to manage and roll back to previous versions if needed.

If you ever need to make further customizations, such as installing additional libraries required for your build or adjusting library versions, you can easily achieve this by modifying the `cloudfront-hosting-toolkit-config.yml` file and running `cloudfront-hosting-toolkit deploy` once again.


### Custom Framework Configurations

The project is designed to support a wide range of popular frameworks by providing flexible build configurations. You can easily adapt our project to suit your preferred framework. Below are some of the frameworks that are supported with corresponding build configurations:

- AngularJs
- NextJs
- ReactJs
- VueJs


The goal is to provide a versatile and adaptable project that empowers you to work with the framework of your choice.


If you're using a framework that isn't listed above, you can bring your own configuration to tailor CloudFront Hosting Toolkit to your needs. Follow these steps to create a custom configuration:

- Start by using one of the existing configurations as a template.
- Locate one existing configuration templates at `/installation_folder/resources/build_config_templates/hosting_angularjs.yml`.
- Create a new configuration and keeping the `aws s3 cp` command  in your new file and following this naming pattern: `hosting_YOURFRAMEWORKNAME.yml`.
- Customize the configuration file to fit your specific requirements, including any additional libraries or version changes.
- After creating your custom configuration, run the `cloudfront-hosting-toolkit init` command again.
- When prompted, select your custom configuration from the list.

This way, you can seamlessly integrate your unique framework configuration into CloudFront Hosting Toolkit and deploy your website with ease.

### Initialize a deployment without built in wizard

Instructions for Deploying Based on Your Deployment Type:

1. If you want to deploy from S3 and build the sources yourself:

  - Use the `solution.context.json.template.s3` template file located in the current folder.
  - Replace the placeholders in the selected template file with your own values, and then copy it to the `./cloudfront-hosting-toolkit` folder.
  - Copy the `s3_build_config.yml` file located in the `resources/build_config_templates` folder to the `cloudfront-hosting-toolkit` folder.

2. If you want the sources to be built by the built-in pipeline and deploy from GitHub:

  - Use the `solution.context.json.template.github` template file located in the current folder.
  - Replace the placeholders in the selected template file with your own values, and then copy it to the `cloudfront-hosting-toolkit` folder.
  - Use the `hosting_[framework].yml` template file located in the `resources/build_config_templates` folder to customize your deployment.
  - Copy the chosen template file into the `./cloudfront-hosting-toolkit` folder.


