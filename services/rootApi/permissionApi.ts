import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../authApi/axiosInstance";
import { myConsole } from "../../hooks/useConsole";

const getUsersPermission = async (id: string) => {
  const res = await axiosInstance.get(`api/permission/getPermissionById/${id}`);
  myConsole("PERMISSION API RESPONSE ====>", res?.data);
  return res?.data?.data?.permissions || {};
};

export const useGetUserPermission = (userId: string) => {
  return useQuery({
    queryKey: ["getUserPermission", userId],
    queryFn: () => getUsersPermission(userId),
    enabled: !!userId,
    staleTime: Infinity,
    select: (data) => data || {},
  });
};
