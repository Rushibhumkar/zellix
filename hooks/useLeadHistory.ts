import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/authApi/axiosInstance";
export function useLeadHistory(leadId: string, userId: string, section: string, enabled: boolean, updatedAt?: string) {
  const pageSize = section === "notes" ? 10 : 30;
  const query = useInfiniteQuery({
    queryKey: ["leadHistory", leadId, userId, section, updatedAt, pageSize],
    initialPageParam: 1,
    enabled: Boolean(leadId && userId && enabled),
    queryFn: ({
      pageParam,
      signal
    }) => axiosInstance.get(`/api/lead/${leadId}/history/${section}`, {
      params: {
        page: pageParam,
        ...(section === "notes" ? { limit: pageSize } : {}),
      },
      signal
    }).then(response => response.data),
    getNextPageParam: page => page.nextPage ?? undefined
  });
  return {
    ...query,
    items: query.data?.pages.flatMap(page => page.data || []) || []
  };
}
