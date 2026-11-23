const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const source = fs.readFileSync('screensHRM/DashboardHRM/CheckInOut.tsx', 'utf8');
const choices = [{ _id: 'office:main', name: 'Head Office', displayName: 'Head Office · Office', kind: 'office' },
  { _id: 'salesCenter:123', name: 'City Sales Center', displayName: 'City Sales Center · Sales center', kind: 'salesCenter' }];
async function scenario(action, selection, empty = false, failPost = false) {
  let cells = [], cursor = 0, effects = [], posts = [], query, releaseLocation;
  const errors = [], modalHost = { show() {} };
  const React = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), useCallback: fn => fn,
    useState(initial) { const i = cursor++; if (!(i in cells)) cells[i] = initial; return [cells[i], value => { cells[i] = typeof value === 'function' ? value(cells[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return cells[i] ||= { current: initial }; } };
  const native = Object.fromEntries(['ActivityIndicator', 'Pressable', 'Text', 'TextInput', 'View'].map(key => [key, key]));
  native.StyleSheet = { create: value => value }; native.useWindowDimensions = () => ({ height: 844 }); native.Alert = { alert() {} }; native.Linking = {};
  const state = { actions: { CHECK_IN: null, VISIT_IN: null, VISIT_OUT: 'No visit' }, mobileOfficePunchEnabled: true,
    siteVisitAvailable: action === 'VISIT_IN', attendancePolicyRevision: 6 };
  const imports = { react: React, 'react-native': native, '@expo/vector-icons': { Feather: 'Feather' },
    '@react-navigation/native': { useFocusEffect: fn => effects.push(fn) },
    'expo-location': { requestForegroundPermissionsAsync: async () => ({ granted: true }), hasServicesEnabledAsync: async () => true,
      Accuracy: { High: 1 }, getCurrentPositionAsync: () => new Promise(resolve => { releaseLocation = () => resolve({ coords: { latitude: 1, longitude: 2, accuracy: 5 } }); }) },
    '../../components/AppToast': { AppToastHost: 'ToastHost', useAppToast: () => ({ error(...args) { errors.push(args); }, success() {} }) },
    '../../services/authApi/axiosInstance': { axiosInstance: { get: async () => ({ data: state }), post: async (_, body) => { posts.push(body); if (failPost) throw { response: { data: { message: 'Outside allowed location', code: 'MOBILE_OFFICE_PUNCH_DISABLED' } } }; return { data: state }; } } },
    'react-native-element-dropdown': { Dropdown: 'Dropdown' }, '@tanstack/react-query': { useQuery: options => { query = options; return { data: empty ? [] : choices, isFetching: false, isError: false }; } },
    '../../services/hrmApi/siteVisitLocationsApi': { getAttendancePunchLocations() {} },
    '../../myComponentsHRM/ModalWithBlur/ModalWithBlur': { __esModule: true, default: 'Modal' },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => { if (!(name in imports)) throw Error(name); return imports[name]; }, setInterval: () => 1, clearInterval() {} });
  const render = () => { cursor = 0; return module.exports.default({ onLoadError() {}, retryVersion: 0 }); };
  const all = (node, type) => Array.isArray(node) ? node.flatMap(child => all(child, type)) : !node || typeof node !== 'object' ? [] : [...(node.type === type ? [node] : []), ...all(node.props?.children, type)];
  const text = node => Array.isArray(node) ? node.map(text).join(' ') : node && typeof node === 'object' ? text(node.props?.children) : typeof node === 'string' ? node : '';
  let tree = render(); effects.shift()(); await new Promise(setImmediate); tree = render();
  const label = action === 'CHECK_IN' ? 'Check In' : 'Visit In';
  all(tree, 'Pressable').find(node => node.props.accessibilityLabel === label).props.onPress(); tree = render();
  assert.equal(all(tree, 'Modal')[0].props.visible, true); // Check In must work even when visits are unavailable.
  assert.equal(query.queryKey[1], action); assert.equal(query.queryKey[2], 6); assert.equal(query.enabled, true);
  let confirm = all(tree, 'Pressable').find(node => text(node).trim() === 'Confirm');
  assert.equal(confirm.props.disabled, true);
  confirm.props.onPress(); await new Promise(setImmediate); assert.equal(posts.length, 0);
  if (empty) { assert.match(text(tree), /No allowed attendance locations/); return; }
  const picker = all(tree, 'Dropdown')[0];
  assert.equal(picker.props.search, true); assert.equal(picker.props.labelField, 'displayName');
  assert.match(picker.props.searchPlaceholder, /office/);
  picker.props.onChange(choices.find(choice => choice._id === selection)); tree = render();
  confirm = all(tree, 'Pressable').find(node => text(node).trim() === 'Confirm'); assert.equal(confirm.props.disabled, false);
  all(tree, 'Modal')[0].props.overlay.props.ref.current = modalHost;
  confirm.props.onPress(); confirm.props.onPress(); await new Promise(setImmediate);
  tree = render();
  const pending = all(tree, 'Pressable').find(node => node.props.accessibilityLabel === 'Confirm');
  assert.equal(pending.props.accessibilityState.busy, true);
  assert.equal(pending.props.disabled, true);
  assert.equal(all(pending, 'ActivityIndicator').length, 1);
  assert.match(text(pending), /Submitting/);
  assert.equal(all(tree, 'Dropdown')[0].props.disable, true);
  all(tree, 'Modal')[0].props.onClose(); assert.equal(all(render(), 'Modal')[0].props.visible, true);
  releaseLocation(); await new Promise(setImmediate);
  tree = render();
  const finished = all(tree, 'Pressable').find(node => node.props.accessibilityLabel === 'Confirm');
  assert.equal(finished.props.accessibilityState.busy, false);
  assert.equal(all(tree, 'Modal')[0].props.visible, failPost);
  if (failPost) { assert.equal(errors.length, 1); assert.equal(errors[0][2], modalHost); }
  assert.equal(posts.length, 1); assert.equal(posts[0].action, action); assert.equal(posts[0].siteId, selection);
}
(async () => {
  await scenario('CHECK_IN', 'office:main'); await scenario('CHECK_IN', 'salesCenter:123');
  await scenario('VISIT_IN', 'office:main'); await scenario('VISIT_IN', 'salesCenter:123'); await scenario('CHECK_IN', undefined, true);
  await scenario('CHECK_IN', 'office:main', false, true);
  await scenario('VISIT_IN', 'office:main', false, true);
  console.log('Mobile locations: searchable office/sales-center picker, action-specific queries, required selection, action preservation, duplicate prevention and empty states passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
