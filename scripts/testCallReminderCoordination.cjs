// Run with: node scripts/testCallReminderCoordination.cjs
// Deterministic component/lease checks. Native Android window rendering still
// requires a device; this harness does not claim to emulate native Modals.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(file, imports = {}) {
  const filename = path.resolve(__dirname, "..", file);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", "setTimeout", "clearTimeout", outputText)(
    (name) => { assert(name in imports, `Unexpected import ${name}`); return imports[name]; },
    module, module.exports, clock.setTimeout, clock.clearTimeout,
  );
  return module.exports;
}

function loadHandler(file, name, context) {
  const filename = path.resolve(__dirname, "..", file);
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) initializer = node.initializer;
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert(initializer, `Missing handler ${name}`);
  const { outputText } = ts.transpileModule(`module.exports = (${initializer.getText(source)});`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const module = { exports: {} };
  new Function("module", ...Object.keys(context), "setTimeout", "clearTimeout", outputText)(
    module, ...Object.values(context), clock.setTimeout, clock.clearTimeout,
  );
  return module.exports;
}

const runtimes = new Set();
const clock = {
  now: 0, next: 0, tasks: new Map(),
  setTimeout(fn, delay) { const id = ++clock.next; clock.tasks.set(id, { at: clock.now + delay, fn }); return id; },
  clearTimeout(id) { clock.tasks.delete(id); },
  advance(ms) {
    const until = this.now + ms;
    while (true) {
      const next = [...this.tasks].filter(([, value]) => value.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.now = next[1].at;
      this.tasks.delete(next[0]);
      next[1].fn();
      runtimes.forEach((runtime) => runtime.flush());
    }
    this.now = until;
    runtimes.forEach((runtime) => runtime.flush());
  },
};

function runtime(componentFactory) {
  const slots = [];
  let cursor = 0, dirty = true, pending = [], view, component;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const effect = (fn, deps, layout = false) => {
    const i = cursor++;
    if (!same(slots[i]?.deps, deps)) pending.push({ i, fn, deps, layout });
  };
  const React = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { value: typeof initial === "function" ? initial() : initial };
      return [slots[i].value, (input) => {
        const next = typeof input === "function" ? input(slots[i].value) : input;
        if (!Object.is(next, slots[i].value)) { slots[i].value = next; dirty = true; }
      }];
    },
    useRef(initial) { const i = cursor++; return slots[i] || (slots[i] = { current: initial }); },
    useEffect: (fn, deps) => effect(fn, deps),
    useLayoutEffect: (fn, deps) => effect(fn, deps, true),
    useCallback(fn, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, value: fn };
      return slots[i].value;
    },
    useSyncExternalStore(subscribe, getSnapshot) {
      effect(() => subscribe(() => { dirty = true; }), [subscribe], true);
      return getSnapshot();
    },
  };
  React.default = React;
  React.__esModule = true;
  const api = {
    React,
    flush() {
      for (let count = 0; dirty; count++) {
        assert(count < 50, "Component did not settle");
        dirty = false; cursor = 0; pending = [];
        view = component();
        pending.sort((a, b) => Number(b.layout) - Number(a.layout)).forEach(({ i, fn, deps }) => {
          slots[i]?.cleanup?.();
          slots[i] = { deps, cleanup: fn() };
        });
      }
      return view;
    },
    update() { dirty = true; return api.flush(); },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); runtimes.delete(api); },
  };
  component = componentFactory(React);
  runtimes.add(api);
  return api;
}

const { createCallUiGate } = load("utils/callUiGate.ts");
const gate = createCallUiGate();
const releaseA = gate.acquire(), releaseB = gate.acquire();
releaseA(); releaseA();
assert.equal(gate.getSnapshot(), true, "A duplicate release must not release B");
releaseB();
assert.equal(gate.getSnapshot(), false);

