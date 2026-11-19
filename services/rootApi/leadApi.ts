import { fetchPreparedLeads } from "../../utils/todayTasksPreparation";
import { readLeadData } from "../../utils/leadReadRetry";
import { isCancel } from "axios";
import type { LeadRequestTiming } from "../../utils/leadSavePerformance";
import { err } from "react-native-svg/lib/typescript/xml";
import { axiosInstance } from "../authApi/axiosInstance";
import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { popupModal2 } from "../../utils/toastFunction";
import { queryKeyCRM } from "../../utils/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
let a = {
  // clientEmail: "danish@gmail.com",
  // clientMobile: "91-1234567890",
  // clientName: "danish",
  // name: "javed",
  type: "calling_data",
  // whatsapp: "https://wa.me/1234567890",
  srManager: "654cd54188f83cd465c9e39d",
};

export const addLead = (data, toast) => {
  return (
    axiosInstance
      .post("/api/lead", data)
      // .then((res) => res?.data)
      .then((res) => {
        // popUpConfToast.successMessage(res?.data)
        return res?.data;
      })
      .catch((err) => {
        myConsole("errUpdateCasessss", err?.response?.data);
        throw err?.response?.data || new Error("Request failed");
        // popUpConfToast.errorMessage('Server error')
      })
  );
};

export const createLeadFromCalling = (data) => {
  return axiosInstance
    .post("/api/lead/create/v2", data)
    .then((res) => res?.data)
    .catch((err) => {
      myConsole("createLeadFromCallingErr", err?.response?.data);

      throw err?.response?.data || new Error("Request failed");
    });
};

export const updateLead = ({ id, data }, toast) => {
  return (
    axiosInstance
      .put(`/api/lead/leadUpdateById/${id}`, data)
      // .then((res) => res?.data)
      .then((res) => {
        // popUpConfToast.successMessage(res?.data)
        return res?.data;
      })
      .catch((err) => {
        myConsole("errUpdateCaseerre", err?.response?.data);
        throw err?.response?.data || new Error("Request failed");
      })
  );
};

export const deleteLead = (data: [string]) => {
  return (
    axiosInstance
      .post("/api/lead/deleteLeadsByIds", data)
      // .then((res) => res)
      .then((res) => {
        // popUpConfToast.successMessage(res?.data);
        return res?.data;
      })
      .catch((err) => {
        myConsole("errUpdateCase", err?.response?.data);
        // popUpConfToast.errorMessage("Server error");
      })
  );
};

export const leadStatusUpdate = ({ id, data, timing }: { id: string; data: any; timing?: LeadRequestTiming }) => {
  return (
    axiosInstance
      .post(`/api/lead/statusUpdateById/${id}`, data, { leadSaveTiming: timing })
      // .then((res) => res)
      .then((res) => {
        // popUpConfToast.successMessage(res?.data)
        return res?.data;
      })
      .catch((err) => {
        throw err;
        // myConsole('errUpdateCase', err?.response?.data)
        // popUpConfToast.errorMessage('Server error')
      })
  );
};

export const leadAssignById = (data: any) => {
  return axiosInstance.put(`/api/lead/leadAssignById`, data);
};

export const leadCallTrack = ({ id, data }: any) => {
  return axiosInstance.post(`/api/lead/updateCallLogById/${id}`, data);
};

export const getLeadDetailById = (id: string, summary = false) => {
  return axiosInstance
    .get(`/api/lead/getLeadById/${id}`, { params: summary ? { view: "summary" } : undefined })
    .then((res) => res?.data);
};

export const searchLeadOptions = async ({
  search = "",
  pageParam = 1,
  limit = 20,
  individual,
  signal,
}: {
  search?: string;
  pageParam?: number;
  limit?: number;
  individual?: boolean;
  signal?: AbortSignal;
}) => {
  const response = await axiosInstance.get("/api/lead/search-options", {
    params: {
      search,
      page: pageParam,
      limit,
      ...(individual && { individual: true }),
    },
    signal,
  });
  return response.data;
};

export const getLeadFolders = (type = "lead", signal?: AbortSignal) =>
  readLeadData("folders", () => axiosInstance.get("/api/lead/folders", { params: { type }, signal }), signal)
    .then((res) => res?.data?.data || []);

export const createLeadFolder = (data: { name: string; color: string; type?: string }) =>
  axiosInstance.post("/api/lead/folders", data).then((res) => res?.data);

export const updateLeadFolder = (
  folderId: string,
  data: { name?: string; color?: string },
) => axiosInstance.patch(`/api/lead/folders/${folderId}`, data).then((res) => res?.data);

export const deleteLeadFolder = (folderId: string) =>
  axiosInstance.delete(`/api/lead/folders/${folderId}`).then((res) => res?.data);

export const addLeadsToFolder = (folderId: string, leadIds: string[]) =>
  axiosInstance.post(`/api/lead/folders/${folderId}/leads`, { leadIds }).then((res) => res?.data);

