---
title: CDK Source Code Guide
---

For maximum flexibility, you can deploy the CloudFront Hosting Toolkit by cloning and modifying its source code.

## Steps

1. Clone the project:
   ```bash
   git clone https://github.com/awslabs/cloudfront-hosting-toolkit.git
   cd cloudfront-hosting-toolkit
   ```

2. Modify the source code as needed to suit your requirements.

3. Set up the necessary configuration files. See our [CDK Configuration Guide](/cloudfront-hosting-toolkit/user-guide/cdk-configuration) for detailed instructions.

4. Deploy the project:
   ```bash
   npm run build
   cdk deploy
   ```

5. After deployment, you need to configure the GitHub connection by going to the AWS console. [More information on GitHub connections](https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html).

## Note on deployment

- The first time you deploy, the pipeline will be automatically triggered.
- If you make changes to the infrastructure and need to redeploy, you may need to manually trigger the pipeline if the changes require a new deployment.
