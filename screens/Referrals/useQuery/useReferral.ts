import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAllReferrals,
  getReferralById,
} from "../../../services/rootApi/referralApi";
import { myConsole } from "../../../hooks/useConsole";

// ✅ 1. Get All Referrals (infinite list)
export const useGetAllReferrals = ({ search = "" }) => {
  const res = useInfiniteQuery({
    queryKey: ["getAllReferrals", search],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const result = await getAllReferrals(); // 🔥 No refferal_id here
        return result;
      } catch (err) {
        myConsole("getAllReferralsErr", err);
      }
    },
    getNextPageParam: (lastPage) => {
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

export const useGetReferralById = (id: string) => {
  const res = useQuery({
    queryKey: ["getReferralById", id],
    queryFn: async () => await getReferralById({ id }), // Fix here
    staleTime: Infinity,
    enabled: !!id,
  });

  return res?.data || {};
};
