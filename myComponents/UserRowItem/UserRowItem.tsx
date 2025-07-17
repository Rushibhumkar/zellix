import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { color } from "../../const/color";
import { shadow1 } from "../../const/globalStyle";
interface TUserRowItem {
  serialNo: number;
  userName: string;
  role: string;
  email: string;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected: boolean;
  bgColor: string;
}

const UserRowItem = ({
  serialNo,
  userName,
  role,
  email,
  onPress,
  onLongPress,
  isSelected,
  bgColor,
}: TUserRowItem) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? color.selectedBg
            : bgColor
            ? bgColor
            : color.listCardBg,
        },
      ]}
      onPress={!!onPress ? onPress : undefined}
      onLongPress={!onLongPress ? undefined : onLongPress}
    >
      <View style={{ flexDirection: "row" }}>
        {typeof serialNo !== "string" ? (
          <Text style={styles.box1}>
            {serialNo < 9 && 0}
            {serialNo + 1}
          </Text>
        ) : (
          <Text style={styles.box1}>{serialNo}</Text>
        )}
        <View style={styles.box2}>
          <Text
            numberOfLines={2}
            style={[
              styles.bold,
              {
                // marginBottom: 5,
                textTransform: "capitalize",
              },
            ]}
          >
            {userName ?? "N/A"}
          </Text>
          <Text numberOfLines={2} style={styles.lightText}>
            {role ?? "N/A"}
          </Text>
        </View>
        <Text numberOfLines={2} style={[styles.box3, { textAlign: "right" }]}>
          {email ?? "N/A"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default UserRowItem;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderColor: color.saffronMango,
    // backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 85,
    ...shadow1,
  },
  box1: {
    width: "10%",
    paddingRight: 3,
    fontSize: 14,
    fontWeight: "400",
  },
  box2: {
    width: "45%",
    paddingRight: 3,
  },
  box3: {
    width: "45%",
    paddingRight: 3,
    fontSize: 14,
    fontWeight: "400",
  },
  bold: {
    fontSize: 16,
    fontWeight: "700",
  },
  lightText: {
    fontSize: 12,
    fontWeight: "300",
  },
});
