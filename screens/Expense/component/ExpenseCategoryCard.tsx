import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { shadow1, shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import moment from "moment";
import { color } from "../../../const/color";

interface TExpenseCategoryCard {
  item: any;
  onPress: () => void;
  index: number;
}

const ExpenseCategoryCard = ({
  item,
  onPress,
  index,
}: TExpenseCategoryCard) => {
  return (
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
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ width: "48%" }}>
          <CustomText style={{ color: color.mainTxtColor, fontWeight: "500" }}>
            {item?.CategoryName || "N/A"}
          </CustomText>
        </View>
        <View style={{ width: "50%" }}>
          <CustomText
            style={{ alignSelf: "flex-end", color: color.mainTxtColor }}
          >
            {item?.subCategory?.map((sub) => sub.subCategoryName).join(", ") ||
              "N/A"}
          </CustomText>
        </View>
      </View>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ width: "48%" }}>
          <CustomText style={{ color: color.strokeColor }}>
            {moment(item?.createdAt).format("DD/MM/YYYY") || "N/A"}
          </CustomText>
        </View>
        <View style={{ width: "50%" }}>
          <CustomText
            style={{ alignSelf: "flex-end", color: color.strokeColor }}
          >
            {moment(item?.updatedAt).format("DD/MM/YYYY") || "N/A"}
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExpenseCategoryCard;

const styles = StyleSheet.create({});
