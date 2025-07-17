import { myConsole } from "../../hooks/useConsole";
import { axiosInstance } from "../authApi/axiosInstance";

export const getAllAttendance = ({
  pageParam = 1,
  search = null,
  startDate = "",
  endDate = "",
  userId = "",
}) =>
  axiosInstance
    .get("/api/hrms/att", {
      params: {
        page: pageParam,
        search: search,
        startDate,
        endDate,
        userId,
      },
    })
    .then((res) => {
      return res?.data;
    })
    .catch((err) => console.log("errorGetAllAttendance", err));

export const getIssueAttendance = ({ pageParam = 1 }) => {
  return axiosInstance
    .get(`/api/hrms/att`, {
      params: {
        page: pageParam,
        issue: true,
      },
    })
    .then((res) => res?.data)
    .catch((err) => console.log("errorGetDashboardAttendance", err));
};

export const getAttendanceDetail = ({ id }) =>
  axiosInstance
    .get(`/api/hrms/att/getDetailsById/${id}`)
    .then((res) => res?.data)
    .catch((err) => console.log("errorGetAttendanceDetail", err));

export const issueRiseAgent = ({ id, data }) =>
  axiosInstance
    .post(`/api/hrms/att/issueRaiseById/${id}`, data)
    .then((res) => res?.data)
    .catch((err) => console.log("errorIssueRiseAgent", err));

export const issueResolveAdmin = ({ id, data }) =>
  axiosInstance
    .post(`/api/hrms/att/updateStatusById/${id}`, data)
    .then((res) => res?.data)
    .catch((err) => console.log("errorIssueResolveAdmin", err));

export const getTodayAbsent = () => {
  return axiosInstance
    .get(`/api/hrms/att`, {
      params: {
        page: 1,
        search: "absent",
        today: true,
      },
    })
    .then((res) => {
      // myConsole('getTodayAbsent', res)
      return res?.data;
    })
    .catch((err) => console.log("errorGetTodayAbsent", err));
};

//?search=absent&page=1&today=true
// export const getDashboardAttendance = () => {  //-->attendance graph
//     return axiosInstance.get(`/api/hrms/dashboard`)
//         .then(res => res?.data)
//         .catch((err) => console.log('errorGetDashboardAttendance', err))
// }

//-->/api/hrms/user/dashboardData -->leave graph
