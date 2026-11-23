// Company attendance policies are restricted to Super Admin and Sub Admin.
// HRMS.attendanceApproval delegates individual approvals, not this global setting.
export const canManageAttendanceAutoApproval = (role?: string): boolean =>
  ["sup_admin", "sub_admin"].includes(role || "");

export const isAutoApprovalEnabled = (approveBasedAttendance: boolean): boolean =>
  !approveBasedAttendance;
