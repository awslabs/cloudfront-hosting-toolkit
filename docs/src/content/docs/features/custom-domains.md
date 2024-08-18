---
title: Custom domain support
---

The CloudFront Hosting Toolkit supports custom domain configuration for both Amazon Route 53 users and those using other DNS providers. This flexibility ensures that regardless of your DNS management solution, you can easily set up a custom domain for your CloudFront-hosted website.

## Route 53 Users vs. Non-Route 53 Users

1. **Route 53 Users**
   - Benefit from a more automated process
   - The CLI can directly interact with your Route 53 hosted zones
   - Automatic creation of necessary DNS records

2. **Non-Route 53 Users**
   - Receive guided instructions for manual DNS configuration
   - Need to create DNS records with their respective DNS providers
   - Still benefit from automated certificate management and CloudFront configuration

## The Process

Regardless of your DNS provider, the CLI handles the following steps:

1. **SSL/TLS Certificate Management**
   - Checks for an existing certificate in AWS Certificate Manager (ACM)
   - Creates a new certificate if one doesn't exist
   - Waits for the certificate to be issued and validated

2. **CloudFront Distribution Configuration**
   - Integrates your custom domain with the CloudFront distribution

3. **DNS Configuration**
   - This step differs based on your DNS provider:

### For Route 53 Users:

1. The CLI detects that you're using Route 53 based on the provided hosted zone ID
2. After deploying the CloudFront distribution, it checks if a CNAME record already exists
3. If no record exists, it prompts you to confirm the creation of a new CNAME record
4. Upon confirmation, it automatically creates the CNAME record in your Route 53 hosted zone

### For Non-Route 53 Users:

1. The CLI recognizes that you're not using Route 53 (no hosted zone ID provided)
2. After deploying the CloudFront distribution, it provides detailed instructions for manual DNS configuration
3. You receive step-by-step guidance on how to create a CNAME record with your DNS provider, including:
   - The record type (CNAME)
   - The host name (your custom domain)
   - The target (the CloudFront distribution domain)

## User Interaction

- **Route 53 Users**: You'll be prompted to confirm the creation of the DNS record. The process is largely automated after your confirmation.
- **Non-Route 53 Users**: You'll need to manually create the DNS record with your provider using the instructions provided by the CLI.

In both cases, the CLI handles the complex tasks of certificate management and CloudFront configuration, simplifying the process of setting up a custom domain for your static website.

## Benefits

- Supports users of all DNS providers
- Automates certificate management and CloudFront configuration
- Provides a guided experience for non-Route 53 users
- Offers a near-fully automated process for Route 53 users

By accommodating both Route 53 and non-Route 53 users, the CloudFront Hosting Toolkit ensures a smooth custom domain setup process, regardless of your DNS management solution.