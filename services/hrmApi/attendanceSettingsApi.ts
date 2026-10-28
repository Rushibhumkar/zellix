import { axiosInstance } from "../authApi/axiosInstance";

const settingsUrl = "/api/hrms/hrms-settings";
const readSettings = (response: any): { approveBasedAttendance: boolean } => {
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
