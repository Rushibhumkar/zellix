import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

import { color } from "../../const/color";
import { shadowPrimaryColor } from "../../const/globalStyle";
import CustomText from "../CustomText/CustomText";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

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
    <SlideFadeIn>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={!!onPress ? onPress : undefined}
        onLongPress={!onLongPress ? undefined : onLongPress}
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? "#E8F1FF" : bgColor || "#FFFFFF",

            borderColor: isSelected ? "#2D67C6" : color.borderColor,
          },
        ]}
      >
        {/* Left Side */}
        <View style={styles.leftSection}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <CustomText style={styles.avatarText}>
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </CustomText>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <CustomText numberOfLines={1} style={styles.userName}>
                {userName ?? "N/A"}
              </CustomText>

              <View style={styles.serialBox}>
                <CustomText style={styles.serialText}>
                  {typeof serialNo !== "string" ? `${serialNo + 1}` : serialNo}
                </CustomText>
              </View>
            </View>

            <View style={styles.roleRow}>
              <Feather name="briefcase" size={12} color="#64748B" />

              <CustomText numberOfLines={1} style={styles.roleText}>
                {role ?? "N/A"}
              </CustomText>
            </View>

            <View style={styles.emailRow}>
              <Feather name="mail" size={12} color="#64748B" />

              <CustomText numberOfLines={1} style={styles.emailText}>
                {email ?? "N/A"}
              </CustomText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default UserRowItem;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadowPrimaryColor,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F1FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D67C6",
  },

  userInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
    marginRight: 10,
    textTransform: "capitalize",
  },

  serialBox: {
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },

  serialText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2D67C6",
  },

  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },

  roleText: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "capitalize",
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },

  emailText: {
    fontSize: 12,
    color: "#94A3B8",
    flex: 1,
  },

  arrowContainer: {
    marginLeft: 10,
  },
});
