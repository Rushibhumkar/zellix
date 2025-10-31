import { Text, StyleSheet, View } from "react-native";
import React from "react";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";

const UserListHeading = () => {
  return (
    <View style={styles.headingContainer}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <CustomText style={styles.headingText}>No</CustomText>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <CustomText style={styles.headingText}>Name</CustomText>
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
        </View>
      </View>

      <CustomText style={[styles.headingText, { marginLeft: 20 }]}>
        Email
      </CustomText>
    </View>
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
