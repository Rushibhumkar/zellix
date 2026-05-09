import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getProjectById,
  getProjectList,
} from "../../../services/rootApi/projectApi";
import { myConsole } from "../../../hooks/useConsole";
import { axiosInstance } from "../../../services/authApi/axiosInstance";

export const useGetProjectList = ({ search }: any) => {
  const res = useInfiniteQuery({
    queryKey: ["getProjectList", search],

    queryFn: ({ pageParam = 1 }) =>
      getProjectList({
        pageParam,
        search,
        limit: 20,
        pagination: true,
      }),

    getNextPageParam: (lastPage) => {
      const current = Number(lastPage?.pagination?.currentPage || 1);
      return lastPage?.pagination?.hasNext ? current + 1 : undefined;
    },

    initialPageParam: 1,
  });

  // ✅ FIX: since API now returns { data: [], pagination: {} }
  const data = res?.data?.pages?.flatMap((page) => page?.data || []) || [];

  // ✅ ADD: total count
  const totalCount = res?.data?.pages?.[0]?.pagination?.totalItem || 0;

  return { ...res, data, totalCount };
};

export const useGetProjectById = (id) => {
  let res = useQuery({
    queryKey: ["getProjectById", id],
    queryFn: async () => await getProjectById(id),
    staleTime: Infinity,
    enabled: !!id,
  });
  return res?.data || {};
};

export const useGetApproveUser = ({ search = "" }) => {
  let res = useInfiniteQuery({
    queryKey: ["useGetApproveUser", search],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const resTemp = await axiosInstance.get("/api/hrms/user", {
          params: {
            page: pageParam,
            search,
            status: "approved",
          },
        });
        return resTemp?.data;
      } catch (err) {
        myConsole("errUserApprove", err);
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // myConsole("lastPage", lastPage);
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage?.pagination?.currentPage) + 1
        : undefined;
    },
  });

  let data = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  return { ...res, data };
};
