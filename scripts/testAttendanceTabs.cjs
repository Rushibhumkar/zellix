const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, imports = {}) {
  const mod = { exports: {} };
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
    fileName: file, reportDiagnostics: true,
  });
  assert.equal(output.diagnostics.length, 0);
  vm.runInNewContext(`(function(require,module,exports){${output.outputText}})`, { console })(name => {
    if (!(name in imports)) throw Error(`Unmocked ${name}`); return imports[name];
  }, mod, mod.exports);
  return mod.exports;
}
const policy = load('utils/attendanceTabs.ts');
for (const role of ['sup_admin', 'sub_admin', 'developer']) assert.equal(policy.getAttendanceTabs(role).length, 3);
for (const role of ['agent', 'hr', 'office_admin', 'manager', undefined]) assert.equal(policy.getAttendanceTabs(role).length, 2);
assert.equal(policy.nextAttendancePage({ pagination: { currentPage: 1, totalPage: 3, isNextPage: true } }), 2);
for (const [currentPage, totalPage, isNextPage] of [[1, 0, true], [3, 3, true], [1, 2, false], ['bad', 3, true]])
  assert.equal(policy.nextAttendancePage({ pagination: { currentPage, totalPage, isNextPage } }), undefined);
let requests = [], fail = false;
const api = load('services/hrmApi/attendanceListApi.ts', {
  '../authApi/axiosInstance': { axiosInstance: {
    get: async (url, config) => { requests.push({ url, ...config }); if (fail) throw Error('offline'); return { data: { data: [], pagination: { totalItem: 0 } } }; },
    post: async url => { requests.push({ url }); return { data: 'approved' }; },
  } },
});
let queryOptions, queryResult = {};
const hook = load('hooks/useAttendanceListing.ts', {
  '@tanstack/react-query': { useInfiniteQuery: options => { queryOptions = options; return queryResult; } },
  '../services/hrmApi/attendanceListApi': api,
  '../utils/attendanceTabs': policy,
}).useAttendanceListing;

