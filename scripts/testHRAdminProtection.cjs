const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function policy(file) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(`(function(module,exports){${code}})`, {})(mod, mod.exports);
  return mod.exports;
}
const mobile = policy(path.join(root, 'utils/hrAdminProtection.ts'));
const web = policy(path.join(root, '../zellix-frontend/src/utils/hrAdminProtection.js'));
const backend = require(path.join(root, '../zellix-backend/utils/hrAdminProtection.js'));
const roles = ['hr', 'agent', 'sup_admin', 'sub_admin', 'developer', 'office_admin', 'manager', 'sr_manager', 'team_lead', 'account', undefined];
let cases = 0;
for (const actor of roles) for (const target of roles) {
  const expected = actor === 'hr' && (!target || ['sup_admin', 'sub_admin', 'developer', 'office_admin'].includes(target));
  for (const implementation of [mobile, web, backend]) assert.equal(implementation.isHRAdminReadOnly(actor, target), expected);
  cases++;
}
const detail = fs.readFileSync(path.join(root, 'screensHRM/UsersHRM/UserDetailHRM.tsx'), 'utf8');
assert.match(detail, /isHRAdminReadOnly\(user\?\.role, data\?\.role \|\| paramsData\?\.role\)/);
assert.match(detail, /const canManageAccount =\s*!readOnlyAdmin &&/);
assert.match(detail, /isEdit: readOnlyAdmin \? undefined/);
assert.match(detail, /<Switch\s+disabled=\{readOnlyAdmin\}/);
assert.match(detail, /const toggleSwitch = \(\) => \{\s*if \(readOnlyAdmin\) return/);
assert.match(detail, /const handleSubmitRestriction = async \(\) => \{\s*if \(readOnlyAdmin\) return/);
assert.match(fs.readFileSync(path.join(root, 'screensHRM/UsersHRM/AddUserHRM.tsx'), 'utf8'), /isHRAdminReadOnly\(user\?\.role, update\?\.role\)/);
console.log(`HR admin protection: ${cases} actor/target combinations consistent across backend/web/mobile; edit, status, lead-pool and direct-form guards verified.`);
