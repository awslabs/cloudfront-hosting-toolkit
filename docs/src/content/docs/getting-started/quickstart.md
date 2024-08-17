---
title: Quickstart
---

Get up and running with CloudFront Hosting Toolkit in just a few minutes:

## Prerequisites
- Node.js 18+
- AWS CLI 2+ installed and configured
- A GitHub account (if deploying from GitHub)

## Installation
Install CloudFront Hosting Toolkit globally:

```bash
npm install -g @aws/cloudfront-hosting-toolkit
```

## Deployment Steps
1. Navigate to your project directory:
   ```bash
   cd /path/to/your/project
   ```

2. Initialize your deployment configuration:
   ```bash
   cloudfront-hosting-toolkit init
   ```
   Follow the prompts to configure your deployment.

3. Deploy your website:
   ```bash
   cloudfront-hosting-toolkit deploy
   ```

4. Once deployment is complete, you'll receive a CloudFront domain name. Use this to access your deployed website.
