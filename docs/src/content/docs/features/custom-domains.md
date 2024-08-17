---
title: Custom Domain Support
---

The Custom Domain Support feature of CloudFront Hosting Toolkit allows you to easily configure and use your own domain names for your deployed websites, ensuring a professional and branded online presence.

## Key Features

- **Simple Domain Configuration**: Streamlined process for adding custom domains to your CloudFront distribution.
- **Automatic DNS Setup**: (When using Amazon Route 53) Automatically configures DNS records for your domain.
- **Support for Apex and Subdomains**: Allows use of both root domains (e.g., example.com) and subdomains (e.g., www.example.com).
- **Integration with Existing Domains**: Works with domains you already own, regardless of where they're registered.

## How It Works

1. **Domain Input**: During the setup process, you specify your custom domain name.
2. **DNS Verification**: The toolkit verifies domain ownership and DNS configuration.
3. **CloudFront Configuration**: Updates the CloudFront distribution to include your custom domain.
4. **SSL/TLS Certificate**: Automatically requests and associates an SSL/TLS certificate for your domain (see [SSL/TLS Management](/features/ssl-tls-management)).
5. **DNS Record Creation**: If using Route 53, creates necessary DNS records; otherwise, provides instructions for manual DNS configuration.

## Benefits

- **Professional Branding**: Use your own domain name instead of the default CloudFront URL.
- **Improved SEO**: Custom domains can positively impact your search engine rankings.
- **Flexibility**: Easily switch between different domains or add multiple domains to a single distribution.
- **Seamless User Experience**: Provides a consistent URL for your users, regardless of backend changes.

## Best Practices

- Secure your domain with HTTPS by using the toolkit's SSL/TLS management feature.
- If not using Route 53, ensure you have access to modify DNS records for your domain.
- Consider using www and non-www versions of your domain for better user accessibility.
- Regularly verify that your domain is correctly pointing to your CloudFront distribution.

Custom Domain Support enhances your website's professional appearance and brand consistency, providing a seamless experience for your users while leveraging the power of CloudFront's global content delivery network.