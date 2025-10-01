import { Text, StyleSheet, View } from "react-native";
import React from "react";
import { color } from "../../const/color";

const UserListHeading = () => {
  return (
    <View style={styles.headingContainer}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Text style={styles.headingText}>No</Text>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={styles.headingText}>Name</Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#FFFFFF",
              lineHeight: 18,
            }}
          >
            Role
          </Text>
        </View>
      </View>

      <Text style={[styles.headingText, { marginLeft: 20 }]}>Email</Text>
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
