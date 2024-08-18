---
title: CDK Configuration guide
---

Both the CDK Construct and CDK Source Code methods require some common configuration steps. Follow this guide to set up the necessary files.

## Configuration Files

Create a `cloudfront-hosting-toolkit` folder at the root of your CDK project and add the following files:

1. `buildConfigurationFile.yml`: Configures the build process for your specific framework.
2. A JavaScript file for the CloudFront function (e.g., `url-rewriting.js`): Handles URL rewriting for your application.
3. `cloudfront-hosting-toolkit.json`: Contains your project configuration.

### 1. Build Configuration File

Example for Vue.js:

```yaml
version: 0.2
phases:
  build:
    commands:
      - npx npm install
      - npx npm run build
      - cd dist
      - echo aws s3 cp ./ s3://$DEST_BUCKET_NAME/$CODEBUILD_RESOLVED_SOURCE_VERSION/ --recursive #don't change this line
      - aws s3 cp ./ s3://$DEST_BUCKET_NAME/$CODEBUILD_RESOLVED_SOURCE_VERSION/ --recursive #don't change this line
```

[More build configuration templates](https://github.com/awslabs/cloudfront-hosting-toolkit/tree/main/resources/build_config_templates)

### 2. CloudFront Function File

Example for Vue.js:

```javascript
import cf from 'cloudfront';

const kvsId = '__KVS_ID__';

// This fails if the key value store is not associated with the function
const kvsHandle = cf.kvs(kvsId);

function pointsToFile(uri) {
  return /\/[^/]+\.[^/]+$/.test(uri);
}
var rulePatterns = {
  "/$": "/index.html", // When URI ends with a '/', append 'index.html'
  "!file": ".html", // When URI doesn't point to a specific file and doesn't have a trailing slash, append '.html'
  "!file/": "/index.html",// When URI has a trailing slash and doesn't point to a specific file, append 'index.html'
};

// Function to determine rule and update the URI
async function updateURI(uri) {

  let pathToAdd = "";

  try {
    pathToAdd = await kvsHandle.get("path");
  } catch (err) {
      console.log(`No key 'path' present : ${err}`);
      return uri;
  }

  // Check for trailing slash and apply rule.
  if (uri.endsWith("/") && rulePatterns["/$"]) {
    return "/" + pathToAdd + uri.slice(0, -1) + rulePatterns["/$"];
  }

  // Check if URI doesn't point to a specific file.
  if (!pointsToFile(uri)) {
    // If URI doesn't have a trailing slash, apply rule.
    if (!uri.endsWith("/") && rulePatterns["!file"]) {
      return "/" + pathToAdd + uri + rulePatterns["!file"];
    }

    // If URI has a trailing slash, apply rule.
    if (uri.endsWith("/") && rulePatterns["!file/"]) {
      return "/" + pathToAdd + uri.slice(0, -1) + rulePatterns["!file/"];
    }
  }

  return "/" + pathToAdd + uri;
}

// Main CloudFront handler
async function handler(event) {
  var request = event.request;
  var uri = request.uri;

  //console.log("URI BEFORE: " + request.uri); // Uncomment if needed
  request.uri = await updateURI(uri); 
  //console.log("URI AFTER: " + request.uri); // Uncomment if needed



  return request;
}

```

[More CloudFront function templates](https://github.com/awslabs/cloudfront-hosting-toolkit/tree/main/resources/cff_templates)

### 3. Project Configuration File

For GitHub-based workflow:

```json
{
    "repoUrl": "https://github.com/USERNAME/REPOSITORY.git",
    "branchName": "main",
    "framework": "nextjs",
    "domainName": "example.com",
    "hostedZoneId": "Z1234567890ABCDEF"
}
```

For S3-based workflow:

```json
{
    "s3bucket": "my-source-bucket",
    "s3path": "path/to/source",
    "domainName": "example.com",
    "hostedZoneId": "Z1234567890ABCDEF"
}
```

[More configuration examples](https://github.com/your-repo-link/configuration-examples)

## Field Descriptions

### Mandatory Fields

- For GitHub workflow:
  - `repoUrl`: The URL of your GitHub repository
  - `branchName`: The branch to deploy
  - `framework`: The framework used in your project (e.g., "nextjs", "react", "vue")

- For S3 workflow:
  - `s3bucket`: The name of your S3 bucket containing the source code
  - `s3path`: The path within the bucket where your source code is located

### Optional Fields

- `domainName`: Your custom domain name (if you want to use one)
- `hostedZoneId`: The Route 53 hosted zone ID for your domain (required if using a custom domain)

Note: If you include `domainName`, you must also include `hostedZoneId`. These fields are used together to set up a custom domain for your website.