const cooldowns = new Map<string, number>();
const errorDeadlines = new WeakMap<object, number>();

export function retryAfterMilliseconds(value: unknown, now = Date.now()) {
  if (value == null || String(value).trim() === "") return 5000;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(String(value));
  return Number.isFinite(date) ? Math.max(0, date - now) : 5000;
}

export function retryAfterRemaining(error: unknown) {
  return error && typeof error === "object"
    ? Math.max(0, (errorDeadlines.get(error) || 0) - Date.now()) : 0;
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      const error = new Error("Request canceled");
      error.name = "AbortError";
      reject(error);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    }, Math.min(ms, 60_000));
    signal?.addEventListener("abort", cancel, { once: true });
    if (signal?.aborted) cancel();
  });
}

// Keep the cooldown at the API boundary so refresh, polling and manual retry
// all respect the same server deadline, without automatically retrying writes.
export async function readLeadData<T>(key: "leads" | "folders", read: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  while ((cooldowns.get(key) || 0) > Date.now()) {
    await wait(cooldowns.get(key)! - Date.now(), signal);
  }
  if (signal?.aborted) {
    const error = new Error("Request canceled");
    error.name = "AbortError";
    throw error;
  }
  try {
    return await read();
  } catch (error: any) {
    if (error?.response?.status === 503) {
      const deadline = Date.now() + retryAfterMilliseconds(error.response.headers?.["retry-after"]);
      cooldowns.set(key, Math.max(cooldowns.get(key) || 0, deadline));
      errorDeadlines.set(error, cooldowns.get(key)!);
    }
    throw error;
  }
}

export function retryLeadRead(failures: number, error: any) {
  const status = error?.response?.status;
  return ![401, 403, 404, 503].includes(status) &&
    !["AbortError", "CanceledError"].includes(error?.name) &&
    error?.code !== "ERR_CANCELED" && failures < 2;
}
