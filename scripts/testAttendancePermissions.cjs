const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
function load(file, imports = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => {
    if (!(name in imports)) throw Error(`Unexpected import ${name}`); return imports[name];
  } });
  return module.exports;
}
const policy = load('utils/attendancePermissions.ts');
for (const role of ['sup_admin', 'sub_admin']) assert.equal(policy.canManageAttendancePermissions(role), true);
for (const role of ['agent', 'hr', 'office_admin', 'developer', undefined]) assert.equal(policy.canManageAttendancePermissions(role), false);
const fixture = () => ({ revision: 3, autoApprove: true, permissions: {
  checkIn: { days: 'everyday', phone: true, biometric: true }, checkOut: { days: 'everyday', phone: true, biometric: true },
  visitIn: { days: 'weekends', phone: true, biometric: false }, visitOut: { days: 'weekends', phone: true, biometric: false },
  requireOfficeGeofence: true, requireVisitGeofence: true, requireVisitOutRemarks: false, allowEndWorkdayWithVisitOut: true,
} });
let hooks = [], cursor = 0, pendingEffects = [], dependencies = [], role = 'sup_admin', gets = 0, saves = [], back = 0, rejectSave = false, blocker;
const React = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  useState(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = initial; return [hooks[index], value => { hooks[index] = typeof value === 'function' ? value(hooks[index]) : value; }]; },
  useRef(initial) { const index = cursor++; return hooks[index] ||= { current: initial }; },
  useEffect(effect, deps) { const index = cursor++; if (!dependencies[index] || deps.some((value, i) => dependencies[index][i] !== value)) { dependencies[index] = deps; pendingEffects.push(effect); } },
};
const navigation = { goBack() { back++; }, addListener(_, handler) { blocker = handler; return () => {}; } };
const native = Object.fromEntries(['ActivityIndicator', 'Pressable', 'ScrollView', 'Switch', 'Text', 'TextInput', 'View'].map(key => [key, key]));
native.StyleSheet = { create: value => value };
const api = { getAttendancePermissions: async () => { gets++; return fixture(); }, saveAttendancePermissions: async draft => {
  saves.push(draft); if (rejectSave) throw { response: { status: 409, data: { message: 'Conflict' } } }; return draft;
} };
const Screen = load('screensHRM/AttendanceHRM/AttendancePermissionsScreen.tsx', {
  react: React, 'react-native': native, '@expo/vector-icons': { Feather: 'Feather' },
  'react-redux': { useSelector: () => ({ user: { _id: 'admin', role } }) },
  '@react-navigation/native': { useNavigation: () => navigation },
  '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async () => {} }) },
  '../../myComponentsHRM/ContainerHRM/ContainerHRM': { __esModule: true, default: 'ContainerHRM' },
  '../../redux/userSlice': {}, '../../components/AppToast': { useAppToast: () => ({ success() {} }) },
  '../../services/hrmApi/attendanceSettingsApi': api, '../../utils/attendancePermissions': policy,
}).default;
const render = () => { cursor = 0; return Screen(); };
const all = (node, type) => Array.isArray(node) ? node.flatMap(value => all(value, type)) : !node || typeof node !== 'object' ? [] : [...(node.type === type ? [node] : []), ...all(node.props?.children, type)];
const text = node => Array.isArray(node) ? node.map(text).join(' ') : node && typeof node === 'object' ? text(node.props?.children) : typeof node === 'string' ? node : '';
const button = (tree, label) => all(tree, 'Pressable').find(node => text(node).trim() === label);
async function open(nextRole = 'sup_admin') {
  hooks = []; dependencies = []; pendingEffects = []; role = nextRole;
  render(); pendingEffects.splice(0).forEach(effect => effect()); for (let tick = 0; tick < 12; tick++) await Promise.resolve();
  return render();
}
(async () => {
  let tree = await open();
  assert.equal(all(tree, 'Switch').length, 15);
  let officeInput = all(tree, 'TextInput').find(node => node.props.accessibilityLabel === 'Office radius (meters)');
  assert.equal(officeInput.props.value, '50');
  for (const invalid of ['12.5', '-1', '1e3', 'abc', '50 m']) {
    officeInput.props.onChangeText(invalid); tree = render();
    officeInput = all(tree, 'TextInput').find(node => node.props.accessibilityLabel === 'Office radius (meters)');
    assert.equal(officeInput.props.value, '50');
  }
  for (const invalid of ['', '0', '10001']) {
    officeInput.props.onChangeText(invalid); tree = render();
    assert.equal(button(tree, 'Save permissions').props.disabled, true);
  }
  officeInput.props.onChangeText('250'); tree = render();
  all(tree, 'TextInput').find(node => node.props.accessibilityLabel === 'Sales-center radius (meters)').props.onChangeText('400');
  tree = render();
  assert.equal(button(tree, 'Save permissions').props.disabled, false);
  const days = all(tree, 'Pressable').find(node => node.props.accessibilityLabel === 'Visit In: Weekdays · Monday–Friday');
  days.props.onPress(); tree = render();
  all(tree, 'Switch').find(node => node.props.accessibilityLabel === 'Check In: allow phone').props.onValueChange(false);
  tree = render();
  assert.equal(saves.length, 0);
  const first = button(tree, 'Save permissions').props.onPress();
  let prevented = false; blocker({ preventDefault() { prevented = true; } }); assert.equal(prevented, true);
  await button(tree, 'Save permissions').props.onPress(); await first;
  assert.equal(saves.length, 1); assert.equal(saves[0].revision, 3);
  assert.equal(saves[0].permissions.officeRadiusMeters, 250); assert.equal(saves[0].permissions.visitRadiusMeters, 400);
  assert.equal(saves[0].permissions.visitIn.days, 'weekdays'); assert.equal(saves[0].permissions.checkIn.phone, false); assert.equal(back, 1);
  rejectSave = true; tree = await open('sub_admin');
  await button(tree, 'Save permissions').props.onPress(); tree = render();
  assert.equal(button(tree, 'Save permissions').props.disabled, true);
  assert.ok(button(tree, 'Reload saved settings'));
  const priorGets = gets; await open('agent'); assert.equal(gets, priorGets);
  console.log('Mobile attendance permissions: role gates, saved values, day/channel editing, explicit save, duplicate prevention, back handling and conflict reload passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
