import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";
import { Feather } from "@expo/vector-icons";
import moment from "moment";

interface TExpenseCard {
  item: any;
  onPress: () => void;
  index: number;
}

const ExpenseCard = ({ item, onPress, index }: TExpenseCard) => {
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
              <Feather name="credit-card" size={16} color="#2D67C6" />
            </View>
            <View>
              <CustomText style={styles.category}>
                {item?.expenseCategory?.name || "N/A"}
              </CustomText>
              <CustomText style={styles.subCategory}>
                {item?.expenseSubCategory?.name || "N/A"}
              </CustomText>
            </View>
          </View>

          <CustomText style={styles.amount}>
            ₹{parseInt(item?.expenseAmount) || "0"}
          </CustomText>
        </View>

        {/* Middle Info */}
        <View style={styles.middleRow}>
          <View style={styles.infoItem}>
            <Feather name="user" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              {item?.responsiblePerson?.name || "N/A"}
            </CustomText>
          </View>

          <View style={styles.infoItem}>
            <Feather name="users" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              {item?.team?.name || "N/A"}
            </CustomText>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              {moment(item?.expenseDate).format("DD MMM YYYY")}
            </CustomText>
          </View>

          <View style={styles.infoItem}>
            <Feather name="percent" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              {item?.vatPercent || 0}%
            </CustomText>
          </View>

          <View style={styles.infoItem}>
            <Feather name="file-text" size={14} color="#7A869A" />
            <CustomText style={styles.infoText}>
              ₹{parseInt(item?.amountExcludedVat) || "0"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default ExpenseCard;

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

  category: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },

  subCategory: {
    fontSize: 12,
    color: "#7A869A",
    marginTop: 2,
  },

  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D67C6",
  },

  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  infoText: {
    fontSize: 12,
    color: "#475569",
  },
});
