const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const file = "components/MeetingActionButtons.tsx";
const { outputText, diagnostics } = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
  fileName: file, reportDiagnostics: true,
  compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
});
assert.equal(diagnostics.length, 0);
const mocks = {
  react: require("react"),
  "react-native": { View: "View", TouchableOpacity: "Button", ActivityIndicator: "Spinner", StyleSheet: { create: value => value } },
  "@expo/vector-icons": { Feather: "Icon" },
  "expo-linear-gradient": { LinearGradient: "Gradient" },
  "../myComponents/CustomText/CustomText": { __esModule: true, default: "Text" },
};
const mod = { exports: {} };
vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: file })(name => {
  assert.ok(name in mocks, name); return mocks[name];
}, mod, mod.exports);
const render = mod.exports.default;
const nodes = tree => Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === "object" ? [tree, ...nodes(tree.props?.children)] : [];
const tapped = [];
const props = { onReschedule: () => tapped.push("reschedule"), onCancel: () => tapped.push("cancel"), onConduct: () => tapped.push("conduct"), canConduct: true, conducting: false };
let tree = render(props);
let buttons = nodes(tree).filter(node => node.type === "Button");
assert.deepEqual(buttons.map(b => b.props.accessibilityLabel), ["Reschedule", "Cancel Meeting", "Mark as Conducted"]);
buttons.forEach(button => button.props.onPress()); assert.deepEqual(tapped, ["reschedule", "cancel", "conduct"]);
assert.equal(tree.props.style.gap, 8);
assert.equal(tree.props.children[0].props.style.gap, 8);
assert.equal(buttons[0].props.style[0].flex, 1);
assert.equal(buttons[1].props.style[0].flex, 1);
assert.equal(buttons[0].props.style[1].backgroundColor, "#F3F4F6");
assert.equal(buttons[1].props.style[1].backgroundColor, "#FEF2F2");
assert.equal(buttons[0].props.style[0].minHeight, 44);
assert.deepEqual(nodes(tree).find(n => n.type === "Gradient").props.colors, ["#2E67BE", "#4985F2"]);
tree = render({ ...props, canConduct: false });
assert.equal(nodes(tree).filter(n => n.type === "Button").length, 2);
assert.equal(nodes(tree).some(n => n.type === "Gradient"), false);
tree = render({ ...props, conducting: true });
const conduct = nodes(tree).find(n => n.props.accessibilityLabel === "Mark as Conducted");
assert.equal(conduct.props.disabled, true); assert.equal(conduct.props.accessibilityState.busy, true);
assert.ok(nodes(tree).some(n => n.type === "Spinner"));
const details = fs.readFileSync(path.join(root, "screens/Meetings/MeetingDetails.tsx"), "utf8");
assert.match(details, /canManageLatest\s*&&\s*\["schedule", "reschedule"\]\.includes\(el\?\.status\)\s*&&\s*\(\s*<MeetingActionButtons/);
assert.match(details, /canConduct=\{actions\.conduct\}/);
assert.match(details, /onReschedule=\{rescheduleMeeting\}/);
assert.match(details, /setCancelEntryId\(el\._id\)/);
assert.match(details, /setTempFollowUpId\(el\?\._id\)/);
assert.match(details, /<CustomModal\s+avoidKeyboard\s+visible=\{isModalVisibleRemark\}/);
assert.match(details, /contentContainerStyle=\{styles\.conductSheetBody\}/);
assert.match(details, /placeholderTextColor: "#64748B"/);
assert.match(details, /conductRemarksInput: \{[^\n]+color: "#1E293B"/);
assert.match(details, /disabled=\{!values\.remarks\.trim\(\) \|\| isLoadingRemark\}/);
assert.doesNotMatch(details, /width: 340|please wait for the app to fetch your location/);
console.log("Meeting action buttons: colors, equal widths, compact gaps, touch targets, callbacks, loading state and existing action gates passed.");
