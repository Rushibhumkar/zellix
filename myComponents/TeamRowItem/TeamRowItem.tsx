import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { color } from "../../const/color";
import {
  shadow1,
  shadowLight,
  shadowPrimaryColor,
} from "../../const/globalStyle";
import { string } from "yup";
import CustomText from "../CustomText/CustomText";

interface TeamRowItem {
  serial: number;
  teamName: string;
  managerName: string;
  teamLeadName: string;
  onLongPress: () => void;
  isSelected: boolean;
  bgColor: string;
  index?: number;
}

const TeamRowItem = ({
  serial,
  teamName,
  managerName,
  teamLeadName,
  onLongPress,
  isSelected,
  bgColor,
  index,
}: TeamRowItem) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? color.selectedBg
            : bgColor
            ? bgColor
            : color.listCardBg,
        },
      ]}
      activeOpacity={1}
      onLongPress={!!onLongPress ? onLongPress : undefined}
    >
      {typeof serial === "string" ? (
        <CustomText numberOfLines={2} style={styles.box1}>
          {serial}
        </CustomText>
      ) : (
        <CustomText numberOfLines={2} style={styles.box1}>
          {serial < 10 && "0"}
          {serial}
        </CustomText>
      )}
      <CustomText numberOfLines={2} style={styles.box2}>
        {teamName}
      </CustomText>
      <CustomText numberOfLines={2} style={styles.box3}>
        {managerName}
      </CustomText>
      <CustomText numberOfLines={2} style={styles.box4}>
        {teamLeadName}
      </CustomText>
    </TouchableOpacity>
  );
};

export default TeamRowItem;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.4,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderColor: color.borderColor,
    backgroundColor: color.white,
    flexDirection: "row",
    alignItems: "center",
    ...shadowPrimaryColor,
    marginHorizontal: 20,
  },
  box1: {
    width: "10%",
    paddingRight: 3,
    fontSize: 14,
    fontWeight: "400",
    color: color.mainTxtColor,
  },
  box2: {
    width: "30%",
    paddingRight: 3,
    fontSize: 14,
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  box3: {
    width: "30%",
    paddingRight: 3,
    fontSize: 14,
    fontWeight: "400",
    color: color.strokeColor,
  },
  box4: {
    width: "30%",
    fontSize: 14,
    fontWeight: "400",
    color: color.mainTxtColor,
  },
});
