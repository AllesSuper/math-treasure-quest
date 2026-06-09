// Validates that all JSON config files parse correctly.
// Used by the `validate:json` npm script and the quality workflow.
"use strict";

var fs = require("fs");
var path = require("path");

var files = ["manifest.json", "package.json"];
var root = path.join(__dirname, "..");
var failed = false;

files.forEach(function (file) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    console.log("ok   " + file);
  } catch (error) {
    failed = true;
    console.error("FAIL " + file + ": " + error.message);
  }
});

if (failed) {
  process.exit(1);
}
console.log("All JSON files are valid.");
