import { axiosInstance } from "../authApi/axiosInstance";
import { AttendancePermissions } from "../../utils/attendancePermissions";

const settingsUrl = "/api/hrms/hrms-settings";
const readPermissions = (response: any): AttendancePermissions => {
  const data = response?.data?.data;
  const actions = ["checkIn", "checkOut", "visitIn", "visitOut"];
  const flags = ["requireOfficeGeofence", "requireVisitGeofence", "requireVisitOutRemarks", "allowEndWorkdayWithVisitOut"];
  if (!Number.isInteger(data?.revision) || data.revision < 0 || typeof data?.autoApprove !== "boolean" ||
    actions.some(key => !["everyday", "weekdays", "weekends", "disabled"].includes(data?.permissions?.[key]?.days) ||
      typeof data?.permissions?.[key]?.phone !== "boolean" || typeof data?.permissions?.[key]?.biometric !== "boolean") ||
    flags.some(key => typeof data?.permissions?.[key] !== "boolean")) throw new Error("Invalid attendance permissions response. Please retry.");
  const permissions = { ...data.permissions, officeName: data.permissions.officeName ?? "Main Office",
    checkIn: { allowOffice: true, allowSalesCenters: false, ...data.permissions.checkIn },
    visitIn: { allowOffice: false, allowSalesCenters: true, ...data.permissions.visitIn },
    officeRadiusMeters: data.permissions.officeRadiusMeters ?? 50,
    visitRadiusMeters: data.permissions.visitRadiusMeters ?? 100 };
  if ([permissions.officeRadiusMeters, permissions.visitRadiusMeters].some(value => !Number.isInteger(value) || value < 1 || value > 10000))
    throw new Error("Invalid attendance radius response. Please retry.");
  if (typeof permissions.officeName !== "string" || !permissions.officeName.trim() || permissions.officeName.length > 100 ||
    [permissions.checkIn, permissions.visitIn].some(rule => typeof rule.allowOffice !== "boolean" || typeof rule.allowSalesCenters !== "boolean"))
    throw new Error("Invalid attendance location permissions response.");
  return { ...data, permissions };
};
export const getAttendancePermissions = async (): Promise<AttendancePermissions> =>
  readPermissions(await axiosInstance.get(`${settingsUrl}/attendance-permissions`));
export const saveAttendancePermissions = async (settings: AttendancePermissions): Promise<AttendancePermissions> =>
  readPermissions(await axiosInstance.put(`${settingsUrl}/attendance-permissions`, settings));
const readSettings = (response: any): { approveBasedAttendance: boolean; mobileOfficePunchEnabled?: boolean; weekendSitePunchEnabled?: boolean } => {
  const settings = response?.data?.data;
  if (typeof settings?.approveBasedAttendance !== "boolean") {
    throw new Error("Invalid attendance settings response. Please retry.");
  }
  return settings;
};

export const getAttendanceSettings = async () =>
  readSettings(await axiosInstance.get(settingsUrl));

export const setAttendanceAutoApproval = async (autoApprove: boolean) => {
  if (typeof autoApprove !== "boolean") throw new Error("Invalid auto approval value");
  return readSettings(await axiosInstance.patch(`${settingsUrl}/set-approve-attendance`, {
    value: !autoApprove,
  }));
};


export const setMobileOfficePunch = async (value: boolean) =>
  readSettings(await axiosInstance.patch(`${settingsUrl}/mobile-office-punch`, { value }));


export const setWeekendSitePunch = async (value: boolean) =>
  readSettings(await axiosInstance.patch(`${settingsUrl}/weekend-site-punch`, { value }));
