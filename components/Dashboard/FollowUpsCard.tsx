import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
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

  const dueTodayReminders = reminders
    .filter((item: any) =>
      moment(item?.reminderTime).isSameOrBefore(moment().endOf("day")),
    )
    .sort(
      (a: any, b: any) =>
        moment(a?.reminderTime).valueOf() - moment(b?.reminderTime).valueOf(),
    );

  const visibleReminders = dueTodayReminders.slice(0, 3);

  const handlePressReminder = (item: any) => {
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

  // Nothing due today — don't take up dashboard space at all.
  if (!isLoading && dueTodayReminders.length === 0) {
    return null;
  }

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

        <TouchableOpacity
          onPress={() => navigation.navigate("Reminders" as never)}
        >
          <CustomText style={styles.viewAllText}>View All</CustomText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={color.mainTxtColor}
          style={{ marginVertical: 20 }}
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 6 }}
        >
          {visibleReminders.map((item: any) => (
            <TouchableOpacity
              key={item?._id}
              style={styles.hCard}
              activeOpacity={0.7}
              onPress={() => handlePressReminder(item)}
            >
              <View style={styles.hCardTopRow}>
                <CustomText style={styles.time}>
                  {moment(item?.reminderTime).format("hh:mm A")}
                </CustomText>
                <CustomText style={styles.date}>
                  {moment(item?.reminderTime).format("DD MMM")}
                </CustomText>
              </View>

              <CustomText style={styles.name} numberOfLines={1}>
                {item?.leadId?.clientName || "N/A"}
              </CustomText>

              <View style={styles.rowRightBottom}>
                {item?.leadId?.name && (
                  <View style={[styles.pill, { maxWidth: "52%" }]}>
                    <Feather name="user" size={11} color="#7A869A" />
                    <CustomText style={styles.pillText}>
                      {truncateText(item?.leadId?.name || "-", 10)}
                    </CustomText>
                  </View>
                )}

                {item?.leadId?.status && (
                  <View
                    style={[
                      styles.pill,
                      { backgroundColor: "#c8e9c7", maxWidth: "52%" },
                    ]}
                  >
                    <Feather name="tag" size={11} color="#7a9a8c" />
                    <CustomText style={styles.pillText} numberOfLines={1}>
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
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  hCard: {
    width: 210,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
  },
  hCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  time: {
    fontWeight: "700",
    fontSize: 13,
    color: "#1F2937",
  },
  date: {
    fontSize: 11,
    color: "#6B7280",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: color.mainTxtColor,
    marginBottom: 6,
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
