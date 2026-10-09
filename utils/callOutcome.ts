export const SHORT_CALL_MAX_DURATION_SECONDS = 60;

export const getTrackedCallDurationSeconds = (callMeta?: {
  initiatedAt?: number | null;
  finishedAt?: number | null;
} | null) => {
  if (!callMeta?.initiatedAt || !callMeta?.finishedAt) return null;

  return Math.max(
    0,
    Math.floor((callMeta.finishedAt - callMeta.initiatedAt) / 1000),
  );
};

export const isShortCallDuration = (duration?: number | null) =>
  typeof duration === "number" &&
  Number.isFinite(duration) &&
  duration >= 0 &&
  duration <= SHORT_CALL_MAX_DURATION_SECONDS;
