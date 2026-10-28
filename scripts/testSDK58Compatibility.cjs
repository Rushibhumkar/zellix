const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let removed = 0, shown = 0, hidden = 0;
const native = {
  Dimensions: { get: () => ({ width: 390, height: 844 }) },
  DeviceEventEmitter: { addListener: () => ({ remove: () => removed++ }) },
  BackHandler: { addEventListener: () => ({ remove: () => removed++ }) },
};
Object.defineProperty(native, 'InteractionManager', { get() { throw Error('Removed RN API accessed'); } });
const mod = { exports: {} };
const compiled = ts.transpileModule(read('node_modules/react-native-modal/dist/modal.js'), {
  compilerOptions: { allowJs: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
vm.runInNewContext(`(function(require,module,exports){${compiled}})`, { console })(name => {
  if (name === 'react') return require('react');
  if (name === 'prop-types') return require('prop-types');
  if (name === 'react-native') return native;
  if (name === './utils') return { initializeAnimations() {}, buildAnimations: props => props };
  return {};
}, mod, mod.exports);
(async () => {
  const Modal = mod.exports.default;
  const modal = new Modal({ ...Modal.defaultProps, isVisible: false, onModalShow: () => shown++, onModalHide: () => hidden++ });
  modal.setState = (update, callback) => { Object.assign(modal.state, update); callback?.(); };
  modal.contentRef = { animate: () => Promise.resolve() };
  modal.componentDidMount();
  modal.props = { ...modal.props, isVisible: true };
  modal.open();
  await Promise.resolve();
  assert.equal(shown, 1);
  modal.props = { ...modal.props, isVisible: false };
  modal.close();
  await Promise.resolve();
  assert.equal(hidden, 1);
  assert.equal(modal.state.isVisible, false);
  modal.componentWillUnmount();
  assert.equal(removed, 2);
  const config = JSON.parse(read('app.json')).expo;
  assert.equal(config.runtimeVersion, '2.3.0-sdk58');
  assert.match(read('android/app/src/main/res/values/strings.xml'), /2\.3\.0-sdk58/);
  assert.match(read('ios/zellix/Supporting/Expo.plist'), /2\.3\.0-sdk58/);
  assert.match(read('ios/zellix/Info.plist'), /UIApplicationSceneManifest/);
  assert.match(read('ios/zellix.xcodeproj/project.pbxproj'), /SceneDelegate.swift in Sources/);
  assert.equal(require('react/package.json').version, '19.3.0');
  assert.equal(require('react-native/package.json').version, '0.88.0');
  console.log('SDK 58 compatibility: modal open/close callbacks, native subscription cleanup, removed-API guard, runtime isolation and scene wiring passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
