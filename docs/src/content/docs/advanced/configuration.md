---
title: Advanced Configuration
---

CloudFront Hosting Toolkit offers various advanced configuration options to tailor the deployment process to your specific needs.

## Custom Build Configurations

You can customize the build process by modifying the `cloudfront-hosting-toolkit-config.yml` file in your project's `cloudfront-hosting-toolkit` folder. This file contains instructions for CodeBuild on how to build your website.

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

The `cloudfront-hosting-toolkit-cff.js` file in your project's `cloudfront-hosting-toolkit` folder contains the CloudFront Function code for URL rewriting. You can modify this to implement custom routing logic.

## Environment Variables

You can set environment variables for your build process by adding them to your `cloudfront-hosting-toolkit-config.yml` file:

```yaml
env:
  variables:
    KEY: "value"
```
