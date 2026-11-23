import axios from "axios";
import { DeviceEventEmitter } from "react-native";
import Constants from "expo-constants";
import { getData, removeItemValue } from "../../hooks/useAsyncStorage";
import { clearSessionData } from "../../redux/userSlice";
import store from "../../redux/store";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../../navigation/navigationRef";
import { myConsole } from "../../hooks/useConsole";
import {
  performanceNow,
  recordLeadRequestTiming,
  recordLeadSaveTiming,
} from "../../utils/leadSavePerformance";

//  ipconfig getifaddr en0

const metroHost =
  Constants.expoConfig?.hostUri?.replace(/^https?:\/\//, "").split(":")[0] ||
  "localhost";
let testURL = process.env.EXPO_PUBLIC_API_URL || `http://${metroHost}:8000`;
// let testURL =
//   "https://b65c-2409-40c2-314f-6b09-c1d2-6929-f244-49b8.ngrok-free.app";
// let testURL = "https://zellix-backend-1.onrender.com";

// export const isLive = !__DEV__;
export const isLive = true;

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
    const authStartedAt = performanceNow();
    const token = await getData("token");

    // myConsole("Bearer", token);

    if (request.headers) {
      if (token !== "null") {
        request.headers.token = `Bearer ${token}`;
        // request.headers.token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTNmMzhmNDViY2EzOWJlZDk0ZDdhNTkiLCJyb2xlIjoic3VwX2FkbWluIiwibmFtZSI6Ik5hZGVlbSBBaG1lZCIsImlhdCI6MTcwMjU1MDMwMX0.iuYMA5rYhZ8p_-hUx7IgK-Pm8BGSOJQYZ0_by7_kXTU`,
      }
      if (request.leadSaveTiming) {
        request.headers["X-Zellix-Interaction"] =
          request.leadSaveTiming.interactionId;
        recordLeadSaveTiming({
          interactionId: request.leadSaveTiming.interactionId,
          stage: "authentication",
          requestStage: request.leadSaveTiming.stage,
          durationMs: performanceNow() - authStartedAt,
          outcome: "success",
        });
        request.leadSaveTiming.requestStartedAt = performanceNow();
      }
      return request;
    }
  },
  (error) => {
    throw error;
  },
);
// axiosInstance.interceptors.response.use(
//     res => {
//       return res;
//     },
//     err => axiosError(err),
//   );

myConsole("axiosInstance.interceptors", axiosInstance);
axiosInstance.interceptors.response.use(
  (response) => {
    recordLeadRequestTiming(
      response.config,
      response.status,
      false,
      response.headers["server-timing"],
    );
    if (
      !response.config.leadSaveTiming?.deferActivityRefresh &&
      String(response.config.method).toLowerCase() !== "get" &&
      /\/(lead|meeting|reminders)(\/|$)/.test(response.config.url || "")
    )
      DeviceEventEmitter.emit("lead-followups-refresh");
    return response;
  },
  async (error) => {
    recordLeadRequestTiming(
      error.config,
      error.response?.status,
      true,
      error.response?.headers?.["server-timing"],
    );
    const status = error?.response?.status;
    const message = error?.response?.data;
    if (
      status === 401 &&
      [
        "SESSION_EXPIRED",
        "ACCOUNT_INACTIVE",
        "ONBOARDING_INCOMPLETE",
        "APPROVAL_PENDING",
        "APPLICATION_REJECTED",
      ].includes(message)
    ) {
      // console.log("SESSION_EXPIRED → Auto logout");

      await removeItemValue("token");
      await removeItemValue("userDetail");

      store.dispatch(clearSessionData());

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
          }),
        );
      }, 100);
    }

    return Promise.reject(error);
  },
);
export const setBaseUrl = (newBaseUrl: any) => {
  baseURL = newBaseUrl;
  axiosInstance.defaults.baseURL = baseURL;
};

export { axiosInstance };
