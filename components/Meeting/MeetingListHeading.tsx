import { Text, StyleSheet, View } from "react-native";
import React from "react";

const MeetingListHeading = () => {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={styles.headingContainer}>
        <View style={{ flexDirection: "column", gap: 2 }}>
          <Text style={styles.headingText}>Client Name</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "400",
              color: "#FFFFFF",
              lineHeight: 18,
            }}
          >
            ProductPitch
          </Text>
        </View>
        <View>
          <Text style={styles.headingText}>Status</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "400",
              color: "#FFFFFF",
              lineHeight: 18,
            }}
          >
            Created By
          </Text>
        </View>

        <View style={{ flexDirection: "column", gap: 2 }}>
          <Text style={styles.headingText}>Scheduled</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "400",
              color: "#FFFFFF",
              lineHeight: 18,
            }}
          >
            ScheduleDate
          </Text>
        </View>
      </View>
    </View>
  );
};
export default MeetingListHeading;
const styles = StyleSheet.create({
  headingContainer: {
    backgroundColor: "#3E3E3E",
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
