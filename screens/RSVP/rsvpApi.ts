import { myConsole } from "../../hooks/useConsole";

// -------------------------------
// GET ALL RSVP INVITATION LIST
// WITH PAGINATION / INFINITE SCROLL
// -------------------------------
export const getRSVPInvitations = async ({
  pageParam = 1,
  limit = 20,
  search = "",
}) => {
  try {
    const response = await axiosInstance.get("/api/invitation", {
      params: {
        page: pageParam,
        limit,
        search,
      },
    });

    return response.data;
  } catch (err) {
    myConsole("getRSVPInvitationsErr", err?.response?.data || err);
    throw err;
  }
};

// -------------------------------
// INFINITE QUERY HOOK
// -------------------------------
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../services/authApi/axiosInstance";

export const useRSVPInvitations = ({ search = "" }) => {
  return useInfiniteQuery({
    queryKey: ["rsvpInvitations", search],
    queryFn: ({ pageParam = 1 }) => getRSVPInvitations({ pageParam, search }),

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;

      const { currentPage, totalPages } = lastPage.pagination;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

// GET ALL RSVP MANAGERS LIST

export const getRSVPEventsList = async ({
  pageParam = 1,
  limit = 20,
  search = "",
}) => {
  try {
    const response = await axiosInstance.get("/api/event", {
      params: {
        page: pageParam,
        limit,
        search,
      },
    });

    return response.data;
  } catch (err) {
    myConsole("getRSVPEventErr", err?.response?.data || err);
    throw err;
  }
};

export const useRSVPEventsList = ({ search = "" }) => {
  return useInfiniteQuery({
    queryKey: ["rsvpEventsList", search],
    queryFn: ({ pageParam = 1 }) => getRSVPEventsList({ pageParam, search }),

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;

      const { currentPage, totalPages } = lastPage.pagination;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

export const useRSVPEventOptions = () => {
  return useQuery({
    queryKey: ["rsvpEventOptions"],
    queryFn: () => getRSVPEventsList({ pageParam: 1, limit: 1000 }),
  });
};

export const getRSVPEventAgents = async ({
  eventId,
  pageParam = 1,
  limit = 20,
  search = "",
}: any) => {
  const response = await axiosInstance.get(`/api/event/${eventId}/agents`, {
    params: { page: pageParam, limit, search },
  });
  return response.data;
};

export const useRSVPEventAgents = ({ eventId, search = "" }: any) => {
  return useInfiniteQuery({
    queryKey: ["rsvpEventAgents", eventId, search],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      getRSVPEventAgents({ eventId, pageParam, search }),
    enabled: Boolean(eventId),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage?.pagination || {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

export const getRSVPEventClients = async ({
  eventId,
  agentId,
  pageParam = 1,
  limit = 20,
  search = "",
}: any) => {
  const response = await axiosInstance.get(`/api/event/${eventId}/clients`, {
    params: { page: pageParam, limit, search, ...(agentId ? { agentId } : {}) },
  });
  return response.data;
};

export const useRSVPEventClients = ({ eventId, agentId, search = "" }: any) => {
  return useInfiniteQuery({
    queryKey: ["rsvpEventClients", eventId, agentId, search],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      getRSVPEventClients({ eventId, agentId, pageParam, search }),
    enabled: Boolean(eventId),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage?.pagination || {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

export const sendRSVPForEventLead = async ({ eventId, eventLeadId }: any) => {
  const response = await axiosInstance.post(
    `/api/event/${eventId}/leads/${eventLeadId}/rsvp`,
  );
  return response.data;
};

export const checkInRSVPEventLead = async ({ eventId, eventLeadId }: any) => {
  const response = await axiosInstance.patch(
    `/api/event/${eventId}/leads/${eventLeadId}/check-in`,
  );
  return response.data;
};

export const updateRSVPEventLeadStatus = async ({
  eventId,
  eventLeadId,
  ...status
}: any) => {
  const response = await axiosInstance.patch(
    `/api/event/${eventId}/leads/${eventLeadId}/status`,
    status,
  );
  return response.data;
};

export const getRSVPInvitationDetails = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/api/invitation/details/${id}`);
    return res.data?.data;
  } catch (err) {
    myConsole("getRSVPInvitationDetailsErr", err?.response?.data || err);
    throw err;
  }
};

export const useRSVPInvitationDetails = (id: string) => {
  return useQuery({
    queryKey: ["rsvpInvitationDetails", id],
    queryFn: () => getRSVPInvitationDetails(id),
    enabled: !!id,
  });
};

export const getRSVPEventDetails = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/api/event/details/${id}`);
    return res.data?.data;
  } catch (err) {
    myConsole("getRSVPEventDetailsErr", err?.response?.data || err);
    throw err;
  }
};

export const useRSVPEventDetails = (id: string) => {
  return useQuery({
    queryKey: ["rsvpEventDetails", id],
    queryFn: () => getRSVPEventDetails(id),
    enabled: !!id,
  });
};

export const sendInvitationRsvp = async (payload: any) => {
  return axiosInstance.post("/api/invitation", payload);
};

export const addEventRsvp = async (payload: any) => {
  return axiosInstance.post("/api/event", payload);
};

export const deleteInvitations = async (ids: string[]) => {
  try {
    const res = await axiosInstance.post("/api/invitation/delete", { ids });
    return res.data;
  } catch (err) {
    myConsole("deleteInvitationsErr", err?.response?.data || err);
    throw err;
  }
};

export const deleteEvents = async (ids: string[]) => {
  try {
    const res = await axiosInstance.post("/api/event/delete", {
      eventIds: ids,
    });
    return res.data;
  } catch (err) {
    myConsole("deleteEventsErr", err?.response?.data || err);
    throw err;
  }
};

export const updateEventRsvp = async (id: string, payload: any) => {
  try {
    const res = await axiosInstance.put(`/api/event/${id}`, payload);
    return res.data;
  } catch (err) {
    myConsole("updateEventErr", err?.response?.data || err);
    throw err;
  }
};
