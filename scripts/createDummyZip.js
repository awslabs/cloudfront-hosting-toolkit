// scripts/createZipArchive.js

const fs = require("fs");
const AdmZip = require("adm-zip");

console.log("createZipArchive");
const outputFile = "resources/s3_trigger/dummy.zip"; // Adjust the path as needed

// Check if the zip file already exists
if (fs.existsSync(outputFile)) {
  console.log("Zip file already exists.");
  return;
}

console.log("Creating new zip file...");

const zip = new AdmZip();

try {
  zip.addLocalFile("resources/s3_trigger/dummy.txt"); // Adjust the path as needed
  zip.writeZip(outputFile);
  console.log("Zip file written successfully.");
} catch (error) {
  console.error("Error writing zip file:", error);
  process.exit(1);
}
