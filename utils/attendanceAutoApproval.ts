// Matches backend isSupAndSubAdmin on PATCH /hrms-settings/set-approve-attendance.
// HRMS.attendanceApproval delegates individual approvals, not this global setting.
export const canManageAttendanceAutoApproval = (role?: string): boolean =>
  ["sup_admin", "sub_admin", "developer"].includes(role || "");

export const isAutoApprovalEnabled = (approveBasedAttendance: boolean): boolean =>
  !approveBasedAttendance;
