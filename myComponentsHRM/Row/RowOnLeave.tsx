import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import CustomText from "../../myComponents/CustomText/CustomText";
import { roleHRM } from "../../utils/hrmKeysMatchToBE";
import moment from "moment";

interface TRowOnLeave {
  containerStyle?: StyleProp<ViewStyle>;
  item: {
    name: string;
    role: string;
    days: number;
    createdAt: string;
    status: string;
  };
  onPress: () => void;
}

const RowOnLeave = ({ containerStyle, item, onPress }: TRowOnLeave) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, containerStyle]}>
      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <CustomText style={styles.nameText}>{item?.name ?? "N/A"}</CustomText>
          <CustomText style={styles.roleText}>{roleHRM[item?.role]}</CustomText>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <CustomText style={styles.detailLabel}>Days</CustomText>
            <View style={styles.daysBadge}>
              <CustomText style={styles.daysText}>{item?.days}</CustomText>
            </View>
          </View>

          <View style={styles.detailItem}>
            <CustomText style={styles.detailLabel}>Applied On</CustomText>
            <CustomText style={styles.dateText}>
              {moment(item.createdAt).format("DD/MM/YYYY")}
            </CustomText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RowOnLeave;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4ECDC4",
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainInfo: {
    flex: 1,
    gap: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A202C",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#718096",
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  detailItem: {
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#A0AEC0",
    textTransform: "uppercase",
  },
  daysBadge: {
    backgroundColor: "#4ECDC4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 30,
    alignItems: "center",
  },
  daysText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4A5568",
  },
});
