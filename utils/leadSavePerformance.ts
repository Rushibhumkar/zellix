import AsyncStorage from "@react-native-async-storage/async-storage";

export type LeadRequestTiming = {
  interactionId: string;
  stage: "status_write" | "call_write";
  deferActivityRefresh?: boolean;
  requestStartedAt?: number;
};

declare module "axios" {
  interface AxiosRequestConfig {
    leadSaveTiming?: LeadRequestTiming;
  }
}

type TimingEntry = {
  interactionId: string;
  stage: "authentication" | "status_write" | "call_write" | "refresh";
  durationMs: number;
  outcome: "success" | "error" | "skipped";
  requestStage?: string;
  httpStatus?: number;
  serverAuthMs?: number;
};

// Bounded local diagnostics remain available in release builds, without user data.
export const LEAD_SAVE_TIMINGS_KEY = "zellix.lead-save-timings.v1";
let pending: Array<TimingEntry & { at: string }> = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let writes = Promise.resolve();

export const performanceNow = () =>
  typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();

export const newLeadInteractionId = () =>
  `lead-save-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function recordLeadSaveTiming(entry: TimingEntry) {
  const record = {
    ...entry,
    durationMs: Math.round(Math.max(0, entry.durationMs)),
    at: new Date().toISOString(),
  };
  console.info("[LeadSaveTiming]", record);
  pending.push(record);
  pending = pending.slice(-100);
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = undefined;
    const batch = pending;
    pending = [];
    writes = writes.then(async () => {
      const raw = await AsyncStorage.getItem(LEAD_SAVE_TIMINGS_KEY);
      let earlier = [];
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) earlier = parsed;
      } catch { /* Replace malformed local diagnostics. */ }
      await AsyncStorage.setItem(LEAD_SAVE_TIMINGS_KEY, JSON.stringify([...earlier, ...batch].slice(-100)));
    }).catch(() => {
      // Diagnostics must never affect a save or produce an unhandled rejection.
    });
  }, 250);
}

export function recordLeadRequestTiming(config: any, status?: number, failed = false, serverTiming?: unknown) {
  const timing: LeadRequestTiming | undefined = config?.leadSaveTiming;
  if (!timing || timing.requestStartedAt == null) return;
  const serverAuth = typeof serverTiming === "string"
    ? /(?:^|,)\s*auth(?:entication)?\s*;\s*dur=([\d.]+)/i.exec(serverTiming)
    : null;
  const serverAuthMs = serverAuth ? Number(serverAuth[1]) : NaN;
  recordLeadSaveTiming({
    interactionId: timing.interactionId,
    stage: timing.stage,
    durationMs: performanceNow() - timing.requestStartedAt,
    outcome: failed ? "error" : "success",
    ...(typeof status === "number" && { httpStatus: status }),
    ...(Number.isFinite(serverAuthMs) && { serverAuthMs }),
  });
}
