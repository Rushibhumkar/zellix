import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { selectUser } from "../redux/userSlice";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { retryLeadRead } from "../utils/leadReadRetry";
import { effectiveLeadLimit, nextLeadPage } from "../utils/leadPagination";
import {
  assigningUser,
  getLead,
  getLeadDetailById,
  searchLeadOptions,
  getLeadPool,
  getLogsInfoLeadDeatil,
  getUserInfoLeadDeatil,
} from "../services/rootApi/leadApi";
import {
  getMeeting,
  getMeetingById,
  getMeetingForBooking,
} from "../services/rootApi/meetingApi";
import { getBooking, getBookingById } from "../services/rootApi/bookingApi";
import { myConsole } from "./useConsole";
import {
  getAppSettings,
  getBookingCount,
  getCallingDataQuality,
  getCommissionCount,
  getDashboardCount,
  getMeetingCount,
} from "../services/rootApi/api";
import { getAllDevelopers } from "../services/rootApi/developerApi";
import {
  getLeadQuality,
  getClosingLeadProjectWise,
  getLeadProjectWise,
} from "../services/rootApi/api";

export const useGetLeadPool = ({ search }) => {
  let res = useInfiniteQuery({
    queryKey: ["getLeadPool", search],
    queryFn: ({ pageParam = 1 }) =>
      getLeadPool({
        pageParam,
        search,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.hasNext
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

export const useGetLead = ({
  search,
  type,
  limit,
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
  projectId,
  source,
  teamId,
  folderId,
  comingSoon = false,
}) => {
  const { user } = useSelector(selectUser);
  const focused = useIsFocused();
  // return useQuery({
  //     queryKey: ['getLead'],
  //     queryFn: () => getLead(),
  //     staleTime: Infinity,
  //     // enabled: !!type
  // })
  let res = useInfiniteQuery({
    queryKey: [
      "getLead",
      search,
      type,
      limit,
      status,
      individual,
      pagination,
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
      folderId === "todays-tasks" ? user?._id : undefined,
    ],
    enabled: focused && Boolean(user?._id) && !comingSoon,
    refetchInterval: focused && !comingSoon && folderId === "todays-tasks" ? 60_000 : false,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, signal }) =>
      getLead({
        signal,
        search,
        pageParam,
        type,
        limit,
        status,
        individual,
        pagination,
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
      }),
    getNextPageParam: nextLeadPage,
    retry: retryLeadRead,
  });
  // console.log("🟡 useGetLead res.data.pages:", res?.data?.pages);
  // console.log("🟠 FIRST PAGE KEYS:", Object.keys(res?.data?.pages?.[0] ?? {}));
  // console.log("🔵 pagination object:", res?.data?.pages?.[0]?.pagination);
  let data = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  const totalCount = res?.data?.pages?.[0]?.pagination?.totalItem ?? null;

  return { ...res, data, totalCount, effectiveLimit: effectiveLeadLimit(res.data?.pages?.[0]) };
};
export const useGetLeadInAddMeeting = ({
  search,
  individual = false,
}) => {
  // return useQuery({
  //     queryKey: ['getLead'],
  //     queryFn: () => getLead(),
  //     staleTime: Infinity,
  //     // enabled: !!type
  // })
  let res = useInfiniteQuery({
    queryKey: ["getLeadInAddMeeting", search, individual],
    queryFn: ({ pageParam = 1, signal }) =>
      searchLeadOptions({
        search,
        pageParam,
        limit: 20,
        individual,
        signal,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.hasNext
        ? parseInt(lastPage?.pagination?.currentPage) + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });
  const flattened = res?.data?.pages?.flatMap((page) => page?.data || []) || [];
  const data = Array.from(
    new Map(flattened.map((lead) => [lead?._id, lead])).values(),
  );
  return { ...res, data };
};

export const useGetLeadById = (id, summary = false) => {
  const { user } = useSelector(selectUser);
  let res = useQuery({
    queryKey: ["getLeadDetailById", id, user?._id, summary],
    queryFn: () => getLeadDetailById(id, summary),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!id,
  });
  return res;
};

export const useGetUserInfoInLeadDetail = (id) => {
  const { user } = useSelector(selectUser);
  let res = useQuery({
    queryKey: ["getUserInfoLeadDeatil", id, user?._id],
    queryFn: async () => await getUserInfoLeadDeatil(id),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!id,
  });
  return res;
};

export const useGetLogsInfoInLeadDetail = (id) => {
  const { user } = useSelector(selectUser);
  let res = useQuery({
    queryKey: ["getLogsInfoLeadDeatil", id, user?._id],
    queryFn: () => getLogsInfoLeadDeatil(id),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!id,
  });
  return res;
};

// getMeeting
export const useGetMeeting = ({
  search,
  limit,
  status,
  pagination = true,
  srManager,
  manager,
  assistantManager,
  teamLead,
  agent,
  startDate,
  endDate,
}) => {
  // return useQuery({
  //     queryKey: ['getLead'],
  //     queryFn: () => getLead(),
  //     staleTime: Infinity,
  //     // enabled: !!type
  // })
  let res = useInfiniteQuery({
    queryKey: [
      "getMeeting",
      search,
      limit,
      status,
      pagination,
      srManager,
      manager,
      assistantManager,
      teamLead,
      agent,
      startDate,
      endDate,
    ],
    queryFn: ({ pageParam = 1 }) =>
      getMeeting({
        search,
        pageParam,
        limit,
        status,
        pagination,
        srManager,
        manager,
        assistantManager,
        teamLead,
        agent,
        startDate,
        endDate,
      }),
    initialPageParam: 1,
    refetchOnMount: "always",
    retry: (count, error: any) => ![401, 403, 404].includes(error?.response?.status) && count < 2,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.hasNext
        ? parseInt(lastPage?.pagination?.currentPage) + 1
        : undefined;
    },
  });
  let data = [];
  if (res) {
    data = res?.data?.pages?.flatMap((page) => Array.isArray(page?.data) ? page.data : []) || [];
  }
  const totalCount = res?.data?.pages?.[0]?.pagination?.totalItem ?? null;
  return { ...res, data, totalCount };
};

export const useGetMeetingById = (id) => {
  const { user } = useSelector(selectUser);
  let res = useQuery({
    queryKey: ["getMeetingById", id, user?._id],
    queryFn: () => getMeetingById(id),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!id,
  });
  return res;
};

//getBooking
export const useGetBooking = ({
  search,
  limit,
  status,
  pagination = true,
  type,
  name,
  startDate,
  endDate,
  srManager,
  manager,
  assistantManager,
  teamLead,
  agent,
  clientName,
  clientMobile,
  clientEmail,
  relationshipManager,
  projectName,
  inputStatus,
  developer,
  paymentStatus,
  paymentMode,
  token,
  businessStatus,
  asOf = "",
  teamId = "",
  reportMetric = "",
}) => {
  const { user } = useSelector(selectUser);
  // return useQuery({
  //     queryKey: ['getLead'],
  //     queryFn: () => getLead(),
  //     staleTime: Infinity,
  //     // enabled: !!type
  // })
  let res = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [
      "getBooking",
      user?._id,
      search,
      limit,
      status,
      (pagination = true),
      type,
      name,
      startDate,
      endDate,
      srManager,
      manager,
      assistantManager,
      teamLead,
      agent,
      clientName,
      clientMobile,
      clientEmail,
      relationshipManager,
      projectName,
      inputStatus,
      developer,
      paymentStatus,
      paymentMode,
      token,
      businessStatus,
      asOf,
      teamId,
      reportMetric,
    ],
    queryFn: ({ pageParam = 1 }) =>
      getBooking({
        search,
        pageParam,
        limit,
        status,
        pagination,
        type,
        name,
        startDate,
        endDate,
        srManager,
        manager,
        assistantManager,
        teamLead,
        agent,
        clientName,
        clientMobile,
        clientEmail,
        relationshipManager,
        projectName,
        inputStatus,
        developer,
        paymentStatus,
        paymentMode,
        token,
        businessStatus,
      asOf,
      teamId,
      reportMetric,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.hasNext
        ? parseInt(lastPage?.pagination?.currentPage) + 1
        : undefined;
    },
  });
  let data = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  const totalCount = res?.data?.pages?.[0]?.pagination?.totalItem ?? null;
  return { ...res, data, totalCount };
};
// getBookingById
export const useGetBookingById = (id) => {
  const { user } = useSelector(selectUser);
  let res = useQuery({
    queryKey: ["getBookingById", id, user?._id],
    queryFn: () => getBookingById(id),
    staleTime: Infinity,
    enabled: !!id,
  });
  return res;
};

export const useGetMeetingForBooking = ({ search }) => {
  const { user } = useSelector(selectUser);
  let res = useInfiniteQuery({
    queryKey: ["getMeetingForBooking", search, user?._id],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      getMeetingForBooking({
        search,
        pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.hasNext
        ? parseInt(lastPage?.pagination?.currentPage) + 1
        : undefined;
    },
  });
  let data = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
    // data = res?.data?.pages?.map(page =>
    //     // page?.data
    //     page?.data?.map((el) => {
    //         return {
    //             ...el,
    //             name: `${el?.lead?.clientName}  (${el?.clientAddress})`
    //         }
    //     })
    // ).flat()
  }
  return { ...res, data };
};

export const useAssigningUser = ({ srManager }) => {
  let res = useQuery({
    queryKey: ["assigningUser", srManager],
    queryFn: () =>
      assigningUser({
        srManager,
      }),
    staleTime: Infinity,
    // enabled: !!srManager,
  });
  return res;
};

export const useGetDashboardCount = () => {
  let res = useQuery({
    queryKey: ["getDashboardCount"],
    queryFn: () => getDashboardCount(),
    staleTime: Infinity,
  });
  return res;
};
export const useGetBookingCount = () => {
  let res = useQuery({
    queryKey: ["getBookingCount"],
    queryFn: () => getBookingCount(),
    staleTime: Infinity,
  });
  return res;
};
export const useGetMeetingCount = () => {
  let res = useQuery({
    queryKey: ["getMeetingCount"],
    queryFn: () => getMeetingCount(),
    staleTime: Infinity,
  });
  return res;
};

// api/booking/getCommissionData
export const useGetCommissionCount = () => {
  let res = useQuery({
    queryKey: ["getCommissionCount"],
    queryFn: () => getCommissionCount(),
    staleTime: Infinity,
  });
  return res;
};

export const useGetDeveloperList = () => {
  let res = useQuery({
    queryKey: ["getAllDevelopers"],
    queryFn: () => getAllDevelopers(),
    staleTime: Infinity,
  });
  return res;
};

export const useGetLeadQuality = (startDate, endDate) => {
  let res = useQuery({
    queryKey: ["getLeadQuality", startDate, endDate],
    queryFn: () => getLeadQuality(startDate, endDate),
    staleTime: Infinity,
    enabled: !!startDate && !!endDate,
  });
  return res;
};

export const useGetCallingDataQuality = (startDate, endDate) => {
  return useQuery({
    queryKey: ["getCallingDataQuality", startDate, endDate],
    queryFn: () => getCallingDataQuality(startDate, endDate),
    staleTime: Infinity,
    enabled: !!startDate && !!endDate,
  });
};

export const useGetLeadProjectWise = (startDate, endDate) => {
  let res = useQuery({
    queryKey: ["getLeadProjectWise", startDate, endDate],
    queryFn: () => getLeadProjectWise(startDate, endDate),
    staleTime: Infinity,
    enabled: !!startDate && !!endDate,
  });
  return res;
};

export const useGetClosingLeadProjectWise = (startDate, endDate) => {
  let res = useQuery({
    queryKey: ["getClosingLeadProjectWise", startDate, endDate],
    queryFn: () => getClosingLeadProjectWise(startDate, endDate),
    staleTime: Infinity,
    enabled: !!startDate && !!endDate,
  });
  return res;
};

export const useGetAppSettings = () => {
  return useQuery({
    queryKey: ["getAppSettings"],
    queryFn: () => getAppSettings().then((res) => res?.data),

    staleTime: 5 * 60 * 1000, // 5 min — settings don't change often
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
