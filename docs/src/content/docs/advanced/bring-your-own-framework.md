---
title: Bring Your Own Framework
---

This feature allows you to use CloudFront Hosting Toolkit with any custom framework or build process.

## Steps:

1. Create a custom build script that outputs your site to a directory.
2. Configure the `cloudfront-hosting-toolkit-config.yml` to use your custom build script.
3. If needed, create a custom CloudFront Function for URL rewriting.
4. Use the `cloudfront-hosting-toolkit init` command to set up your project with these custom configurations.

## Best Practices:

- Test your build script locally before integrating with the toolkit.
- Ensure your CloudFront Function handles all necessary URL rewriting scenarios.
- Document any special requirements or steps for your custom framework.
