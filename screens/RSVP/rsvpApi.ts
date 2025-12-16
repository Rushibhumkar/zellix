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
