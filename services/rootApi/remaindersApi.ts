import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../authApi/axiosInstance";

/* =========================
   API FUNCTION
========================= */

export const getAllReminders = async ({
  filter = "upcoming",
  page = 1,
  limit = 10,
}: {
  filter?: "upcoming" | "missed" | "completed";
  page?: number;
  limit?: number;
}) => {
  const res = await axiosInstance.get(
    `/api/reminders?filter=${filter}&page=${page}&limit=${limit}`,
  );
  return res?.data;
};

/* =========================
   REACT QUERY HOOK
========================= */

export const useGetAllReminders = ({
  filter,
  page,
  limit,
}: {
  filter: "upcoming" | "missed" | "completed";
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["all-reminders", filter, page, limit],
    queryFn: () => getAllReminders({ filter, page, limit }),
    keepPreviousData: true, // pagination smooth
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const deleteReminder = async (id: string) => {
  const res = await axiosInstance.patch(`/api/reminders/${id}/delete`);
  return res?.data;
};

export const markReminderAsCompleted = async (id: string) => {
  const res = await axiosInstance.patch(`/api/reminders/${id}/complete`);
  return res?.data;
};
