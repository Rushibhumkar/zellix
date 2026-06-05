import { axiosInstance } from "../authApi/axiosInstance";
import { myConsole } from "../../hooks/useConsole";
import { useInfiniteQuery } from "@tanstack/react-query";

export const initiateCall = async ({ leadId }: { leadId: string }) => {
  try {
    if (!leadId) {
      throw new Error("Lead ID is required");
    }

    const res = await axiosInstance.post("/api/call", {
      leadId,
    });

    return res?.data;
  } catch (err: any) {
    myConsole("initiateCallErr", err?.response?.data || err);

    throw err?.response?.data || new Error("Call API failed");
  }
};

export const getMyCallLogs = async ({
  pageParam = 1,
  limit = 22,
}: {
  pageParam?: number;
  limit?: number;
}) => {
  const res = await axiosInstance.get("/api/call-logs/mylogs", {
    params: {
      page: pageParam,
      limit,
    },
  });

  return res?.data;
};

export const useGetMyCallLogs = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["getMyCallLogs", limit],

    queryFn: ({ pageParam = 1 }) =>
      getMyCallLogs({
        pageParam,
        limit,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;

      const logs =
        lastPage?.data || lastPage?.results || lastPage?.callLogs || [];

      return logs.length < limit ? undefined : currentPage + 1;
    },

    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};
