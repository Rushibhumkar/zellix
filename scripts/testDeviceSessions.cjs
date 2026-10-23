// Isolated native component contract tests; no device or backend connection needed.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
let role, result, options, alert, posts, invalidations, calls;
const native = { View: "View", Text: "Text", TouchableOpacity: "Button", FlatList: "FlatList", ActivityIndicator: "Spinner", StyleSheet: { create: x => x }, Alert: { alert: (...args) => { alert = args; } } };
const mockReact = { ...React, useState: x => [x, () => {}], useRef: x => ({ current: x }), useCallback: x => x };
const mocks = {
  react: mockReact, "react-native": native,
  "@expo/vector-icons": { Feather: "Icon" },
  "@react-navigation/native": { useFocusEffect: fn => fn() },
  "@tanstack/react-query": { useInfiniteQuery: config => { options = config; return result; }, useQueryClient: () => ({ invalidateQueries: async x => invalidations.push(x) }) },
  "react-native-safe-area-context": { useSafeAreaInsets: () => ({ bottom: 34 }) },
  "react-redux": { useSelector: () => ({ user: { role } }) },
  "../../../redux/userSlice": { selectUser: () => {} },
  "../../../services/authApi/axiosInstance": { axiosInstance: { get: async () => ({ data: page }), post: async url => posts.push(url) } },
};
const source = fs.readFileSync(require("node:path").join(__dirname, "../screensHRM/UsersHRM/components/DeviceSessionsCard.tsx"), "utf8");
const { outputText, diagnostics } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true }, reportDiagnostics: true });
assert.equal(diagnostics.length, 0);
const moduleResult = { exports: {} };
vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`)(name => { assert.ok(mocks[name], name); return mocks[name]; }, moduleResult, moduleResult.exports);
const Component = moduleResult.exports.default;
const session = { _id: "one", deviceName: "iPhone", platform: "iOS", status: "active", loginTime: "21 Oct 2026, 01 PM" };
const page = { data: [session], total: 26, page: 1, pageSize: 25, activeCounts: { Web: 0, Mobile: 1 }, timezone: "Asia/Dubai" };
function reset() {
  role = "sup_admin"; posts = []; invalidations = []; calls = 0;
  result = { data: { pages: [page] }, isPending: false, isFetching: false, hasNextPage: true, fetchNextPage: async () => { calls++; }, refetch: async () => { calls++; } };
}
function text(tree) { if (tree == null || typeof tree === "boolean") return ""; if (Array.isArray(tree)) return tree.map(text).join(" "); if (typeof tree !== "object") return String(tree); return text(tree.props?.children); }
function buttons(tree) { if (!tree || typeof tree !== "object") return []; if (Array.isArray(tree)) return tree.flatMap(buttons); return [...(tree.type === "Button" ? [tree] : []), ...buttons(tree.props?.children)]; }
(async () => {
  for (const value of ["sup_admin", "sub_admin"]) { reset(); role = value; assert.equal(Component({ userId: "target" }).type, "FlatList"); assert.equal(options.enabled, true); }
  for (const value of ["agent", "hr", "developer", "office_admin"]) { reset(); role = value; assert.equal(Component({ userId: "target" }), null); assert.equal(options.enabled, false); }
  reset(); let tree = Component({ userId: "target" });
  assert.equal(options.refetchOnMount, "always"); assert.equal(options.refetchInterval, 30000);
  assert.equal(options.getNextPageParam(page), 2); assert.equal(options.getNextPageParam({ ...page, page: 2 }), undefined);
  await Promise.all([tree.props.onEndReached(), tree.props.onEndReached()]); assert.equal(calls, 1);
  result.data.pages.push({ ...page, data: [session, { ...session, _id: "two" }] });
  tree = Component({ userId: "target" }); assert.equal(tree.props.data.length, 2);
  const active = tree.props.renderItem({ item: session }); assert.match(text(active), /Active/);
  buttons(active)[0].props.onPress(); await alert[2][1].onPress();
  assert.deepEqual(posts, ["/api/hrms/user/target/sessions/one/logout"]); assert.deepEqual(invalidations[0].queryKey, ["deviceSessions", "history", "target"]);
  assert.equal(buttons(tree.props.renderItem({ item: { ...session, status: "logged_out" } })).length, 0);
  reset(); result.data = undefined; result.isPending = true; assert.match(text(Component({ userId: "target" }).props.ListEmptyComponent), /Loading/);
  reset(); result.data.pages = [{ ...page, data: [], total: 0 }]; assert.match(text(Component({ userId: "target" }).props.ListEmptyComponent), /No login history/);
  reset(); result.error = new Error("offline"); tree = Component({ userId: "target" }); assert.match(text(tree.props.ListHeaderComponent), /Check your connection/); await tree.props.onEndReached(); assert.equal(calls, 0);
  assert.equal(tree.props.contentContainerStyle[1].paddingBottom, 154);
  console.log("Device sessions: role gating, auto-fetch, infinite scroll, deduplication, logout, loading, empty/error states and safe-area padding passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
