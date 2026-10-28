const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, requireMock) {
  const mod = { exports: {} };
  const result = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
  });
  assert.equal(result.diagnostics.length, 0);
  vm.runInNewContext(`(function(require,module,exports){${result.outputText}})`, {})(requireMock, mod, mod.exports);
  return mod.exports;
}
const { checkPermission } = load('utils/commonFunctions.ts', () => ({}));
let user, permissions, requestedId;
const React = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) };
const stack = { Navigator: 'Stack.Navigator', Screen: 'Stack.Screen' };
const tabs = { Navigator: 'Tab.Navigator', Screen: 'Tab.Screen' };
const { HRManagementStack } = load('navigation/HRManagementStack.tsx', name => {
  switch (name) {
    case 'react': return React;
    case 'react-native': return { Platform: { OS: 'android' } };
    case '@react-navigation/bottom-tabs': return { createBottomTabNavigator: () => tabs };
    case '@react-navigation/native-stack': return { createNativeStackNavigator: () => stack };
    case 'react-native-safe-area-context': return { useSafeAreaInsets: () => ({ bottom: 0 }) };
    case 'react-redux': return { useSelector: () => ({ user }) };
    case '../utils/data': return { roleEnum: { agent: 'agent' } };
    case '../utils/commonFunctions': return { checkPermission };
    case '../services/rootApi/permissionApi': return { useGetUserPermission: id => { requestedId = id; return { data: permissions }; } };
    default: return { __esModule: true, default: 'ScreenComponent' };
  }
});
const screenNames = () => HRManagementStack().props.children.flat(Infinity).filter(Boolean).map(child => child.props.name);
let cases = 0;
for (const role of ['hr', 'sub_admin', 'office_admin', 'manager', 'sr_manager', 'agent', 'sup_admin', 'developer']) {
  user = { _id: `${role}-id`, role };
  for (const value of [true, false, undefined, 'true', 1]) {
    permissions = { Recruitment: { sidebar: { value } } };
    const names = screenNames();
    assert.equal(requestedId, user._id);
    assert.equal(names.includes('InterviewStack'), ['sup_admin', 'developer'].includes(role) || value === true, `${role}: ${value}`);
    assert.equal(names.includes('AttendanceStack'), true);
    assert.equal(names.includes('AllLeaveStack'), true);
    assert.equal(names.includes('AllUsersHRMStack'), role !== 'agent');
    assert.equal(names.includes('DashboardHRMStack'), role !== 'agent');
    cases++;
  }
}
user = { _id: 'hr', role: 'hr' };
permissions = undefined;
assert.equal(screenNames().includes('InterviewStack'), false); // Loading/missing permissions fail closed for HR.
permissions = { Recruitment: { sidebar: { value: true } } };
assert.equal(screenNames().includes('InterviewStack'), true);
permissions.Recruitment.sidebar.value = false;
assert.equal(screenNames().includes('InterviewStack'), false); // Permission revocation removes the route.
user = undefined;
assert.equal(screenNames().includes('InterviewStack'), false);
console.log(`Interview tab: ${cases} strict permission/role cases, HR loading/grant/revocation, current-user lookup, admin overrides and unchanged other tabs passed.`);