let visibleUi = false;
const guard = runtime((React) => {
  const { useCallUiGuard } = load("hooks/useCallUiGuard.ts", { react: React, "../utils/callUiGate": { callUiGate: gate } });
  return () => useCallUiGuard(visibleUi);
});
let call = guard.flush();
call.beginCallUi(); call.beginCallUi();
assert(gate.getSnapshot(), "Dial intent blocks synchronously, before AppState changes");
visibleUi = true; call = guard.update();
call.endCallUi();
assert(gate.getSnapshot(), "Outcome modal keeps the lease after the call ends");
visibleUi = false; guard.update();
assert.equal(gate.getSnapshot(), false);
call.beginCallUi(); guard.unmount();
assert.equal(gate.getSnapshot(), false, "Unmount releases an unfinished call");
call.beginCallUi();
assert.equal(gate.getSnapshot(), false, "Late async callbacks cannot acquire a lease after unmount");

let userId = "user-a";
const socketListeners = new Map(), appListeners = new Set(), navListeners = new Set();
const appState = { currentState: "active", addEventListener(event, callback) { appListeners.add(callback); return { remove: () => appListeners.delete(callback) }; } };
const navigationCalls = [];
let route = "CallListing", navigationReady = true;
const navigationRef = {
  isReady: () => navigationReady,
  getCurrentRoute: () => ({ name: route }),
  addListener(event, callback) { navListeners.add(callback); return () => navListeners.delete(callback); },
  navigate(...args) { navigationCalls.push(args); route = "LeadsDetails"; navListeners.forEach((fn) => fn()); },
};
const socket = {
  on(event, callback) { const listeners = socketListeners.get(event) || new Set(); listeners.add(callback); socketListeners.set(event, listeners); },
  off(event, callback) { socketListeners.get(event)?.delete(callback); },
};
const jsx = (type, props) => ({ type, props });
const manager = runtime((React) => load("myComponents/GlobalPopup/GlobalPopupManager.tsx", {
  react: React,
  "react/jsx-runtime": { jsx, jsxs: jsx },
  "react-native": { AppState: appState },
  "./PopupModal": { __esModule: true, default: "PopupModal" },
  "../../navigation/navigationRef": { navigationRef },
  "../../screens/Dashboard/Dashboard": { socket },
  "react-redux": { useSelector: () => ({ user: { _id: userId } }) },
  "../../redux/userSlice": { selectUser() {} },
  "../../utils/callUiGate": { callUiGate: gate },
}).default);
const send = (id) => { socketListeners.get("reminder:due").forEach((fn) => fn({ _id: id, title: id, leadId: { _id: "lead-a" } })); return manager.flush(); };
const setAppState = (value) => { appState.currentState = value; appListeners.forEach((fn) => fn(value)); return manager.flush(); };

assert.equal(manager.flush(), null);
const endCall = gate.acquire();
setAppState("background");
send("reminder-a"); send("reminder-a"); send("reminder-b");
clock.advance(2000);
assert.equal(manager.flush(), null, "Background reminder stays queued");
setAppState("active"); clock.advance(2000);
assert.equal(manager.flush(), null, "Return from call cannot expose reminders while outcome is open");
endCall(); manager.flush();
clock.advance(499); assert.equal(manager.flush(), null);
clock.advance(1); assert.equal(manager.flush().props.title, "reminder-a");

manager.flush().props.onIgnore(); manager.flush();
assert.equal(manager.flush(), null);
clock.advance(1000);
assert.equal(manager.flush().props.title, "reminder-b", "Duplicate socket delivery was deduplicated");
manager.flush().props.onOpen(); manager.flush();
assert.equal(manager.flush(), null, "Dismiss popup before navigation");
assert.equal(navigationCalls.length, 0);
clock.advance(500);
assert.deepEqual(navigationCalls[0], ["Dashboard", { screen: "allLead2", params: { screen: "LeadsDetails", params: { item: { _id: "lead-a" } } } }]);
clock.advance(15000); assert.equal(manager.flush(), null, "Opening consumed only the selected reminder");

