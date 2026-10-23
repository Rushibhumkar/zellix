const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
let state = [], effects = [], cursor = 0, timers = new Map(), timerId = 0, dismissals = 0;
const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
const react = {
  useRef(initial) { const index = cursor++; if (!(index in state)) state[index] = { current: initial }; return state[index]; },
  useState(initial) { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }]; },
  useCallback(callback, deps) { const index = cursor++; if (!same(state[index]?.deps, deps)) state[index] = { callback, deps }; return state[index].callback; },
  useEffect(callback, deps) { const index = cursor++; if (!same(state[index]?.deps, deps)) { state[index]?.cleanup?.(); state[index] = { deps }; effects.push(() => { state[index].cleanup = callback(); }); } },
};
const output = ts.transpileModule(read("hooks/useHRMListingSearch.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
vm.runInNewContext(`(function(require,module,exports){${output}})`, { setTimeout: (callback, delay) => { assert.equal(delay, 300); timers.set(++timerId, callback); return timerId; }, clearTimeout: id => timers.delete(id) })(name => name === "react" ? react : { Keyboard: { dismiss: () => dismissals++ } }, mod, mod.exports);
const submitted = [];
const onSearch = value => submitted.push(value);
function render() { cursor = 0; const result = mod.exports.useHRMListingSearch(onSearch); effects.splice(0).forEach(callback => callback()); return result; }
function tick() { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); }
let hook = render(); tick(); submitted.length = 0;
let scrolls = 0;
hook.listRef.current = { scrollToOffset: () => scrolls++ };
hook.toggleSearch(); hook = render(); assert.equal(hook.showSearch, true);
hook.setSearchValue("a"); hook = render(); hook.setSearchValue("  alice  "); hook = render();
assert.deepEqual(submitted, []); assert.equal(timers.size, 1); tick(); assert.deepEqual(submitted, ["alice"]);
assert.ok(scrolls >= 2);
hook.setSearchValue("pending"); hook = render(); hook.closeSearch(); hook = render(); tick();
assert.equal(hook.searchValue, ""); assert.equal(hook.showSearch, false); assert.ok(dismissals > 0); assert.equal(submitted.at(-1), ""); assert.ok(!submitted.includes("pending"));
hook.toggleSearch(); hook = render(); hook.toggleSearch(); hook = render(); assert.equal(hook.showSearch, false);
for (const file of ["screensHRM/UsersHRM/AllUSersHRM.tsx", "screensHRM/LeaveHRM/AllLeave.tsx", "screensHRM/AttendanceHRM/AllAttendance.tsx", "screensHRM/AttendanceHRM/UserAttendanceList.tsx"]) {
  const source = read(file);
  assert.match(source, /onPressSearch=\{search.toggleSearch\}/);
  assert.match(source, /ListingSearch/);
  assert.doesNotMatch(source, /onPressFilter|<SearchBox/);
  assert.match(source, /keyboardShouldPersistTaps="handled"/);
  const { diagnostics } = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 }, fileName: file, reportDiagnostics: true });
  assert.equal(diagnostics.length, 0);
}
assert.match(read("hooks/useGetQuerryHRM.ts"), /queryKey: \["getAllLeave", search, startDate, endDate\]/);
console.log("HRMS search: debounce, latest-input wins, trim, clear, close, keyboard dismissal, four header integrations and date query keys passed.");
