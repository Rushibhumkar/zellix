import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { shadowPrimaryColor } from "../../../const/globalStyle";
import { color } from "../../../const/color";
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
  const [visibleTooltip, setVisibleTooltip] = useState<
    "flagged" | "rejected" | null
  >(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = (tooltip: "flagged" | "rejected") => {
    setVisibleTooltip(tooltip);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }
    tooltipTimerRef.current = setTimeout(() => {
      tooltipTimerRef.current = null;
      setVisibleTooltip(null);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

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
  const reviewStatus = item?.reviewStatus || "pending";
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
      style={[
        styles.card,
        reviewMode && styles.reviewCard,
        selected && styles.selectedCard,
        visibleTooltip && styles.cardWithTooltip,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.header, reviewMode && styles.reviewHeader]}>
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

      <View style={[styles.callMeta, reviewMode && styles.reviewCallMeta]}>
        <View style={{ flex: 1 }}>
          <View style={[styles.row, reviewMode && styles.reviewRow]}>
            <Feather name="phone-call" size={14} color="#64748B" />

            <Text
              numberOfLines={1}
              style={[styles.infoText, reviewMode && styles.reviewInfoText]}
            >
              {clientMobile}
            </Text>
          </View>

          <View style={[styles.row, reviewMode && styles.reviewRow]}>
            <Feather name="calendar" size={14} color="#64748B" />

            <Text
              numberOfLines={1}
              style={[styles.infoText, reviewMode && styles.reviewInfoText]}
            >
              {callDateTime}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.row,
            styles.durationRow,
            reviewMode && styles.reviewRow,
          ]}
        >
          <Feather name="clock" size={14} color="#64748B" />

          <Text style={[styles.infoText, reviewMode && styles.reviewInfoText]}>
            {formatSeconds(item?.duration ?? 0)}
          </Text>
        </View>
      </View>

      {reviewMode &&
      ((item?.userId && typeof item.userId === "object") ||
        item?.leadStatusAfterCall) ? (
        <View style={styles.reviewSummaryRow}>
          {item?.userId && typeof item.userId === "object" && (
            <View style={[styles.row, styles.reviewRow, styles.reviewUser]}>
              <Feather name="user" size={14} color="#64748B" />
              <Text
                numberOfLines={1}
                style={[styles.infoText, styles.reviewInfoText]}
              >
                {[item.userId.name, item.userId.lastName]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </Text>
            </View>
          )}
          {!!item?.leadStatusAfterCall && (
            <View style={[styles.tag, styles.reviewTag]}>
              <Text
                numberOfLines={1}
                style={[styles.tagText, styles.reviewTagText]}
              >
                {item.leadStatusAfterCall.replaceAll("_", " ")}
              </Text>
            </View>
          )}
        </View>
      ) : !!item?.leadStatusAfterCall ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {item.leadStatusAfterCall.replaceAll("_", " ")}
          </Text>
        </View>
      ) : null}

      {!!item?.comment && (
        <Text
          numberOfLines={reviewMode ? 1 : 2}
          style={[styles.comment, reviewMode && styles.reviewComment]}
        >
          {item.comment}
        </Text>
      )}
      {(reviewMode ||
        (showFlag && isFlagged) ||
        reviewStatus === "rejected") && (
        <View
          style={[
            styles.reviewFooter,
            reviewMode && styles.compactReviewFooter,
          ]}
        >
          <View
            style={[
              styles.reviewBadges,
              reviewMode && styles.compactReviewBadges,
            ]}
          >
            {reviewMode && reviewStatus === "pending" && (
              <View
                style={[styles.reviewStatus, { backgroundColor: "#FEF3C7" }]}
              >
                <Text style={[styles.reviewStatusText, { color: "#92400E" }]}>
                  Pending
                </Text>
              </View>
            )}
            {reviewStatus === "rejected" && (
              <View style={styles.statusIconWrapper}>
                {visibleTooltip === "rejected" && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>
                      This call was rejected during review.
                    </Text>
                    <View style={styles.tooltipArrow} />
                  </View>
                )}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Rejected call information"
                  hitSlop={8}
                  style={[styles.statusIcon, styles.rejectedIcon]}
                  onPress={() => showTooltip("rejected")}
                >
                  <Feather name="x" size={14} color="#B91C1C" />
                </TouchableOpacity>
              </View>
            )}
            {showFlag && isFlagged && (
              <View style={styles.statusIconWrapper}>
                {visibleTooltip === "flagged" && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>
                      This call is flagged for review.
                    </Text>
                    <View style={styles.tooltipArrow} />
                  </View>
                )}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Flagged call information"
                  hitSlop={8}
                  style={[styles.statusIcon, styles.flaggedIcon]}
                  onPress={() => showTooltip("flagged")}
                >
                  <Feather name="flag" size={12} color="#6D28D9" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          {reviewMode && !selected && (
            <View style={[styles.reviewActions, styles.compactReviewActions]}>
              {flagEligible && (
                <TouchableOpacity
                  hitSlop={4}
                  style={[
                    styles.reviewButton,
                    styles.compactReviewButton,
                    isFlagged ? styles.unflagButton : styles.flagButton,
                  ]}
                  onPress={() => onFlagToggle?.(!isFlagged)}
                >
                  <Text
                    style={[
                      styles.reviewButtonText,
                      styles.compactReviewButtonText,
                    ]}
                  >
                    {isFlagged ? "Unflag" : "Flag"}
                  </Text>
                </TouchableOpacity>
              )}
              {item.reviewStatus !== "approved" && (
                <TouchableOpacity
                  hitSlop={4}
                  style={[
                    styles.reviewButton,
                    styles.compactReviewButton,
                    styles.approveButton,
                  ]}
                  onPress={onApprove}
                >
                  <Text
                    style={[
                      styles.reviewButtonText,
                      styles.compactReviewButtonText,
                    ]}
                  >
                    Approve
                  </Text>
                </TouchableOpacity>
              )}
              {item.reviewStatus !== "rejected" && (
                <TouchableOpacity
                  hitSlop={4}
                  style={[
                    styles.reviewButton,
                    styles.compactReviewButton,
                    styles.rejectButton,
                  ]}
                  onPress={onReject}
                >
                  <Text
                    style={[
                      styles.reviewButtonText,
                      styles.compactReviewButtonText,
                    ]}
                  >
                    Reject
                  </Text>
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
  reviewCard: {
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 7,
  },
  cardWithTooltip: {
    zIndex: 50,
    elevation: 12,
  },
  selectedCard: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  reviewFooter: { marginTop: 8, gap: 8 },
  compactReviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    gap: 6,
  },
  reviewBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  compactReviewBadges: {
    flexShrink: 0,
    gap: 5,
  },
  reviewStatus: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  reviewStatusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    color: "#334155",
  },
  statusIconWrapper: {
    position: "relative",
    alignItems: "center",
    overflow: "visible",
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  rejectedIcon: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  flaggedIcon: {
    backgroundColor: "#EDE9FE",
    borderColor: "#C4B5FD",
  },
  tooltip: {
    position: "absolute",
    bottom: 38,
    width: 174,
    left: -7,
    zIndex: 20,
    elevation: 8,
    backgroundColor: "#334155",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...shadowPrimaryColor,
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -7,
    left: 14,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#334155",
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  compactReviewActions: {
    flex: 1,
    flexWrap: "nowrap",
    gap: 5,
  },
  reviewButton: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  compactReviewButton: {
    minHeight: 28,
    paddingHorizontal: 9,
    paddingVertical: 5,
    justifyContent: "center",
  },
  approveButton: { backgroundColor: "#16A34A" },
  rejectButton: { backgroundColor: "#DC2626" },
  flagButton: { backgroundColor: color.primaryColor },
  unflagButton: { backgroundColor: color.secondaryColor },
  reviewButtonText: { color: "white", fontWeight: "700", fontSize: 12 },
  compactReviewButtonText: { fontSize: 11 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewHeader: { marginBottom: 5 },

  callMeta: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  reviewCallMeta: { gap: 8 },
  durationRow: { alignSelf: "flex-end" },
  reviewSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginVertical: 2,
  },
  reviewUser: { flex: 1, minWidth: 0 },

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
  reviewRow: { marginBottom: 2 },

  infoText: {
    marginLeft: 8,
    color: "#475569",
    fontSize: 13,
  },
  reviewInfoText: { marginLeft: 6, fontSize: 12 },

  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },
  reviewTag: {
    flexShrink: 1,
    maxWidth: "46%",
    marginTop: 0,
    paddingVertical: 2,
  },

  tagText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  reviewTagText: { fontSize: 11 },

  comment: {
    marginTop: 6,
    color: "#475569",
    fontSize: 12,
  },
  reviewComment: { marginTop: 3, fontSize: 11, lineHeight: 15 },
});
