---
title: Custom Frameworks
---

While CloudFront Hosting Toolkit supports many popular frameworks out-of-the-box, you can configure it for custom frameworks.

## Steps to Integrate Your Framework

1. Create a custom build configuration file named `hosting_YOURFRAMEWORKNAME.yml` in the `cloudfront-hosting-toolkit` folder.
2. Create a custom CloudFront Function file named `index_YOURFRAMEWORKNAME.js` in the same folder.
3. Run `cloudfront-hosting-toolkit init` again and select your custom framework when prompted.

## Example: Custom Static Site Generator

For a custom static site generator called "MySSG":

1. Create `hosting_myssg.yml`:

```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
  build:
    commands:
      - npm run generate
artifacts:
  base-directory: output
  files:
    - '**/*'
```

2. Create `index_myssg.js`:

```javascript
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Custom URL rewriting logic here
    
    return request;
}
```