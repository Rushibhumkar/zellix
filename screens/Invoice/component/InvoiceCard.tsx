import moment from "moment";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";
import { Feather } from "@expo/vector-icons";

interface TInvoiceCard {
  item: any;
  onPress: () => void;
  index: number;
}

const InvoiceCard = ({ item, onPress, index }: TInvoiceCard) => {
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
              <Feather name="file-text" size={16} color="#2D67C6" />
            </View>
            <View>
              <CustomText style={styles.devName}>
                {item?.developer?.name || "N/A"}
              </CustomText>
              <CustomText style={styles.clientName}>
                {item?.clientName || "N/A"}
              </CustomText>
            </View>
          </View>

          <CustomText style={styles.amount}>
            ₹{item?.totalExcludedVat || "0"}
          </CustomText>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              {moment(item?.createdAt).format("DD MMM YYYY")}
            </CustomText>
          </View>

          <View style={styles.infoItem}>
            <Feather name="user" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              {item?.developer?.name || "N/A"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default InvoiceCard;

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

  devName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },

  clientName: {
    fontSize: 12,
    color: "#7A869A",
    marginTop: 2,
  },

  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D67C6",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
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
