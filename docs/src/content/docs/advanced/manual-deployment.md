---
title: Manual Deployment
---


For scenarios requiring more control, you can perform manual deployments.

## Steps for Manual Deployment

1. Build your project locally
2. Upload to S3:
   ```bash
   aws s3 sync ./build s3://your-bucket-name/commit-id/ --delete
   ```
3. Update DynamoDB:
   ```bash
   aws dynamodb put-item \
     --table-name YourKeyValueStoreName \
     --item '{"key": {"S": "latest"}, "value": {"S": "commit-id"}}'
   ```
4. Invalidate CloudFront Cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id YourDistributionId --paths "/*"
   ```

Remember to keep track of manual deployments for auditing purposes.