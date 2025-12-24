// services/remainderPopup/remainderPopupApi.ts

import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../authApi/axiosInstance";

/* =========================
   API FUNCTIONS
========================= */

export const getUserReminders = async () => {
  const res = await axiosInstance.get("/api/user-reminder");
  return res?.data;
};

export const markReminderAsRead = async (reminderId: string) => {
  const res = await axiosInstance.post(`/api/user-reminder/read/${reminderId}`);
  return res?.data;
};

/* =========================
   REACT QUERY HOOKS
========================= */

export const useGetUserReminders = () => {
  return useQuery({
    queryKey: ["user-reminders"],
    queryFn: getUserReminders,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 0,
  });
};

export const useMarkReminderAsRead = () => {
  return useMutation({
    mutationFn: (reminderId: string) => markReminderAsRead(reminderId),
  });
};
