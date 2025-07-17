import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { axiosInstance } from "../authApi/axiosInstance";

export const getAllUserHRM = ({ search = null, pageParam = 1 }) =>
  axiosInstance
    .get("/api/hrms/user", {
      params: {
        page: pageParam,
        search,
      },
    })
    .then((res) => {
      // myConsole('getAllUserHRM', res)
      return res?.data;
    });

export const userDetailHRM = ({ id }) =>
  axiosInstance
    .get(`/api/hrms/user/getUserDetailsById/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err.response.data);
    });

export const sendInvitation = ({ id }) =>
  axiosInstance
    .post(`/api/hrms/user/sendInvitation/${id}`)
    .then((res) => res?.data);

export const addUserHRM = ({ data }) =>
  axiosInstance
    .post(`/api/hrms/user`, data)
    .then((res) => {
      popUpConfToast.successMessage(res?.data?.message ?? "---");
      return res?.data;
    })
    .catch((err) => {
      popUpConfToast.errorMessage(err?.response?.data ?? "---");
    });
//name,lastName,email,team,teamName,srManager,role

export const updateUserHRM = ({ id, data }) =>
  axiosInstance
    .post(`/api/hrms/user/updateUserById/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      popUpConfToast.successMessage(res?.data?.message ?? "---");
      return res?.data;
    })
    .catch((err) => {
      popUpConfToast.errorMessage(err?.response?.data);
    });

export const getSrManagers = () =>
  axiosInstance.get(`/api/hrms/user/getSrManagers`).then((res) => res?.data);

export const getTeamsBySrManager = ({ id }) =>
  axiosInstance
    .get(`/api/hrms/user/getTeamsBySrManager/${id}`)
    .then((res) => res?.data?.data);
//getSrManagerHrm ki id

export const getAvailableRoles = ({ id }) =>
  axiosInstance
    .get(`/api/hrms/user/getAvailableRoles/${id}`)
    .then((res) => res?.data?.data);
//getTeamsBySrManager ki id

export const sendToUpdate = ({ id, data }) =>
  axiosInstance
    .post(`/api/hrms/user/accessUpdate/${id}`, data)
    .then((res) => res?.data);
//remark:'ss',isEditable:['keys']

export const userApproved = ({ id }) => {
  return axiosInstance
    .post(`/api/hrms/user/approveById/${id}`)
    .then((res) => res?.data);
};

export const leadPoolRestriction = (data) => {
  return axiosInstance
    .post(`/api/user/updatePoolRestriction`, data)
    .then((res) => res?.data);
};

export const confirmedBusiness = (data) => {
  return axiosInstance
    .post(`/api/booking/confirmedBusinessBooking`, data)
    .then((res) => res?.data);
};

export const executedBusiness = (data) => {
  return axiosInstance
    .post(`/api/booking/executedBusinessBooking`, data)
    .then((res) => res?.data);
};

export const summary = (data) => {
  return axiosInstance
    .post(`/api/booking/summaryOfConfirmedBusinessBooking`, data)
    .then((res) => res?.data);
};

export const deleteDeviceId = ({ id }) => {
  console.log("first", `/api/hrms/user/update-devices/${id}`);
  return axiosInstance
    .post(`/api/hrms/user/update-devices/${id}`, { devices: [] }) // Send empty array
    .then((res) => res?.data);
};

export const getCandidateDetails = ({ id }) =>
  axiosInstance.get(`/api/recruitment/${id}`).then((res) => res?.data);

export const scheduleInterview = (data) =>
  axiosInstance.post(`/api/recruitment`, data).then((res) => res?.data);

export const changeInterviewStatus = ({ candidateId, newStatus }) =>
  axiosInstance
    .post(`/api/recruitment/changestatus?candidateId=${candidateId}`, {
      newStatus,
    })
    .then((res) => res?.data);

export const getAllCandidates = ({ pageParam = 1, limit = 10, search = "" }) =>
  axiosInstance
    .get(`/api/recruitment`, {
      params: {
        page: pageParam,
        limit,
        search,
      },
    })
    .then((res) => res?.data);

export const postInterviewProcess = (data) =>
  axiosInstance
    .post(`/api/recruitment/post-intervierw-process`, data)
    .then((res) => res?.data);

export const rescheduleInterview = (data) =>
  axiosInstance
    .post(`/api/recruitment/reschedule`, data)
    .then((res) => res?.data);

export const downloadInterviewsExcel = () =>
  axiosInstance.get(`/api/recruitment/download/excel`).then((res) => res?.data);

export const deleteInterview = (candidateId) =>
  axiosInstance
    .delete(`/api/recruitment/${candidateId}`)
    .then((res) => res?.data);
