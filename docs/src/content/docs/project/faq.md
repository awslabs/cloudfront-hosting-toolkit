---
title: FAQ
---


##### I've successfully deployed my website using the tool, and now I'd like to configure a custom domain name. What are the steps I should follow?

To use a domain name for your deployed website, follow these steps:

Run the init command again to initiate the setup process.

During the setup process, select the option that allows you to specify your desired domain name.

Once you've made the desired domain name selection, proceed with the deployment by running the deploy command.
<br />

---

##### Is it possible to deploy a website that was built without utilizing any frontend framework using this tool?

Yes, you can. The tool is designed to be versatile and adaptable to your specific needs. If you've built your website without utilizing any frontend framework, our tool will automatically detect that no framework is in use. As a result, there won't be any build step required.

<br />

---

##### What is CloudFront Hosting Toolkit?

CloudFront Hosting Toolkit is an open-source command-line tool designed for deploying and managing frontend applications on AWS. It simplifies the process of setting up and maintaining a robust, scalable hosting infrastructure using services like CloudFront, S3, and CodePipeline.

<br />

---

##### Who is CloudFront Hosting Toolkit for?

CloudFront Hosting Toolkit is primarily designed for developers and teams working on frontend projects who want to leverage AWS services for hosting. It's particularly useful for those who need a streamlined deployment process, want to take advantage of CloudFront's global content delivery network, and require features like custom domains and SSL/TLS management.

<br />

---

##### What types of projects are supported?

The toolkit supports a wide range of frontend projects, including:
- Single-page applications (SPAs)
- Static websites
- Projects built with popular frameworks like React, Angular, and Vue.js
- Custom or less common frameworks (via the [Bring your own framework](/cloudfront-hosting-toolkit/advanced/bring-your-own-framework) feature)

Additionally, you can easily customize the build and deployment process to suit your specific project requirements.

<br />

---

##### Is custom domain support available?

Yes, CloudFront Hosting Toolkit provides built-in support for custom domains. During the initialization process, you can specify your custom domain, and the toolkit will:

1. Configure your CloudFront distribution to use the custom domain.
2. Automatically provision and associate an SSL/TLS certificate using AWS Certificate Manager.
3. Provide guidance on setting up the necessary DNS records.

This feature allows you to use your own branded domain while still benefiting from CloudFront's global content delivery network.

<br />

---

##### Is it necessary to acquire a domain name in advance or before deploying my website?

Yes, it's advisable to acquire your desired domain name before configuring it for your website if you want to associate a custom domain name with your website. You have the flexibility to purchase the domain name either through your AWS account or from any other DNS provider of your choice. This ensures that you have ownership and control over the domain name as you proceed with the website configuration.
<br />

---

##### Can I use the toolkit with existing AWS resources?

While CloudFront Hosting Toolkit is designed to set up a complete hosting infrastructure, it also offers flexibility for integration with existing AWS resources:

- You can use an existing S3 bucket for deployments by specifying it during the initialization process.
- For more advanced scenarios, you can use the toolkit's [CDK constructs](/cloudfront-hosting-toolkit/user-guide/cdk-guide) to integrate with your existing AWS CDK stacks.

<br />

---

##### Is continuous deployment supported?

Yes, CloudFront Hosting Toolkit supports continuous deployment when using [GitHub](/cloudfront-hosting-toolkit/architecture/github-workflow) as your source repository. Each push to your configured branch will automatically trigger a new deployment through the AWS CodePipeline set up by the toolkit.

For [S3-based deployments](/cloudfront-hosting-toolkit/architecture/s3-workflow), you can achieve continuous deployment by integrating the toolkit's commands into your existing CI/CD processes.

<br />

---

##### How can I contribute to the CloudFront Hosting Toolkit project?

Contributions to CloudFront Hosting Toolkit are welcome! You can contribute in several ways:

1. Fork the [CloudFront Hosting Toolkit repository](https://github.com/awslabs/cloudfront-hosting-toolkit) on GitHub and submit pull requests for new features or bug fixes.
2. Report issues or suggest features using the GitHub issue tracker.
3. Improve the documentation by submitting updates or clarifications.
4. Share your experiences and help other users in the project's discussion forums.

Before contributing, please review the project's contribution guidelines and code of conduct in the repository.

<br />

---

##### Can I use the toolkit for backend deployments?

CloudFront Hosting Toolkit is primarily designed for frontend deployments. However, the toolkit's [CDK constructs](/cloudfront-hosting-toolkit/user-guide/cdk-construct) can be integrated into a broader CDK stack that includes both frontend and backend resources
