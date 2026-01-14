import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Container from "../../../myComponents/Container/Container";
import CustomText from "../../../myComponents/CustomText/CustomText";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

interface LeadListHeadingProps {
  noText: string;
  nameText: string;
  belowNameText: string;
  typeText: string;
  belowTypeText: string;
  statusText: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const LeadListHeading: React.FC<LeadListHeadingProps> = ({
  noText,
  nameText,
  belowNameText,
  typeText,
  belowTypeText,
  statusText,
  containerStyle,
}) => {
  return (
    <Container style={[{ paddingHorizontal: 20 }, containerStyle]}>
      <LinearGradient
        colors={["#2452FAFF", "#6CA8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headingContainer}
      >
        <View style={{ width: "10%" }}>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>{noText}</CustomText>
          </SlideFadeIn>
        </View>

        <View style={{ width: "36%" }}>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>{nameText}</CustomText>
            <CustomText style={styles.headingText}>{belowNameText}</CustomText>
          </SlideFadeIn>
        </View>

        <View style={{ width: "27%", alignItems: "center" }}>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>{typeText}</CustomText>
            <CustomText style={styles.headingText}>{belowTypeText}</CustomText>
          </SlideFadeIn>
        </View>

        <View style={{ width: "27%", alignItems: "center" }}>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>{statusText}</CustomText>
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
  },
  headingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});

export default LeadListHeading;
