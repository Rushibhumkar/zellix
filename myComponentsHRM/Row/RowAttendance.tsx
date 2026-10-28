import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import moment from "moment";

import CustomText from "../../myComponents/CustomText/CustomText";
import {
  punchType,
  roleHRM,
  statusAttend,
  statusColorAttend,
} from "../../utils/hrmKeysMatchToBE";

import { color } from "../../const/color";
import { shadowPrimaryColor } from "../../const/globalStyle";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface TRowAttendance {
  containerStyle?: StyleProp<ViewStyle>;
  action?: React.ReactNode;

  onPress: () => void;

  item: {
    name: string;
    role: string;
    punchedInType: string;
    status: string;
    createdAt: string;
    issue: boolean;
    resolve: boolean;
  };
}

const RowAttendance = ({ containerStyle, onPress, item, action }: TRowAttendance) => {
  return (
    <SlideFadeIn>
      <View style={[styles.card, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.cardContent}
      >
        {/* ROW 1 */}
        <View style={[styles.topRow, action ? styles.topRowWithAction : undefined]}>
          <View style={styles.leftSection}>
            <View style={styles.avatar}>
              <CustomText style={styles.avatarText}>
                {item?.name?.charAt(0)?.toUpperCase()}
              </CustomText>
            </View>

            <View style={{ flex: 1 }}>
              <CustomText numberOfLines={1} style={styles.userName}>
                {item?.name || "N/A"}
              </CustomText>

              <View style={styles.roleDateRow}>
                <View style={styles.roleRow}>
                  <Feather name="briefcase" size={10} color="#64748B" />

                  <CustomText numberOfLines={1} style={styles.roleText}>
                    {roleHRM[item?.role] || "N/A"}
                  </CustomText>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.rightDetails, action ? styles.rightDetailsWithAction : undefined]}>
            <View style={[styles.dateInline, action ? styles.centeredDate : undefined]}>
              <Feather name="calendar" size={10} color="#64748B" />

              <CustomText style={styles.dateText}>
                {moment(item?.createdAt).format("DD MMM YYYY")}
              </CustomText>
            </View>
          <View
            style={[
              styles.statusBadge,
              action ? styles.centeredStatus : undefined,
              {
                backgroundColor:
                  item?.status === "present"
                    ? "#DCFCE7" // light green (fixed)
                    : `${statusColorAttend[item?.status]}15`,
              },
            ]}
          >
            <CustomText
              style={[
                styles.statusText,
                {
                  color:
                    item?.status === "present"
                      ? "#15803D" // dark green (fixed)
                      : statusColorAttend[item?.status] || color.mainTxtColor,
                },
              ]}
            >
              {statusAttend[item?.status]}
            </CustomText>
          </View>
          </View>
        </View>

        {/* ROW 2 */}
        <View style={styles.middleRow}>
          <View style={styles.infoItem}>
            <Feather
              name={item?.punchedInType === "office" ? "home" : "map-pin"}
              size={11}
              color="#2D67C6"
            />

            <CustomText style={styles.infoText}>
              {punchType[item?.punchedInType] || "-"}
            </CustomText>
          </View>

          <View style={styles.infoItem}>
            <Feather
              name={
                !item?.issue
                  ? "check-circle"
                  : item?.resolve
                    ? "shield"
                    : "alert-circle"
              }
              size={11}
              color={
                !item?.issue ? "#16A34A" : item?.resolve ? "#F59E0B" : "#DC2626"
              }
            />

            <CustomText
              style={[
                styles.infoText,
                {
                  color: !item?.issue
                    ? "#16A34A"
                    : item?.resolve
                      ? "#F59E0B"
                      : "#DC2626",
                },
              ]}
            >
              {!item?.issue
                ? "No Issue"
                : item?.resolve
                  ? "Resolved"
                  : "Unresolved"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
      {action && <View style={styles.actionCorner}>{action}</View>}
      </View>
    </SlideFadeIn>
  );
};

export default RowAttendance;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginTop: 10,
    ...shadowPrimaryColor,
  },

  cardContent: { padding: 12 },
  actionCorner: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  rightDetails: {
    minWidth: 100,
    marginLeft: 10,
    alignItems: "flex-end",
    gap: 6,
  },
  rightDetailsWithAction: { alignItems: "center", alignSelf: "center", marginLeft: 8 },
  topRowWithAction: { paddingRight: 100, minHeight: 44 },
  centeredDate: { justifyContent: "center" },
  centeredStatus: { alignSelf: "center" },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D67C6",
  },

  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    textTransform: "capitalize",
  },
  roleText: {
    fontSize: 11,
    color: "#64748B",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },

  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  infoText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },

  dateText: {
    fontSize: 11,
    color: "#64748B",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-end",
  },

  roleDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    width: "100%",
  },

  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },

  dateInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
});