export const removeLeadsFromFolder = (folderId: string, leadIds: string[]) =>
  axiosInstance.delete(`/api/lead/folders/${folderId}/leads`, { data: { leadIds } }).then((res) => res?.data);

export const getLead = async ({
  search = null,
  pageParam = 1,
  type = "lead",
  limit = 20,
  status,
  individual,
  pagination = true,
  srManager,
  manager,
  assistantManager,
  teamLead,
  agent,
  startDate,
  endDate,
  skipType,
  dateKey,
  source,
  projectId,
  teamId,
  folderId,
  signal = undefined as AbortSignal | undefined,
}) => {
  try {
    const request = {
      params: {
        page: pageParam,
        search,
        type,
        ...(limit && { limit }),
        ...(status && { status }),
        ...(individual && { individual }),
        ...(pagination && { pagination }),
        ...(srManager && { srManager }),
        ...(manager && { manager }),
        ...(assistantManager && { assistantManager }),
        ...(teamLead && { teamLead }),
        ...(agent && { agent }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(skipType && { skipType }),
        ...(dateKey && { dateKey }),
        ...(source && { source }),
        ...(projectId && { projectId }),
        ...(teamId && { teamId }),
        ...(folderId && { folderId }),
      },
      signal,
    };
    if (folderId === "todays-tasks") return await fetchPreparedLeads(request.params, signal);
    const response = await readLeadData("leads", () => axiosInstance.get("api/lead", request), signal);
    return response.data;
  } catch (err) {
    if (!signal?.aborted && !isCancel(err) && (err as any)?.name !== "AbortError") {
      console.log("getLeadErrPag", err);
    }
    throw err;
  }
};

export const getLeadPool = async ({
  pageParam = 1,
  search = "",
  type = "lead",
  limit = 10,
  pagination = true,
}) => {
  try {
    const response = await axiosInstance.get("api/lead/leadPoolList", {
      params: {
        page: pageParam,
        search,
        type,
        limit: limit,
        pagination: pagination,
      },
    });
    return response.data;
  } catch (err) {
    console.log("getLeadPoolErr", err);
  }
};

export const assigningUser = ({ srManager = null, search = null }) => {
  console.log("srManager@@#", srManager);
  return axiosInstance
    .get("api/user/assigningUsers", {
      params: {
        srManager,
        search,
      },
    })
    .then((res) => {
      return res?.data;
    })
    .catch((err) => {
      myConsole("assigningUserErr", err?.response?.data);
      throw new Error(err);
    });
};

export const addLeadNote = ({ id, note }) => {
  return axiosInstance
    .post(`/api/lead/addNotes/${id}`, { note })
    .then((res) => res?.data)
    .catch((err) => {
      myConsole("errUpdateCase", err?.response?.data);
      throw new Error(err);
    });
};

export const getUserInfoLeadDeatil = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/api/lead/getAssignedHistory/${id}`);
    return res?.data?.data || [];
  } catch (err) {
    myConsole("userInfoErr", err);
  }
};

export const getLogsInfoLeadDeatil = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/api/lead/getStatusHistory/${id}`);
    return res?.data?.data || [];
  } catch (err) {
    myConsole("userInfoErr", err);
  }
};

export const claimLead = async (id: string) => {
  try {
    popupModal2.wantLoading("Do yo want to claim!");
    const res = await axiosInstance.post(`/api/lead/claimLead/${id}`);
    popUpConfToast.successMessage(res?.data?.message || "Claimed Succefully");
    return res?.data?.data || [];
  } catch (err) {
    popUpConfToast.errorMessage(err?.response?.data || "Something went wrong");
    myConsole("claimLeadErr", err?.response?.data);
  }
};
export const deleteLeadsByIds = async (ids: string[]) => {
  try {
    popupModal2.wantLoading();
    const res = await axiosInstance.post(`/api/lead/deleteLeadsByIds`, ids);
    popUpConfToast.successMessage(res?.data?.message || "Deleted Successfully");
    return res?.data?.data || [];
  } catch (err) {
    popUpConfToast.errorMessage(err?.response?.data || "Something went wrong");
    // myConsole('claimLeadErr', err?.response?.data)
    myConsole("err", err);
  }
};
// claimLead

const fetchLatestMeetings = async (id) => {
  try {
    const res = await axiosInstance.get(`/api/meeting/getLatestMeetings/${id}`);
    return {
      meetings: res?.data?.data || [],
      totalMeetings:
        res?.data?.totalMeetings ?? res?.data?.data?.length ?? 0,
    };
  } catch (err) {
    throw err;
  }
};

export const useLatestMeetings = (id) => {
  const { user } = useSelector(selectUser);
  return useQuery({
    queryKey: ["latestMeetings", id, user?._id],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: () => fetchLatestMeetings(id),
    enabled: !!id, // Prevents query from running if id is not provided
  });
};
