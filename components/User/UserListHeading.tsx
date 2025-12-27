import { Text, StyleSheet, View } from "react-native";
import React from "react";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

const UserListHeading = () => {
  return (
    <LinearGradient
      colors={["#2E67BE", "#4985F2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 14,
          justifyContent: "space-between",
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 16,
        },
      ]}
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <SlideFadeIn>
          <CustomText style={styles.headingText}>No</CustomText>
        </SlideFadeIn>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <SlideFadeIn>
            <CustomText style={styles.headingText}>Name</CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#FFFFFF",
                lineHeight: 18,
              }}
            >
              Role
            </CustomText>
          </SlideFadeIn>
        </View>
      </View>
      <SlideFadeIn>
        <CustomText style={[styles.headingText, { marginLeft: 20 }]}>
          Email
        </CustomText>
      </SlideFadeIn>
    </LinearGradient>
  );
};
export default UserListHeading;
const styles = StyleSheet.create({
  headingContainer: {
    backgroundColor: color.primary200,
    flexDirection: "row",
    paddingHorizontal: 15,
    padding: 10,
    borderRadius: 16,
    gap: 100,
  },
  headingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});
