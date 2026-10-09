export const PENDING_CALL_KEY = "pendingCall";
export const PENDING_CALL_KEY_LEAD = "pendingCallLead";

export const CONFIRMED_CALL_MARKER = "dialer_backgrounded_v1";

export const isConfirmedPendingCall = (pending: unknown): boolean => (
  Boolean(
    pending
    && typeof pending === "object"
    && (pending as { confirmation?: string }).confirmation === CONFIRMED_CALL_MARKER,
  )
);
