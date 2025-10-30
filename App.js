// App.js
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import { Platform, LogBox } from "react-native";
import { Provider } from "react-redux";
import StackNavigation from "./navigation/StackNavigation"; // ✅ don't import navigate directly
import store from "./redux/store";
import { storeData } from "./hooks/useAsyncStorage";
import { Root as PopupRootProvider } from "react-native-popup-confirm-toast";
import "react-native-get-random-values";
import UpdateChecker from "./myComponents/UpdateChecker/UpdateChecker";
import { myConsole } from "./hooks/useConsole";

LogBox.ignoreAllLogs();

// ✅ Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const queryClient = new QueryClient();

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  // ✅ PATCH fetch timeout only once
  if (Platform.OS === "android" && !global.fetch._patched) {
    const originalFetch = global.fetch;
    global.fetch = async (uri, options = {}) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        return await originalFetch(uri, { ...options, signal: controller.signal });
      } catch (err) {
        console.log("🔥 Fetch failed:", err);
        throw err;
      } finally {
        clearTimeout(timeout);
      }
    };
    global.fetch._patched = true;
  }

  useEffect(() => {
    console.log("🚀 App mounted");

    const initPush = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await storeData("deviceId", token);
          setExpoPushToken(token);
          console.log("✅ Expo Push Token stored:", token);
        } else {
          console.log("⚠️ No push token received");
        }
      } catch (err) {
        console.log("❌ Error registering push notifications:", err);
      }
    };

    initPush();

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      console.log("📩 Notification received:", n);
      setNotification(n);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("🧭 Notification response:", response);
      const notData = response?.notification?.request?.content?.data;
      if (notData?.module === "leads" && notData?.id) {
        console.log("🔗 Navigating to Lead Details:", notData.id);
        // Delay navigation to ensure navigator is ready
        setTimeout(() => {
          try {
            const nav = require("./navigation/StackNavigation").navigate;
            nav("allLeads", {
              screen: "LeadsDetails",
              params: { item: { _id: notData.id } },
            });
          } catch (navErr) {
            console.log("❌ Navigation failed:", navErr);
          }
        }, 1000);
      }
    });

    return () => {
      console.log("🧹 Cleaning up listeners...");
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <PopupRootProvider>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <StackNavigation />
          <UpdateChecker />
        </Provider>
      </QueryClientProvider>
    </PopupRootProvider>
  );
}

// ✅ Schedule local notification
export async function schedulePushNotification({ title = "title", body = "body", data2 = "data2" }) {
  console.log("📅 Scheduling notification...");
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data: data2 },
    },
    trigger: { seconds: 1 },
  });
  console.log("✅ Notification scheduled.");
}

// ✅ Register for Push Notifications with Debug Logs
async function registerForPushNotificationsAsync() {
  console.log("🔔 Registering for push notifications...");
  let token;

  if (Platform.OS === "android") {
    console.log("📱 Setting Android notification channel...");
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    console.log("📦 Checking permissions...");
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      console.log("🟡 Requesting permission...");
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("❌ Permission not granted");
      return;
    }
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "9b8838cd-39d5-4148-a221-a81701015be2",
      });
      token = tokenData?.data;
      console.log("✅ Token fetched:", token);
    } catch (err) {
      console.log("❌ Error fetching token:", err);
    }
  } else {
    console.log("⚠️ Must use a physical device for Push Notifications");
  }

  return token;
}
