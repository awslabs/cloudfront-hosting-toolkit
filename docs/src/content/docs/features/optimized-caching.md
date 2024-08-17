---
title: Optimized Caching
---

The Optimized Caching feature of CloudFront Hosting Toolkit leverages Amazon CloudFront's powerful caching capabilities to enhance your website's performance, ensuring faster response times and reduced server load.

## Key Features

- **CloudFront Edge Caching**: Utilizes CloudFront's global network of edge locations for content delivery.
- **Customizable Caching Rules**: Allows fine-tuning of caching behavior for different types of content.
- **Automatic Cache Invalidation**: Invalidates relevant cache entries upon new deployments.
- **Smart Default Settings**: Provides optimized default caching settings suitable for most web applications.

## How It Works

1. **Content Delivery**: Your website content is distributed to CloudFront edge locations worldwide.
2. **Request Handling**: When a user requests your website, the nearest edge location serves the content if cached.
3. **Origin Fetching**: If content is not in the cache, CloudFront retrieves it from the origin (S3 bucket) and caches it for subsequent requests.
4. **Cache Invalidation**: Upon new deployments, the toolkit automatically invalidates the cache to ensure users receive the latest content.

## Benefits

- **Improved Load Times**: Serves content from geographically closer locations to end-users.
- **Reduced Origin Load**: Minimizes requests to your origin server, reducing costs and improving scalability.
- **Consistent Performance**: Maintains fast load times even during traffic spikes.
- **Bandwidth Savings**: Reduces the amount of data transferred from your origin.

## Best Practices

- Use appropriate cache-control headers for different types of content.
- Leverage CloudFront's cache-key customization for more granular caching control.
- Monitor cache hit ratios and adjust settings as needed for optimal performance.
- Use versioned file names for static assets to facilitate long-term caching.

Optimized Caching ensures that your website delivers the best possible performance to users around the globe, enhancing user experience and reducing the load on your infrastructure.