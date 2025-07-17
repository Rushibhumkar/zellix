import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";

const HeaderCategoryExpense = () => {
  return (
    <View
      style={[
        {
          borderWidth: 0.5,
          borderColor: "grey",
          padding: 10,
          paddingHorizontal: 30,
          borderRadius: 5,
          justifyContent: "space-between",
          flexDirection: "row",
          marginTop: 10,
          backgroundColor: color.darkBlack,
        },
      ]}
    >
      <View style={styles.row1}>
        <CustomText style={styles.text1}>Expense Category</CustomText>
        <View>
          <CustomText color={"white"} fontSize={14} fontWeight="600">
            Creation Date
          </CustomText>
        </View>
      </View>
      <View style={styles.row2}>
        <CustomText style={styles.text1}>
          Sub Category
          {/* {roleHRM[item?.role]} */}
        </CustomText>
        {/* <CustomText style={styles.text2}>03</CustomText> */}
        <View>
          <CustomText color={"white"} fontSize={14} fontWeight="600">
            Update Date
          </CustomText>
        </View>
      </View>
    </View>
  );
};

export default HeaderCategoryExpense;

const styles = StyleSheet.create({
  row1: {
    width: "50%",
    gap: 10,
    // backgroundColor: "red",
  },
  row2: {
    width: "40%",
    gap: 10,
    //backgroundColor: "green",

    alignItems: "flex-end",
  },

  text1: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    // marginBottom: 5
  },
});
