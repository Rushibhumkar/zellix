export const canManageAttendancePermissions = (role?: string) => ["sup_admin", "sub_admin"].includes(role || "");
export type AttendanceActionPermission = { days: "everyday" | "weekdays" | "weekends" | "disabled"; phone: boolean; biometric: boolean; allowOffice?: boolean; allowSalesCenters?: boolean };
export type AttendancePermissions = {
  revision: number; autoApprove: boolean;
  permissions: { checkIn: AttendanceActionPermission; checkOut: AttendanceActionPermission; visitIn: AttendanceActionPermission; visitOut: AttendanceActionPermission;
    requireOfficeGeofence: boolean; requireVisitGeofence: boolean; requireVisitOutRemarks: boolean; allowEndWorkdayWithVisitOut: boolean;
    officeRadiusMeters: number; visitRadiusMeters: number; officeName: string };
};
export const attendancePermissionActions = [["checkIn", "Check In"], ["checkOut", "Check Out"], ["visitIn", "Visit In"], ["visitOut", "Visit Out"]] as const;
export const attendancePermissionDays = [["everyday", "Every day"], ["weekdays", "Weekdays · Monday–Friday"], ["weekends", "Weekends · Saturday–Sunday"], ["disabled", "Not allowed"]] as const;
export const attendancePermissionExtras = [
  ["requireOfficeGeofence", "Require office geofence", "Set the allowed office distance below. Accurate GPS is required."],
  ["requireVisitGeofence", "Require sales-center geofence", "Set the allowed distance from the selected sales center below."],
  ["requireVisitOutRemarks", "Require Visit Out remarks", "Employees must enter a reason or summary before Visit Out."],
  ["allowEndWorkdayWithVisitOut", "Allow End workday too", "Employees can finish their day from the Visit Out dialog."],
] as const;
export type AttendanceRadiusKey = "officeRadiusMeters" | "visitRadiusMeters";
export const attendanceRadiusDefaults = { officeRadiusMeters: 50, visitRadiusMeters: 100 };
export const attendanceRadiusLabels = { officeRadiusMeters: "Office radius (meters)", visitRadiusMeters: "Sales-center radius (meters)" };
export const attendanceRadiusError = (value: string) =>
  /^[0-9]+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 10000
    ? "" : "Enter a whole number from 1 to 10,000 meters.";
