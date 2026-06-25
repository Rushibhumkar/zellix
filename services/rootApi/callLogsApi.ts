import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../authApi/axiosInstance";
import { myConsole } from "../../hooks/useConsole";

/* ------------------ CREATE CALL LOG ------------------ */

export interface TCreateCallLog {
  userId: string;
  leadId: string;
  type: "not_connected" | "positive" | "negative" | "connected";
  initiatedAt: string; // ISO string
  finishedAt: string; // ISO string
  leadStatusAfterCall: string;
}

export const createCallLog = (data: TCreateCallLog) =>
  axiosInstance.post("/api/call-logs/", data).then((res) => res?.data);

/* ------------------ GET CALL LOGS (PAGINATED) ------------------ */

export const getLeadCallLogs = async ({
  pageParam = 1,
  leadId,
}: {
  pageParam?: number;
  leadId: string;
}) => {
  const res = await axiosInstance.get(`/lead/${leadId}`, {
    params: {
      page: pageParam,
      limit: 10,
    },
  });

  return res?.data;
};

/* ------------------ INFINITE QUERY ------------------ */

export const useLeadCallLogs = (leadId: string) => {
  return useInfiniteQuery({
    queryKey: ["callLogs", leadId],

    queryFn: ({ pageParam = 1 }) => getLeadCallLogs({ pageParam, leadId }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      // ✅ HANDLE BOTH CASES

      // case 1: backend gives nextPage
      if (lastPage?.nextPage) return lastPage.nextPage;

      // case 2: backend gives page + totalPages
      if (lastPage?.page && lastPage?.totalPages) {
        return lastPage.page < lastPage.totalPages
          ? lastPage.page + 1
          : undefined;
      }

      // fallback
      return undefined;
    },

    enabled: !!leadId, // ✅ prevent unnecessary calls
  });
};

export const getCallLogsByUserId = async ({
  pageParam = 1,
  userId,
}: {
  pageParam?: number;
  userId: string;
}) => {
  try {
    myConsole("REQUEST URL =>", `/api/call-logs/user/${userId}`);
    myConsole("REQUEST USER ID =>", userId);

    const response = await axiosInstance.get(`/api/call-logs/user/${userId}`, {
      params: {
        page: pageParam,
        limit: 10,
      },
    });

    myConsole("API SUCCESS =>", response.data);

    return response.data;
  } catch (error: any) {
    console.log("FULL ERROR RESPONSE =>", error?.response?.data);

    myConsole("API ERROR =>", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
      url: error?.config?.url,
    });

    throw error;
  }
};

export const useCallLogsByUserId = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ["callLogsByUserId", userId],

    queryFn: ({ pageParam = 1 }) =>
      getCallLogsByUserId({
        pageParam,
        userId,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;

      if (!pagination?.hasNextPage) {
        return undefined;
      }

      return pagination.page + 1;
    },

    enabled: !!userId,

    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
