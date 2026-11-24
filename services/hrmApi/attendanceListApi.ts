import { axiosInstance } from "../authApi/axiosInstance";
import { AttendanceTab } from "../../utils/attendanceTabs";

export const getAttendanceList = async ({ tab, pageParam = 1, userId = "", search = "", startDate = "", endDate = "", status = "", signal }: {
  tab: AttendanceTab; pageParam?: number; userId?: string; search?: string; startDate?: string; endDate?: string; status?: string; signal?: AbortSignal;
}) => {
  const response = await axiosInstance.get(tab === "unapproved"
    ? "/api/hrms/att/get-notapproved-attendance" : "/api/hrms/att", {
    params: { page: pageParam, userId, search, startDate, endDate, status: status || undefined, ...(tab === "issues" ? { issue: true } : {}) }, signal,
  });
  if (!Array.isArray(response.data?.data)) throw new Error("Invalid attendance response. Please retry.");
  return response.data;
};

export const approveAttendance = async (id: string) => {
  if (!id) throw new Error("Missing attendance ID");
  return (await axiosInstance.post(`/api/hrms/att/approve-attendance/${id}`)).data;
};

export type AttendanceEmployee = {
  _id: string; name?: string; lastName?: string; email?: string; role?: string;
};

export const getAttendanceEmployees = async ({ search = "", pageParam = 1, signal }: {
  search?: string; pageParam?: number; signal?: AbortSignal;
}) => {
  const response = await axiosInstance.get("/api/hrms/att/users", {
    params: { search, page: pageParam, limit: 20 }, signal,
  });
  if (!Array.isArray(response.data?.data)) throw new Error("Unable to load employees.");
  return response.data as {
    data: AttendanceEmployee[];
    pagination: { currentPage: number; totalPage: number };
  };
};
