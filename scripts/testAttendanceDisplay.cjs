const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  useState: value => [value, () => {}],
};
let data;
const native = Object.fromEntries(['View', 'Text', 'FlatList', 'RefreshControl', 'Pressable', 'TouchableOpacity'].map(key => [key, key]));
native.StyleSheet = { create: value => value };
native.Linking = { openURL: async () => {} };
function load(file) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  } }).outputText;
  const req = name => {
    if (name === 'react') return React;
    if (name === 'react-native') return native;
    if (name === 'moment') return require('moment');
    if (name.endsWith('/utils/attendanceDisplay')) return display;
    if (name === '@react-navigation/native') return { useRoute: () => ({ params: { item: { _id: 'one' } } }) };
    if (name === '@tanstack/react-query') return { useQueryClient: () => ({}) };
    if (name === 'react-redux') return { useSelector: () => ({ user: { _id: 'user' } }) };
    if (name.endsWith('/hooks/useGetQuerryHRM')) return { useGetAttendanceDetail: () => ({ data, isLoading: false }) };
    if (name.endsWith('/utils/hrmKeysMatchToBE')) return { statusAttend: { present: 'Present' }, statusColorAttend: {}, roleHRM: {} };
    if (name === '@expo/vector-icons') return { Feather: 'Feather' };
    if (name.endsWith('/const/color')) return { color: {} };
    return { __esModule: true, default: name, shadowPrimaryColor: {} };
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: req });
  return module.exports;
}
const display = load('utils/attendanceDisplay.ts');
for (const [source, expected] of [['Visit In · Mobile', 'smartphone'], ['Visit Out · Mobile', 'smartphone'], ['Phone Check Out', 'smartphone'], ['MOBILE', 'smartphone'], ['MACHINE', 'cpu'], ['Attendance Machine', 'cpu'], ['ADMIN_CORRECTION', 'edit-2'], ['WEB', 'monitor'], ['Source unavailable', 'help-circle']])
  assert.equal(display.attendanceSourceIcon(source), expected);
for (const [minutes, expected] of [[0, '0min'], [25, '25min'], [60, '1hr'], [80, '1hr 20min'], [180, '3hr'], [null, '—']])
  assert.equal(display.formatAttendanceDuration(minutes), expected);
const Details = load('screensHRM/AttendanceHRM/AttendanceDetail.tsx').default;
const Row = load('myComponentsHRM/Row/RowAttendance.tsx').default;
const text = node => Array.isArray(node) ? node.map(text).join(' ') : node && typeof node === 'object' ? text(node.props?.children) : node == null || typeof node === 'boolean' ? '' : String(node);
const find = (node, type) => {
  if (Array.isArray(node)) return node.map(child => find(child, type)).find(Boolean);
  if (!node || typeof node !== 'object') return null;
  return node.type === type ? node : find(node.props?.children, type);
};
const start = { action: 'VISIT_IN', source: 'MOBILE', effectiveAt: '2026-11-20T10:00:00Z', displaySource: 'Visit In · Mobile' };
const end = { action: 'VISIT_OUT', source: 'MOBILE', effectiveAt: '2026-11-20T11:20:00Z', displaySource: 'Visit Out · Mobile' };
data = { name: 'Ram', createdAt: start.effectiveAt, status: 'present', lateMinutes: 180,
  displaySummary: { checkInAt: start.effectiveAt, checkOutAt: end.effectiveAt, checkOutSource: end.displaySource, checkOutDerived: true, workMinutes: 80 },
  sessions: [{ id: 'visit-0', kind: 'visit', in: start, out: end }], events: [start, end] };
let list = find(Details(), 'FlatList');
const attendanceCard = list.props.renderItem({ item: list.props.data.find(section => section.kind === 'attendance') });
assert.match(text(attendanceCard), /Late ·\s+3hr/);
assert.doesNotMatch(text(attendanceCard), /Visit Out · Mobile/);
const allIcons = node => Array.isArray(node) ? node.flatMap(allIcons) : node && typeof node === 'object'
  ? [...(node.type === 'Feather' ? [node] : []), ...allIcons(node.props?.children)] : [];
