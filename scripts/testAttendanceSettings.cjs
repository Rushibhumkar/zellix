const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function load(file, imports = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(read(file), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React,
  } }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}})`, { console })(
    name => { if (!(name in imports)) throw Error(`Unexpected import ${name}`); return imports[name]; }, mod, mod.exports,
  );
  return mod.exports;
}
const policy = load('utils/attendanceAutoApproval.ts');
for (const role of ['sup_admin', 'sub_admin', 'developer']) assert.equal(policy.canManageAttendanceAutoApproval(role), true);
for (const role of ['agent', 'hr', 'office_admin', 'manager', 'sr_manager', 'recruiter', 'admin', undefined, '']) assert.equal(policy.canManageAttendanceAutoApproval(role), false);
assert.equal(policy.isAutoApprovalEnabled(false), true);
assert.equal(policy.isAutoApprovalEnabled(true), false);
const charts = load('utils/hrmChartData.ts');
const definitions = [{ key: 'present', value: 47 }, { key: 'absent', value: 40 }];
assert.equal(charts.getHRMChartValues(definitions).every(x => x.value === 0), true);
assert.equal(charts.getHRMChartValues(definitions, { present: 0, absent: 0 }).every(x => x.value === 0), true);
assert.equal(charts.getHRMChartValues(definitions, { present: 7, absent: '2' })[0].value, 7);
assert.equal(charts.getHRMChartValues(definitions, { present: 7, absent: '2' })[1].value, 2);
for (const value of [null, undefined, '', true, 'invalid', Infinity, -1]) assert.equal(charts.getHRMChartValues(definitions, { present: value })[0].value, 0);
assert.equal(definitions[0].value, 47); // Never mutate caller's definitions.

let saved = false, calls = [], failure = false;
const api = load('services/hrmApi/attendanceSettingsApi.ts', {
  '../authApi/axiosInstance': { axiosInstance: {
    get: async url => { calls.push({ method: 'GET', url }); if (failure) throw Error('offline'); return { data: { data: { approveBasedAttendance: saved } } }; },
    patch: async (url, body) => { calls.push({ method: 'PATCH', url, body }); if (failure) throw Error('forbidden'); saved = body.value; return { data: { data: { approveBasedAttendance: saved } } }; },
  } },
});

(async () => {
  assert.equal((await api.getAttendanceSettings()).approveBasedAttendance, false);
  await api.setAttendanceAutoApproval(false);
  assert.equal(saved, true);
  assert.equal(calls[1].url, '/api/hrms/hrms-settings/set-approve-attendance');
  await api.setAttendanceAutoApproval(true);
  assert.equal(saved, false);
  assert.equal(typeof calls[2].body.value, 'boolean');
  const before = calls.length;
  await assert.rejects(api.setAttendanceAutoApproval('true'), /Invalid/);
  assert.equal(calls.length, before);
  failure = true;
  await assert.rejects(api.getAttendanceSettings(), /offline/);
  await assert.rejects(api.setAttendanceAutoApproval(false), /forbidden/);
  assert.equal(saved, false);

  // Exercise the actual toggle component's handlers and query/mutation options.
  const React = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), useRef: value => ({ current: value }) };
  const native = Object.fromEntries(['ActivityIndicator', 'Pressable', 'Switch', 'Text', 'View'].map(x => [x, x]));
  native.StyleSheet = { create: styles => styles };
  let queryOptions, mutationOptions, submissions = 0, pendingResolve;
  let queryState = { data: { approveBasedAttendance: false }, isFetching: false, isError: false };
  const invalidations = [], cached = [];
  const component = load('screensHRM/AttendanceHRM/AttendanceAutoApproval.tsx', {
    react: React,
    'react-native': native,
    '@tanstack/react-query': {
      useQueryClient: () => ({ setQueryData: (...args) => cached.push(args), invalidateQueries: options => { invalidations.push(options); return Promise.resolve(); } }),
      useQuery: options => { queryOptions = options; return queryState; },
      useMutation: options => { mutationOptions = options; return { isPending: false, mutateAsync: () => { submissions++; return new Promise(resolve => { pendingResolve = resolve; }); } }; },
    },
    '../../services/hrmApi/attendanceSettingsApi': api,
    '../../utils/attendanceAutoApproval': policy,
    '../../components/AppToast': { useAppToast: () => ({ success() {}, error() {} }) },
  }).default;
  function find(node, type) {
    if (!node || typeof node !== 'object') return;
    if (node.type === type) return node;
    return node.props?.children?.flat(Infinity).map(x => find(x, type)).find(Boolean);
  }
  assert.equal(component({ role: 'agent', userId: 'a' }), null);
  assert.equal(queryOptions.enabled, false);
  assert.equal(component({ role: 'sup_admin' }), null);
  let tree = component({ role: 'sup_admin', userId: 'admin' });
  let toggle = find(tree, 'Switch');
  assert.equal(toggle.props.value, true);
  assert.equal(toggle.props.disabled, false);
  const first = toggle.props.onValueChange(false);
  await toggle.props.onValueChange(false);
  assert.equal(submissions, 1); // Synchronous duplicate-tap guard.
  pendingResolve(); await first;
  mutationOptions.onSuccess({ approveBasedAttendance: true });
  assert.equal(cached.length, 1);
  assert.equal(invalidations.length, 3);
  queryState = { ...queryState, isFetching: true };
  toggle = find(component({ role: 'sub_admin', userId: 'sub' }), 'Switch');
  assert.equal(toggle.props.disabled, true);
  await toggle.props.onValueChange(false);
  assert.equal(submissions, 1);
  queryState = { data: undefined, isFetching: false, isError: true, refetch() {} };
  tree = component({ role: 'developer', userId: 'dev' });
  assert.equal(find(tree, 'Switch'), undefined);
  assert.equal(find(tree, 'Pressable').props.accessibilityRole, 'button');
  let chartCounts;
  let userChartState = {};
  const Chart = load('myComponentsHRM/CircularBarChart/CircularBarChart.tsx', {
    react: React,
    'react-native': native,
    'react-native-gifted-charts': { PieChart: 'PieChart' },
    '../../utils/hrmChartData': charts,
    '../../myComponents/CustomText/CustomText': { default: 'CustomText', __esModule: true },
    '../../const/color': { color: {} },
    '../../const/globalStyle': { shadowPrimaryColor: {} },
    '../../hooks/useGetQuerryHRM': {
      useGetAttendanceChart: () => ({ data: chartCounts }),
      useGetLeaveChart: () => ({}), useGetUserStatusChart: () => userChartState,
    },
    '../../hooks/useConsole': {},
    '../../utils/animations/SlideFadeIn': { default: 'SlideFadeIn', __esModule: true },
  }).default;
  let donut = find(Chart({ type: 'attendanceChart' }), 'PieChart');
  assert.equal(donut.props.data.length, 1);
  assert.equal(donut.props.data[0].color, '#D1D5DB');
  assert.equal(donut.props.sectionAutoFocus, false);
  function labels(node) {
    if (!node || typeof node !== 'object') return [];
    if (typeof node.type === 'function') return labels(node.type(node.props));
    return [node.props?.accessibilityLabel, ...(node.props?.children || []).flat(Infinity).flatMap(labels)].filter(Boolean);
  }
  userChartState = { data: { approved: 12, rejected: 3, pending: '7', new: 0 } };
  let userChart = Chart({ type: 'userChart' });
  assert.deepEqual(labels(userChart).sort(), ['Approve: 12', 'Reject: 3', 'Pending: 7', 'New: 0'].sort());
  donut = find(userChart, 'PieChart');
  assert.equal(donut.props.data.find(x => x.key === 'approved').value, 12);
  assert.equal(donut.props.data.find(x => x.key === 'pending').value, 7);
  userChartState = { data: { approved: 0, rejected: 0, pending: 0, new: 0 } };
  userChart = Chart({ type: 'userChart' });
  assert.deepEqual(labels(userChart).sort(), ['Approve: 0', 'Reject: 0', 'Pending: 0', 'New: 0'].sort());
  assert.equal(find(userChart, 'PieChart').props.data[0].color, '#D1D5DB');
  userChartState = { isLoading: true };
  assert.ok(labels(Chart({ type: 'userChart' })).every(label => label.endsWith(': —')));
  let userRetries = 0;
  userChartState = { isError: true, refetch: () => userRetries++ };
  userChart = Chart({ type: 'userChart' });
  const retry = find(userChart, 'Text');
  assert.equal(retry.props.accessibilityRole, 'button');
  retry.props.onPress(); assert.equal(userRetries, 1);
  userChartState = { data: { approved: 13, rejected: 2, pending: 7, new: 0 } };
  assert.ok(labels(Chart({ type: 'userChart' })).includes('Approve: 13'));
  const legacyLegend = read('myComponentsHRM/CircularBarChart/CircularBarChart.tsx');
  assert.doesNotMatch(legacyLegend, /width: "47%"|minHeight: 40|justifyContent: "space-between"/);
  assert.match(legacyLegend, /width: "75%"/);
  assert.match(legacyLegend, /fontSize=\{11\}>\{`\(\$\{displayCount\}\)`\}/);
  chartCounts = { present: 6, absent: 2, leave: 1, halfDay: 0 };
  donut = find(Chart({ type: 'attendanceChart' }), 'PieChart');
  assert.equal(donut.props.data.length, 4);
  assert.equal(donut.props.data.find(x => x.key === 'present').value, 6);
  assert.equal(donut.props.data.find(x => x.key === 'absent').value, 2);
  chartCounts = {};
  donut = find(Chart({ type: 'attendanceChart' }), 'PieChart');
  assert.equal(donut.props.data[0].color, '#D1D5DB');
  const chartSource = read('myComponentsHRM/CircularBarChart/CircularBarChart.tsx');
  assert.match(chartSource, /data=\{chartData\}/);
  assert.doesNotMatch(chartSource, /temp = dummyUser|pieCirData : dummyUser/);
  assert.match(chartSource, /color: "#D1D5DB"/);
  console.log('Attendance: real/empty chart values, role gates, inverted API booleans, request failures, saved switch state, duplicate prevention, disabled loading, retry and cache refresh passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
