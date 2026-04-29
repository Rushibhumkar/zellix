import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import moment from "moment";

import { shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

const CardProject = ({
  item,
  onPress,
  index,
  selected,
  bgColor,
  onLongPress,
}: any) => {
  return (
    <SlideFadeIn>
      <TouchableOpacity
        activeOpacity={0.85}
        key={index}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.card,
          {
            backgroundColor: selected ? "#E8F1FF" : bgColor || "#FFFFFF",

            borderColor: selected ? "#2D67C6" : color.borderColor,
          },
        ]}
      >
        {/* Top Section */}
        <View style={styles.topRow}>
          <View style={styles.leftTop}>
            <View style={styles.iconBox}>
              <Feather name="folder" size={18} color="#2D67C6" />
            </View>

            <View style={{ flex: 1 }}>
              <CustomText numberOfLines={1} style={styles.projectName}>
                {item?.projectName || "N/A"}
              </CustomText>

              <View style={styles.infoRow}>
                <Feather name="globe" size={12} color="#64748B" />

                <CustomText numberOfLines={1} style={styles.infoText}>
                  {item?.source || "N/A"}
                </CustomText>
              </View>
            </View>
          </View>

          <View style={styles.leadBox}>
            <CustomText style={styles.leadCount}>
              {item?.totalLeads || 0}
            </CustomText>

            <CustomText style={styles.leadLabel}>Leads</CustomText>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom Section */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomItem}>
            <Feather name="layout" size={13} color="#64748B" />

            <CustomText numberOfLines={1} style={styles.bottomText}>
              {item?.pageName || "N/A"}
            </CustomText>
          </View>

          <View style={styles.bottomItem}>
            <Feather name="users" size={13} color="#64748B" />

            <CustomText style={styles.bottomText}>
              {item?.totalMembers || 0}
            </CustomText>
          </View>

          <View style={styles.bottomItem}>
            <Feather name="calendar" size={13} color="#64748B" />

            <CustomText style={styles.bottomText}>
              {moment(item?.createdAt).format("DD MMM")}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default CardProject;

export const HeaderProjectList = () => {
  return null;
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 12,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    ...shadowPrimaryColor,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftTop: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  projectName: {
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

  infoText: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "capitalize",
    flex: 1,
  },

  leadBox: {
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  leadCount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D67C6",
  },

  leadLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bottomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },

  bottomText: {
    fontSize: 12,
    color: "#64748B",
  },
});
