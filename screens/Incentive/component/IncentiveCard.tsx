import moment from "moment";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { shadow1, shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { monthsStatic } from "../../../utils/data";
import { color } from "../../../const/color";

interface TIncentiveCard {
  item: any;
  onPress: () => void;
  index: number;
}
const IncentiveCard = ({ item, onPress, index }: TIncentiveCard) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      style={{
        marginTop: index === 0 ? 24 : 12,
        borderWidth: 1.8,
        padding: 13,
        borderRadius: 14,
        borderColor: color.borderColor,
        marginHorizontal: 20,
        ...shadowPrimaryColor,
        backgroundColor: color.white,
      }}
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
          marginBottom: 8,
        }}
      >
        <CustomText style={{ color: color.mainTxtColor }}>
          {item?.user?.name || "N/A"}
        </CustomText>
        <CustomText style={{ color: color.mainTxtColor }}>
          {moment(item?.updatedAt).format("DD/MM/YYYY") || "N/A"}
        </CustomText>
      </View>
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <CustomText style={{ color: color.strokeColor }}>
          {item?.year || "N/A"}{" "}
        </CustomText>
        <CustomText
          style={{ textTransform: "capitalize", color: color.strokeColor }}
        >
          {item?.status || "N/A"}
        </CustomText>
        <CustomText style={{ color: color.mainTxtColor }}>
          {monthsStatic?.[item?.month] || "N/A"}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default IncentiveCard;

const styles = StyleSheet.create({});
