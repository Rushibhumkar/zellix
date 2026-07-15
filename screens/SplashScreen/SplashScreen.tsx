import { CommonActions, useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View } from "react-native";
import { getData, getDataJson } from "../../hooks/useAsyncStorage";
import AppLogo from "../../assets/svg/AppLogo";
import { navigationRef } from "../../navigation/navigationRef";
import { PENDING_CALL_KEY } from "../../utils/pendingCallStorage";

const SplashScreen = () => {
  const { dispatch } = useNavigation();
  useEffect(() => {
    setTimeout(() => {
      handleGetToken();
    }, 100);
  }, []);

  // ✅ NEW: retry-based navigate — waits until nested navigator is actually ready
  const navigateToCallListingWithRetry = (retriesLeft = 15) => {
    console.log(
      "🔁 Attempting CallListing redirect, retries left:",
      retriesLeft,
    );

    if (!navigationRef.isReady()) {
      if (retriesLeft <= 0) {
        console.log("❌ navigationRef never became ready, giving up");
        return;
      }
      setTimeout(() => navigateToCallListingWithRetry(retriesLeft - 1), 200);
      return;
    }

    try {
      navigationRef.navigate("allLead2", {
        screen: "CallListing",
      });
      console.log("✅ Navigated to CallListing");
    } catch (e) {
      console.log("❌ Navigate threw error:", e);
      if (retriesLeft > 0) {
        setTimeout(() => navigateToCallListingWithRetry(retriesLeft - 1), 200);
      }
    }
  };

  const handleGetToken = async () => {
    console.log("🚀 SplashScreen handleGetToken started");

    const token = await getData("token");
    console.log("🔑 token found:", !!token);

    if (typeof token !== "string") {
      dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        }),
      );
      return;
    }

    // ✅ check for a pending (interrupted) call before deciding where to land
    const pending = await getDataJson(PENDING_CALL_KEY);
    console.log("📞 pending call check on splash:", pending);

    dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      }),
    );

    if (pending?.number) {
      console.log(
        "🔄 Pending call found on splash — will redirect to CallListing",
        pending,
      );

      // give the reset a brief head start, then begin retry-polling
      setTimeout(() => {
        navigateToCallListingWithRetry();
      }, 300);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <AppLogo width={230} height={250} />
    </View>
  );
};

export default SplashScreen;
