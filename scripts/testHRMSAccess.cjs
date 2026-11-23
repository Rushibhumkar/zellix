const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const root = path.resolve(__dirname, '..') + path.sep;
const React = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) };
function evaluate(source, context) {
 const module = { exports: {} };
 const compiled = ts.transpileModule(source, { fileName: 'test.tsx', reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } });
 assert.equal(compiled.diagnostics.length, 0);
 vm.runInNewContext(compiled.outputText, { module, exports: module.exports, ...context });
 return module.exports;
}
const checkPermission = evaluate(fs.readFileSync(root + 'utils/commonFunctions.ts', 'utf8'), { require: () => ({}) }).checkPermission;
const source = fs.readFileSync(root + 'navigation/HRManagementStack.tsx', 'utf8');
const ast = ts.createSourceFile('nav.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let entry;
function find(node) {
 if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'HRManagementStack') entry = node.initializer.getText(ast);
 ts.forEachChild(node, find);
}
find(ast);
let role, permission, failed = false, loading = false, back = 0, retries = 0;
const context = {
 React, useNavigation: () => ({ goBack: () => back++ }),
 useSelector: () => ({ user: { _id: 'user', role } }), selectUser: {},
 roleEnum: { agent: 'agent', team_lead: 'team_lead' },
 useGetUserPermission: () => ({ data: permission, isLoading: loading, isError: failed, isFetching: false, refetch: () => retries++ }),
 checkPermission, useSafeAreaInsets: () => ({ bottom: 0 }), HRMSAccessNotice: 'AccessNotice',
 View: 'View', ActivityIndicator: 'Spinner', Tab: { Navigator: 'Tabs', Screen: 'Tab' }, hasCRMGlassTabs: false, Platform: { OS: 'ios' },
};
for (const name of ['DashboardHRMStack','AllUsersHRMStack','AttendanceStack','AllLeaveStack','InterviewStack']) context[name] = name;
const render = evaluate('module.exports = ' + entry, context);
// VM functions above close over changing test state.
for (role of ['agent','team_lead','hr','sub_admin','manager']) {
 permission = {};
 let tree = render();
 assert.equal(tree.type, 'AccessNotice', role);
 tree.props.onBack(); tree.props.onRetry();
 for (const module of ['HrmsDashboard','Users','Attendance','Leaves','Recruitment']) {
  permission = { [module]: { sidebar: { value: true } } };
  const restricted = role === 'agent' && ['HrmsDashboard','Users','Recruitment'].includes(module) || role === 'team_lead' && module === 'Recruitment';
  assert.equal(render().type, restricted ? 'AccessNotice' : 'Tabs', role + ':' + module);
 }
}
for (role of ['sup_admin','developer']) { permission = {}; assert.equal(render().type, 'Tabs'); }
role = 'agent'; permission = {}; failed = true;
assert.equal(render().props.loadFailed, true);
loading = true; assert.equal(render().type, 'View');
assert.equal(back, 5); assert.equal(retries, 5);
const notice = evaluate(fs.readFileSync(root + 'components/HRMSAccessNotice.tsx', 'utf8'), { require: name => name === 'react' ? { ...React, default: React } : name === 'react-native' ? { ScrollView: 'Scroll', View: 'View', Text: 'Text', Pressable: 'Button', ActivityIndicator: 'Spinner', StyleSheet: { create: x => x } } : name === '@expo/vector-icons' ? { Feather: 'Icon' } : { useSafeAreaInsets: () => ({ top: 24, bottom: 20 }) } }).default;
const nodes = tree => !tree || typeof tree !== 'object' ? [] : [tree, ...(tree.props?.children || []).flat(Infinity).flatMap(nodes)];
for (const loadFailed of [true, false]) {
 const tree = notice({ loadFailed, retrying: false, onBack() {}, onRetry() {} });
 assert.ok(JSON.stringify(tree).includes(loadFailed ? 'Unable to check HRMS access' : 'HRMS access unavailable'));
 assert.equal(nodes(tree).filter(n => n.props?.accessibilityLabel === 'Retry permission check').length, loadFailed ? 1 : 0);
 assert.ok(nodes(tree).some(n => n.type === 'Icon'));
}
console.log('HRMS access: module/role matrix, admin access, failed/loading permissions, back/retry and notice rendering passed.');
