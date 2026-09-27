// Run with: node scripts/testRoles.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const cache = new Map();

function load(relativePath) {
  const filename = path.resolve(__dirname, "..", relativePath);
  if (cache.has(filename)) return cache.get(filename);
  const { outputText, diagnostics } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    reportDiagnostics: true,
    fileName: filename,
  });
  assert.equal(diagnostics.length, 0);
  const module = { exports: {} };
  cache.set(filename, module.exports);
  vm.runInThisContext(`(function(require, module, exports) {${outputText}\n})`, { filename })(
    specifier => load(path.relative(path.resolve(__dirname, ".."), path.resolve(path.dirname(filename), specifier + ".ts"))), module, module.exports,
  );
  return module.exports;
}

const roles = load("utils/roles.ts");
const data = load("utils/data.ts");
const hrm = load("utils/hrmKeysMatchToBE.ts");
assert.deepEqual(Object.values(data.roleEnum), roles.ROLE_VALUES);
for (const role of roles.ROLE_VALUES) {
  assert.equal(data.userTypes[role], roles.ROLE_LABELS[role]);
  assert.equal(hrm.roleHRM[role], roles.ROLE_LABELS[role]);
}
for (const role of ["hr", "developer", "marketing", "office_admin", "assistant_manager"]) {
  assert.equal(roles.isValidRole(role), true);
  assert(data.roleListArr.some(option => option._id === role && option.name === roles.ROLE_LABELS[role]));
}
assert(!data.roleListArr.some(option => option._id === "sup_admin"));
for (const role of ["unknown", "HR", "office-admin", null, undefined]) assert.equal(roles.isValidRole(role), false);
console.log(`Mobile role catalog, selectors and labels verified (${roles.ROLE_VALUES.length} roles).`);
