import { Text, StyleSheet, View } from "react-native";
import React from "react";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";

const MeetingListHeading = () => {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={styles.headingContainer}>
        <View style={{ flexDirection: "column", gap: 2 }}>
          <CustomText style={styles.headingText}>Client Name</CustomText>
          <CustomText
            style={{
              fontSize: 12,
              fontWeight: "400",
              color: "#FFFFFF",
              lineHeight: 18,
            }}
          >
            ProductPitch
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.headingText}>Status</CustomText>
          <CustomText
            style={{
              fontSize: 12,
              fontWeight: "400",
              color: "#FFFFFF",
              lineHeight: 18,
            }}
          >
            Created By
          </CustomText>
        </View>

        <View style={{ flexDirection: "column", gap: 2 }}>
          <CustomText style={styles.headingText}>Scheduled</CustomText>
          <CustomText
            style={{
              fontSize: 12,
              fontWeight: "400",
              color: "#FFFFFF",
              lineHeight: 18,
            }}
          >
            ScheduleDate
          </CustomText>
        </View>
      </View>
    </View>
  );
};
export default MeetingListHeading;
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
