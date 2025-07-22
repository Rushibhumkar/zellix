import axios from "axios";
import { getData } from "../../hooks/useAsyncStorage";

let testURL = "https://zellix-backend.onrender.com";

const isLive = false;

export let baseURL = isLive ? "https://api.crmaxproperty.com" : testURL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 50000,
  timeoutErrorMessage: "Network request timed out.",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (request: any) => {
    const token = await getData("token");
    if (request.headers) {
      if (token !== "null") {
        request.headers.token = `Bearer ${token}`;
        // request.headers.token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTNmMzhmNDViY2EzOWJlZDk0ZDdhNTkiLCJyb2xlIjoic3VwX2FkbWluIiwibmFtZSI6Ik5hZGVlbSBBaG1lZCIsImlhdCI6MTcwMjU1MDMwMX0.iuYMA5rYhZ8p_-hUx7IgK-Pm8BGSOJQYZ0_by7_kXTU`,
        // request.headers.token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTNmMzhmNDViY2EzOWJlZDk0ZDdhNTkiLCJyb2xlIjoic3VwX2FkbWluIiwibmFtZSI6Ik5hZGVlbSBBaG1lZCIsImlhdCI6MTcwMjU3MzM2OX0.qpK0YvM-idZW-XrOTrhrhngYtn1FXXr389P9inLhR9E`
      }
      return request;
    }
  },
  (error) => {
    throw error;
  }
);
// Add a response interceptor
// axiosInstance.interceptors.response.use(
//     res => {
//       return res;
//     },
//     err => axiosError(err),
//   );
export const setBaseUrl = (newBaseUrl) => {
  baseURL = newBaseUrl;
  axiosInstance.defaults.baseURL = baseURL;
};

export { axiosInstance };
