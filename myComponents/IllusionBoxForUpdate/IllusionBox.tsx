import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import CustomText from "../CustomText/CustomText";
import { color } from "../../const/color";

const IllusionBox = ({ title = "N/A", value = "N/A", onPress }) => {
  return (
    <View
      style={{
        marginBottom: 15,
      }}
    >
      <CustomText
        color={color.mainTxtColor}
        marginBottom={6}
        fontSize={16}
        fontWeight="500"
      >
        {title}
      </CustomText>
      <TouchableOpacity
        onPress={onPress}
        style={{
          borderColor: "#739fe141",
          backgroundColor: "#FFFFFF",
          borderWidth: 1.2,
          borderRadius: 14,
          paddingHorizontal: 10,
          paddingVertical: Platform.OS === "ios" ? 12 : 12,
        }}
      >
        <CustomText style={{ color: color.mainTxtColor }}>{value}</CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default IllusionBox;

const styles = StyleSheet.create({});
