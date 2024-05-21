import cf from 'cloudfront';

const kvsId = '__KVS_ID__';

// This fails if the key value store is not associated with the function
const kvsHandle = cf.kvs(kvsId);

// Function to update the URI to point to index.html
async function updateURI(uri) {
  let pathToAdd = "";

  try {
    pathToAdd = await kvsHandle.get("path");
  } catch (err) {
    console.log(`No key 'path' present: ${err}`);
    return uri;
  }

  // Always return index.html
  return `/${pathToAdd}/index.html`;
}


// Main CloudFront handler
async function handler(event) {
  var request = event.request;
  var uri = request.uri;

  //console.log("URI BEFORE: " + request.uri); -> Uncomment if needed
  request.uri = await updateURI(uri); 
  //console.log("URI AFTER: " + request.uri);-> Uncomment if needed

  return request;
}
