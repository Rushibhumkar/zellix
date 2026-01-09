import React, { useEffect, useState } from "react";
import { Modal, View, AppState } from "react-native";
import * as Updates from "expo-updates";
import CustomBtn from "../CustomBtn/CustomBtn";
import CustomText from "../CustomText/CustomText";

const UpdateChecker = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  const check = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      console.log("OTA check:", update);
      setIsUpdateAvailable(update.isAvailable);
    } catch (e) {
      console.log("OTA check failed:", e);
    }
  };

  useEffect(() => {
    check();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        check();
      }
    });

    return () => sub.remove();
  }, []);

  const handleUpdateNow = async () => {
    try {
      console.log("Manual update started");

      const update = await Updates.checkForUpdateAsync();
      console.log("checkForUpdate:", update);

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        setIsUpdateAvailable(false);
        console.log("Update fetched, reloading...");
        await Updates.reloadAsync();
      } else {
        console.log("No update available on server");
      }
    } catch (e) {
      console.log("Update failed:", e);
    }
  };

  return (
    <Modal visible={isUpdateAvailable} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 12,
            minWidth: 250,
            alignItems: "center",
          }}
        >
          <CustomText>New update available</CustomText>
          <CustomBtn title="Update Now" onPress={handleUpdateNow} />
        </View>
      </View>
    </Modal>
  );
};

export default UpdateChecker;
