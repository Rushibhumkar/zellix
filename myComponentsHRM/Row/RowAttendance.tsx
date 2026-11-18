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
  statusAttend,
  statusColorAttend,
} from "../../utils/hrmKeysMatchToBE";

import { color } from "../../const/color";
import { shadowPrimaryColor } from "../../const/globalStyle";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

export interface TRowAttendance {
  containerStyle?: StyleProp<ViewStyle>;
  action?: React.ReactNode;
  personal?: boolean;

  onPress: () => void;

  item: {
    name?: string;
    role?: string;
    punchedInType?: string;
    punchedOutType?: string;
    punchedIn?: string;
    punchedOut?: string;
    workDate?: string;
    status: string;
    lateMinutes?: number;
    workMinutes?: number;
    visitCount?: number;
    reviewFlags?: string[];
    createdAt: string;
    issue: boolean;
    resolve: boolean;
  };
}

const RowAttendance = ({ containerStyle, onPress, item, action, personal }: TRowAttendance) => {
  const attendanceDate = item.workDate || item.createdAt;
  const date = attendanceDate ? moment(attendanceDate) : null;
  const dateLabel = date?.isValid() ? date.locale("en").format("D MMM YYYY") : "—";
  const needsReview = !!item.reviewFlags?.length;
  const statusText = statusAttend[item.status] || "—";
  const statusTint = item.status === "present" ? "#15803D" : statusColorAttend[item.status] || color.mainTxtColor;
  const formatTime = (value?: string) => {
    const time = value ? moment(value) : null;
    return time?.isValid() ? time.format("hh:mm A") : "—";
  };
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
          {personal ? (
            <View style={styles.leftSection}>
              <View style={styles.avatar}>
                <Feather name="calendar" size={17} color="#2D67C6" />
              </View>
              <CustomText style={styles.userName}>{dateLabel}</CustomText>
            </View>
          ) : <View style={styles.leftSection}>
            <View style={styles.avatar}>
              <CustomText style={styles.avatarText}>
                {item?.name?.charAt(0)?.toUpperCase()}
              </CustomText>
            </View>

            <View style={{ flex: 1 }}>
              <CustomText numberOfLines={1} style={styles.userName}>
                {item?.name || "N/A"}
              </CustomText>

            </View>
          </View>}

          <View style={[styles.rightDetails, action ? styles.rightDetailsWithAction : undefined]}>
            {!personal && <View style={[styles.dateInline, action ? styles.centeredDate : undefined]}>
              <Feather name="calendar" size={10} color="#64748B" />

              <CustomText style={styles.dateText}>
                {dateLabel}
              </CustomText>
            </View>}
            <View style={[styles.badgeRow, action && styles.centeredStatus]}>
              {typeof item.visitCount === "number" && item.visitCount > 0 && (
                <View style={[styles.statusBadge, styles.visitBadge]}>
                  <CustomText style={[styles.statusText, styles.visitBadgeText]}>
                    {item.visitCount} {item.visitCount === 1 ? "visit" : "visits"}
                  </CustomText>
                </View>
              )}
              <View style={[styles.statusBadge, { backgroundColor: statusTint + "18" }]}>
                <CustomText style={[styles.statusText, { color: statusTint }]}>{statusText}</CustomText>
              </View>
              {item.status === "present" && (item.lateMinutes ?? 0) > 0 && (
                <View style={[styles.statusBadge, { backgroundColor: "#FEF3C7" }]}>
                  <CustomText style={[styles.statusText, { color: "#92400E" }]}>Late</CustomText>
                </View>
              )}
              {needsReview && (
                <View style={[styles.statusBadge, { backgroundColor: "#FEF3C7" }]}>
                  <CustomText style={[styles.statusText, { color: "#92400E" }]}>Needs Review</CustomText>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.middleRow}>
          {([
            ["log-in", "Check In", item.punchedIn],
            ["log-out", "Check Out", item.punchedOut],
          ] as const).map(([icon, label, value]) => (
            <View key={label} style={styles.infoItem}>
              <Feather name={icon} size={14} color="#2D67C6" />
              <View style={styles.punchDetails}>
                <CustomText style={styles.roleText}>{label}</CustomText>
                <CustomText style={styles.infoText}>{formatTime(value)}</CustomText>
              </View>
            </View>
          ))}
        </View>
        {item.issue && (
          <CustomText style={[styles.issueText, { color: item.resolve ? "#15803D" : "#B91C1C" }]}>
            {item.resolve ? "Issue resolved" : "Issue open"}
          </CustomText>
        )}
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
    marginTop: 8,
    ...shadowPrimaryColor,
  },

  cardContent: { padding: 10 },
  actionCorner: {
    position: "absolute",
    top: 10,
    right: 10,
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
  badgeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 },
  visitBadge: { backgroundColor: "#EEF4FF", paddingHorizontal: 7 },
  visitBadgeText: { color: "#245AA9" },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  },

  punchDetails: { flex: 1, gap: 2 },
  issueText: { fontSize: 11, marginTop: 6 },
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 8,
  },

  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  infoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    fontVariant: ["tabular-nums"],
  },

  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
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



  dateInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
});
