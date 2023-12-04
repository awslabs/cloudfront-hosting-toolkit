import {} from "../bin/cli/actions/init";

describe("Test URI rewrites", () => {
  // URL rewriting rules
  function pointsToFile(uri: string) {
    return /\/[^/]+\.[^/]+$/.test(uri);
  }
  var rulePatterns = {
    "/$": "/index.html", // When URI ends with a '/', append 'index.html'
    "!file": ".html", // When URI doesn't point to a specific file and doesn't have a trailing slash, append '.html'
    "!file/": "/index.html"
  };

  const pathToAdd = "myFolderName";

  // Function to determine rule and update the URI
  function updateURI(uri: string) {
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

  test("test uri rewrite", async () => {
    const testCases = [
      { input: "/", expected: "/myFolderName/index.html" },
      { input: "/test", expected: "/myFolderName/test.html" },
      { input: "/test/", expected: "/myFolderName/test/index.html" },
      { input: "/test.jpg", expected: "/myFolderName/test.jpg" },
      { input: "/folder/", expected: "/myFolderName/folder/index.html" },
      {
        input: "/folder/page",
        expected: "/myFolderName/folder/page.html",
      },

      // Add more test cases as required
    ];

    testCases.forEach((testCase, index) => {
      const result = updateURI(testCase.input);
      expect(result).toEqual(testCase.expected); // This will assert if the result matches the expected value.
    });
  });
});
