import { StyleSheet, View } from "react-native";
import React from "react";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import { LinearGradient } from "expo-linear-gradient";
import { headerRowItemsStyle } from "../../../const/globalStyle";

const HeaderRowAttendance = () => {
  return (
    <LinearGradient
      colors={["#2E67BE", "#4985F2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={headerRowItemsStyle}
    >
      <View style={styles.row1}>
        <CustomText style={styles.text1}>Name</CustomText>
        <CustomText style={styles.text2}>Role</CustomText>
      </View>
      <View style={styles.row2}>
        <CustomText style={styles.text1}>P.I.T</CustomText>
        <CustomText style={styles.text2} numberOfLines={1}>
          Issue
        </CustomText>
      </View>
      <View style={styles.row3}>
        <CustomText style={styles.text1} color={"white"}>
          Status
        </CustomText>
        <CustomText style={styles.text2}>Date</CustomText>
      </View>
    </LinearGradient>
  );
};

export default HeaderRowAttendance;

const styles = StyleSheet.create({
  row1: {
    width: "50%",
    gap: 5,
  },
  row2: {
    width: "20%",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  row3: {
    width: "30%",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  text1: {
    fontSize: 14,
    fontWeight: "400",
    color: "white",
  },
  text2: {
    fontSize: 12,
    fontWeight: "300",
    color: "white",
  },
});
