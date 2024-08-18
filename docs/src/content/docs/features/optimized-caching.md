---
title: Optimized caching
---

The Optimized Caching feature of CloudFront Hosting Toolkit leverages Amazon CloudFront's powerful caching capabilities to enhance your website's performance, ensuring faster response times and reduced server load.

## Key Features

- **Specialized Cache Policies**: Implements distinct caching strategies for different types of content.
- **Long-Term Caching**: Utilizes extended cache durations to maximize performance benefits.
- **Compression Support**: Enables Gzip and Brotli compression for compatible content.

## How It Works

### Cache Policies

1. **Default Cache Policy**:
   - Applied to most content types
   - Cache duration: 365 days (1 year)
   - Ignores cookies and query strings
   - Enables Gzip and Brotli compression

2. **Images Cache Policy**:
   - Specifically for image files (jpg, jpeg, png, gif, bmp, tiff, ico)
   - Cache duration: 365 days (1 year)
   - Ignores cookies, headers, and query strings

3. **Static Assets Cache Policy**:
   - Applied to js, css, and html files
   - Cache duration: 365 days (1 year)
   - Ignores cookies, headers, and query strings
   - Enables compression

## Benefits

- **Improved Load Times**: Long-term caching ensures faster content delivery for returning visitors.
- **Reduced Origin Load**: Extended cache durations minimize requests to the origin S3 bucket.
- **Optimized for Different Content Types**: Specialized policies for images and static assets ensure appropriate handling.
- **Reduced Bandwidth Usage**: Compression and efficient caching reduce data transfer.

The Optimized Caching feature ensures that your website delivers exceptional performance globally, enhancing user experience and reducing infrastructure load.