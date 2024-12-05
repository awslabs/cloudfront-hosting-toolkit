---
title: How it works
---

CloudFront Hosting Toolkit simplifies the process of deploying and managing frontend applications on AWS. The toolkit operates in three main steps:

1. **Initialization**: Set up your project and configure the toolkit.
2. **Deployment**: Deploy your frontend application infrastructure to AWS.
3. **Updates**: Automatic updates and content delivery after deployment.

## Re:Invent 2024 lightning talk

Watch our AWS re:Invent 2024 lightning talk to see CloudFront Hosting Toolkit in action:

<p align="center">
  <a href="https://www.youtube.com/watch?v=pmWhspx4ppw">
    <img src="https://img.youtube.com/vi/pmWhspx4ppw/maxresdefault.jpg" alt="AWS re:Invent 2024 - CloudFront Hosting Toolkit lightning talk" width="600"/>
  </a>
</p>

Learn how to leverage CloudFront Hosting Toolkit for deploying secure and fast frontends using Git-based workflows while maintaining full control over your AWS resources.

Let's explore each step in detail:

## Initialization

When you run `cloudfront-hosting-toolkit init`:

1. The CLI detects your project's configuration, including GitHub repository details (if applicable).
2. It guides you through a setup process, allowing you to confirm or override detected information.
3. The command creates configuration files in a `cloudfront-hosting-toolkit` folder.

## Deployment

When you run `cloudfront-hosting-toolkit deploy`:

1. The toolkit deploys the hosting infrastructure on AWS, including:
   - Amazon S3 bucket for storing your website files
   - Amazon CloudFront distribution for content delivery
   - AWS CodePipeline for continuous deployment
   - AWS CodeBuild project for building your application
   - CloudFront Functions for request handling and routing
   - Key-Value Store (KVS) for storing the latest deployment information

2. Once the infrastructure is set up, the toolkit triggers the initial deployment of your website content.

## Updates

After the initial deployment, the update process and content delivery work as follows:

<img src="/cloudfront-hosting-toolkit/img/flow.png" alt="CloudFront Hosting Toolkit Flow">


1. A developer pushes code changes to the GitHub repository, triggering the AWS CodePipeline (steps 4-5).

2. CodePipeline fetches the new code and builds the new website version (step 5).

3. The built artifacts are uploaded to a new folder in the S3 bucket, identified by the commit ID (step 6).

4. The Key-Value Store is updated with the new commit ID as the current served website version (step 7).

5. When an end-user requests the website (step 1):
   - The request hits Amazon CloudFront.
   - CloudFront executes a function that fetches the latest build ID from the Key-Value Store (step 2).
   - The function rewrites the URL to include the latest build ID and adds it to the cache key.
   - CloudFront then requests the content from the correct S3 folder using the rewritten URL (step 3).
   - The content is served to the user with a 200 OK status.

6. For subsequent requests (step 8), the process repeats, ensuring that users always see the latest version of the website.

This approach enables atomic deployments, providing several key benefits:

- All requests are immediately directed to the new version once it's deployed.
- There's no risk of users seeing a mix of old and new content.
- The transition is seamless and instantaneous for all users globally.
- It eliminates the "partial update" problem, ensuring consistency across your entire user base.
- It prevents potential issues that could arise from inconsistent state between old and new versions.

By leveraging CloudFront's global content delivery network and this intelligent routing mechanism, visitors always see the most recent version of your website, regardless of their location or when they accessed the site. This ensures a consistent, up-to-date experience for all users while benefiting from the performance advantages of a CDN.