const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
let os = 'android', insets = { top: 24, bottom: 0, left: 0, right: 0 };
const React = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  useState: initial => [initial, () => {}],
};
const native = Object.fromEntries(['Image', 'Pressable', 'TouchableOpacity', 'View'].map(name => [name, name]));
native.Platform = { get OS() { return os; } };
native.StyleSheet = { create: value => value };
const imports = {
  react: React,
  'react-native': native,
  '@react-navigation/native': { useNavigation: () => ({ goBack() {}, navigate() {} }), CommonActions: {} },
  'expo-status-bar': { StatusBar: 'StatusBar' },
  '../const/color': { color: {} },
  '../myComponents/CustomText/CustomText': { __esModule: true, default: 'CustomText' },
  'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView', useSafeAreaInsets: () => insets },
  'expo-linear-gradient': { LinearGradient: 'LinearGradient' },
  '@expo/vector-icons': Object.fromEntries(['AntDesign', 'Feather', 'FontAwesome', 'MaterialIcons'].map(name => [name, name])),
  './Dashboard/MenuModal': { __esModule: true, default: 'MenuModal' },
  'react-redux': { useDispatch: () => () => {}, useSelector: () => ({ user: {} }) },
  '../redux/userSlice': { selectUser() {} },
  '../services/authApi/auth': { logOut() {} },
  '../hooks/useAsyncStorage': { removeItemValue() {} },
  '../redux/action': { onLogOutEmpty() {} },
  'react-native-reanimated': { __esModule: true, default: { createAnimatedComponent: type => type } },
  '@tanstack/react-query': { useQueryClient: () => ({}) },
  '../assets/Backicon.png': 1,
};
const file = path.resolve(__dirname, '../components/Header.tsx');
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: file, reportDiagnostics: true,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } });
assert.equal(compiled.diagnostics.length, 0);
const mod = { exports: {} };
vm.runInNewContext(`(function(require,module,exports){${compiled.outputText}})`, { console })(
  name => { assert.ok(name in imports, `Unexpected import ${name}`); return imports[name]; }, mod, mod.exports);
const Header = mod.exports.default;
function all(node) {
  return !node || typeof node !== 'object' ? [] : [node, ...(node.props?.children || []).flat(Infinity).flatMap(all)];
}
function layout(moduleName) {
  const tree = Header({ title: 'A long screen title', moduleName, showActions: true, totalCount: 52,
    onPressSearch() {}, onPressFilter() {}, onPressAdd() {} });
  const nodes = all(tree);
  return {
    safeArea: nodes.find(node => node.type === 'SafeAreaView'),
    row: nodes.find(node => node.props.style?.paddingHorizontal === 20),
    title: nodes.find(node => node.type === 'CustomText' && node.props.children[0] === 'A long screen title'),
  };
}
for (const top of [0, 24, 40, 56]) for (const bottom of [0, 16, 24, 48]) for (const moduleName of [undefined, 'lead', 'meeting', 'rsvp', 'booking']) {
  insets = { top, bottom, left: 0, right: 0 };
  const { safeArea, row, title } = layout(moduleName);
  assert.equal(JSON.stringify(safeArea.props.edges), JSON.stringify(['top', 'left', 'right']));
  assert.equal(row.props.style.marginBottom, 0);
  assert.equal(row.props.style.paddingBottom, 12);
  assert.equal(row.props.style.minHeight, 44);
  assert.equal(row.props.style.height, undefined); // Let text/font scaling grow the row.
  assert.equal(title.props.numberOfLines, 1);
  assert.equal(title.props.ellipsizeMode, 'tail');
}
os = 'ios';
for (const bottom of [0, 34]) for (const moduleName of [undefined, 'lead']) {
  insets = { top: 59, bottom, left: 0, right: 0 };
  const { safeArea, row } = layout(moduleName);
  assert.equal(safeArea.props.edges, undefined);
  assert.equal(row.props.style.marginBottom, moduleName === 'lead' ? -30 : bottom ? -20 : 51);
  assert.equal(row.props.style.paddingBottom, undefined);
  assert.equal(row.props.style.minHeight, undefined);
}
console.log('Header layout: 80 Android inset/action combinations and 4 unchanged iOS layouts passed; no negative Android margins or fixed row height.');
