import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import { roleHRM, statusColor, statusHRM } from "../../utils/hrmKeysMatchToBE";

import { shadowPrimaryColor } from "../../const/globalStyle";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface TRowEmployee {
  containerStyle?: StyleProp<ViewStyle>;

  onPress: () => void;

  item: {
    name: string;
    role: string;
    status: string;
    customId: string;
  };
}

const RowEmployee = ({ containerStyle, onPress, item }: TRowEmployee) => {
  return (
    <SlideFadeIn>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.card, containerStyle]}
      >
        {/* LEFT SECTION */}
        <View style={styles.leftSection}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <CustomText style={styles.avatarText}>
              {item?.name?.charAt(0)?.toUpperCase()}
            </CustomText>
          </View>

          {/* INFO */}
          <View style={styles.infoContainer}>
            <CustomText numberOfLines={1} style={styles.name}>
              {item?.name || "N/A"}
            </CustomText>

            <View style={styles.infoRow}>
              <Feather name="hash" size={11} color="#64748B" />

              <CustomText style={styles.idText}>
                {item?.customId || "N/A"}
              </CustomText>
            </View>

            <View style={styles.infoRow}>
              <Feather name="briefcase" size={11} color="#64748B" />

              <CustomText numberOfLines={1} style={styles.roleText}>
                {roleHRM[item?.role] || "N/A"}
              </CustomText>
            </View>
          </View>
        </View>

        {/* RIGHT SECTION */}
        <View style={styles.rightSection}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item?.status === "approved"
                    ? "#DCFCE7"
                    : item?.status === "rejected"
                      ? "#FEE2E2"
                      : item?.status === "pending"
                        ? "#FEF3C7"
                        : "#EEF4FF",
              },
            ]}
          >
            <CustomText
              style={[
                styles.statusText,
                {
                  color: statusColor[item?.status] || color.mainTxtColor,
                },
              ]}
            >
              {statusHRM[item?.status] || "N/A"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default RowEmployee;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginTop: 10,
    ...shadowPrimaryColor,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D67C6",
  },

  infoContainer: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    textTransform: "capitalize",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },

  idText: {
    fontSize: 11,
    color: "#64748B",
  },

  roleText: {
    fontSize: 11,
    color: "#64748B",
    textTransform: "capitalize",
    flex: 1,
  },

  rightSection: {
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
