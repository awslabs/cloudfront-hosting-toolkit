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

  console.log("BEFORE:" + request.uri);
  // Update the request URI using our rules
  request.uri = await updateURI(uri);
  
  console.log("AFTER:" + request.uri);

  return request;
}
