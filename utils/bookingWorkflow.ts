import type { QueryClient } from "@tanstack/react-query";
function minorUnits(value: unknown) {
  const text = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return NaN;
  const [whole, fraction = ""] = text.split(".");
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  return minor <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(minor) : NaN;
}
export function previewBookingAllocation(values: any, rows: any[]) {
  const netMinor = minorUnits(values.commission || 0) - minorUnits(values.clientLoyalty || 0) - minorUnits(values.brokerReferral || 0);
  const agents = rows.map(row => {
    const percentage = minorUnits(row.commissionPerc);
    const payout = row.inputMode === "amount" ? minorUnits(row.commission) : Number.isSafeInteger(netMinor) && netMinor >= 0 && Number.isFinite(percentage) && percentage <= 10000 ? Number((BigInt(netMinor) * BigInt(percentage) + 5000n) / 10000n) : NaN;
    const credit = minorUnits(rows.length === 1 ? 100 : row.creditPerc);
    return {
      ...row,
      commission: payout / 100,
      creditPerc: credit / 100
    };
  });
  const allocatedMinor = agents.reduce((total, row) => total + Math.round(row.commission * 100), 0);
  return {
    agents,
    net: netMinor / 100,
    allocated: allocatedMinor / 100,
    credit: agents.reduce((total, row) => total + Math.round(row.creditPerc * 100), 0) / 100
  };
}
export function bookingCommand(cache: Record<string, any>, action: string, values: any) {
  const fingerprint = JSON.stringify([action, values]);
  if (cache.fingerprint !== fingerprint) {
    cache.fingerprint = fingerprint;
    cache.requestId = `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return {
    ...values,
    requestId: cache.requestId
  };
}
export function bookingError(error: any) {
  const data = error?.response?.data;
  return (typeof data === "string" ? data : data?.message) || "Could not update the booking. Check your connection and try again.";
}
export function refreshBookingQueries(client: QueryClient) {
  for (const key of ["getBooking", "getBookingById", "getDashboardCount", "getMeetingForBooking", "getBookingCount", "getCommissionCount", "bookingShareSettings"]) {
    void client.invalidateQueries({
      queryKey: [key]
    });
  }
}
