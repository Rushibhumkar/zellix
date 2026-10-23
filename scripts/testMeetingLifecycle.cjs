const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const root = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
function compile(file, resolve) {
  const { outputText, diagnostics } = ts.transpileModule(read(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: file, reportDiagnostics: true });
  assert.equal(diagnostics.length, 0);
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: file })(resolve, mod, mod.exports);
  return mod.exports;
}
const life = compile("utils/meetingLifecycle.ts", () => { throw Error("Unexpected dependency"); });
const leadOptionsHelper = compile("utils/meetingLeadOptions.ts", () => { throw Error("Unexpected dependency"); });
const searchedLead = { _id: "searched", name: "Selected searched lead" };
assert.deepEqual(leadOptionsHelper.meetingLeadOptions([], "searched", [searchedLead]), [searchedLead]);
assert.deepEqual(leadOptionsHelper.meetingLeadOptions([{ _id: "first-page", clientName: "Other lead" }], "searched", [searchedLead]), [{ _id: "first-page", name: "Other lead" }, searchedLead]);
assert.deepEqual(leadOptionsHelper.meetingLeadOptions([{ _id: "searched", clientName: "Updated label" }], "searched", [searchedLead]), [{ _id: "searched", name: "Updated label" }]);
assert.deepEqual(leadOptionsHelper.meetingLeadOptions([], "different", [searchedLead]), []);
assert.deepEqual(leadOptionsHelper.meetingLeadOptions([], "", [searchedLead]), []);
assert.deepEqual(leadOptionsHelper.meetingLeadOptions([], "returned", [searchedLead, { _id: "returned", clientName: "Newly created lead" }]), [{ _id: "returned", name: "Newly created lead" }]);
const meetingNavigation = compile("utils/meetingNavigation.ts", () => { throw Error("Unexpected dependency"); });
const historyRows = [
  { _id: "open-group", lead: { _id: "lead" }, responsibleUserId: "owner", meeting: { status: "schedule" } },
  { _id: "open-group", lead: "lead", responsibleUserId: "owner", latestMeeting: { status: "reschedule" } },
  { _id: "closed-group", lead: "lead", responsibleUserId: "owner", meeting: { status: "cancelled" } },
  { _id: "wrong-lead", lead: "other", responsibleUserId: "owner", meeting: { status: "schedule" } },
];
assert.equal(life.existingOpenMeetingId(historyRows, "lead", "owner"), "open-group");
assert.equal(life.existingOpenMeetingId(historyRows, "lead", "different-owner"), null);
assert.equal(life.existingOpenMeetingId([...historyRows, { _id: "second-open", lead: "lead", meeting: { status: "schedule" } }], "lead"), null);
assert.equal(life.existingOpenMeetingId([], "lead"), null);
assert.equal(life.existingOpenMeetingId([
  { _id: "closed", lead: "lead", meeting: { status: "conducted" } },
  { _id: "closed", lead: "lead", meeting: { status: "schedule" } },
], "lead"), null);
const navCalls = [];
assert.equal(meetingNavigation.openExistingMeeting({ getState: () => ({ routeNames: ["MeetingDetails"] }), push: (...args) => navCalls.push(args) }, "open-group"), true);
assert.deepEqual(navCalls.pop(), ["MeetingDetails", { item: { _id: "open-group" } }]);
assert.equal(meetingNavigation.openExistingMeeting({ getState: () => ({ routeNames: ["AddMeetingFromLead"] }), getParent: () => ({ getState: () => ({ routeNames: ["MeetingsNavigator"] }), navigate: (...args) => navCalls.push(args) }) }, "open-group"), true);
assert.deepEqual(navCalls.pop(), ["MeetingsNavigator", { screen: "MeetingDetails", params: { item: { _id: "open-group" } }, initial: false }]);
assert.equal(meetingNavigation.openExistingMeeting({ getState: () => ({ routeNames: ["AddMeetingFromLead"] }) }, "open-group"), false);
assert.equal(meetingNavigation.openExistingMeeting({}, ""), false);
const notifications = compile("utils/meetingNotification.ts", () => { throw Error("Unexpected dependency"); });
let notificationEvents = 0;
const removeListener = notifications.subscribeMeetingNotification(() => notificationEvents++);
const notificationId = "6ad4c59149fa54dd26b36a93";
assert.equal(notifications.queueMeetingNotification({ type: "Meeting", id: notificationId }), true);
assert.equal(notifications.pendingMeetingNotification(), notificationId);
assert.equal(notifications.queueMeetingNotification({ type: "Meeting", id: "invalid" }), false);
assert.equal(notifications.queueMeetingNotification({ module: "leads", id: notificationId }), false);
notifications.consumeMeetingNotification("other"); assert.equal(notifications.pendingMeetingNotification(), notificationId);
notifications.consumeMeetingNotification(notificationId); assert.equal(notifications.pendingMeetingNotification(), null);
removeListener(); assert.equal(notificationEvents, 2);
const entry = { _id: "entry-2", appointmentId: "entry-1", createdBy: { _id: "rescheduler" }, scheduleDate: new Date(Date.now() - 60000).toISOString(), status: "reschedule", self: false, meetingMode: "virtual", virtualMeetingLink: "Zoom", members: [{ _id: "owner", name: "Owner" }], capabilities: { manage: true, originalCreatorId: "creator" } };
const group = { _id: "meeting", lead: { _id: "lead" }, responsibleUserId: { _id: "owner", name: "Owner" }, lifecycleVersion: 2, __v: 7, meetings: [{ ...entry, _id: "entry-1", status: "superseded" }, entry] };
assert.deepEqual(life.meetingVersion(group), { expectedEntryId: "entry-2", expectedVersion: 7 });
assert.throws(() => life.meetingVersion({ ...group, lifecycleVersion: 1 }), /review/);
assert.throws(() => life.meetingVersion({ ...group, migrationBlocked: true }), /review/);
assert.throws(() => life.meetingVersion({ ...group, __v: undefined }), /review/);
assert.equal(life.meetingActions(group).conduct, true);
assert.equal(life.meetingActions({ ...group, meetings: [{ ...entry, scheduleDate: new Date(Date.now() + 60000).toISOString() }] }).conduct, false);
assert.equal(life.meetingActions({ ...group, meetings: [{ ...entry, capabilities: { manage: false } }] }).cancel, false);
assert.equal(life.meetingActions({ ...group, meetings: [{ ...entry, status: "cancelled" }] }).closed, true);
assert.equal(life.meetingActions({ ...group, meetings: [{ ...entry, status: "superseded" }] }).edit, false);
assert.deepEqual(life.meetingMembers({ _id: "owner" }, ["owner", "support", "support"]), ["owner", "support"]);
assert.deepEqual(life.meetingSupportingMembers({ _id: "owner" }, ["owner", "support", { _id: "actor" }, "hidden", "removed", "support"], [{ _id: "owner" }, { _id: "support" }, { _id: "actor" }]), ["support", "actor"]);
assert.deepEqual(life.meetingSupportingMembers("owner", ["support"], []), []);
const request = { current: null }; const key = life.meetingRequestId(request, { lead: "one" });
assert.equal(life.meetingRequestId(request, { lead: "one" }), key);
assert.notEqual(life.meetingRequestId(request, { lead: "two" }), key);
assert.match(key, /^[\w-]{8,100}$/);
assert.equal(life.meetingMessage({ response: { data: { message: "Review required" } } }), "Review required");
assert.equal(life.isMeetingConflict({ response: { status: 428 } }), true);
assert.throws(() => life.combineMeetingDate(null, new Date()), /valid/);
let params, form, calls, toasts, eligible, nextError, navigation, eligibilityChecks, memberResult, eligibilityError, eligibilityFetching, focusCallback, cacheWrites, existingResult;
const axios = {
  post: async (url, body) => { calls.push({ url, body }); if (nextError) { const e = nextError; nextError = null; throw e; } return { data: { meetingId: "meeting", message: "Saved" } }; },
  put: async (url, body) => { calls.push({ url, body }); return { data: { message: "Updated" } }; },
};
const api = compile("services/rootApi/meetingApi.ts", name => name.includes("axiosInstance") ? { axiosInstance: axios } : {});
const noop = () => {};
const generic = new Proxy({ __esModule: true, default: () => null }, { get: (obj, key) => key in obj ? obj[key] : noop });
const mockReact = { ...React, useState: initial => [typeof initial === "function" ? initial() : initial, noop], useEffect: noop, useCallback: fn => fn, useRef: value => ({ current: value }) };
const resolve = name => {
  if (name === "react") return mockReact;
  if (name === "react-native") return { View: "View", ScrollView: "ScrollView", Pressable: "Pressable", Text: "Text", TouchableOpacity: "Button", ActivityIndicator: "Spinner", Platform: { OS: "android" }, StyleSheet: { create: x => x } };
  if (name === "formik") return { useFormik: config => { form = config; return { values: config.initialValues, errors: {}, touched: {}, setFieldValue: noop, handleSubmit: noop, handleChange: () => noop, handleBlur: noop }; } };
  if (name === "moment") return require("moment");
  if (name === "yup") return require("yup");
  if (name === "@react-navigation/native") return { useFocusEffect: fn => { focusCallback = fn; }, useRoute: () => ({ params }), useNavigation: () => ({ getState: () => ({ routeNames: ["MeetingDetails"] }), navigate: (...args) => navigation.push(args), goBack: () => navigation.push("back") }) };
  if (name === "react-redux") return { useSelector: () => ({ user: { _id: "actor", role: "sup_admin" }, allUsers: [] }), useDispatch: () => noop };
  if (name === "@tanstack/react-query") return { useQueryClient: () => ({ invalidateQueries: async () => {}, setQueryData: (...args) => cacheWrites.push(args) }) };
  if (name.includes("/utils/meetingLifecycle")) return life;
  if (name.includes("/utils/meetingNavigation")) return meetingNavigation;
  if (name.includes("/utils/meetingLeadOptions")) return leadOptionsHelper;
  if (name.includes("/hooks/useMeetingLifecycle")) return { useExistingMeetingForLead: () => existingResult, useMeetingEligibility: () => ({ data: eligible, error: eligibilityError, isFetching: eligibilityFetching, refetch: async () => { eligibilityChecks++; return { data: eligible, error: eligibilityError }; } }), useMeetingMemberOptions: () => memberResult };
  if (name.includes("/services/rootApi/meetingApi")) return api;
  if (name.includes("/hooks/useCRMgetQuerry")) return { useGetLeadInAddMeeting: () => ({ data: [] }), useGetLeadById: () => ({ data: {} }) };
  if (name.includes("/components/AppToast")) return { useAppToast: () => ({ success: text => toasts.push(text), error: text => toasts.push(text) }) };
  if (name.includes("/utils/toastModalByFunction")) return { popUpConfToast: { successMessage: text => toasts.push(text) } };
  if (name.includes("/utils/queryKeys")) return { queryKeyCRM: { getMeetingById: "getMeetingById", getMeeting: "getMeeting" } };
  if (name.includes("/utils/routes")) return { routeMeeting: { MeetingDetails: "MeetingDetails" } };
  return generic;
};
const Add = compile("screens/Meetings/AddMeeting.tsx", resolve).default;
const Reschedule = compile("screens/Meetings/MeetingReschedule.tsx", resolve).default;
for (const screen of ["screens/Meetings/AddMeeting.tsx", "screens/Meetings/MeetingReschedule.tsx"]) {
  assert.doesNotMatch(read(screen), /SelfMeetingToggle|Self meeting|What does Self meeting mean/);
  assert.match(read(screen), /Responsible:/);
}
function reset(route = {}) {
  params = route; calls = []; toasts = []; navigation = []; nextError = null; eligibilityChecks = 0;
  eligible = { allowed: true, self: false, responsible: { _id: "owner" } };
  eligibilityError = null; eligibilityFetching = false; cacheWrites = []; focusCallback = null;
  existingResult = {};
  memberResult = { data: [{ _id: "owner", name: "Owner" }, { _id: "support", name: "Support" }] };
}
(async () => {
  reset({ meetingDraft: { lead: "lead", status: "schedule", self: true, agents: ["support"] } });
  Add(); await form.onSubmit(form.initialValues);
  assert.equal(calls[0].url, "/api/meeting"); assert.equal(calls[0].body.self, false); assert.deepEqual(calls[0].body.members, ["owner", "support"]); assert.ok(calls[0].body.requestId); assert.equal(eligibilityChecks, 1); assert.equal(toasts[0], "Saved");
  reset({ meetingDraft: { lead: "lead", status: "schedule", agents: [] } }); Add();
  nextError = { isAxiosError: true, message: "Network error" }; await form.onSubmit(form.initialValues);
  const originalKey = calls[0].body.requestId;
  eligible = { ...eligible, allowed: false, reason: "Already open" };
  await form.onSubmit(form.initialValues); assert.equal(calls.length, 2); assert.equal(calls[1].body.requestId, originalKey);
  reset({ detail: group }); Add(); await form.onSubmit(form.initialValues);
  assert.equal(calls[0].url, "/api/meeting/updateMeetingById/meeting"); assert.equal(calls[0].body.expectedVersion, 7); assert.equal(calls[0].body.expectedEntryId, "entry-2"); assert.equal(calls[0].body.scheduleDate, entry.scheduleDate); assert.equal(calls[0].body.self, false);
  reset({ detail: { ...group, migrationBlocked: true } }); Add(); await form.onSubmit(form.initialValues); assert.equal(calls.length, 0);
  reset({ meetingDraft: { lead: "lead", status: "schedule", agents: [] } }); eligible = { allowed: false, reason: "Open appointment" }; Add(); await form.onSubmit(form.initialValues); assert.equal(calls.length, 0); assert.ok(toasts.includes("Open appointment"));
  reset({ detail: { ...group, meetings: [{ ...entry, capabilities: { manage: false } }] } }); Add(); await form.onSubmit(form.initialValues); assert.equal(calls.length, 0);
  reset({ detail: { ...group, meetings: [{ ...entry, status: "cancelled" }] }, followUpSource: entry }); Add(); await form.onSubmit(form.initialValues);
  assert.equal(calls[0].url, "/api/meeting/meeting/entries"); assert.equal(calls[0].body.sourceEntryId, "entry-2"); assert.equal(calls[0].body.expectedVersion, 7); assert.ok(calls[0].body.requestId);
  reset({ id: "meeting", meetingDetails: group }); Reschedule(); await form.onSubmit(form.initialValues);
  assert.equal(calls[0].url, "/api/meeting/reScheduleMeetingById/meeting"); assert.equal(calls[0].body.meetingMode, "virtual"); assert.equal(calls[0].body.expectedEntryId, "entry-2"); assert.ok(calls[0].body.requestId); assert.deepEqual(calls[0].body.members, ["owner"]);
  const historicalMembers = { ...group, meetings: [{ ...entry, members: [{ _id: "owner" }, { _id: "support", name: "Support" }, { _id: "actor", name: "Actor" }, { _id: "hidden", name: "Hidden" }, { _id: "removed", name: "Removed" }] }] };
  const nodes = tree => Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === "object" ? [tree, ...nodes(tree.props?.children)] : [];
  for (const [Screen, route] of [[Add, { detail: historicalMembers }], [Reschedule, { id: "meeting", meetingDetails: historicalMembers }]]) {
    reset(route); memberResult.data.push({ _id: "actor", name: "Actor" });
    const tree = Screen();
    const picker = nodes(tree).find(node => node.props?.label === "Supporting members (Optional)");
    assert.deepEqual(picker.props.initialValue, ["support", "actor"]);
    assert.equal(picker.props.arrOfObj.some(option => ["hidden", "removed", "owner"].includes(option._id)), false);
    assert.equal(picker.props.keyName, undefined);
    await form.onSubmit(form.initialValues);
    assert.deepEqual(calls[0].body.members, ["owner", "support", "actor"]);
    reset(route); memberResult = { data: undefined, isPending: true }; Screen(); await form.onSubmit(form.initialValues); assert.equal(calls.length, 0);
    reset(route); memberResult = { data: [], error: new Error("Members unavailable") }; Screen(); await form.onSubmit(form.initialValues); assert.equal(calls.length, 0); assert.ok(toasts.includes("Members unavailable"));
    reset(route); memberResult = { data: [] }; Screen(); await form.onSubmit(form.initialValues); assert.deepEqual(calls[0].body.members, ["owner"]);
  }
  reset({ id: "meeting", meetingDetails: group }); Reschedule(); nextError = { response: { status: 409, data: { message: "Meeting changed" } } }; await form.onSubmit(form.initialValues); assert.ok(toasts.includes("Meeting changed")); assert.ok(navigation.includes("back"));
  reset({ meetingDraft: { lead: "lead", status: "schedule", agents: [] } });
  eligible = { allowed: false, reason: "This client already has an open meeting. Conduct or cancel it first.", meetingId: "existing-meeting", responsible: { _id: "owner" } };
  let warningTree = Add();
  const findSubmit = tree => nodes(tree).find(node => node.props?.title === "Submit");
  assert.equal(findSubmit(warningTree).props.disabled, true);
  const open = nodes(warningTree).find(node => node.props?.accessibilityLabel === "Open existing meeting"); assert.ok(open);
  open.props.onPress(); assert.deepEqual(navigation.at(-1), ["MeetingDetails", { item: { _id: "existing-meeting" } }]);
  await form.onSubmit(form.initialValues); assert.equal(calls.length, 0);
  eligible = { allowed: true, self: false, responsible: { _id: "owner" } }; await focusCallback(); assert.ok(eligibilityChecks >= 2);
  warningTree = Add(); assert.equal(findSubmit(warningTree).props.disabled, false); assert.equal(nodes(warningTree).some(node => node.props?.accessibilityLabel === "Open existing meeting"), false);
  eligible = { allowed: false, reason: "Meeting history needs admin review" }; warningTree = Add(); assert.equal(findSubmit(warningTree).props.disabled, true); assert.equal(nodes(warningTree).some(node => node.props?.accessibilityLabel === "Open existing meeting"), false);
  existingResult = { data: "open-group" }; warningTree = Add(); nodes(warningTree).find(node => node.props?.accessibilityLabel === "Open existing meeting").props.onPress(); assert.deepEqual(navigation.at(-1), ["MeetingDetails", { item: { _id: "open-group" } }]); assert.equal(findSubmit(warningTree).props.disabled, true);
  existingResult = { error: new Error("History offline"), refetch: async () => {} }; warningTree = Add(); assert.ok(nodes(warningTree).some(node => node.props?.accessibilityLabel === "Retry finding existing meeting"));
  eligible = null; eligibilityFetching = true; warningTree = Add(); assert.equal(findSubmit(warningTree).props.disabled, true);
  eligibilityFetching = false; eligibilityError = new Error("Eligibility offline"); warningTree = Add(); assert.equal(findSubmit(warningTree).props.disabled, true); assert.ok(nodes(warningTree).some(node => node.props?.accessibilityLabel === "Retry eligibility check"));
  reset({ meetingDraft: { lead: "lead", status: "schedule", agents: [] } }); Add();
  nextError = { response: { status: 409, data: { message: "Another meeting was created", meetingId: "concurrent-meeting" } } }; await form.onSubmit(form.initialValues);
  assert.equal(calls.length, 1); assert.deepEqual(cacheWrites[0][0], ["meetingEligibility", "actor", "lead"]);
  assert.deepEqual(cacheWrites[0][1]({ responsible: { _id: "owner" } }), { responsible: { _id: "owner" }, allowed: false, reason: "Another meeting was created", meetingId: "concurrent-meeting" });
  let eligibilityConfig;
  const eligibilityHook = compile("hooks/useMeetingLifecycle.ts", name => name === "@tanstack/react-query" ? { useQuery: options => { eligibilityConfig = options; return {}; } } : name.includes("utils/meetingLifecycle") ? life : { axiosInstance: axios });
  eligibilityHook.useExistingMeetingForLead("lead", "actor", { allowed: false, responsible: "owner" }); assert.equal(eligibilityConfig.enabled, true); assert.deepEqual(eligibilityConfig.queryKey, ["existingOpenMeeting", "actor", "lead", "owner"]);
  axios.get = async (url) => { assert.equal(url, "/api/meeting/getLatestMeetings/lead"); return { data: { data: historyRows } }; }; assert.equal(await eligibilityConfig.queryFn({ signal: new AbortController().signal }), "open-group");
  eligibilityHook.useExistingMeetingForLead("lead", "actor", { allowed: false, meetingId: "known" }); assert.equal(eligibilityConfig.enabled, false);
  eligibilityHook.useExistingMeetingForLead("lead", "actor", { allowed: true }); assert.equal(eligibilityConfig.enabled, false);
  eligibilityHook.useExistingMeetingForLead("lead", "actor", { allowed: false }, false); assert.equal(eligibilityConfig.enabled, false);
  eligibilityHook.useMeetingEligibility("lead-a", "actor"); assert.deepEqual(eligibilityConfig.queryKey, ["meetingEligibility", "actor", "lead-a"]); assert.equal(eligibilityConfig.enabled, true);
  eligibilityHook.useMeetingEligibility("lead-b", "actor"); assert.deepEqual(eligibilityConfig.queryKey, ["meetingEligibility", "actor", "lead-b"]);
  eligibilityHook.useMeetingEligibility("", "actor"); assert.equal(eligibilityConfig.enabled, false);
  eligibilityHook.useMeetingEligibility("lead", "actor", false); assert.equal(eligibilityConfig.enabled, false);
  reset(); await api.cancelMeetingEntry("meeting", "entry-2", "No longer required", life.meetingVersion(group)); assert.equal(calls[0].body.expectedVersion, 7);
  await api.meetingConduct("meeting", { ...life.meetingVersion(group), remarks: "Completed" }); assert.equal(calls[1].body.expectedEntryId, "entry-2");
  const details = read("screens/Meetings/MeetingDetails.tsx");
  axios.get = async () => { if (nextError) { const e = nextError; nextError = null; throw e; } return { data: { data: [group], pagination: { totalItem: 1, hasNext: false } } }; };
  assert.equal((await api.getMeeting({ pageParam: 1 })).data.length, 1);
  const denied = { response: { status: 403, data: "Meeting access is disabled for this account" } };
  nextError = denied;
  await assert.rejects(api.getMeeting({}), error => error === denied);
  let listConfig;
  const hooks = compile("hooks/useCRMgetQuerry.ts", name => name === "@tanstack/react-query" ? {
    useInfiniteQuery: config => { listConfig = config; return { data: { pages: [undefined, { data: [group], pagination: { totalItem: 1 } }] } }; }, useQuery: () => ({}),
  } : name.includes("meetingApi") ? api : generic);
  const list = hooks.useGetMeeting({ pagination: false });
  assert.equal(list.data.length, 1); assert.equal(listConfig.queryKey[4], false);
  assert.equal(listConfig.initialPageParam, 1); assert.equal(listConfig.refetchOnMount, "always");
  assert.equal(listConfig.retry(0, denied), false); assert.equal(listConfig.retry(0, { response: { status: 503 } }), true);
  assert.doesNotMatch(details, /meetingOtpGenerate|meetingOtpVerify|isModalVisibleConduct/);
  assert.match(details, /meetingVersion\(actionSnapshot\)/); assert.match(details, /actions.conduct/); assert.match(details, /isLatestEntry\s*&&\s*\(\s*<Pressable/);
  console.log("Meeting lifecycle v2: permissions/time gates, migration protection, members, retry identity, actual create/edit/follow-up/reschedule submissions, cancellation/conduct API context, conflict recovery and OTP removal passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