assert.ok(allIcons(attendanceCard).some(icon => icon.props.name === 'smartphone'));
const allNodes = node => Array.isArray(node) ? node.flatMap(allNodes) : node && typeof node === 'object' ? [node, ...allNodes(node.props?.children)] : [];
const mobileBadge = allNodes(attendanceCard).find(node => node.type === 'View' && node.props.accessibilityLabel === 'Visit Out · Mobile');
assert.equal(mobileBadge.props.style.alignSelf, 'flex-end');
assert.equal(mobileBadge.props.style.marginLeft, 'auto');
assert.equal(text(mobileBadge).trim(), 'Mobile');
const checkoutTile = allNodes(attendanceCard).find(node => node.type === 'View' && node.props.children?.[0] === mobileBadge);
assert.ok(checkoutTile); // Badge is the first row, above the time, not below it.
for (const [source, shortLabel] of [['MOBILE', 'Mobile'], ['MACHINE', 'Machine'], ['ADMIN_CORRECTION', 'Admin'], ['WEB', 'Web']])
  assert.equal(display.attendanceSourceLabel(source), shortLabel);
const footer = text(list.props.ListFooterComponent);
assert.match(footer, /Work time\s+1hr 20min.*estimated/);
assert.match(footer, /Last Visit Out used as checkout/);
assert.match(footer, /Field visit.*Visit\s+In.*Visit\s+Out/s);
assert.doesNotMatch(footer, /· Mobile/);
assert.ok(allIcons(list.props.ListFooterComponent).some(icon => icon.props.name === "smartphone"));
assert.doesNotMatch(footer, /Attendance timeline/);
assert.match(text(Row({ item: data, onPress() {}, personal: true })), /Last Visit Out used as checkout/);
assert.doesNotMatch(text(Row({ item: data, onPress() {}, personal: true })), /· Mobile/);
data.displaySummary.state = 'open';
data.displaySummary.checkOutAt = null;
data.displaySummary.checkOutDerived = false;
assert.match(text(find(Details(), 'FlatList').props.ListFooterComponent), /Day in progress/);
assert.match(text(Row({ item: data, onPress() {}, personal: true })), /Day in progress/);
for (const state of ['not_started', 'open', 'provisional']) {
  data.displaySummary = { state, checkInAt: null, checkOutAt: null };
  const rowText = text(Row({ item: data, onPress() {}, personal: true }));
  const detailsText = text(find(Details(), 'FlatList').props.ListFooterComponent);
  for (const output of [rowText, detailsText]) {
    assert.match(output, /Not checked in/);
    assert.doesNotMatch(output, /Day in progress|duration is provisional/);
  }
  assert.equal(display.attendanceProgressLabel({ state, checkInAt: 'invalid' }), 'Not checked in');
}
for (const state of ['open', 'provisional']) {
  data.displaySummary = { state, checkInAt: start.effectiveAt };
  assert.match(text(Row({ item: data, onPress() {}, personal: true })), /Day in progress/);
  assert.match(text(find(Details(), 'FlatList').props.ListFooterComponent), /Day in progress/);
}
for (const state of ['final', 'override', 'needs_review'])
  assert.equal(display.attendanceProgressLabel({ state, checkInAt: start.effectiveAt }), null);
data = { name: 'Legacy', status: 'present', punchedIn: start.effectiveAt, punchedOut: end.effectiveAt, events: [start, end] };
list = find(Details(), 'FlatList');
assert.match(text(list.props.ListFooterComponent), /Attendance timeline/);
assert.doesNotMatch(text(list.props.ListFooterComponent), /Last Visit Out used as checkout/);
console.log('Mobile attendance duration, paired sessions, checkout source, listing and legacy rendering checks passed.');
