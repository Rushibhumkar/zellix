const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

function loadTypeScript(file) {
  const source = fs.readFileSync(file, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loadedModule = new Module(file, module);
  loadedModule.filename = file;
  loadedModule.paths = Module._nodeModulePaths(path.dirname(file));
  loadedModule._compile(output, file);
  return loadedModule.exports;
}

const phoneUtils = loadTypeScript(path.join(root, "utils/phoneNumber.ts"));

assert.equal(
  phoneUtils.formatSelectedPhoneNumber({
    countryCode: "+971",
    countryCodeAlphabet: "AE",
    number: "050 123 4567",
  }),
  "+971501234567",
);
assert.equal(
  phoneUtils.formatSelectedPhoneNumber({
    countryCode: "+91",
    countryCodeAlphabet: "IN",
    number: "98765 43210",
  }),
  "+919876543210",
);
assert.equal(phoneUtils.isValidPhoneNumber("+971501234567"), true);
assert.equal(phoneUtils.isValidPhoneNumber("+919876543210"), true);
assert.equal(phoneUtils.isValidPhoneNumber("undefinedundefined"), false);
assert.equal(phoneUtils.isValidPhoneNumber("123"), false);

const mobileInput = fs.readFileSync(
  path.join(root, "myComponents/MobileInput/MobileInput.tsx"),
  "utf8",
);
assert.match(mobileInput, /if \(isCountryPicker \|\| !number\.phone\) return/);
assert.match(mobileInput, /country\.callingCode\?\.\[0\]/);

for (const screen of ["ScheduleInterview.tsx", "PostIntProcess.tsx"]) {
  const source = fs.readFileSync(
    path.join(root, "screensHRM/Interview", screen),
    "utf8",
  );
  assert.match(source, /formatSelectedPhoneNumber\(v\)/);
  assert.match(source, /\.test\("is-valid", "Invalid number", isValidPhoneNumber\)/);
}

console.log(
  "Interview phone validation: country-picker emissions, UAE/India normalization, and invalid-number checks passed.",
);
