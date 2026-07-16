import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../authApi/axiosInstance";

export const getAllUser = () =>
  axiosInstance.get("/api/user").then((res) => res?.data);

export const getMyAllTeamMembers = () =>
  axiosInstance.get("/api/team/getMyAllTeamMembers").then((res) => res?.data);

export const getAllMeeting = () => {
  return axiosInstance.get("/api/meeting").then((res) => res?.data);
};

export const useGetMyAllTeamMembers = () => {
  return useQuery({
    queryKey: ["getMyAllTeamMembers"],

    queryFn: () => getMyAllTeamMembers(),

    staleTime: Infinity,

    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,

    retry: 1,
  });
};

export const getAllLead = ({ type = null }) => {
  return axiosInstance
    .get("/api/lead", {
      params: {
        type,
      },
    })
    .then((res) => res?.data);
};

export const getAllBooking = () => {
  return axiosInstance.get("/api/booking").then((res) => res?.data);
};

export const getTeam = () => {
  return axiosInstance.get("/api/team").then((res) => res?.data);
};

export const getAllUsers = () => {
  return axiosInstance.get("/api/user").then((res) => res?.data);
};

export const forgetPassword = (data) => {
  return axiosInstance
    .post("/api/user/forgetPassword", data)
    .then((res) => res);
};

export const getCommissionData = () => {
  return axiosInstance
    .get("api/booking/getCommissionData")
    .then((res) => res?.data);
};

export const getDashboardCount = () => {
  return axiosInstance
    .get("api/dashboard")
    .then((res) => res?.data)
    .catch((err) => {
      throw new Error("getDashboardCountErr", err);
    });
};

export const getBookingCount = () => {
  return axiosInstance
    .get("api/dashboard/bookings")
    .then((res) => res?.data)
    .catch((err) => {
      throw new Error("getBookingCountErr", err);
    });
};

export const getMeetingCount = () => {
  return axiosInstance
    .get("api/dashboard/meetings")
    .then((res) => res?.data)
    .catch((err) => {
      throw new Error("getBookingCountErr", err);
    });
};

export const getCommissionCount = () => {
  return axiosInstance
    .get("api/booking/getCommissionData")
    .then((res) => res?.data)
    .catch((err) => {
      throw new Error("getCommissionCountErr", err);
    });
};

export const getLeadQuality = (startDate, endDate) => {
  return axiosInstance
    .get("/api/dashboard/lead-quality", {
      params: {
        startDate,
        endDate,
      },
    })
    .then((res) => res?.data)
    .catch((err) => {
      throw new Error("getLeadQualityErr", err);
    });
};

export const getCallingDataQuality = (startDate, endDate) => {
  return axiosInstance
    .get("/api/dashboard/calling-data-quality", {
      params: {
        startDate,
        endDate,
      },
    })
    .then((res) => res?.data)
    .catch(() => {
      throw new Error("getCallingDataQualityErr");
    });
};

export const getLeadProjectWise = (startDate, endDate) => {
  return axiosInstance
    .get("/api/dashboard/lead-project-wise", {
      params: {
        startDate,
        endDate,
      },
    })
    .then((res) => res?.data)
    .catch((err) => {
      throw new Error("getLeadProjectWiseErr", err);
    });
};

export const getClosingLeadProjectWise = (startDate, endDate) => {
  return axiosInstance
    .get("/api/dashboard/closing-lead-project-wise", {
      params: {
        startDate,
        endDate,
      },
    })
    .then((res) => res?.data)
    .catch((err) => {
      throw new Error("getClosingLeadProjectWiseErr", err);
    });
};

export const getAppVersion = () => {
  return axiosInstance.get("api/app-version");
};

export const getAppInstruction = () => {
  return axiosInstance.get("api/app-instruction");
};

export const getAppSettings = () => {
  return axiosInstance.get("api/app-settings");
};
