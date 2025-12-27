import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import { LinearGradient } from "expo-linear-gradient";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

const HeaderCategoryExpense = () => {
  return (
    <LinearGradient
      colors={["#2E67BE", "#4985F2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 14,
          justifyContent: "space-between",
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 16,
        },
      ]}
    >
      <View style={styles.row1}>
        <SlideFadeIn>
          <CustomText style={styles.text1}>Expense Category</CustomText>
        </SlideFadeIn>
        <View>
          <SlideFadeIn>
            <CustomText color={"white"} fontSize={14} fontWeight="600">
              Creation Date
            </CustomText>
          </SlideFadeIn>
        </View>
      </View>
      <View style={styles.row2}>
        <SlideFadeIn>
          <CustomText style={styles.text1}>
            Sub Category
            {/* {roleHRM[item?.role]} */}
          </CustomText>
        </SlideFadeIn>
        {/* <CustomText style={styles.text2}>03</CustomText> */}
        <View>
          <SlideFadeIn>
            <CustomText color={"white"} fontSize={14} fontWeight="600">
              Update Date
            </CustomText>
          </SlideFadeIn>
        </View>
      </View>
    </LinearGradient>
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
