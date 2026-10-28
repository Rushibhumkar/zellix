const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let response, options;
const mod = { exports: {} };
const compiled = ts.transpileModule(read('hooks/useGetQuerryHRM.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
vm.runInNewContext(`(function(require,module,exports){${compiled}})`, {})(
  name => name === '@tanstack/react-query'
    ? { useInfiniteQuery: config => { options = config; return response; }, useQuery: config => { options = config; return {}; } }
    : {}, mod, mod.exports,
);
const page = (totalItem, count) => ({ data: Array.from({ length: count }, (_, _id) => ({ _id })), pagination: { totalItem } });
function check(pages, expected, search = '') {
  response = { data: pages ? { pages } : undefined };
  const result = mod.exports.useGetAllUserHRM({ search });
  assert.equal(result.totalCount, expected);
  assert.equal(options.initialPageParam, 1);
  assert.equal(options.queryKey[1], search);
  return result;
}
assert.equal(check([page(145, 10)], 145).data.length, 10);
assert.equal(check([page(145, 10), page(145, 10)], 145).data.length, 20);
check([page(2, 2)], 2, 'alice');
check([page(0, 0)], 0, 'no match');
check([page(144, 10)], 144); // Refetch after deletion.
check([page('42', 10)], 42);
check(undefined, undefined);
for (const invalid of [null, undefined, '', -1, 'invalid', Infinity]) check([page(invalid, 0)], undefined);
const screen = read('screensHRM/UsersHRM/AllUSersHRM.tsx');
assert.match(screen, /totalCount=\{totalCount\}/);
const header = read('myComponentsHRM/ContainerHRM/ContainerHRM.tsx');
assert.match(header, /totalCount\?: number/);
assert.match(header, /Total: \{totalCount\}/);
assert.match(header, /totalCount >= 0/); // Zero is visible; absent prop leaves other headers unchanged.
for (const [hook, screen] of [
  ['useGetAllLeave', 'screensHRM/LeaveHRM/AllLeave.tsx'],
  ['useGetAllAttendance', 'screensHRM/AttendanceHRM/AllAttendance.tsx'],
  ['useGetSingleUserAttList', 'screensHRM/AttendanceHRM/UserAttendanceList.tsx'],
]) {
  const params = { search: 'approved', startDate: '2026-10-01', endDate: '2026-10-26', userId: 'current-agent' };
  response = { data: { pages: [page(125, 10), page(125, 10)] } };
  let result = mod.exports[hook](params);
  assert.equal(result.totalCount, 125);
  assert.equal(result.data.length, 20);
  assert.equal(options.initialPageParam, 1);
  for (const filter of [params.search, params.startDate, params.endDate]) assert.ok(options.queryKey.includes(filter));
  if (hook !== 'useGetAllLeave') assert.ok(options.queryKey.includes(params.userId));
  for (const [raw, expected] of [[0, 0], ['17', 17], [null, undefined], [undefined, undefined], ['', undefined], ['invalid', undefined], [-1, undefined], [Infinity, undefined]]) {
    response = { data: { pages: [page(raw, 0)] } };
    assert.equal(mod.exports[hook](params).totalCount, expected);
  }
  response = {};
  assert.equal(mod.exports[hook](params).totalCount, undefined);
  response = { data: { pages: [page(3, 3)] } };
  assert.equal(mod.exports[hook]({ ...params, search: 'new filter' }).totalCount, 3);
  assert.match(read(screen), /totalCount=\{totalCount\}/);
}
mod.exports.useGetUserStatusChart({ isEnable: true });
assert.equal(options.queryKey[0], 'getUserStatusChart');
assert.equal(options.staleTime, 60_000);
assert.equal(options.refetchOnMount, 'always');
assert.match(read('screensHRM/UsersHRM/AllUSersHRM.tsx'), /await queryClient.invalidateQueries\(\{ queryKey: \["getUserStatusChart"\] \}\)/);
console.log('HRMS Users/Leave/Attendance totals: API totals (not loaded rows), pagination, search/date/user filters, zero, refresh, missing data, status refresh and header wiring passed.');
