// UpdateChecker.tsx
import React, { useEffect, useState } from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import * as Updates from "expo-updates";
import CustomBtn from "../CustomBtn/CustomBtn";
import CustomText from "../CustomText/CustomText";

const UpdateChecker = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setIsUpdateAvailable(true);
      }
    } catch (error) {
      console.log("Update check failed:", error);
    }
  };
  useEffect(() => {
    if (__DEV__) return;
    checkForUpdates();
  }, []);

  const handleUpdateNow = async () => {
    try {
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.log("Update failed:", error);
    }
  };

  return (
    <Modal visible={isUpdateAvailable} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <CustomText style={styles.title}>New Update Available</CustomText>
          <CustomText style={styles.message}>
            Please update the app to get the latest features.
          </CustomText>
          {/* <Button title="Update Now" onPress={handleUpdateNow} /> */}
          <CustomBtn
            title="Update Now"
            onPress={handleUpdateNow}
            textStyle={{ fontSize: 15 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default UpdateChecker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
});
