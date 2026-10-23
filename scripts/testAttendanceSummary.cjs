const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
function load(file) {
  const filename = path.join(root, file);
  const source = fs.readFileSync(filename, "utf8");
  const { outputText, diagnostics } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename, reportDiagnostics: true });
  assert.equal(diagnostics.length, 0);
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename })(name => name.includes("AppToast") ? {} : load(path.relative(root, path.resolve(path.dirname(filename), name + ".ts"))), mod, mod.exports);
  return mod.exports;
}
const { canViewAttendanceSummary } = load("utils/attendanceSummary.ts");
const { ROLE_VALUES } = load("utils/roles.ts");
let cases = 0;
for (const role of [...ROLE_VALUES, undefined]) {
  for (const sidebar of [false, true]) for (const attendance of [false, true]) {
    const permissions = { Attendance: { sidebar: { value: sidebar } }, HrmsDashboard: { attendance: { value: attendance } } };
    const expected = Boolean(role) && role !== "agent" && (["sup_admin", "developer"].includes(role) || (sidebar && attendance));
    assert.equal(canViewAttendanceSummary(permissions, role), expected, `${role}: sidebar=${sidebar}, summary=${attendance}`);
    cases++;
  }
}
assert.equal(canViewAttendanceSummary({}, "sub_admin"), false);
assert.equal(canViewAttendanceSummary({}, "agent"), false);
assert.equal(canViewAttendanceSummary(), false);
for (const file of ["screensHRM/UsersHRM/AllUSersHRM.tsx", "screensHRM/LeaveHRM/AllLeave.tsx"]) assert.doesNotMatch(fs.readFileSync(path.join(root, file), "utf8"), /CardHRM/);
const attendance = fs.readFileSync(path.join(root, "screensHRM/AttendanceHRM/AllAttendance.tsx"), "utf8");
assert.match(attendance, /showAttendanceSummary &&\s*\(?\s*<>\s*<CircularBarChart type="attendanceChart" \/>\s*<CardHRM \/>/);
assert.match(attendance, /if \(showAttendanceSummary\)\s+await queryClient.invalidateQueries/);
console.log(`Attendance summary: ${cases} role/permission combinations, Agent exclusion, missing permissions, placement and refresh gating passed.`);
