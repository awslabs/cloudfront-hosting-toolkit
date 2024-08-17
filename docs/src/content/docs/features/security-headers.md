---
title: Enhanced Security Headers
---

The Enhanced Security Headers feature of CloudFront Hosting Toolkit automatically configures crucial HTTP security headers for your website, significantly improving its security posture and protecting against common web vulnerabilities.

## Key Features

- **Automatic Configuration**: Security headers are set up without manual intervention.
- **Best Practice Compliance**: Implements headers recommended by security experts and standards bodies.
- **Customizable Settings**: Allows adjustment of header values to suit specific security requirements.
- **Regular Updates**: The toolkit stays updated with the latest security header recommendations.

## Implemented Headers

1. **Content-Security-Policy (CSP)**: Controls which resources the user agent is allowed to load for a given page.
2. **Strict-Transport-Security (HSTS)**: Ensures the browser always uses HTTPS for your domain.
3. **X-Content-Type-Options**: Prevents MIME type sniffing.
4. **X-Frame-Options**: Protects against clickjacking attacks.
5. **Referrer-Policy**: Controls how much referrer information should be included with requests.

## How It Works

1. **Initial Setup**: During deployment, the toolkit configures CloudFront to add these security headers to all responses.
2. **Response Modification**: CloudFront automatically adds the configured headers to each HTTP response.
3. **Browser Enforcement**: Web browsers interpret these headers and enforce the specified security policies.

## Benefits

- **Improved Security Posture**: Protects against various common web vulnerabilities.
- **Compliance Support**: Helps meet security requirements for various compliance standards.
- **Automatic Protection**: Provides security benefits without requiring changes to application code.
- **Consistent Application**: Ensures security headers are applied uniformly across your entire website.

## Best Practices

- Regularly review and update your security header configuration.
- Use the Content-Security-Policy header in report-only mode initially to identify potential issues.
- Test your website thoroughly after enabling or modifying security headers.
- Stay informed about new security headers and best practices in web security.

Enhanced Security Headers provide a robust first line of defense against many common web attacks, significantly enhancing your website's security with minimal effort.