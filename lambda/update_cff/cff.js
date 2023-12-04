// Configuration (Path to add)
var pathToAdd = "";

function pointsToFile(uri) {
  return /\/[^/]+\.[^/]+$/.test(uri);
}
var rulePatterns = {
  "/$": "/index.html", // When URI ends with a '/', append 'index.html'
  "!file": ".html", // When URI doesn't point to a specific file and doesn't have a trailing slash, append '.html'
  "!file/": "/index.html",// When URI has a trailing slash and doesn't point to a specific file, append 'index.html'
};

// Function to determine rule and update the URI
function updateURI(uri) {
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

  // Default return
  return "/" + pathToAdd + uri;
}

// Main CloudFront handler
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  console.log("BEFORE:" + request.uri);
  if (pathToAdd) {
    // Update the request URI using our rules
  request.uri = updateURI(uri);

  }
  
  console.log("AFTER:" + request.uri);

  return request;
}
