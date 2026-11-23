const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('navigation/CRMGlassTabBar.tsx', 'utf8');
const compiled = ts.transpileModule(source, { fileName: 'CRMGlassTabBar.tsx', reportDiagnostics: true,
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 } });
assert.equal(compiled.diagnostics.length, 0);
function harness(os = 'android', available = true) {
  const heights = [];
  let floating = true;
  const cells = [], frames = new Map(), listeners = new Map(), effects = [];
  let cursor = 0, frameId = 0;
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    Fragment: 'Fragment',
    useContext: () => height => heights.push(height),
    useState: initial => { const i = cursor++; if (!(i in cells)) cells[i] = typeof initial === 'function' ? initial() : initial;
      return [cells[i], value => { cells[i] = typeof value === 'function' ? value(cells[i]) : value; }]; },
    useRef: initial => { const i = cursor++; if (!(i in cells)) cells[i] = { current: initial }; return cells[i]; },
    useMemo: fn => fn(),
    useEffect: fn => { const i = cursor++; if (!(i in cells)) { cells[i] = true; effects.push(fn); } },
  };
  const imports = {
    react: React,
    'react-native': { Platform: { OS: os }, View: 'View', StyleSheet: { create: styles => styles },
      Keyboard: { isVisible: () => false, addListener: (name, fn) => { listeners.set(name, fn); return { remove: () => listeners.delete(name) }; } } },
    expo: { requireOptionalNativeModule: () => available ? { isSupported: () => true, selectionProtocolVersion: () => 2 } : null,
      requireNativeView: () => 'NativeTabs' },
    '@react-navigation/bottom-tabs': { BottomTabBar: 'Fallback' },
    '@react-navigation/native': { CommonActions: { navigate: payload => ({ type: 'NAVIGATE', payload }) } },
  };
  const mod = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${compiled.outputText}})`, {
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
  })(name => {
    if (name.startsWith('../assets/')) return { __esModule: true, default: 'Icon' };
    assert.ok(name in imports, name); return imports[name];
  }, mod, mod.exports);
  let state = { key: 'tabs', index: 0, routes: [
    { key: 'dashboard-key', name: 'dashboard' }, { key: 'data-key', name: 'allLead2' }, { key: 'reports-key', name: 'ReportsNavigator' },
  ] };
  let prevent = false;
  const dispatched = [], emitted = [];
  const navigation = {
    getState: () => state,
    emit: event => { emitted.push(event); return { defaultPrevented: prevent }; },
    dispatch: action => { dispatched.push(action); state = { ...state, index: state.routes.findIndex(route => route.name === action.payload.name) }; },
  };
  const props = () => ({ state, navigation, floating, insets: { bottom: 24 },
    descriptors: Object.fromEntries(state.routes.map(route => [route.key, { options: { tabBarHideOnKeyboard: true } }])) });
  const find = (node, type) => !node || typeof node !== 'object' ? undefined : node.type === type ? node :
    (node.props?.children || []).flat(Infinity).map(child => find(child, type)).find(Boolean);
  const render = () => { cursor = 0; const tree = mod.exports.default(props()); effects.splice(0).forEach(fn => fn()); return tree; };
  const native = () => find(render(), 'NativeTabs');
  const press = (key, requestId) => native().props.onTabSelect({ nativeEvent: { key, requestId } });
  return { api: mod.exports, native, render, press, frames, listeners, emitted, dispatched, heights,
    setFloating: value => { floating = value; },
    flush: () => { const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn()); },
    prevent: value => { prevent = value; },
    setState: value => { state = value; }, state: () => state };
}
let h = harness();
assert.equal(h.api.hasAndroidNativeTabs, true);
assert.equal(h.api.crmGlassTabHeight(24), 104);
assert.ok(h.native());
assert.equal(h.native().props.style[0].position, undefined); // Android is inline even for the CRM default.
assert.ok(h.native().props.tabs.every(tab => tab.iconData === undefined));
h.native().props.onLayout({ nativeEvent: { layout: { height: 104 } } });
assert.deepEqual(h.heights, [104]);
h.setFloating(false);
assert.equal(h.native().props.style[0].position, undefined);
assert.ok(h.listeners.has('keyboardDidShow'));
assert.ok(!h.listeners.has('keyboardWillShow'));
h.press('data-key', 1); h.press('reports-key', 2); h.flush();
assert.equal(h.dispatched.length, 1);
assert.equal(h.dispatched[0].payload.name, 'ReportsNavigator');
assert.equal(h.dispatched[0].target, 'tabs');
assert.equal(h.native().props.selectionState.requestId, 2);
assert.equal(h.native().props.selectionState.key, 'reports-key');
h.prevent(true); h.press('data-key', 3); h.flush();
assert.equal(h.dispatched.length, 1);
assert.equal(h.native().props.selectionState.key, 'reports-key');
assert.equal(h.native().props.selectionState.requestId, 3);
h.native().props.onTabLongPress({ nativeEvent: { key: 'data-key' } });
assert.equal(h.emitted.at(-1).type, 'tabLongPress');
h.listeners.get('keyboardDidShow')(); assert.equal(h.render(), null);
h.listeners.get('keyboardDidHide')(); assert.ok(h.native());
h.setState({ key: 'hrm', index: 0, routes: [{ key: 'attendance-only', name: 'AttendanceStack' }] });
assert.equal(h.native().props.tabs.length, 1);
assert.equal(h.native().props.tabs[0].title, 'Attendance');
h.setState({ key: 'tabs', index: 0, routes: Array.from({ length: 6 }, (_, index) => ({ key: String(index), name: String(index) })) });
assert.equal(h.render().type, 'Fallback');
h = harness('android', false); assert.equal(h.api.hasCRMGlassTabs, false); assert.equal(h.render().type, 'Fallback');
h = harness('ios'); assert.equal(h.api.crmGlassTabHeight(34), 98); assert.equal(h.api.hasAndroidNativeTabs, false);
assert.ok(h.native()); assert.ok(h.listeners.has('keyboardWillShow'));
assert.equal(h.native().props.bottomInset, undefined);
assert.equal(h.native().props.style[0].position, 'absolute'); // Existing iOS floating layout.
h = harness('web'); assert.equal(h.render().type, 'Fallback');
// Verify the real CRM navigator reserves space on Android, while iOS stays floating.
const navSource = fs.readFileSync('navigation/StackNavigation.tsx', 'utf8');
const navAst = ts.createSourceFile('StackNavigation.tsx', navSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let bottomTabs, barStyle;
function locate(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(navAst) === 'BottomTabs') bottomTabs = node.initializer;
  ts.forEachChild(node, locate);
}
locate(navAst);
function locateStyle(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(navAst) === 'tabBarStyle') barStyle = node.initializer;
  ts.forEachChild(node, locateStyle);
}
locateStyle(bottomTabs);
assert.ok(barStyle);
for (const os of ['android', 'ios']) {
  const module = { exports: {} };
  const code = ts.transpileModule('module.exports = (' + barStyle.getText(navAst) + ');', { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { module, hasCRMGlassTabs: true, hasAndroidNativeTabs: os === 'android', insets: { bottom: 24 }, crmGlassTabHeight: inset => (os === 'android' ? 80 : 64) + inset });
  assert.equal(module.exports.position, os === 'android' ? undefined : 'absolute');
  assert.equal(module.exports.height, os === 'android' ? 104 : 88);
}
const config = JSON.parse(fs.readFileSync('app.json')).expo;
assert.ok(config.android.runtimeVersion.endsWith('-android-tabs-v2'));
assert.ok(fs.readFileSync('android/app/src/main/res/values/strings.xml', 'utf8').includes(config.android.runtimeVersion));
assert.ok(fs.readFileSync('ios/zellix/Supporting/Expo.plist', 'utf8').includes(config.runtimeVersion));
console.log('Native tab bridge: latest-tap navigation, prevented presses, keyboard, HRM/permission tabs, long press, fallback, unchanged iOS sizing and runtime isolation passed.');
