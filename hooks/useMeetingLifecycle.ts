import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/authApi/axiosInstance";
import { existingOpenMeetingId, meetingId } from "../utils/meetingLifecycle";

export const useExistingMeetingForLead = (leadId: string, userId: string, eligibility: any, enabled = true) => useQuery({
  queryKey: ["existingOpenMeeting", userId, leadId, meetingId(eligibility?.responsible)],
  enabled: Boolean(enabled && leadId && userId && eligibility?.allowed === false && !eligibility?.meetingId),
  queryFn: async ({ signal }) => {
    const { data } = await axiosInstance.get(`/api/meeting/getLatestMeetings/${leadId}`, { signal });
    return existingOpenMeetingId(Array.isArray(data?.data) ? data.data : [], leadId, eligibility?.responsible);
  },
  staleTime: 0,
  refetchOnMount: "always",
  retry: (count, error: any) => ![401, 403, 404].includes(error?.response?.status) && count < 2,
});

export const useMeetingEligibility = (leadId: string, userId: string, enabled = true) => useQuery({
  queryKey: ["meetingEligibility", userId, leadId],
  enabled: Boolean(leadId && userId && enabled),
  queryFn: async ({ signal }) => (await axiosInstance.get(`/api/meeting/eligibility/${leadId}`, { signal })).data,
  staleTime: 0,
});
export const useMeetingMemberOptions = (userId: string) => useQuery({
  queryKey: ["meetingMemberOptions", userId],
  enabled: Boolean(userId),
  queryFn: async ({ signal }) => (await axiosInstance.get("/api/meeting/member-options", { signal })).data.data || [],
  staleTime: 0,
});
