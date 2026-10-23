import { checkPermission } from "./commonFunctions";

// Viewing one's own attendance must not expose team-wide summary counts.
export const canViewAttendanceSummary = (
  permission: Record<string, any> = {},
  role?: string,
): boolean => Boolean(role) && role !== "agent" &&
  checkPermission(permission, "Attendance", "sidebar", role) &&
  checkPermission(permission, "HrmsDashboard", "attendance", role);
