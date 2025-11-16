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
import { color } from "../../const/color";
import moment from "moment";
import { roleHRM, statusColor, statusHRM } from "../../utils/hrmKeysMatchToBE";
import { shadowSecondaryColor } from "../../const/globalStyle";

interface TRowLeaveInAllList {
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  item: {
    name: string;
    role: string;
    status: string;
    days: number;
    createdAt: string;
  };
  isAgent?: boolean;
}

const RowLeaveInAllList = ({
  containerStyle,
  onPress,
  item,
  isAgent,
}: TRowLeaveInAllList) => {
  const getStatusBorderColor = (status) => {
    const colors = {
      approved: "#48BB78",
      pending: "#ED8936",
      rejected: "#F56565",
    };
    return colors[status] || "#CBD5E0";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        { borderLeftColor: getStatusBorderColor(item?.status) },
        containerStyle,
      ]}
    >
      {!isAgent && (
        <View style={styles.contentContainer}>
          <View style={styles.mainInfo}>
            <CustomText style={styles.nameText}>{item?.name}</CustomText>
            <CustomText style={styles.roleText}>
              {roleHRM[item?.role]}
            </CustomText>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <CustomText style={styles.detailLabel}>Days</CustomText>
              <View style={styles.daysBadge}>
                <CustomText style={styles.daysText}>{item?.days}</CustomText>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${statusColor[item?.status]}20` },
                ]}
              >
                <CustomText
                  style={[
                    styles.statusText,
                    { color: statusColor[item?.status] },
                  ]}
                >
                  {statusHRM[item?.status]}
                </CustomText>
              </View>
              <CustomText style={styles.dateText}>
                {moment(item?.createdAt).format("DD/MM/YYYY") ?? "NA"}
              </CustomText>
            </View>
          </View>
        </View>
      )}
      {isAgent && (
        <View style={styles.contentContainer}>
          <View style={styles.daysSection}>
            <CustomText style={styles.daysText}>{item?.days}</CustomText>
            <CustomText style={styles.detailLabel}>Days</CustomText>
          </View>

          <View style={styles.mainInfo}>
            <CustomText style={styles.roleText}>
              {roleHRM[item?.role]}
            </CustomText>
          </View>

          <View style={styles.statusSection}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor[item?.status]}20` },
              ]}
            >
              <CustomText
                style={[
                  styles.statusText,
                  { color: statusColor[item?.status] },
                ]}
              >
                {statusHRM[item?.status]}
              </CustomText>
            </View>
            <CustomText style={styles.dateText}>
              {moment(item?.createdAt).format("DD/MM/YYYY") ?? "NA"}
            </CustomText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default RowLeaveInAllList;

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
  daysSection: {
    alignItems: "center",
    gap: 4,
  },
  statusSection: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusItem: {
    alignItems: "flex-end",
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#A0AEC0",
    textTransform: "uppercase",
  },
  daysBadge: {
    backgroundColor: "#4299E1",
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
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#718096",
  },
});
