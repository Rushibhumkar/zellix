import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { useGetAllReminders } from "../../services/rootApi/remaindersApi";
import { statusObj } from "../../utils/data";
import { truncateText } from "../../utils/commonFunctions";

// TEMPORARY: no real reminders exist yet to test against — remove once real data is available.
const DUMMY_FOLLOW_UPS = [
  {
    _id: "dummy-1",
    reminderTime: moment().hour(11).minute(30).toISOString(),
    leadId: {
      _id: "dummy-lead-1",
      clientName: "Rohan Mehta",
      name: "Rohan Mehta",
      status: "call_back",
      type: "lead",
    },
  },
  {
    _id: "dummy-2",
    reminderTime: moment().hour(14).minute(0).toISOString(),
    leadId: {
      _id: "dummy-lead-2",
      clientName: "Priya Sharma",
      name: "Priya Sharma",
      status: "followUp_required",
      type: "lead",
    },
  },
  {
    _id: "dummy-3",
    reminderTime: moment().subtract(2, "hours").toISOString(),
    leadId: {
      _id: "dummy-lead-3",
      clientName: "Amit Verma",
      name: "Amit Verma",
      status: "no_response",
      type: "calling_data",
    },
  },
];

const FollowUpsCard = ({ onRefresh }: any) => {
  const navigation = useNavigation();

  const { data, isLoading, refetch } = useGetAllReminders({
    filter: "upcoming",
    limit: 20,
  });

  useEffect(() => {
    if (onRefresh) {
      refetch();
    }
  }, [onRefresh]);

  const reminders = data?.pages?.flatMap((page: any) => page?.data || []) || [];

  const fetchedDueToday = reminders
    .filter((item: any) =>
      moment(item?.reminderTime).isSameOrBefore(moment().endOf("day")),
    )
    .sort(
      (a: any, b: any) =>
        moment(a?.reminderTime).valueOf() - moment(b?.reminderTime).valueOf(),
    );

  // TEMPORARY: fall back to dummy data when there are no real follow-ups yet — remove alongside DUMMY_FOLLOW_UPS above.
  const dueTodayReminders =
    !isLoading && fetchedDueToday.length === 0
      ? DUMMY_FOLLOW_UPS
      : fetchedDueToday;

  const visibleReminders = dueTodayReminders.slice(0, 5);

  const handlePressReminder = (item: any) => {
    if (item?._id?.startsWith?.("dummy-")) return;
    if (!item?.leadId?._id) return;
    navigation.navigate("allLead2", {
      screen: "LeadsDetails",
      params: {
        item: { _id: item.leadId._id },
        from: "reminders",
        remindersActiveTab: "Upcoming",
      },
    });
  };

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <CustomText style={styles.titleText}>Today's Follow-ups</CustomText>
          {dueTodayReminders.length > 0 && (
            <View style={styles.countBadge}>
              <CustomText style={styles.countBadgeText}>
                {dueTodayReminders.length}
              </CustomText>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Reminders" as never)}>
          <CustomText style={styles.viewAllText}>View All</CustomText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={color.mainTxtColor}
          style={{ marginVertical: 20 }}
        />
      ) : visibleReminders.length === 0 ? (
        <CustomText style={styles.emptyText}>
          No follow-ups due today
        </CustomText>
      ) : (
        visibleReminders.map((item: any) => (
          <TouchableOpacity
            key={item?._id}
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => handlePressReminder(item)}
          >
            <View style={styles.rowLeft}>
              <CustomText style={styles.time}>
                {moment(item?.reminderTime).format("hh:mm A")}
              </CustomText>
              <CustomText style={styles.date}>
                {moment(item?.reminderTime).format("DD MMM")}
              </CustomText>
            </View>

            <View style={styles.rowRight}>
              <CustomText style={styles.name} numberOfLines={1}>
                {item?.leadId?.clientName || "N/A"}
              </CustomText>

              <View style={styles.rowRightBottom}>
                {item?.leadId?.name && (
                  <View style={styles.pill}>
                    <Feather name="user" size={11} color="#7A869A" />
                    <CustomText style={styles.pillText}>
                      {truncateText(item?.leadId?.name || "-", 16)}
                    </CustomText>
                  </View>
                )}

                {item?.leadId?.status && (
                  <View style={[styles.pill, { backgroundColor: "#c8e9c7" }]}>
                    <Feather name="tag" size={11} color="#7a9a8c" />
                    <CustomText style={styles.pillText}>
                      {truncateText(
                        statusObj[item?.leadId?.status] ||
                          item?.leadId?.status ||
                          "-",
                        14,
                      )}
                    </CustomText>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default FollowUpsCard;

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    ...shadowPrimaryColor,
    borderLeftWidth: 4,
    borderLeftColor: color.mainTxtColorFade,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleText: {
    fontSize: 17,
    color: color.titleColor,
    letterSpacing: 0.3,
  },
  countBadge: {
    minWidth: 22,
    borderRadius: 11,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: color.mainTxtColor,
    justifyContent: "center",
    alignItems: "center",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  rowLeft: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontWeight: "700",
    fontSize: 13,
    color: "#1F2937",
  },
  date: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  rowRight: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: "center",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  rowRightBottom: {
    flexDirection: "row",
    marginTop: 6,
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 10,
    marginLeft: 3,
    color: "#64748B",
  },
});
