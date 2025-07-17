import { axiosInstance } from "../authApi/axiosInstance";

export const getAllUser = () =>
  axiosInstance.get("/api/user").then((res) => res?.data);

export const getAllMeeting = () => {
  return axiosInstance.get("/api/meeting").then((res) => res?.data);
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

export const getLeadQuality = () => {
  return axiosInstance
    .get("/api/dashboard/lead-quality")
    .then((res) => res?.data)
    .catch((err) => {
      throw new Error("getLeadQualityErr", err);
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

// api/booking/getCommissionData
