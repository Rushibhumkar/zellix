import moment from "moment";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { shadow1 } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { monthsStatic } from "../../../utils/data";

interface TInvoiceCard {
  item: any;
  onPress: () => void;
}
const InvoiceCard = ({ item, onPress }: TInvoiceCard) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      style={{
        marginTop: 25,
        borderWidth: 1,
        padding: 13,
        borderRadius: 10,
        borderColor: "#FFC857",
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
        <CustomText>{item?.developer?.name || "N/A"}</CustomText>
        <CustomText>
          {moment(item?.createdAt).format("DD/MM/YYYY") || "N/A"}
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
        <CustomText>{item?.clientName || "N/A"} </CustomText>

        <CustomText>{item?.totalExcludedVat || "N/A"}</CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default InvoiceCard;

const styles = StyleSheet.create({});
