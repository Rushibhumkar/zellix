import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../authApi/axiosInstance";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";

/* =========================
   API FUNCTION
========================= */

export const getAllReminders = async ({
  filter = "upcoming",
  page = 1,
  limit = 10,
  signal,
}: {
  filter?: "upcoming" | "missed" | "completed";
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}) => {
  const res = await axiosInstance.get(
    `/api/reminders?filter=${filter}&page=${page}&limit=${limit}`,
    { signal },
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
  const focused = useIsFocused();
  const { user } = useSelector(selectUser);
  return useInfiniteQuery({
    queryKey: ["all-reminders", filter, user?._id, limit],
    initialPageParam: 1,
    enabled: focused && Boolean(user?._id),
    queryFn: ({ pageParam = 1, signal }) =>
      getAllReminders({
        filter,
        page: pageParam,
        limit,
        signal,
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
