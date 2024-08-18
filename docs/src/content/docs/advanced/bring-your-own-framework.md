---
title: Bring your own framework
---

While CloudFront Hosting Toolkit supports many popular frameworks out-of-the-box, you can configure it for custom frameworks. This allows you to create a reusable configuration for your specific framework that can be used across multiple projects.

## Steps to Integrate Your Custom Framework

1. Locate the CLI installation folder of CloudFront Hosting Toolkit.

2. Create two new files and place them in the following subfolders of the CLI installation folder:
   - A custom build configuration file named `hosting_YOUR_FRAMEWORK_NAME.yml` in the `resources/build_config_templates` folder.
   - A custom CloudFront Function file named `index_YOUR_FRAMEWORK_NAME.js` in the `resources/cff_templates` folder.

3. After creating and placing these files, run `cloudfront-hosting-toolkit init` in your project directory and select your custom framework when prompted.

## File Naming Convention and Locations

It's crucial to follow the exact naming format for both files and place them in the correct folders:

- The build configuration file must be named: `hosting_YOUR_FRAMEWORK_NAME.yml`
  Place this file in: `<CLI_INSTALLATION_FOLDER>/resources/build_config_templates/`

- The CloudFront Function file must be named: `index_YOUR_FRAMEWORK_NAME.js`
  Place this file in: `<CLI_INSTALLATION_FOLDER>/resources/cff_templates/`

Replace YOUR_FRAMEWORK_NAME with the name of your framework.

For example:
- For a framework called "MySSG": 
  - `resources/build_config_templates/hosting_MySSG.yml`
  - `resources/cff_templates/index_MySSG.js`
- For a framework called "Custom React": 
  - `resources/build_config_templates/hosting_Custom_React.yml`
  - `resources/cff_templates/index_Custom_React.js`

Note: The framework name displayed in the init wizard will be taken from the YOUR_FRAMEWORK_NAME part of the filename. For example, if your files are named `hosting_Custom_React.yml` and `index_Custom_React.js`, the framework name displayed will be "Custom React".

## Build Configuration File Structure

When creating your custom build configuration file (`hosting_YOUR_FRAMEWORK_NAME.yml`), keep in mind the following structure and requirements:

```yaml
version: 0.2
phases:
  build:
    commands:
      # Your custom build commands go here
      - command1
      - command2
      # ...
      # The following command is mandatory and must be the last command
      - aws s3 cp ./ s3://$DEST_BUCKET_NAME/$CODEBUILD_RESOLVED_SOURCE_VERSION/ --recursive #don't change this line
```

Important notes:
1. You can include any number of custom build commands to suit your framework's needs.
2. The last command (the `aws s3 cp` command) is mandatory and must be included exactly as shown above.
3. `$DEST_BUCKET_NAME` and `$CODEBUILD_RESOLVED_SOURCE_VERSION` are environment variables automatically available in CodeBuild. Do not change these variable names.

## Example: Custom Static Site Generator

Let's create a configuration for a custom static site generator called "MySSG":

1. Create `hosting_MySSG.yml` in the `<CLI_INSTALLATION_FOLDER>/resources/build_config_templates/` folder:

```yaml
version: 0.2
phases:
  build:
    commands:
      - npm install
      - npm run generate
      - cd dist  # Assuming 'dist' is your output directory
      # The following command is mandatory
      - aws s3 cp ./ s3://$DEST_BUCKET_NAME/$CODEBUILD_RESOLVED_SOURCE_VERSION/ --recursive #don't change this line
```

2. Create `index_MySSG.js` in the `<CLI_INSTALLATION_FOLDER>/resources/cff_templates/` folder:

```javascript
function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Custom URL rewriting logic for MySSG
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } else if (!uri.includes('.')) {
        request.uri += '.html';
    }

    return request;
}
```

3. Run `cloudfront-hosting-toolkit init` in your project directory and select "MySSG" when prompted for the framework.


By following these steps and ensuring your build configuration file includes the mandatory S3 copy command, you can create and use custom framework configurations across multiple projects, streamlining your deployment process for unique or in-house frameworks.