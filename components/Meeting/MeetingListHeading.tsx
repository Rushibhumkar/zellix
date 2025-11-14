import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "../../myComponents/CustomText/CustomText";

const MeetingListHeading = () => {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#2452FAFF", "#6CA8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Left Section */}
        <View style={styles.column}>
          <CustomText style={styles.headingText}>Client Name</CustomText>
          <CustomText style={styles.subText}>Product Pitch</CustomText>
        </View>

        {/* Middle Section */}
        <View style={[styles.column, styles.centerColumn]}>
          <CustomText style={styles.headingText}>Status</CustomText>
          <CustomText style={styles.subText}>Created By</CustomText>
        </View>

        {/* Right Section */}
        <View style={[styles.column, styles.rightColumn]}>
          <CustomText style={styles.headingText}>Scheduled</CustomText>
          <CustomText style={styles.subText}>Schedule Date</CustomText>
        </View>
      </LinearGradient>
    </View>
  );
};

export default MeetingListHeading;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  gradientContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 11,
    marginBottom: -8,
  },
  column: {
    flexDirection: "column",
    gap: 2,
  },
  centerColumn: {
    alignItems: "center",
  },
  rightColumn: {
    alignItems: "flex-end",
  },
  headingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
  subText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});
