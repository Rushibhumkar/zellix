import moment from "moment";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { shadow1 } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { monthsStatic } from "../../../utils/data";

interface TIncentiveCard {
  item: any;
  onPress: () => void;
}
const IncentiveCard = ({ item, onPress }: TIncentiveCard) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      style={{
        marginTop: 25,
        borderWidth: 1,
        padding: 13,
        borderRadius: 10,
        borderColor: "#2D67C6",
        marginHorizontal: 20,
      }}
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
          marginBottom: 15,
        }}
      >
        <CustomText>{item?.user?.name || "N/A"}</CustomText>
        <CustomText>
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
        <CustomText>{item?.year || "N/A"} </CustomText>
        <CustomText style={{ textTransform: "capitalize" }}>
          {item?.status || "N/A"}
        </CustomText>
        <CustomText>{monthsStatic?.[item?.month] || "N/A"}</CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default IncentiveCard;

const styles = StyleSheet.create({});