send("reminder-c"); clock.advance(500);
assert(manager.flush());
setAppState("inactive"); assert.equal(manager.flush(), null);
setAppState("active"); clock.advance(500); assert(manager.flush());
manager.flush().props.onOpen(); manager.flush();
setAppState("background"); clock.advance(500);
assert.equal(navigationCalls.length, 1, "Do not navigate if backgrounded during dismissal");
setAppState("active"); clock.advance(500);
assert.equal(manager.flush().props.title, "reminder-c", "Aborted navigation retains the reminder");

userId = "user-b"; manager.update(); clock.advance(1000);
assert.equal(manager.flush(), null, "Account changes clear old user's queue");
send("reminder-d"); clock.advance(250);
const duringTransition = gate.acquire(); manager.flush();
clock.advance(1000);
assert.equal(manager.flush(), null, "A new call cancels an already scheduled reminder presentation");
duringTransition(); manager.flush(); clock.advance(500);
assert(manager.flush());
navigationReady = false;
manager.flush().props.onOpen(); manager.flush();
assert(manager.flush(), "Navigation unavailable does not discard reminder");
manager.unmount();
assert.equal(appListeners.size, 0);
assert.equal(navListeners.size, 0);
assert.equal(socketListeners.get("reminder:due").size, 0);
assert.equal(clock.tasks.size, 0, "Unmount cancels delayed navigation and modal timers");

const outcome = load("utils/callOutcome.ts");
const noop = () => {};
const ref = (current = null) => ({ current });

// Run the real duration handler at the reported short-call boundaries.
for (const seconds of [12, 15, 16, 30, 59, 60, 61, 1200, 1201]) {
  for (const status of ["active_hot", "no_response"]) {
    let popup = false, fromCall = false, meta, releases = 0;
    const messages = [], logs = [];
    const end = loadHandler("screens/Leads/LeadsDetails.tsx", "handleCallEnd", {
      ...outcome,
      DURATION_THRESHOLD_SEC: 1200,
      console: { log() {} }, pendingResumeRef: ref(),
      toast: { info: message => messages.push(message) },
      hitCreateCallLog: (...args) => logs.push(args),
      endCallUi: () => releases++, setShowDurationEditor: noop,
      setIsStatusPopupFromCall: value => { fromCall = value; },
      setCallMeta: value => { meta = value; },
      setShowChangeStatusPopup: value => { popup = value; },
    });
    end(1000, 1000 + seconds * 1000);
    const eligible = seconds > 60 && seconds <= 1200;
    assert.equal(popup, eligible, `${seconds}s: only meaningful calls open the status form`);
    assert.equal(fromCall, eligible);
    assert.equal(releases, eligible ? 0 : 1, "Visible outcome retains the call/reminder guard");
    if (eligible) {
      assert.equal(meta.finishedAt - meta.initiatedAt, seconds * 1000);
    } else assert.equal(meta, null);
    const shortLogged = seconds > 15 && seconds <= 60;
    assert.equal(logs.length, shortLogged ? 1 : 0);
    assert.equal(messages.length, seconds <= 60 ? 1 : 0);
    if (shortLogged) {
      assert.deepEqual(logs[0], [undefined, { initiatedAt: 1000, finishedAt: 1000 + seconds * 1000 }, false]);
      assert.match(messages[0], /Not Connected/);
    }
  }
}

// Reproduce the exact Android failure: short calls clear positive statuses to
// "", and &&/|| used to pass that string through TouchableOpacity to Fabric's
// accessibilityState.disabled. Evaluate the actual source initializer.
for (const status of [undefined, null, "", "active_hot", "no_response", "broker"]) {
  for (const type of ["lead", "calling_data"]) {
    for (const note of ["", "  ", "note"]) {
      for (const followUpReady of [false, true]) {
        const disabled = loadHandler("screens/Leads/LeadsDetails.tsx", "isSubmitDisabled", {
          selectLeadType: type, fields: { status },
          NOTE_REQUIRED_STATUSES: ["active_hot", "broker"],
          FOLLOWUP_REQUIRED_STATUSES: ["active_hot"],
          formik: { values: { note } },
          tdForFUT: { date: followUpReady ? "date" : null, time: followUpReady ? "time" : null },
        });
        assert.equal(typeof disabled, "boolean", `Native disabled must be boolean for ${String(status)}`);
        const expected = type !== "calling_data" && Boolean(status) &&
          ((["active_hot", "broker"].includes(status) && !note.trim()) ||
           (status === "active_hot" && !followUpReady));
        assert.equal(disabled, expected, "Existing note/follow-up validation must not change");
        for (const loading of [false, true]) assert.equal(typeof (loading || disabled), "boolean");
      }
    }
  }
}

