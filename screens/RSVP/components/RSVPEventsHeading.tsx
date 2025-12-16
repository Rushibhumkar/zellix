import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Container from "../../../myComponents/Container/Container";
import CustomText from "../../../myComponents/CustomText/CustomText";

const RSVPEventsHeading = () => {
  return (
    <Container style={{ paddingHorizontal: 20 }}>
      <LinearGradient
        colors={["#2452FAFF", "#6CA8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headingContainer}
      >
        <View style={{ width: "28%" }}>
          <CustomText style={styles.headingText}>Name</CustomText>
        </View>

        <View style={{ width: "32%", alignItems: "center" }}>
          <CustomText style={styles.headingText}>Event Type</CustomText>
        </View>

        <View
          style={{
            width: "40%",
            alignItems: "flex-end",
          }}
        >
          <CustomText style={styles.headingText}>Sart Date</CustomText>
          <CustomText style={styles.headingText}>End Date</CustomText>
        </View>
      </LinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 11,
    marginBottom: -8,
    marginTop: 16,
    alignItems: "center",
  },
  headingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});

export default RSVPEventsHeading;
