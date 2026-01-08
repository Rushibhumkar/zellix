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
      console.log("OTA check result:", update);

      if (update.isAvailable) {
        setIsUpdateAvailable(true);
      }
    } catch (e) {
      console.log("OTA check error:", e);
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
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
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
          style={{ backgroundColor: "white", padding: 20, borderRadius: 12 }}
        >
          <CustomText>New update available</CustomText>
          <CustomBtn title="Update Now" onPress={handleUpdateNow} />
        </View>
      </View>
    </Modal>
  );
};

export default UpdateChecker;
