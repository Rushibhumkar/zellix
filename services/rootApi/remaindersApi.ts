import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
  limit,
}: {
  filter: "upcoming" | "missed" | "completed";
  limit: number;
}) => {
  return useInfiniteQuery({
    queryKey: ["all-reminders", filter],
    queryFn: ({ pageParam = 1 }: { pageParam: number }) =>
      getAllReminders({
        filter,
        page: pageParam,
        limit,
      }),

    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page || 1;

      const totalPages = lastPage?.pagination?.totalPages || 1;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },

    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
