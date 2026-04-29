import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

import { color } from "../../const/color";
import { shadowPrimaryColor } from "../../const/globalStyle";
import CustomText from "../CustomText/CustomText";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface TeamRowItem {
  serial: number;
  teamName: string;
  managerName: string;
  teamLeadName: string;
  onLongPress: () => void;
  isSelected: boolean;
  bgColor: string;
  index?: number;
}

const TeamRowItem = ({
  serial,
  teamName,
  managerName,
  teamLeadName,
  onLongPress,
  isSelected,
  bgColor,
}: TeamRowItem) => {
  return (
    <SlideFadeIn>
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={!!onLongPress ? onLongPress : undefined}
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? "#E8F1FF" : bgColor || "#FFFFFF",

            borderColor: isSelected ? "#2D67C6" : color.borderColor,
          },
        ]}
      >
        {/* Left Avatar */}
        <View style={styles.avatar}>
          <CustomText style={styles.avatarText}>
            {teamName?.charAt(0)?.toUpperCase() || "T"}
          </CustomText>
        </View>

        {/* Team Details */}
        <View style={styles.content}>
          {/* Top Row */}
          <View style={styles.topRow}>
            <CustomText numberOfLines={1} style={styles.teamName}>
              {teamName || "N/A"}
            </CustomText>

            <View style={styles.serialBox}>
              <CustomText style={styles.serialText}>
                {typeof serial === "string"
                  ? serial
                  : serial < 10
                    ? `0${serial}`
                    : serial}
              </CustomText>
            </View>
          </View>

          {/* Manager */}
          <View style={styles.infoRow}>
            <Feather name="briefcase" size={13} color="#64748B" />

            <CustomText numberOfLines={1} style={styles.infoText}>
              Manager : {managerName || "N/A"}
            </CustomText>
          </View>

          {/* Team Lead */}
          <View style={styles.infoRow}>
            <Feather name="users" size={13} color="#64748B" />

            <CustomText numberOfLines={1} style={styles.infoText}>
              Team Lead : {teamLeadName || "N/A"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default TeamRowItem;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 6,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    ...shadowPrimaryColor,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D67C6",
  },

  content: {
    flex: 1,
    marginRight: 10,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  teamName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
    marginRight: 10,
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

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },

  infoText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
  },
});
