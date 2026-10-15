export const SHORT_CALL_MAX_DURATION_SECONDS = 60;
export const IGNORED_CALL_MAX_DURATION_SECONDS = 15;

export const getTrackedCallDurationSeconds = (
  callMeta?: {
    initiatedAt?: number | null;
    finishedAt?: number | null;
  } | null,
) => {
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

export const isIgnoredCallDuration = (duration?: number | null) =>
  typeof duration === "number" &&
  Number.isFinite(duration) &&
  duration >= 0 &&
  duration <= IGNORED_CALL_MAX_DURATION_SECONDS;

export const formatCallDuration = (duration?: number | null) => {
  const totalSeconds = Math.max(0, Math.floor(Number(duration) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} hr ${minutes} min ${seconds} sec`;
  }
  if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  }
  return `${seconds} sec`;
};