(async () => {
  for (const tab of ['all', 'issues', 'unapproved']) {
    await api.getAttendanceList({ tab, search: 'alice', startDate: '2026-10-01', endDate: '2026-10-26', pageParam: 2, userId: 'employee' });
    const request = requests.at(-1);
    assert.equal(request.url, tab === 'unapproved' ? '/api/hrms/att/get-notapproved-attendance' : '/api/hrms/att');
    assert.equal(request.params.issue, tab === 'issues' ? true : undefined);
    assert.equal(request.params.page, 2);
    assert.equal(request.params.search, 'alice');
    const params = { tab, accountId: 'admin', role: 'sup_admin', userId: 'employee', search: 'alice', startDate: '2026-10-01', endDate: '2026-10-26' };
    queryResult = { data: { pages: [{ data: [{ _id: 'a' }], pagination: { totalItem: 57 } }, { data: [{ _id: 'b' }] }] } };
    const result = hook(params);
    assert.equal(result.totalCount, 57);
    assert.equal(result.data.length, 2);
    assert.equal(queryOptions.initialPageParam, 1);
    assert.equal(queryOptions.queryKey[0], policy.attendanceTabQueryKey(tab));
    for (const value of ['admin', 'employee', 'alice', params.startDate, params.endDate]) assert.ok(queryOptions.queryKey.includes(value));
    assert.equal(queryOptions.enabled, true);
  }
  queryResult = { data: { pages: [{ data: [], pagination: { totalItem: 0 } }] } };
  assert.equal(hook({ tab: 'all', accountId: 'a', role: 'agent' }).totalCount, 0);
  hook({ tab: 'unapproved', accountId: 'a', role: 'agent' }); assert.equal(queryOptions.enabled, false);
  hook({ tab: 'all' }); assert.equal(queryOptions.enabled, false);
  fail = true; await assert.rejects(api.getAttendanceList({ tab: 'all' }), /offline/); fail = false;
  await assert.rejects(api.approveAttendance(''), /Missing/);
  await api.approveAttendance('record'); assert.equal(requests.at(-1).url, '/api/hrms/att/approve-attendance/record');

  const states = []; let cursor = 0, role = 'sup_admin', lastListing, navigations = [], approvalCalls = 0, confirm;
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState: initial => { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }]; },
    useRef: initial => { const i = cursor++; if (!(i in states)) states[i] = { current: initial }; return states[i]; },
    useCallback: fn => fn,
  };
  const native = Object.fromEntries(['ActivityIndicator', 'FlatList', 'Pressable', 'RefreshControl', 'ScrollView', 'Text', 'View'].map(x => [x, x]));
  native.StyleSheet = { create: x => x };
  native.Alert = { alert: (_, __, buttons) => { confirm = buttons.find(x => x.text === 'Approve').onPress; } };
  const moduleNames = ['ContainerHRM/ContainerHRM', 'CardHRM/CardHRM', 'Row/RowAttendance', 'Row/RowSingleUserAtt', 'LoadingCompo/LoadingCompo', 'CircularBarChart/CircularBarChart', 'SearchBox/ListingSearch'];
  const imports = Object.fromEntries(moduleNames.map(name => [`../../myComponentsHRM/${name}`, { __esModule: true, default: name.split('/').at(-1) }]));
  const navRoutes = { UserAttendanceList: 'UserAttendanceList', AttendanceDetail: 'AttendanceDetail' };
  const listing = tab => ({ data: [{ _id: tab, name: 'Alice' }], totalCount: { all: 57, issues: 2, unapproved: 3 }[tab], refetch: async () => {}, fetchNextPage() {}, isLoading: false });
  Object.assign(imports, {
    react: React, 'react-native': native,
    '@react-navigation/native': { useNavigation: () => ({ navigate: (...args) => navigations.push(args) }), useFocusEffect() {} },
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async () => {} }), useMutation: () => ({ isPending: false, mutateAsync: async () => { approvalCalls++; } }) },
    'react-redux': { useSelector: () => ({ user: { _id: 'me', role } }) },
    '../../redux/userSlice': { selectUser() {} },
    '../../hooks/useHRMListingSearch': { useHRMListingSearch: () => ({ listRef: { current: { scrollToOffset() {} } }, toggleSearch() {}, showSearch: false }) },
    '../../hooks/useAttendanceListing': { useAttendanceListing: options => { lastListing = options; return listing(options.tab); } },
    '../../services/rootApi/permissionApi': { useGetUserPermission: () => ({ data: {} }) },
    '../../services/hrmApi/attendanceListApi': api,
    '../../utils/commonFunctions': { checkPermission: (_, __, ___, userRole) => userRole === 'sup_admin' || userRole === 'agent' },
    '../../utils/attendanceSummary': { canViewAttendanceSummary: () => false },
    '../../utils/attendanceTabs': policy,
    '../../utils/routesHRM': { routeAttendance: navRoutes },
    '../../utils/queryKeys': { queryKeyHRM: { getAttendanceChart: 'getAttendanceChart' } },
    '../../components/AppToast': { useAppToast: () => ({ success() {}, error() {} }) },
    './AttendanceAutoApproval': { __esModule: true, default: 'AttendanceAutoApproval', attendanceSettingsKey: ['settings'] },
    '../../utils/attendanceAutoApproval': { canManageAttendanceAutoApproval: () => false },
    '../../myComponents/NoDataFound/NoDataFound': { __esModule: true, default: 'NoDataFound' },
  });
  const Screen = load('screensHRM/AttendanceHRM/AllAttendance.tsx', imports).default;
  const render = () => { cursor = 0; return Screen(); };
  function findAll(node, type) {
    if (!node || typeof node !== 'object') return [];
    return [...(node.type === type ? [node] : []), ...(node.props?.children || []).flat(Infinity).flatMap(child => findAll(child, type))];
  }
  let tree = render();
  assert.equal(tree.props.totalCount, 57);
  assert.equal(findAll(tree, 'FlatList').length, 1); // No nested list swallowing pagination.
  const tabs = findAll(tree, 'Pressable').filter(x => x.props.accessibilityRole === 'tab');
  assert.equal(tabs.length, 3);
  tabs[1].props.onPress(); tree = render();
  assert.equal(lastListing.tab, 'issues'); assert.equal(tree.props.totalCount, 2);
  let list = findAll(tree, 'FlatList')[0];
  assert.equal(list.props.data[0]._id, 'issues');
  list.props.renderItem({ item: { _id: 'issue' } }).props.children[0].props.onPress();
  assert.equal(navigations.at(-1)[0], 'AttendanceDetail');
  tabs[2].props.onPress(); tree = render();
  assert.equal(tree.props.totalCount, 3);
  list = findAll(tree, 'FlatList')[0];
  let row = list.props.renderItem({ item: { _id: 'pending', name: 'Alice' } });
  const action = findAll(row, 'RowAttendance')[0].props.action;
  assert.equal(action.props.hitSlop, 4);
  assert.equal(action.props.style[0].minHeight, 36);
  action.props.onPress(); assert.equal(approvalCalls, 0);
  await confirm(); assert.equal(approvalCalls, 1);
  // The action is inside the card, but outside its navigation touchable.
  const Row = load('myComponentsHRM/Row/RowAttendance.tsx', {
    react: React,
    'react-native': { ...native, TouchableOpacity: 'TouchableOpacity' },
    '@expo/vector-icons': { Feather: 'Feather' },
    moment: () => ({ format: () => '26 Oct 2026' }),
    '../../myComponents/CustomText/CustomText': { __esModule: true, default: 'CustomText' },
    '../../utils/hrmKeysMatchToBE': { punchType: {}, roleHRM: {}, statusAttend: {}, statusColorAttend: {} },
    '../../const/color': { color: {} },
    '../../const/globalStyle': { shadowPrimaryColor: {} },
    '../../utils/animations/SlideFadeIn': { __esModule: true, default: 'SlideFadeIn' },
  }).default;
  let cardOpens = 0;
  const card = Row({ item: { name: 'Alice', role: 'agent' }, action, onPress: () => cardOpens++ });
  assert.equal(findAll(card, 'Pressable').length, 1);
  const actionCorner = findAll(card, 'View').find(node => node.props.style?.position === 'absolute');
  assert.equal(actionCorner.props.style.top, 12);
  assert.equal(actionCorner.props.style.right, 12);
  const details = findAll(card, 'View').find(node => Array.isArray(node.props.style) && node.props.style[0]?.minWidth === 100);
  assert.equal(details.props.style[1].alignItems, 'center');
  assert.equal(details.props.style[1].paddingTop, undefined); // Metadata is beside, not below, Approve.
  const cardTop = findAll(card, 'View').find(node => Array.isArray(node.props.style) && node.props.style[1]?.paddingRight === 100);
  assert.ok(cardTop); // Reserve button width so center metadata never overlaps it.
  const metadata = details.props.children.flat(Infinity).filter(Boolean);
  assert.equal(metadata[0].props.style[0].flexDirection, 'row'); // Date first.
  assert.equal(metadata[0].props.style[1].justifyContent, 'center');
  assert.equal(metadata[1].props.style[1].alignSelf, 'center'); // Status centered below date.
  const navigationTouchable = findAll(card, 'TouchableOpacity')[0];
  assert.equal(findAll(navigationTouchable, 'Pressable').length, 0);
  navigationTouchable.props.onPress(); assert.equal(cardOpens, 1);
  assert.equal(findAll(Row({ item: { name: 'Alice' }, onPress() {} }), 'Pressable').length, 0);
  role = 'agent'; tree = render();
  assert.equal(lastListing.tab, 'all'); assert.equal(lastListing.userId, 'me');
  assert.equal(findAll(tree, 'Pressable').filter(x => x.props.accessibilityRole === 'tab').length, 2);
  row = findAll(tree, 'FlatList')[0].props.renderItem({ item: { _id: 'own' } });
  assert.equal(findAll(row, 'RowSingleUserAtt').length, 1);
  console.log('Attendance tabs: role gates, endpoint/filter contracts, isolated cache/counts, zero/last-page stopping, single list, switching/navigation, own-agent scope and approval confirmation passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
