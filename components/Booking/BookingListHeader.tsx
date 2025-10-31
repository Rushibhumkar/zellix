import { Text, StyleSheet, View } from "react-native";
import React from "react";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";

const BookingListHeading = () => {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={styles.headingContainer}>
        <View style={{ flexDirection: "row", gap: 5 }}>
          <CustomText style={styles.headingText}>No</CustomText>
          <CustomText numberOfLines={1} style={styles.headingText}>
            Project Name
          </CustomText>
        </View>
        <CustomText style={styles.headingText}>Status</CustomText>
        <CustomText numberOfLines={1} style={styles.headingText}>
          Project Details
        </CustomText>
      </View>
    </View>
  );
};
export default BookingListHeading;
const styles = StyleSheet.create({
  headingContainer: {
    backgroundColor: color.primary200,
    flexDirection: "row",
    padding: 10,
    borderRadius: 11,
    marginBottom: -8,
    marginTop: 25,
    justifyContent: "space-between",
  },
  headingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});
