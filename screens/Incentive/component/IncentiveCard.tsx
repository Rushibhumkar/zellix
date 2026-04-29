import moment from "moment";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { monthsStatic } from "../../../utils/data";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";
import { Feather } from "@expo/vector-icons";

interface TIncentiveCard {
  item: any;
  onPress: () => void;
  index: number;
}

const IncentiveCard = ({ item, onPress, index }: TIncentiveCard) => {
  return (
    <SlideFadeIn>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.card}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.leftTop}>
            <View style={styles.iconBox}>
              <Feather name="gift" size={16} color="#2D67C6" />
            </View>

            <View>
              <CustomText style={styles.userName}>
                {item?.user?.name || "N/A"}
              </CustomText>

              <CustomText style={styles.date}>
                {moment(item?.updatedAt).format("DD MMM YYYY") || "N/A"}
              </CustomText>
            </View>
          </View>

          <View
            style={[
              styles.statusBox,
              {
                backgroundColor:
                  item?.status === "paid" ? "#DCFCE7" : "#FEF3C7",
              },
            ]}
          >
            <CustomText
              style={[
                styles.statusText,
                {
                  color: item?.status === "paid" ? "#15803D" : "#B45309",
                },
              ]}
            >
              {item?.status || "N/A"}
            </CustomText>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              {monthsStatic?.[item?.month] || "N/A"}
            </CustomText>
          </View>

          <View style={styles.infoItem}>
            <Feather name="hash" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              {item?.year || "N/A"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default IncentiveCard;

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6ECF5",
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
    gap: 10,
  },

  iconBox: {
    backgroundColor: "#EEF4FF",
    padding: 8,
    borderRadius: 10,
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },

  date: {
    fontSize: 12,
    color: "#7A869A",
    marginTop: 2,
  },

  statusBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  infoText: {
    fontSize: 12,
    color: "#475569",
  },
});
