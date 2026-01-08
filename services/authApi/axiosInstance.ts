import axios from "axios";
import { getData, removeItemValue } from "../../hooks/useAsyncStorage";
import { onLogOutEmpty } from "../../redux/action";
import store from "../../redux/store";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../../navigation/navigationRef";
import { myConsole } from "../../hooks/useConsole";

// let testURL = "https://zellix-backend.onrender.com";
let testURL = "https://zellix-backend-1.onrender.com";

const isLive = true;

export let baseURL = isLive ? "https://api.zellix.io" : testURL;

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

myConsole("axiosInstance.interceptors", axiosInstance);
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data;
    if (status === 401 && message === "SESSION_EXPIRED") {
      // console.log("SESSION_EXPIRED → Auto logout");

      await removeItemValue("token");
      await removeItemValue("userDetail");

      store.dispatch(onLogOutEmpty());

      // 🔥 Reset navigation stack

      // if (navigationRef.isReady()) {
      //   navigationRef.dispatch(
      //     CommonActions.reset({
      //       index: 0,
      //       routes: [{ name: "Login" }],
      //     })
      //   );
      // }
      setTimeout(() => {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        );
      }, 100);
    }

    return Promise.reject(error);
  }
);
export const setBaseUrl = (newBaseUrl: any) => {
  baseURL = newBaseUrl;
  axiosInstance.defaults.baseURL = baseURL;
};

export { axiosInstance };
