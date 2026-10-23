const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const result = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  assert.equal(result.diagnostics.length, 0);
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${result.outputText}\n})`, { filename: file })(name => {
    if (!(name in mocks)) throw new Error(`Missing mock: ${name}`);
    return mocks[name];
  }, mod, mod.exports);
  return mod.exports;
}
const utils = load('utils/meetingReminderSettings.ts');
assert.deepEqual(utils.parseMeetingReminderOffsets('120, 0, 30'), [0, 30, 120]);
assert.deepEqual(utils.parseMeetingReminderOffsets('0,10080'), [0, 10080]);
assert.deepEqual(utils.parseMeetingReminderOffsets('0,1,2,3,4,5,6,7,8,9'), [0,1,2,3,4,5,6,7,8,9]);
for (const input of ['', ' ', '0,', ',0', '0,,30', '-1', '1.5', '1e2', 'abc', '10081', '0,00', '30,30', '0,1,2,3,4,5,6,7,8,9,10']) assert.throws(() => utils.parseMeetingReminderOffsets(input));
assert.throws(() => utils.reminderSettingsPayload('0', 'true', false));
assert.deepEqual(utils.reminderSettingsPayload('0', false, false), { offsets: [0], email: false, push: false });
assert.equal(utils.meetingReminderTimeLabel(0), 'At meeting time');
assert.equal(utils.meetingReminderTimeLabel(120), '2 hr later');
assert.equal(utils.meetingReminderTimeLabel(30), '30 min later');
let state = [], effects = [], cursor = 0, role = 'sup_admin', queryOptions, queryCalls = 0, closes = 0, refetches = 0;
let query = { data: { offsets: [0,30,120], email: true, push: true }, isFetching: false, isPending: false, error: null, refetch: () => refetches++ };
const same = (a,b) => a && b && a.length === b.length && a.every((v,i) => Object.is(v,b[i]));
const React = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), Fragment: 'Fragment',
  useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; },
  useRef(initial) { const i = cursor++; if (!(i in state)) state[i] = { current: initial }; return state[i]; },
  useEffect(fn, deps) { const i = cursor++; if (!same(state[i]?.deps,deps)) { state[i]?.cleanup?.(); state[i] = { deps }; effects.push(() => { state[i].cleanup = fn(); }); } },
};
const calls = [], cache = [];
let put = async (url, payload) => ({ data: { ...payload, revision: 2 } });
const native = Object.fromEntries(['ActivityIndicator','KeyboardAvoidingView','Modal','Pressable','ScrollView','Switch','Text','TextInput','TouchableOpacity','View'].map(name => [name,name]));
native.StyleSheet = { create: value => value, absoluteFill: {} }; native.Platform = { OS: 'android' };
const component = load('components/MeetingReminderSettings.tsx', {
  react: React, 'react-native': native, '@expo/vector-icons': { Feather: 'Feather' },
  '@tanstack/react-query': { useQuery: options => { queryCalls++; queryOptions = options; return query; }, useQueryClient: () => ({ setQueryData: (...args) => cache.push(args) }) },
  'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 24 }) },
  'react-redux': { useSelector: () => ({ user: { _id: 'user-1', role } }) }, '../redux/userSlice': { selectUser: () => {} },
  '../services/authApi/axiosInstance': { axiosInstance: { get: async (...args) => { calls.push(['get', ...args]); return { data: query.data }; }, put: async (...args) => { calls.push(['put', ...args]); return put(...args); } } },
  '../utils/meetingLifecycle': { meetingMessage: (error, fallback) => error?.response?.data?.message || error?.message || fallback },
  '../utils/meetingReminderSettings': utils,
});
let tree;
function render(fn = component.ReminderSettingsSheet) { for (let i=0;i<3;i++) { cursor = 0; tree = fn({ userId: 'user-1', onClose: () => closes++ }); effects.splice(0).forEach(effect => effect()); } return tree; }
function reset() { state = []; effects = []; cursor = 0; }
function nodes(node = tree) { if (Array.isArray(node)) return node.flatMap(item => nodes(item)); if (!node || typeof node !== 'object') return []; return [node, ...nodes(node.props?.children)]; }
const label = value => nodes().find(node => node.props.accessibilityLabel === value);
const button = () => label('Save reminder settings');
const text = () => JSON.stringify(tree);
(async () => {
  for (role of ['agent','hr','manager','director','',undefined]) { reset(); assert.equal(render(component.default), null); }
  assert.equal(queryCalls, 0);
  for (role of ['sup_admin','sub_admin','developer']) { reset(); render(component.default); assert.ok(label('Meeting update reminders')); assert.equal(nodes().some(n => n.type === component.ReminderSettingsSheet), false); label('Meeting update reminders').props.onPress(); render(component.default); assert.ok(nodes().some(n => n.type === component.ReminderSettingsSheet)); }
  reset(); render();
  assert.equal(button().props.disabled, false);
  assert.deepEqual(queryOptions.queryKey, ['meetingReminderSettings','user-1']);
  assert.equal(queryOptions.refetchOnMount, 'always');
  assert.equal(queryOptions.retry(0, { response: { status: 403 } }), false);
  assert.equal(queryOptions.retry(0, { response: { status: 401 } }), false);
  assert.equal(queryOptions.retry(1, {}), true); assert.equal(queryOptions.retry(2, {}), false);
  const signal = new AbortController().signal; await queryOptions.queryFn({ signal });
  assert.deepEqual(calls.at(-1), ['get','/api/meeting/settings',{ signal }]);
  label('Reminder times (minutes)').props.onChangeText('120, 0, 60'); render();
  label('Email').props.onValueChange(false); render();
  await button().props.onPress(); render();
  assert.deepEqual(calls.at(-1), ['put','/api/meeting/settings',{ offsets: [0,60,120], email: false, push: true }]);
  assert.deepEqual(cache.at(-1)[0], ['meetingReminderSettings','user-1']);
  assert.match(text(), /Saved. Pending reminders/);
  label('Push').props.onValueChange(false); render();
  await button().props.onPress(); render();
  assert.deepEqual(calls.at(-1)[2], { offsets: [0,60,120], email: false, push: false });
  // A background refetch must not overwrite an administrator's unsaved edits.
  label('Reminder times (minutes)').props.onChangeText('0, 45'); render();
  query = { ...query, data: { offsets: [0,10], email: true, push: true } }; render();
  assert.equal(label('Reminder times (minutes)').props.value, '0, 45');
  assert.equal(label('Email').props.value, false);
  label('Reminder times (minutes)').props.onChangeText('0,0'); render();
  const count = calls.length; await button().props.onPress(); render(); assert.equal(calls.length,count); assert.match(text(), /must be unique/);
  label('Reminder times (minutes)').props.onChangeText('0, 30'); render();
  put = async () => { throw { response: { data: { message: 'Settings unavailable' } } }; };
  await button().props.onPress(); render(); assert.match(text(), /Settings unavailable/); assert.equal(label('Reminder times (minutes)').props.value, '0, 30'); assert.equal(button().props.disabled,false);
  let resolve; put = () => new Promise(done => { resolve = done; });
  const save = button().props.onPress; const pending = save(); const before = calls.length; await save(); assert.equal(calls.length,before);
  render(); assert.equal(button().props.disabled,true); label('Close').props.onPress(); assert.equal(closes,0);
  resolve({ data: { offsets: [0,30], email: false, push: true } }); await pending; render(); label('Close').props.onPress(); assert.equal(closes,1);
  reset(); query = { ...query, data: undefined, isPending: true, isFetching: true }; render(); assert.equal(button().props.disabled,true); assert.match(text(),/Loading settings/);
  // Cached settings must not become editable until the fresh opening fetch succeeds.
  reset(); query = { ...query, data: { offsets: [0], email:true, push:true }, isPending:false }; render(); assert.equal(button().props.disabled,true);
  reset(); query = { ...query, data: undefined, isFetching:false, error: new Error('Offline') }; render(); assert.equal(button().props.disabled,true); assert.match(text(),/Offline/);
  nodes().find(node => node.type === 'TouchableOpacity' && JSON.stringify(node).includes('Retry')).props.onPress(); assert.equal(refetches,1);
  console.log('Meeting reminders: limits, roles, lazy loading, cache refresh, API contract, channel toggles, validation, error recovery and duplicate-save guard passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
