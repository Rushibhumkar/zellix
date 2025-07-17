import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAllCandidates,
  getAllUserHRM,
  getAvailableRoles,
  getCandidateDetails,
  getSrManagers,
  getTeamsBySrManager,
  userDetailHRM,
} from "../services/hrmApi/userHrmApi";
import {
  getAllLeave,
  getLeaveDashboardData,
  getLeaveDetail,
  getTodayLeave,
} from "../services/hrmApi/leaveHrmApi";
import { myConsole } from "./useConsole";
import {
  getDeveloperForCheckInOut,
  getMeetingForCheckInOut,
} from "../services/hrmApi/checkinOutApi";
import {
  getAllAttendance,
  getAttendanceDetail,
  getDashboardAttendance,
  getIssueAttendance,
  getTodayAbsent,
} from "../services/hrmApi/attendanceApi";
import {
  getAgentLeaveCount,
  getAttendanceChart,
  getLeaveChart,
  getUserStatusChart,
} from "../services/hrmApi/graphApi";
import {
  getNotificationHrm,
  getNotificationInCRM,
} from "../services/hrmApi/extraApi";

//1.users
export const useGetAllUserHRM = ({ search }) => {
  // return useQuery({
  //     queryKey: ['getAllUserHRM'],
  //     queryFn: () => getAllUserHRM({ page, search }),
  //     staleTime: Infinity,
  // })
  let res = useInfiniteQuery<any, any>({
    queryKey: ["getAllUserHRM", search],
    queryFn: ({ pageParam }) => getAllUserHRM({ search, pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage.pagination.currentPage) + 1
        : null;
    },
  });
  let data: any = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  return { ...res, data };
};

export const useUserDetailHRM = ({ id }) => {
  return useQuery({
    queryKey: ["userDetailHRM", id],
    queryFn: () => userDetailHRM({ id }),
    staleTime: Infinity,
    enabled: !!id,
  });
};

export const useGetSrManagers = () => {
  return useQuery({
    queryKey: ["getSrManagers"],
    queryFn: () => getSrManagers(),
    staleTime: Infinity,
  });
};

export const useGetTeamsBySrManager = ({ id }) => {
  return useQuery({
    queryKey: ["getTeamsBySrManager", id],
    queryFn: async () => {
      const fetchedData = await getTeamsBySrManager({ id });
      const modifiedData = fetchedData.map((item) => ({
        ...item,
        name: item?.label,
        _id: item.value,
      }));
      return modifiedData;
    },
    staleTime: Infinity,
    enabled: !!id,
  });
};

export const useGetAvailableRoles = ({ id }) => {
  return useQuery({
    queryKey: ["getAvailableRoles", id],
    // queryFn: () => getAvailableRoles({ id }),
    queryFn: async () => {
      const fetchedData = await getAvailableRoles({ id });
      const modifiedData = fetchedData.map((item) => ({
        ...item,
        name: item?.label,
        _id: item.value,
      }));
      return modifiedData;
    },
    staleTime: Infinity,
    enabled: !!id ? true : false,
  });
};

//2.Leave
export const useGetAllLeave = ({ search, startDate, endDate }) => {
  let res = useInfiniteQuery<any, any>({
    queryKey: ["getAllLeave", search],
    queryFn: ({ pageParam }) =>
      getAllLeave({ search, pageParam, startDate, endDate }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage.pagination.currentPage) + 1
        : null;
    },
  });
  let data: any = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  return { ...res, data };
};

export const useGetLeaveDetail = ({ id }) => {
  return useQuery({
    queryKey: ["getLeaveDetail", id],
    queryFn: () => getLeaveDetail({ id }),
    staleTime: Infinity,
    enabled: !!id,
  });
};

//3.dashBoard
export const useGetTodayLeaveEmp = () => {
  return useQuery({
    queryKey: ["TodayLeaveEmp"],
    queryFn: getTodayLeave,
    staleTime: Infinity,
  });
};

//checkIn checkOut
export const useGetDeveloperForCheckInOut = () => {
  return useQuery({
    queryKey: ["getDeveloperForCheckInOut"],
    // queryFn: getDeveloperForCheckInOut,
    queryFn: async () => {
      const fetchedData = await getDeveloperForCheckInOut();
      const modifiedData = fetchedData?.options?.map((item) => ({
        ...item,
        name: item?.label,
        _id: item.value,
      }));
      return modifiedData;
    },
    staleTime: Infinity,
  });
};

export const useGetMeetingForCheckInOut = () => {
  return useQuery({
    queryKey: ["getMeetingForCheckInOut"],
    // queryFn: getMeetingForCheckInOut,
    queryFn: async () => {
      const fetchedData = await getMeetingForCheckInOut();
      const modifiedData = fetchedData?.options?.map((item) => ({
        ...item,
        name: item?.label,
        _id: item.value,
      }));
      return modifiedData;
    },
    staleTime: Infinity,
  });
};

