import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "../../myComponents/CustomText/CustomText";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

const BookingListHeading = () => {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <LinearGradient
        colors={["#2452FAFF", "#6CA8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headingContainer}
      >
        <View style={{ flexDirection: "row", gap: 5 }}>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>No</CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText numberOfLines={1} style={styles.headingText}>
              Project Name
            </CustomText>
          </SlideFadeIn>
        </View>
        <SlideFadeIn>
          <CustomText style={styles.headingText}>Status</CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText numberOfLines={1} style={styles.headingText}>
            Project Details
          </CustomText>
        </SlideFadeIn>
      </LinearGradient>
    </View>
  );
};

export default BookingListHeading;

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 11,
    marginBottom: -8,
    marginTop: 16,
  },
  headingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});
