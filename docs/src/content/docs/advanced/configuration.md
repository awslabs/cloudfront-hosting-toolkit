---
title: Advanced Configuration
---

CloudFront Hosting Toolkit offers various advanced configuration options to tailor the deployment process to your specific needs. After running the `init` command, you have the flexibility to customize your deployment before running the `deploy` command.

## Configuration Files

After running `cloudfront-hosting-toolkit init`, three configuration files are created in your project's `cloudfront-hosting-toolkit` folder:

1. `cloudfront-hosting-toolkit-config.yml`
2. `cloudfront-hosting-toolkit-cff.js`
3. `cloudfront-hosting-toolkit-config.json`

You can edit these files to customize your deployment before running the `deploy` command.

## Customization Process

1. **Initial Setup**: Run `cloudfront-hosting-toolkit init` to generate the default configuration files.
2. **Customization**: Edit the configuration files as needed (optional).
3. **Deployment**: Run `cloudfront-hosting-toolkit deploy` to deploy your infrastructure using either the default or customized configuration.

Note: You can deploy using the default configuration and later customize as needed. After making changes to any configuration file, simply run the `deploy` command again to update your infrastructure.

## Custom Build Configurations

Modify the `cloudfront-hosting-toolkit-config.yml` file to customize the build process. This file contains instructions for CodeBuild on how to build your website.

Example for a React app:

```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
  pre_build:
    commands:
      - npm install
  build:
    commands:
      - npm run build
artifacts:
  base-directory: build
  files:
    - '**/*'
```

## CloudFront Function Customization

The `cloudfront-hosting-toolkit-cff.js` file contains the CloudFront Function code for URL rewriting. Modify this file to implement custom routing logic for your application.

Example of a basic URL rewriting function:

```javascript
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Add custom routing logic here
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } else if (!uri.includes('.')) {
        request.uri += '.html';
    }
    
    return request;
}
```

## Project Configuration

The `cloudfront-hosting-toolkit-config.json` file contains your project's configuration settings. You can modify this file to change settings such as the repository URL, branch name, or framework.

Example:

```json
{
    "repoUrl": "https://github.com/USERNAME/REPOSITORY.git",
    "branchName": "main",
    "framework": "react"
}
```

## Potential Modifications

Here are some examples of modifications you might make to each configuration file:

### 1. cloudfront-hosting-toolkit-config.yml

This file controls your build process. Some potential modifications include:

- Changing the Node.js version:
  ```yaml
  runtime-versions:
    nodejs: 16  # Change to a different version if needed
  ```

- Adding a testing step:
  ```yaml
  phases:
    pre_build:
      commands:
        - npm install
        - npm run test  # Add this line to run tests before building
  ```

- Customizing the artifact output:
  ```yaml
  artifacts:
    base-directory: dist  # Change if your build output is in a different folder
    files:
      - '**/*'
      - '!**/*.map'  # Exclude source map files
  ```

### 2. cloudfront-hosting-toolkit-cff.js

This file contains your CloudFront Function for URL rewriting. You might modify it to:

- Handle single-page application (SPA) routing:
  ```javascript
  function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Route all requests to index.html for SPA
    if (!uri.includes('.')) {
      request.uri = '/index.html';
    }
    
    return request;
  }
  ```

- Implement custom error page routing:
  ```javascript
  function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    if (uri === '/404') {
      request.uri = '/custom-404.html';
    } else if (uri === '/500') {
      request.uri = '/custom-500.html';
    }
    
    return request;
  }
  ```

### 3. cloudfront-hosting-toolkit-config.json

This file contains your project configuration. Possible modifications include:

- Changing the deployment branch:
  ```json
  {
    "repoUrl": "https://github.com/USERNAME/REPOSITORY.git",
    "branchName": "develop",  // Change to deploy from a different branch
    "framework": "react"
  }
  ```

- Adding a custom domain:
  ```json
  {
    "repoUrl": "https://github.com/USERNAME/REPOSITORY.git",
    "branchName": "main",
    "framework": "react",
    "domainName": "www.example.com",  // Add your custom domain
    "hostedZoneId": "Z1234567890ABC"  // Add your Route 53 hosted zone ID
  }
  ```

Remember, you can always revert to the default configuration by re-running the `init` command, but this will overwrite any existing customizations. Always backup your custom configurations before reinitializing.