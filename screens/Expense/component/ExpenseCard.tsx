import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { shadow1, shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

interface TExpenseCard {
  item: any;
  onPress: () => void;
  index: number;
}

const ExpenseCard = ({ item, onPress, index }: TExpenseCard) => {
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
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <View style={{ width: "48%" }}>
            <CustomText style={{ color: color.mainTxtColor }}>
              {item?.responsiblePerson?.CategoryName || "N/A"}
            </CustomText>
          </View>
          <View style={{ width: "50%" }}>
            <CustomText
              style={{ alignSelf: "flex-end", color: color.mainTxtColor }}
            >
              {item?.team?.name || "N/A"}
            </CustomText>
          </View>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <View style={{ width: "48%" }}>
            <CustomText style={{ color: color.mainTxtColor }}>
              {item?.expenseCategory?.name || "N/A"}
            </CustomText>
          </View>
          <View style={{ width: "50%" }}>
            <CustomText
              style={{ alignSelf: "flex-end", color: color.mainTxtColor }}
            >
              {item?.expenseSubCategory?.name || "N/A"}
            </CustomText>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: "30%" }}>
            <CustomText style={{ color: color.mainTxtColor }}>
              {item?.vatPercent || "N/A"}
            </CustomText>
          </View>
          <View style={{ width: "30%" }}>
            <CustomText
              style={{ alignSelf: "center", color: color.mainTxtColor }}
            >
              {parseInt(item?.vatAmount) || "N/A"}
            </CustomText>
          </View>
          <View style={{ width: "30%" }}>
            <CustomText
              style={{ alignSelf: "flex-end", color: color.mainTxtColor }}
            >
              {parseInt(item?.amountExcludedVat) || "N/A"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default ExpenseCard;

const styles = StyleSheet.create({});
