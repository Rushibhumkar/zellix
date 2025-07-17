import { Text, StyleSheet, View } from "react-native";
import React from "react";

const BookingListHeading = () => {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={styles.headingContainer}>
        <View style={{ flexDirection: "row", gap: 5 }}>
          <Text style={styles.headingText}>No</Text>
          <Text numberOfLines={1} style={styles.headingText}>Project Name</Text>
        </View>
        <Text style={styles.headingText}>Status</Text>
        <Text numberOfLines={1} style={styles.headingText}>Project Details</Text>
      </View>
    </View>
  );
};
export default BookingListHeading;
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
