import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomText from "../myComponents/CustomText/CustomText";

interface CustomListPermissionMsgProps {
  message?: string;
}

const CustomListPermissionMsg: React.FC<CustomListPermissionMsgProps> = ({
  message = "You are not authorized to view this list.",
}) => {
  return (
    <View style={styles.container}>
      <CustomText style={styles.messageText}>{message}</CustomText>
    </View>
  );
};

export default CustomListPermissionMsg;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 50,
  },
  messageText: {
    color: "grey",
    fontSize: 18,
    textAlign: "center",
  },
});
