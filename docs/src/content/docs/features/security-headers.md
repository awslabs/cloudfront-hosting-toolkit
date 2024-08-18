---
title: Security headers
---

The CloudFront Hosting Toolkit implements a comprehensive set of security headers to enhance the protection of your website against common web vulnerabilities.

## Key Features

- **Custom Response Headers Policy**: Applies a set of security headers to all responses from CloudFront.
- **Comprehensive Protection**: Addresses multiple security concerns with a single configuration.

## Implemented Security Headers

The following security headers are implemented through a custom Response Headers Policy:

1. **Content-Type Options**:
   - Prevents MIME type sniffing.
   - Helps protect against MIME confusion attacks.

2. **Frame Options**:
   - Set to DENY.
   - Prevents your content from being embedded in iframes on other domains.
   - Protects against clickjacking attacks.

3. **Strict Transport Security (HSTS)**:
   - Enforces HTTPS connections.
   - Includes subdomains.
   - Set for a duration of one year (31,536,000 seconds).
   - Enhances protection against protocol downgrade attacks and cookie hijacking.

4. **XSS Protection**:
   - Enables the browser's built-in XSS protection.
   - Set to block mode.
   - Provides an additional layer of protection against Cross-Site Scripting (XSS) attacks.

5. **Referrer Policy**:
   - Set to STRICT_ORIGIN_WHEN_CROSS_ORIGIN.
   - Controls the Referer header sent by the browser.
   - Balances security and functionality by sending the origin, path, and query string when performing a same-origin request, and only the origin when performing a cross-origin request.

## Benefits

- **Enhanced Security Posture**: Protects against various common web vulnerabilities.
- **Browser Compatibility**: Implemented headers are widely supported by modern browsers.
- **Centralized Configuration**: Applied at the CloudFront level, ensuring consistent security across all resources.
- **Compliance Support**: Helps meet security requirements for various compliance standards.

These security headers work in conjunction with other security features of the CloudFront Hosting Toolkit to provide a robust defense for your web application.