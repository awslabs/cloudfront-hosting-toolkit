---
title: SSL/TLS Management
---

The SSL/TLS Management feature of CloudFront Hosting Toolkit automates the process of securing your custom domains with SSL/TLS certificates, ensuring encrypted connections for your users and compliance with modern web security standards.

## Key Features

- **Automatic Certificate Provisioning**: Utilizes AWS Certificate Manager to request and manage SSL/TLS certificates.
- **Renewal Management**: Handles certificate renewals automatically, ensuring continuous HTTPS availability.
- **Support for Wildcard Certificates**: Enables securing multiple subdomains with a single certificate.
- **Integration with Custom Domains**: Seamlessly works with the Custom Domain Support feature.

## How It Works

1. **Certificate Request**: When you add a custom domain, the toolkit automatically requests a certificate from AWS Certificate Manager.
2. **Domain Validation**: Guides you through the domain validation process (DNS or email validation).
3. **CloudFront Association**: Once validated, the certificate is automatically associated with your CloudFront distribution.
4. **Renewal Monitoring**: AWS Certificate Manager handles automatic renewal of certificates before they expire.

## Benefits

- **Enhanced Security**: Ensures all traffic to your website is encrypted, protecting user data.
- **Improved Trust**: Displays the padlock icon in browsers, increasing user confidence.
- **SEO Boost**: HTTPS is a ranking factor for search engines.
- **Compliance**: Helps meet security requirements for various compliance standards.
- **Cost-Effective**: Utilizes AWS Certificate Manager, which provides free SSL/TLS certificates for use with AWS services.

## Best Practices

- Use DNS validation when possible for quicker issuance and automatic renewal.
- If using email validation, ensure you have access to the domain's administrative email addresses.
- Implement HSTS (HTTP Strict Transport Security) for additional security.
- Regularly monitor the status of your certificates in the AWS Certificate Manager console.

SSL/TLS Management simplifies the often complex process of obtaining, configuring, and maintaining SSL/TLS certificates, ensuring your website remains secure with minimal manual intervention.