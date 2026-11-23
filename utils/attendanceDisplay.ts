export const attendanceUserName = (user?: { name?: string; lastName?: string; email?: string }) =>
  [user?.name, user?.lastName].filter((value): value is string => typeof value === "string" &&
    Boolean(value.trim()) && !["undefined", "null"].includes(value.trim().toLowerCase()))
    .map(value => value.trim()).join(" ") || user?.email || "Employee";

export const attendanceSourceIcon = (source?: string): "smartphone" | "cpu" | "edit-2" | "monitor" | "help-circle" => {
  const value = (source || "").toUpperCase().replace(/ /g, "_");
  if (value.includes("ADMIN_CORRECTION")) return "edit-2";
  if (value.includes("MACHINE")) return "cpu";
  if (value.includes("MOBILE") || value.startsWith("PHONE")) return "smartphone";
  if (value === "WEB") return "monitor";
  return "help-circle";
};
export const attendanceSourceLabel = (source?: string) => ({
  smartphone: "Mobile", cpu: "Machine", "edit-2": "Admin", monitor: "Web", "help-circle": "Unknown",
})[attendanceSourceIcon(source)];

export type AttendanceDisplaySummary = {
  checkInAt?: string | null; checkOutAt?: string | null;
  checkInSource?: string; checkOutSource?: string;
  state?: "not_started" | "open" | "provisional" | "final" | "override" | "needs_review";
  calculatedStatus?: string | null; finalizationReason?: string | null;
  checkOutExplanation?: string | null; checkOutDerived?: boolean; workMinutes?: number | null;
};
export const attendanceProgressLabel = (summary: AttendanceDisplaySummary) => {
  if (!["not_started", "open", "provisional"].includes(summary.state || "")) return null;
  return summary.checkInAt && Number.isFinite(new Date(summary.checkInAt).getTime())
    ? "Day in progress" : "Not checked in";
};
export const formatAttendanceDuration = (value?: number | null) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return "—";
  const minutes = Math.floor(value);
  const hours = Math.floor(minutes / 60);
  return [hours ? `${hours}hr` : "", minutes % 60 || !hours ? `${minutes % 60}min` : ""].filter(Boolean).join(" ");
};
export const attendanceSummary = (row?: { displaySummary?: AttendanceDisplaySummary; punchedIn?: string; punchedOut?: string; workMinutes?: number }): AttendanceDisplaySummary => row?.displaySummary || {
  checkInAt: row?.punchedIn, checkOutAt: row?.punchedOut,
  checkInSource: "Source unavailable", checkOutSource: "Source unavailable",
  checkOutDerived: false, workMinutes: row?.workMinutes,
};
