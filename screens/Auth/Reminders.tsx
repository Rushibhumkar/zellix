import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Header from "../../components/Header";
import CustomText from "../../myComponents/CustomText/CustomText";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import moment from "moment";
import { Feather } from "@expo/vector-icons";
import {
  deleteReminder,
  markReminderAsCompleted,
  useGetAllReminders,
} from "../../services/rootApi/remaindersApi";
import { myConsole } from "../../hooks/useConsole";
import { useNavigation } from "@react-navigation/native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useAppToast } from "../../components/AppToast";

const Remainders = () => {
  const toast = useAppToast();
  const [activeTab, setActiveTab] = useState("Upcoming");

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllReminders({
    filter: activeTab.toLowerCase(),
    limit: 10,
  });

  const reminders = data?.pages?.flatMap((page) => page?.data || []) || [];

  // myConsole("remindersss", reminders);

  const navigation = useNavigation();
  const upcomingCount = reminders.filter(
    (i: any) => i?.status === "pending",
  ).length;

  const missedCount = reminders.filter(
    (i: any) => i?.status === "missed",
  ).length;

  const completedCount = reminders.filter(
    (i: any) => i?.status === "completed",
  ).length;

  const tabs = [
    { key: "Upcoming", count: upcomingCount },
    { key: "Missed", count: missedCount },
    { key: "Completed", count: completedCount },
  ];

  const handleMarkReminderComplete = async (id: string) => {
    try {
      const res = await markReminderAsCompleted(id);
      refetch();
    } catch (err: any) {
      console.log("errrrr", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteReminder(id);

      myConsole("resssss", res);

      toast.success(res?.data?.message || "Reminder cancelled successfully");

      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel reminder");
    }
  };

  const renderLeftActions = (item: any) => {
    return (
      <View style={styles.leftSwipeContainer}>
        <TouchableOpacity
          style={styles.readBtn}
          onPress={() => handleMarkReminderComplete(item._id)}
        >
          <Feather name="check-circle" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightActions = (id: string) => {
    return (
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(id)}
        >
          <Feather name="trash-2" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={"Remainders"}
        onBack={() =>
          navigation.navigate("Dashboard", {
            screen: "dashboard", // 👈 tab name
          })
        }
      />

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabBtn, isActive && styles.activeTabBtn]}
              >
                <CustomText
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab.key}
                </CustomText>

                {tab.count > 0 && (
                  <View style={[styles.badge, isActive && styles.activeBadge]}>
                    <CustomText
                      style={[
                        styles.badgeText,
                        isActive && styles.activeBadgeText,
                      ]}
                    >
                      {tab.count}
                    </CustomText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={reminders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && isFetching}
            onRefresh={refetch}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="small" style={{ marginTop: 40 }} />
          ) : isError ? (
            <CustomText style={{ textAlign: "center", marginTop: 40 }}>
              Something went wrong
            </CustomText>
          ) : (
            <NoDataFound style={{ marginTop: 80 }} showTxt />
          )
        }
        renderItem={({ item, index }) => {
          const time = moment(item?.reminderTime).format("hh:mm A");
          const date = moment(item?.reminderTime).format("DD MMM");
          const status = item?.status?.toLowerCase()?.trim();

          return ["pending", "missed"].includes(status) ? (
            <Swipeable
              renderRightActions={() => renderRightActions(item._id)}
              renderLeftActions={() => renderLeftActions(item)}
              overshootRight={false}
            >
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={async () => {
                  if (!item?.leadId?._id) return;
                  if (item?.status?.toLowerCase()?.trim() === "missed") {
                    await handleMarkReminderComplete(item._id);
                  }
                  navigation.navigate("allLead2", {
                    screen: "LeadsDetails",
                    params: {
                      item: { _id: item.leadId._id },
                      from: "reminders",
                    },
                  });
                }}
              >
                {/* LEFT */}
                <View style={styles.left}>
                  <CustomText style={styles.serial}>{index + 1}</CustomText>
                  <CustomText style={styles.time}>{time}</CustomText>
                  <CustomText style={styles.date}>{date}</CustomText>
                </View>

                {/* RIGHT */}
                <View style={styles.right}>
                  <View style={styles.topRow}>
                    <CustomText style={styles.title}>
                      {item?.leadId?.clientName || "N/A"}
                    </CustomText>

                    {/* <View style={styles.statusBadge}>
                      <CustomText style={styles.statusText}>
                        {item?.status}
                      </CustomText>
                    </View> */}
                  </View>

                  <CustomText style={styles.message}>
                    {item?.message}
                  </CustomText>

                  <View style={styles.bottomRow}>
                    <View style={styles.pill}>
                      <Feather name="user" size={12} color="#7A869A" />
                      <CustomText style={styles.pillText}>
                        {item?.leadId?.name || "-"}
                      </CustomText>
                    </View>

                    <View style={styles.pill}>
                      <Feather name="tag" size={12} color="#7A869A" />
                      <CustomText style={styles.pillText}>
                        {item?.type}
                      </CustomText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          ) : (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={async () => {
                if (!item?.leadId?._id) return;
                if (
                  ["pending", "missed"].includes(
                    item?.status?.toLowerCase()?.trim(),
                  )
                ) {
                  await handleMarkReminderComplete(item._id);
                }
                navigation.navigate("allLead2", {
                  screen: "LeadsDetails",
                  params: {
                    item: { _id: item.leadId._id },
                    from: "reminders",
                  },
                });
              }}
            >
              {/* LEFT */}
              <View style={styles.left}>
                <CustomText style={styles.serial}>{index + 1}</CustomText>
                <CustomText style={styles.time}>{time}</CustomText>
                <CustomText style={styles.date}>{date}</CustomText>
              </View>

              {/* RIGHT */}
              <View style={styles.right}>
                <View style={styles.topRow}>
                  <CustomText style={styles.title}>
                    {item?.leadId?.clientName || "N/A"}
                  </CustomText>

                  {/* <View style={styles.statusBadge}>
                    <CustomText style={styles.statusText}>
                      {item?.status}
                    </CustomText>
                  </View> */}
                </View>

                <CustomText style={styles.message}>{item?.message}</CustomText>

                <View style={styles.bottomRow}>
                  <View style={styles.pill}>
                    <Feather name="user" size={12} color="#7A869A" />
                    <CustomText style={styles.pillText}>
                      {item?.leadId?.name || "-"}
                    </CustomText>
                  </View>

                  <View style={styles.pill}>
                    <Feather name="tag" size={12} color="#7A869A" />
                    <CustomText style={styles.pillText}>
                      {item?.type}
                    </CustomText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
          ) : null
        }
      />
    </View>
  );
};

export default Remainders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  /* Tabs */
  tabsWrapper: {
    paddingVertical: 10,
  },

  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 10,
  },

  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },

  activeTabBtn: {
    backgroundColor: "#3B82F6",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  activeTabText: {
    color: "#fff",
  },

  badge: {
    marginLeft: 6,
    minWidth: 20,
    borderRadius: 10,
    paddingVertical: 4,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  activeBadge: {
    backgroundColor: "#2563EB",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  activeBadgeText: {
    color: "#fff",
  },

  /* Card */
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  left: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  serial: {
    position: "absolute",
    top: 0,
    left: 0,
    fontSize: 12,
    color: "#6B7280",
  },

  time: {
    fontWeight: "700",
    color: "#1F2937",
  },

  date: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  right: {
    flex: 1,
    paddingLeft: 10,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
    flex: 1,
  },

  statusBadge: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    color: "#3730A3",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  message: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 6,
  },

  bottomRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  pillText: {
    fontSize: 11,
    marginLeft: 4,
    color: "#64748B",
  },

  deleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: 10,
    marginRight: 10,
  },

  deleteBtn: {
    backgroundColor: "#EF4444",
    width: 70,
    height: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  leftSwipeContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 10,
    marginLeft: 10,
  },

  readBtn: {
    backgroundColor: "#10B981",
    width: 70,
    height: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