//4.Attendance
export const useGetAllAttendance = ({ search, startDate, endDate }) => {
  let res = useInfiniteQuery<any, any>({
    queryKey: ["getAllAttendance", search, startDate, endDate],
    queryFn: ({ pageParam }) =>
      getAllAttendance({ search, pageParam, startDate, endDate }),
    getNextPageParam: (lastPage, allPages) => {
      // console.log('lastPage?.pagination', lastPage?.pagination)
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage.pagination.currentPage) + 1
        : null;
    },
  });
  let data: any = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  return { ...res, data };
};

export const useGetSingleUserAttList = ({
  search,
  startDate,
  endDate,
  userId,
}) => {
  let res = useInfiniteQuery<any, any>({
    queryKey: ["getSingleUserAttList", userId, search, startDate, endDate],
    queryFn: ({ pageParam }) =>
      getAllAttendance({ search, pageParam, startDate, endDate, userId }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage.pagination.currentPage) + 1
        : null;
    },
    enabled: !!userId,
  });
  let data: any = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  return { ...res, data };
};
//issue

export const useGetIssueAttendance = () => {
  // return useQuery({
  //     queryKey: ['getIssueAttendance'],
  //     queryFn: getDashboardAttendance,
  //     staleTime: Infinity,
  // })
  let res = useInfiniteQuery<any, any>({
    queryKey: ["getIssueAttendance"],
    queryFn: ({ pageParam }) => getIssueAttendance({ pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage.pagination.currentPage) + 1
        : null;
    },
  });
  let data: any = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  return { ...res, data };
};

export const useGetAttendanceDetail = ({ id }) => {
  return useQuery({
    queryKey: ["getAttendanceDetail", id],
    queryFn: () => getAttendanceDetail({ id }),
    staleTime: Infinity,
    enabled: !!id,
  });
};

export const useGetTodayAbsent = () => {
  return useQuery({
    queryKey: ["getTodayAbsent"],
    queryFn: getTodayAbsent,
    staleTime: Infinity,
  });
};

//5. graph chart
export const useGetAttendanceChart = ({ isEnable = false }) => {
  return useQuery({
    queryKey: ["getAttendanceChart"],
    queryFn: getAttendanceChart,
    staleTime: Infinity,
    enabled: !!isEnable,
  });
};
export const useGetAgentLeaveCount = ({ isEnable = false }) => {
  return useQuery({
    queryKey: ["getAgentLeaveCount"],
    queryFn: getAgentLeaveCount,
    staleTime: Infinity,
    enabled: !!isEnable,
  });
};
export const useGetLeaveChart = ({ isEnable }) => {
  return useQuery({
    queryKey: ["getLeaveChart"],
    queryFn: getLeaveChart,
    staleTime: Infinity,
    enabled: !!isEnable,
  });
};
export const useGetUserStatusChart = ({ isEnable }) => {
  return useQuery({
    queryKey: ["getUserStatusChart"],
    queryFn: getUserStatusChart,
    staleTime: Infinity,
    enabled: isEnable,
  });
};

//setting, notification screen
export const useGetNotificationHrm = () => {
  let res = useInfiniteQuery<any, any>({
    queryKey: ["getNotificationHrm"],
    queryFn: ({ pageParam }) => getNotificationHrm({ pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage.pagination.currentPage) + 1
        : null;
    },
  });
  let data: any = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  return { ...res, data };
};
//
export const useGetNotificationInCRM = ({ id }) => {
  let res = useInfiniteQuery<any, any>({
    queryKey: ["getNotificationInCRM"],
    queryFn: ({ pageParam }) => getNotificationInCRM({ pageParam, id }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage.pagination.currentPage) + 1
        : null;
    },
    enabled: !!id,
  });
  let data: any = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }
  return { ...res, data };
};

export const useGetAllCandidates = ({ search, limit = 10 }) => {
  const res = useInfiniteQuery<any, any>({
    queryKey: ["getAllCandidates", search],
    queryFn: ({ pageParam = 1 }) =>
      getAllCandidates({ pageParam, limit, search }),
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.isNextPage
        ? parseInt(lastPage?.pagination?.currentPage) + 1
        : null;
    },
  });

  let data: any = [];
  if (res) {
    data = res?.data?.pages?.map((page) => page?.data).flat();
  }

  return { ...res, data };
};

export const useGetCandidateDetails = ({ id }) => {
  return useQuery({
    queryKey: ["getCandidateDetails", id],
    queryFn: () => getCandidateDetails({ id }),
    enabled: !!id,
    staleTime: Infinity,
  });
};
