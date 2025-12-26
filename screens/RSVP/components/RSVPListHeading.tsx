import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Container from "../../../myComponents/Container/Container";
import CustomText from "../../../myComponents/CustomText/CustomText";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

const RSVPListHeading = () => {
  return (
    <Container style={{ paddingHorizontal: 20 }}>
      <LinearGradient
        colors={["#2452FAFF", "#6CA8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headingContainer}
      >
        <View style={{ width: "36%" }}>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>Client Name</CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>Client Mobile</CustomText>
          </SlideFadeIn>
        </View>

        <View style={{ width: "36%", alignItems: "center" }}>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>Response Status</CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>Attend Status</CustomText>
          </SlideFadeIn>
        </View>

        <View
          style={{
            width: "28%",
            alignItems: "flex-end",
            paddingRight: 8,
          }}
        >
          <SlideFadeIn>
            <CustomText style={styles.headingText}>Date</CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>Time</CustomText>
          </SlideFadeIn>
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

export default RSVPListHeading;
