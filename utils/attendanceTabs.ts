export type AttendanceTab = "all" | "issues" | "unapproved";

// Mirrors isSupAndSubAdmin on GET /get-notapproved-attendance.
export const canViewUnapprovedAttendance = (role?: string): boolean =>
  ["sup_admin", "sub_admin", "developer"].includes(role || "");

export const getAttendanceTabs = (role?: string): { key: AttendanceTab; label: string }[] => [
  { key: "all", label: "All Attendance" },
  { key: "issues", label: "Issues" },
  ...(canViewUnapprovedAttendance(role) ? [{ key: "unapproved" as const, label: "Unapproved" }] : []),
];

export const attendanceTabQueryKey = (tab: AttendanceTab) => ({
  all: "getAllAttendance", issues: "getIssueAttendance", unapproved: "getUnapprovedAttendance",
})[tab];

export const nextAttendancePage = (page: any): number | undefined => {
  const pagination = page?.pagination;
  if (!pagination?.isNextPage) return undefined;
  const current = Number(pagination.currentPage);
  const total = Number(pagination.totalPage);
  if (!Number.isInteger(current) || current < 1 ||
      (Number.isFinite(total) && current >= total)) return undefined;
  return current + 1;
};
