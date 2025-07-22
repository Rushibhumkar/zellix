import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { shadow1 } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import moment from "moment";

interface TExpenseCategoryCard {
  item: any;
  onPress: () => void;
}

const ExpenseCategoryCard = ({ item, onPress }: TExpenseCategoryCard) => {
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
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ width: "48%" }}>
          <CustomText>{item?.CategoryName || "N/A"}</CustomText>
        </View>
        <View style={{ width: "50%" }}>
          <CustomText style={{ alignSelf: "flex-end" }}>
            {item?.subCategory?.map((sub) => sub.subCategoryName).join(", ") ||
              "N/A"}
          </CustomText>
        </View>
      </View>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ width: "48%" }}>
          <CustomText>
            {moment(item?.createdAt).format("DD/MM/YYYY") || "N/A"}
          </CustomText>
        </View>
        <View style={{ width: "50%" }}>
          <CustomText style={{ alignSelf: "flex-end" }}>
            {moment(item?.updatedAt).format("DD/MM/YYYY") || "N/A"}
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExpenseCategoryCard;

const styles = StyleSheet.create({});
