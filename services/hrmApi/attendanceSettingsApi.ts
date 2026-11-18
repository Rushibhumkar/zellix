import { axiosInstance } from "../authApi/axiosInstance";

const settingsUrl = "/api/hrms/hrms-settings";
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