// Android only: native call dialogs wait for a stable foreground/focused host.
let leadFocused = true;
const androidState = { currentState: "active", listeners: new Set(), addEventListener(_, fn) { this.listeners.add(fn); return { remove: () => this.listeners.delete(fn) }; } };
const androidPlatform = { OS: "android" };
const modalHost = runtime(React => {
  const { useAndroidCallModalReady } = load("hooks/useAndroidCallModalReady.ts", { react: React, "react-native": { AppState: androidState, Platform: androidPlatform } });
  return () => useAndroidCallModalReady(leadFocused);
});
const modalAppState = state => { androidState.currentState = state; androidState.listeners.forEach(fn => fn(state)); return modalHost.flush(); };
assert.equal(modalHost.flush(), false); clock.advance(500); assert.equal(modalHost.flush(), true);
assert.equal(modalAppState("background"), false); clock.advance(1000); assert.equal(modalHost.flush(), false);
modalAppState("inactive"); modalAppState("active"); clock.advance(300);
modalAppState("background"); clock.advance(500); assert.equal(modalHost.flush(), false, "Interrupted resume must cancel native-modal presentation");
modalAppState("active"); clock.advance(499); assert.equal(modalHost.flush(), false); clock.advance(1); assert.equal(modalHost.flush(), true);
leadFocused = false; assert.equal(modalHost.update(), false); clock.advance(1000); assert.equal(modalHost.flush(), false);
leadFocused = true; modalHost.update(); clock.advance(500); assert.equal(modalHost.flush(), true);
modalHost.unmount(); assert.equal(androidState.listeners.size, 0);
androidPlatform.OS = "ios";
const iosHost = runtime(React => {
  const { useAndroidCallModalReady } = load("hooks/useAndroidCallModalReady.ts", { react: React, "react-native": { AppState: androidState, Platform: androidPlatform } });
  return () => useAndroidCallModalReady(true);
});
assert.equal(iosHost.flush(), true, "iOS presentation remains unchanged"); iosHost.unmount();

// Execute the actual lead AppState callback, not a rewritten model of it.
const foreground = { currentState: "active" }, previousState = ref("active");
const dialer = ref(true), tracking = ref(false), started = ref(), accepted = ref(true), returnTimer = ref(), cancelTimer = ref();
const completions = [];
let callNow = 1000;
const leadAppStateHandler = loadHandler("screens/Leads/LeadsDetails.tsx", "onCallAppStateChange", {
  appState: previousState, AppState: foreground, Platform: { OS: "android" },
  isDialerOpenedRef: dialer, isCallTrackingRef: tracking, callStartTimeRef: started,
  dialRequestAcceptedRef: accepted, callReturnTimerRef: returnTimer, dialerCancelTimerRef: cancelTimer,
  isCallLogSentRef: ref(false), TEST_CALL_INITIATED_AT_OFFSET_MS: 0, detail: { _id: "lead-a" },
  Date: class extends Date { static now() { return callNow; } }, console: { log() {} },
  setCallStartTime: noop, setCallMeta: noop, setIsCallTracking: noop, setIsDialerOpened: noop,
  storeData: async () => {}, removeItemValue: async () => {}, PENDING_CALL_KEY_LEAD: "pendingCallLead", CONFIRMED_CALL_MARKER: "confirmed",
  dispatch: noop, setCallDetect: value => value, endCallUi: noop,
  handleCallEnd: (...args) => completions.push(args),
});
const leadState = value => { foreground.currentState = value; leadAppStateHandler(value); };
leadState("background"); assert.equal(tracking.current, true);
callNow = 62000; leadState("inactive"); leadState("active"); clock.advance(300);
leadState("background"); clock.advance(1000); assert.equal(completions.length, 0); assert.equal(tracking.current, true);
leadState("inactive"); leadState("active"); clock.advance(599); assert.equal(completions.length, 0);
clock.advance(1); assert.deepEqual(completions, [[1000, 62000]]); assert.equal(tracking.current, false);
leadState("active"); clock.advance(1000); assert.equal(completions.length, 1, "Duplicate active events cannot complete the same call twice");

