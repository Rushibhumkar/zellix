import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { Provider } from "react-redux";
import StackNavigation, { navigate } from "./navigation/StackNavigation";
import store from "./redux/store";
import { storeData } from "./hooks/useAsyncStorage";
import { Root as PopupRootProvider } from "react-native-popup-confirm-toast";
import "react-native-get-random-values";
import UpdateChecker from "./myComponents/UpdateChecker/UpdateChecker";
import { LogBox } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";
import { ModalPortal } from "react-native-modals";
import { BackHandler } from "react-native";
import { myConsole } from "./hooks/useConsole";
import * as Updates from "expo-updates";
import { Alert, Linking } from "react-native";

if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = (type, handler) => true;
}

Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log("handleNotification triggered");
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export const queryClient = new QueryClient();

export default function App() {
  if (Platform.OS === "android") {
    const originalFetch = global.fetch;
    global.fetch = (uri, options = {}) => {
      const opts = { timeout: 15000, ...options };
      return originalFetch(uri, opts);
    };
  }

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  myConsole("notificationnn", notification);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    console.log("App mounted - registering push notifications");

    registerForPushNotificationsAsync()
      .then(async (token) => {
        console.log("registerForPushNotificationsAsync returned token:", token);
        if (!token) console.log("No token received");
        await storeData("deviceId", token);
        setExpoPushToken(token);
      })
      .catch((error) =>
        console.log("registerForPushNotificationsAsync ERROR:", error)
      );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification RECEIVED:", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification CLICK RESPONSE:", response);

        let notData = response?.notification?.request?.content?.data;
        console.log("Notification CLICK DATA:", notData);

        if (notData?.module === "leads" && notData?.id) {
          console.log("Navigating to leads with ID:", notData.id);
          navigate("allLeads", {
            screen: "LeadsDetails",
            params: { item: { _id: notData?.id } },
          });
        }
      });

    return () => {
      console.log("Cleaning notification listeners");
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const APP_STORE_URL = "https://apps.apple.com/app/id6748918861";
  const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.skg.zellix";

  useEffect(() => {
    async function checkUpdate() {
      try {
        if (__DEV__) return;

        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          Alert.alert(
            "Update Available",
            "A new version of the app is available. Please update from the store.",
            [
              {
                text: "Update Now",
                onPress: () => {
                  const url =
                    Platform.OS === "android" ? PLAY_STORE_URL : APP_STORE_URL;
                  Linking.openURL(url);
                },
              },
            ]
          );
        }
      } catch (e) {
        console.log("Update check failed:", e);
      }
    }

    checkUpdate();
  }, []);

  LogBox.ignoreAllLogs(true);

  return (
    <>
      <PopupRootProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <ToastProvider
              placement="top"
              offset={16}
              duration={2500}
              swipeEnabled
            >
              <StackNavigation />
              <UpdateChecker />
              <ModalPortal />
            </ToastProvider>
          </Provider>
        </QueryClientProvider>
      </PopupRootProvider>
    </>
  );
}
console.log("📌 Platform:", Platform.OS, "Version:", Platform.Version);

export async function schedulePushNotification({
  title = "title",
  body = "body",
  data2 = "data2",
}) {
  console.log("schedulePushNotification called", { title, body, data2 });
  try {
    const res = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { data: data2 },
      },
      trigger: { seconds: 1 },
    });
    console.log("Notification scheduled:", res);
  } catch (e) {
    console.log("schedulePushNotification ERROR:", e);
  }
}

async function registerForPushNotificationsAsync() {
  console.log("🔍 registerForPushNotificationsAsync() called");

  let token;

  if (!Device.isDevice) {
    console.log("❌ Must use a physical device for push notifications");
    return;
  }

  if (Platform.OS === "android") {
    console.log("📌 Setting Android notification channel...");
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  // Step 1: check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log("🔍 Existing notification status:", existingStatus);

  let finalStatus = existingStatus;

  // Step 2: request permissions
  if (existingStatus !== "granted") {
    console.log("📌 Requesting notification permissions...");
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log("📌 Requested notification status:", finalStatus);
  }

  // Step 3: if still not granted, exit
  if (finalStatus !== "granted") {
    console.log("❌ Push permission not granted!");
    return;
  }

  console.log("✅ Push permission granted!");

  try {
    console.log("📌 Fetching Expo push token...");
    const response = await Notifications.getExpoPushTokenAsync({
      projectId: "e53c2c8e-81e7-4fb9-acf7-3913c9ee6ee8",
    });

    token = response.data;
    console.log("✅ Expo Push Token:", token);
  } catch (e) {
    console.log("❌ ERROR getting token:", e);
    return;
  }

  return token;
}
