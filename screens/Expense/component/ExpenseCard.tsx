import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { shadow1 } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";

interface TExpenseCard {
  item: any;
  onPress: () => void;
}

const ExpenseCard = ({ item, onPress }: TExpenseCard) => {
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
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ width: "48%" }}>
          <CustomText>
            {item?.responsiblePerson?.CategoryName || "N/A"}
          </CustomText>
        </View>
        <View style={{ width: "50%" }}>
          <CustomText style={{ alignSelf: "flex-end" }}>
            {item?.team?.name || "N/A"}
          </CustomText>
        </View>
      </View>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ width: "48%" }}>
          <CustomText>{item?.expenseCategory?.name || "N/A"}</CustomText>
        </View>
        <View style={{ width: "50%" }}>
          <CustomText style={{ alignSelf: "flex-end" }}>
            {item?.expenseSubCategory?.name || "N/A"}
          </CustomText>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "30%" }}>
          <CustomText>{item?.vatPercent || "N/A"}</CustomText>
        </View>
        <View style={{ width: "30%" }}>
          <CustomText style={{ alignSelf: "center" }}>
            {parseInt(item?.vatAmount) || "N/A"}
          </CustomText>
        </View>
        <View style={{ width: "30%" }}>
          <CustomText style={{ alignSelf: "flex-end" }}>
            {parseInt(item?.amountExcludedVat) || "N/A"}
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExpenseCard;

const styles = StyleSheet.create({});