const opened = [];
const releaseManualCall = gate.acquire();
const finalize = loadHandler("screens/Leads/CallListing.tsx", "finalizeCallAndOpenLead", {
  ...outcome,
  setCallMeta: noop, setCalledNumber: noop, formik: { setFieldValue: noop },
  setLeadType: noop, setPhoneNumber: noop, setCallStartTime: noop,
  isCallingRef: ref(true), isCallTrackingRef: ref(true), callStartTimeRef: ref(1000),
  setShowDialPad: (visible) => opened.push(["dial-pad", visible]),
  setShowLeadModal: (visible) => opened.push(["outcome", visible]),
  resumeModalTimerRef: ref(), endCallUi: releaseManualCall,
});
finalize("test-number", 1000, 62000);
assert.deepEqual(opened, [["dial-pad", false]]);
clock.advance(349); assert(gate.getSnapshot());
clock.advance(1);
assert.deepEqual(opened, [["dial-pad", false], ["outcome", true]]);
assert.equal(gate.getSnapshot(), false);

async function testShortLeadCallLogs() {
  for (const seconds of [12, 15, 16, 30, 59, 60, 61]) {
    const sent = ref(false), calls = [], successes = [], errors = [];
    let cleared = 0;
    const save = loadHandler("screens/Leads/LeadsDetails.tsx", "hitCreateCallLog", {
      ...outcome, callMeta: null, isCallLogSentRef: sent,
      DURATION_THRESHOLD_SEC: 1200, console: { log() {} },
      user: { _id: "user-a" }, detail: { _id: "lead-a" },
      createCallLog: async payload => { calls.push(payload); return { success: true }; },
      toast: { success: value => successes.push(value), error: value => errors.push(value) },
      queryClient: { invalidateQueries: noop }, queryKeyCRM: {}, refetchLeadDetail: noop,
      setCallMeta: () => cleared++, setShowChangeStatusPopup: noop, setIsStatusPopupFromCall: noop,
    });
    const completed = { initiatedAt: 1000, finishedAt: 1000 + seconds * 1000 };
    await save(undefined, completed, false);
    await save(undefined, completed, false);
    assert.equal(calls.length, seconds <= 15 ? 0 : 1, "Save each eligible call once, even without a mounted popup");
    assert.equal(successes.length, 0, "Success toast must not overwrite the short-call explanation");
    assert.equal(errors.length, 0);
    if (seconds > 15) {
      assert.equal(calls[0].type, seconds <= 60 ? "not_connected" : "connected");
      assert.equal(calls[0].leadId, "lead-a");
      assert.equal(calls[0].finishedAt, new Date(completed.finishedAt).toISOString());
      assert.equal(cleared, 0, "A background save cannot clear a newer tracked call");
      assert.equal("leadStatusAfterCall" in calls[0], false, "Automatic log must not change lead status");
    }
  }
}

