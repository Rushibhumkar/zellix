import { axiosInstance } from "../authApi/axiosInstance";
import { AttendanceTab } from "../../utils/attendanceTabs";

export const getAttendanceList = async ({ tab, pageParam = 1, userId = "", search = "", startDate = "", endDate = "" }: {
  tab: AttendanceTab; pageParam?: number; userId?: string; search?: string; startDate?: string; endDate?: string;
}) => {
  const response = await axiosInstance.get(tab === "unapproved"
    ? "/api/hrms/att/get-notapproved-attendance" : "/api/hrms/att", {
    params: { page: pageParam, userId, search, startDate, endDate, ...(tab === "issues" ? { issue: true } : {}) },
  });
  if (!Array.isArray(response.data?.data)) throw new Error("Invalid attendance response. Please retry.");
  return response.data;
};

export const approveAttendance = async (id: string) => {
  if (!id) throw new Error("Missing attendance ID");
  return (await axiosInstance.post(`/api/hrms/att/approve-attendance/${id}`)).data;
};
