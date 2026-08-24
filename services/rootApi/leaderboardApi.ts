import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../authApi/axiosInstance";

export type LeaderboardPeriod = "today" | "week" | "month" | "custom";

export interface LeaderboardFilters {
  period: LeaderboardPeriod;
  role: string;
  startDate?: string;
  endDate?: string;
  teamId?: string;
}

export const getLeaderboard = async (filters: LeaderboardFilters) => {
  const response = await axiosInstance.get("/api/leaderboard", {
    params: {
      ...filters,
      limit: 50,
    },
  });

  return response.data;
};

export const useGetLeaderboard = (filters: LeaderboardFilters) =>
  useQuery({
    queryKey: [
      "leaderboard",
      filters.period,
      filters.role,
      filters.startDate || "",
      filters.endDate || "",
      filters.teamId || "",
    ],
    queryFn: () => getLeaderboard(filters),
    enabled:
      filters.period !== "custom" ||
      (Boolean(filters.startDate) && Boolean(filters.endDate)),
    staleTime: 60 * 1000,
    retry: 1,
  });
