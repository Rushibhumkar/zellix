import moment from "moment";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { shadow1, shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { monthsStatic } from "../../../utils/data";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

interface TInvoiceCard {
  item: any;
  onPress: () => void;
  index: number;
}
const InvoiceCard = ({ item, onPress, index }: TInvoiceCard) => {
  return (
    <SlideFadeIn>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onPress}
        style={{
          marginTop: index === 0 ? 25 : 12,
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
            {item?.developer?.name || "N/A"}
          </CustomText>
          <CustomText style={{ color: color.mainTxtColor }}>
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
          <CustomText style={{ color: color.strokeColor }}>
            {item?.clientName || "N/A"}{" "}
          </CustomText>

          <CustomText style={{ color: color.strokeColor }}>
            {item?.totalExcludedVat || "N/A"}
          </CustomText>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default InvoiceCard;

const styles = StyleSheet.create({});
