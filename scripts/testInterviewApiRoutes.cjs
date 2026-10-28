const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "../services/hrmApi/userHrmApi.ts"),
  "utf8"
);

if (!source.includes("/api/recruitment/post-interview-process")) {
  throw new Error("Mobile must use the canonical post-interview endpoint");
}

if (source.includes("post-intervierw-process")) {
  throw new Error("The misspelled legacy post-interview endpoint is still in use");
}

console.log("Interview API route checks passed");
