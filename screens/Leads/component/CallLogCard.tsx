import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { shadowPrimaryColor } from "../../../const/globalStyle";
import { formatSeconds } from "../../../utils/commonFunctions";

interface Props {
  item: any;
  onPress?: () => void;
  onCallPress?: (mobile: string) => void;
  onLongPress?: () => void;
  selected?: boolean;
  reviewMode?: boolean;
  showFlag?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onFlagToggle?: (isFlagged: boolean) => void;
}

const FLAG_ELIGIBLE_DURATION_SECONDS = 5 * 60;

const CallLogCard = ({
  item,
  onPress,
  onCallPress,
  onLongPress,
  selected,
  reviewMode,
  showFlag,
  onApprove,
  onReject,
  onFlagToggle,
}: Props) => {
  const getStatusColor = (type: string) => {
    switch (type) {
      case "positive":
        return "#16A34A";

      case "negative":
        return "#DC2626";

      case "connected":
        return "#2563EB";

      default:
        return "#F59E0B";
    }
  };

  const leadDetails =
    item?.leadId && typeof item?.leadId === "object" ? item.leadId : null;

  const clientName =
    leadDetails?.clientName?.trim() || item?.phoneNumber || "-";

  const clientMobile =
    leadDetails?.clientMobile?.trim() || item?.phoneNumber || "-";
  const callTimestamp = item?.initiatedAt || item?.createdAt;
  const flagEligible =
    typeof item?.flagEligible === "boolean"
      ? item.flagEligible
      : Number(item?.duration) >= FLAG_ELIGIBLE_DURATION_SECONDS;
  const isFlagged =
    flagEligible &&
    (typeof item?.isFlagged === "boolean" ? item.isFlagged : true);
  const callDateTime = callTimestamp
    ? new Date(callTimestamp).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              disabled={!!leadDetails}
              onPress={() => {
                if (!leadDetails) {
                  onCallPress?.(clientMobile);
                }
              }}
            >
              <View>
                <Text style={styles.name}>{clientName}</Text>

                {!leadDetails?._id && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#858585",
                      // marginTop: 1,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>

            {!!leadDetails?._id ? (
              <Feather
                name="chevron-right"
                size={16}
                color="#64748B"
                style={{ marginLeft: 4 }}
              />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  onCallPress?.(clientMobile);
                }}
              >
                <Feather
                  name="phone-call"
                  size={12}
                  color="#64748B"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: getStatusColor(item?.type),
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {(item?.type || "unknown").replace("_", " ")}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Feather name="phone-call" size={14} color="#64748B" />

            <Text style={styles.infoText}>{clientMobile}</Text>
          </View>

          <View style={styles.row}>
            <Feather name="calendar" size={14} color="#64748B" />

            <Text style={styles.infoText}>{callDateTime}</Text>
          </View>
        </View>

        <View style={[styles.row, { alignSelf: "flex-end" }]}>
          <Feather name="clock" size={14} color="#64748B" />

          <Text style={styles.infoText}>
            {formatSeconds(item?.duration ?? 0)}
          </Text>
        </View>
      </View>

      {reviewMode && item?.userId && typeof item.userId === "object" && (
        <View style={styles.row}>
          <Feather name="user" size={14} color="#64748B" />
          <Text style={styles.infoText}>
            {[item.userId.name, item.userId.lastName]
              .filter(Boolean)
              .join(" ") || "-"}
          </Text>
        </View>
      )}

      {!!item?.leadStatusAfterCall && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {item.leadStatusAfterCall.replaceAll("_", " ")}
          </Text>
        </View>
      )}

      {!!item?.comment && (
        <Text numberOfLines={2} style={styles.comment}>
          {item.comment}
        </Text>
      )}
      {(reviewMode || showFlag) && (
        <View style={styles.reviewFooter}>
          <View style={styles.reviewBadges}>
            {reviewMode && (
              <View
                style={[
                  styles.reviewStatus,
                  {
                    backgroundColor:
                      item.reviewStatus === "approved"
                        ? "#DCFCE7"
                        : item.reviewStatus === "rejected"
                          ? "#FEE2E2"
                          : "#FEF3C7",
                  },
                ]}
              >
                <Text style={styles.reviewStatusText}>
                  {item.reviewStatus || "pending"}
                </Text>
              </View>
            )}
            {showFlag && (
              <View
                style={[
                  styles.reviewStatus,
                  { backgroundColor: isFlagged ? "#FFEDD5" : "#F1F5F9" },
                ]}
              >
                <Text style={styles.reviewStatusText}>
                  {flagEligible
                    ? isFlagged
                      ? "Flagged"
                      : "Unflagged"
                    : "Flag: —"}
                </Text>
              </View>
            )}
          </View>
          {reviewMode && !selected && (
            <View style={styles.reviewActions}>
              {flagEligible && (
                <TouchableOpacity
                  style={[styles.reviewButton, styles.flagButton]}
                  onPress={() => onFlagToggle?.(!isFlagged)}
                >
                  <Text style={styles.reviewButtonText}>
                    {isFlagged ? "Unflag" : "Flag"}
                  </Text>
                </TouchableOpacity>
              )}
              {item.reviewStatus !== "approved" && (
                <TouchableOpacity
                  style={[styles.reviewButton, styles.approveButton]}
                  onPress={onApprove}
                >
                  <Text style={styles.reviewButtonText}>Approve</Text>
                </TouchableOpacity>
              )}
              {item.reviewStatus !== "rejected" && (
                <TouchableOpacity
                  style={[styles.reviewButton, styles.rejectButton]}
                  onPress={onReject}
                >
                  <Text style={styles.reviewButtonText}>Reject</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CallLogCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1.2,
    borderColor: "#E3E8EF",
    ...shadowPrimaryColor,
  },
  selectedCard: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  reviewFooter: { marginTop: 8, gap: 8 },
  reviewBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  reviewStatus: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  reviewStatusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    color: "#334155",
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  reviewButton: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  approveButton: { backgroundColor: "#16A34A" },
  rejectButton: { backgroundColor: "#DC2626" },
  flagButton: { backgroundColor: "#D97706" },
  reviewButtonText: { color: "white", fontWeight: "700", fontSize: 12 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  date: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  infoText: {
    marginLeft: 8,
    color: "#475569",
    fontSize: 13,
  },

  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },

  tagText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  comment: {
    marginTop: 6,
    color: "#475569",
    fontSize: 12,
  },
});