async function testLeadDialIntent() {
  const dialer = ref(false), tracking = ref(false), started = ref(), accepted = ref(false), returnTimer = ref();
  let finishOpen, launches = 0, releases = 0, fails = false;
  const dial = loadHandler("screens/Leads/LeadsDetails.tsx", "navToCall", {
    isDialerOpenedRef: dialer, isCallTrackingRef: tracking, callStartTimeRef: started,
    dialRequestAcceptedRef: accepted, callReturnTimerRef: returnTimer,
    detail: { _id: "lead-a", clientMobile: "test-number" },
    beginCallUi: noop, endCallUi: () => releases++, setIsDialerOpened: noop,
    setIsCallTracking: noop, setCallStartTime: noop, setCallMeta: noop,
    Linking: { openURL: async () => { launches++; if (fails) throw Error("Dialer unavailable"); return new Promise(resolve => { finishOpen = resolve; }); } },
    storeData: async () => {}, removeItemValue: async () => {}, PENDING_CALL_KEY_LEAD: "pendingCallLead", CONFIRMED_CALL_MARKER: "confirmed",
    dispatch: noop, setCallDetect: value => value, console: { log() {} },
  });
  const pending = dial(); await dial(); assert.equal(launches, 1, "Fast repeat taps must not open two native dialers");
  finishOpen(); await pending; assert.equal(accepted.current, true);
  dialer.current = false; tracking.current = true; await dial(); assert.equal(launches, 1, "An ongoing tracked call cannot be started again");
  tracking.current = false; fails = true;
  returnTimer.current = clock.setTimeout(() => { throw Error("Stale failed-dial timer"); }, 10);
  await dial(); assert.equal(accepted.current, false); assert.equal(dialer.current, false); assert.equal(tracking.current, false); assert.equal(started.current, null); assert.equal(returnTimer.current, null); assert.equal(releases, 1);
  clock.advance(20);
}

async function testRecoveredLeadCall() {
  let alert, ended = 0, releaseRecovered;
  const isCallTrackingRef = ref(true), isDialerOpenedRef = ref(true), callStartTimeRef = ref(1000);
  const handler = loadHandler("screens/Leads/LeadsDetails.tsx", "resumePendingCallIfAny", {
    ...outcome,
    isResumingRef: ref(false), isHandlingResumeAlertRef: ref(false),
    getDataJson: async () => ({ leadId: "lead-a", initiatedAt: 1000 }),
    PENDING_CALL_KEY_LEAD: "pendingCallLead", isConfirmedPendingCall: () => true,
    detail: { _id: "lead-a", clientName: "Test lead", clientMobile: "test-number" },
    beginCallUi: () => { releaseRecovered = gate.acquire(); },
    endCallUi: () => releaseRecovered?.(),
    removeItemValue: async () => {}, Date: class extends Date { static now() { return 62000; } },
    DURATION_THRESHOLD_SEC: 1200, console: { log() {} },
    pendingResumeRef: ref(), setShowDurationEditor: noop, setShowChangeStatusPopup: noop,
    setIsStatusPopupFromCall: noop, setCallMeta: noop,
    isCallTrackingRef, isDialerOpenedRef, callStartTimeRef,
    setIsCallTracking: noop, setIsDialerOpened: noop, setCallStartTime: noop,
    Alert: { alert(...args) { alert = args; } }, resumeModalTimerRef: ref(),
    handleCallEnd: () => { ended++; releaseRecovered?.(); },
  });
  await handler();
  assert.equal(isCallTrackingRef.current, false);
  assert.equal(isDialerOpenedRef.current, false);
  assert.equal(callStartTimeRef.current, null);
  assert.equal(ended, 0);
  assert(gate.getSnapshot(), "Recovery alert retains the call guard");
  assert.equal(alert[0], "Missed Call Log");
  alert[2][0].onPress();
  clock.advance(299); assert.equal(ended, 0, "Alert must dismiss before the status modal opens");
  clock.advance(1); assert.equal(ended, 1);
  assert.equal(gate.getSnapshot(), false);
  assert.equal(clock.tasks.size, 0);
}

testShortLeadCallLogs().then(testLeadDialIntent).then(testRecoveredLeadCall).then(() => {
  console.log("PASS: Native disabled boolean regression (144 form combinations), 12/15/16/30/59/60/61/1200/1201-second boundaries, foreground/focus stability, interrupted resume, duplicate/dial-failure cleanup, call leases, reminder queue/navigation and recovered-call alert transitions.");
}).catch((error) => { console.error(error); process.exitCode = 1; });
