import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import { useGetNotificationHrm } from "../../hooks/useGetQuerryHRM";
import { myConsole } from "../../hooks/useConsole";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { useNavigation } from "@react-navigation/native";
import { routeAttendance, routeLeave, routeUser } from "../../utils/routesHRM";
import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";

const NotificationHRM = () => {
  const { navigate } = useNavigation();
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetNotificationHrm();
  const [refreshing, setRefreshing] = useState(false);
  //
  const groupNotificationsByDate = (notifications) => {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");

    return notifications.reduce((acc, notification) => {
      const notificationDate = moment(notification.time).startOf("day");
      let groupKey;

      if (notificationDate.isSame(today, "day")) {
        groupKey = "Today";
      } else if (notificationDate.isSame(yesterday, "day")) {
        groupKey = "Yesterday";
      } else {
        groupKey = notificationDate.format("MMMM DD, YYYY");
      }

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }

      acc[groupKey].push(notification);
      return acc;
    }, {});
  };
  const groupData = groupNotificationsByDate(!!data?.[0] ? data : []); //object m key m array
  //
  const onEndReach = () => {
    if (hasNextPage && !isLoading && data?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  const handleNotificationSeen = async (item) => {
    myConsole("item", item);
    try {
      if (!item?.seen) {
        // await getNotificationSeenById(user?._id, item?._id);
        // refetch();
      }
      if (item?.type === "leave") {
        navigate(routeLeave?.AllLeaveStack, {
          screen: routeLeave?.LeaveDetail,
          initial: false,
          params: { item: { ...item, from: "nav" } },
        });
      } else if (item?.type === "user") {
        navigate(routeUser?.AllUsersHRMStack, {
          screen: routeUser?.UserDetailHRM,
          initial: false,
          params: { item: { ...item, from: "nav" } },
        });
      } else if (item?.type === "attendance") {
        navigate(routeAttendance?.AttendanceStack, {
          screen: routeAttendance?.AttendanceDetail,
          initial: false,
          params: { item: { ...item, from: "nav" } },
        });
      }
      // getNotification();
    } catch (err) {
      console.log("err", err);
    }
  };
  return (
    <ContainerHRM
      isBAck={{
        title: "Notification",
      }}
    >
      <View style={styles.container}>
        <FlatList
          data={Object.entries(groupData)}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => {
            const [date, dateWiseData] = item;
            console.log("dateWiseData", dateWiseData);
            return (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <CustomText
                    fontSize={16}
                    fontWeight="700"
                    style={styles.dateText}
                  >
                    {date}
                  </CustomText>
                  <View style={styles.dateDivider} />
                </View>
                <View style={styles.notificationsContainer}>
                  {dateWiseData?.[0]
                    ? dateWiseData.map((notification, index) => (
                        <RowNotification
                          key={notification?._id?.toString()}
                          item={notification}
                          onPress={() => handleNotificationSeen(notification)}
                          isLast={index === dateWiseData.length - 1}
                        />
                      ))
                    : null}
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          onEndReached={onEndReach}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage && (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size={"small"} color={color.saffronMango} />
              </View>
            )
          }
          ListEmptyComponent={
            <>
              {isLoading && <LoadingCompo />}
              {!isLoading && data?.length === 0 && (
                <View style={styles.emptyContainer}>
                  <NoDataFound />
                  <CustomText style={styles.emptyText}>
                    No notifications found
                  </CustomText>
                </View>
              )}
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[color.saffronMango]}
              tintColor={color.saffronMango}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ContainerHRM>
  );
};

export default NotificationHRM;

interface TRowNotification {
  item: {
    message: string;
    title: string;
    type: string;
    seen: boolean;
    time: string;
  };
  onPress: () => void;
  isLast?: boolean;
}

const RowNotification = ({ item, onPress, isLast }: TRowNotification) => {
  const getTypeColor = (type: string) => {
    const colors = {
      leave: "#FF6B6B",
      user: "#4ECDC4",
      attendance: "#45B7D1",
      default: "#95A5A6",
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      leave: "beach-access",
      user: "person",
      attendance: "schedule",
      default: "notifications",
    };
    return icons[type as keyof typeof icons] || icons.default;
  };

  const typeColor = getTypeColor(item.type);
  const typeIcon = getTypeIcon(item.type);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.notificationCard, !item.seen && styles.unseenCard]}
    >
      <View style={[styles.iconContainer, { backgroundColor: typeColor }]}>
        <MaterialIcons name={typeIcon as any} size={20} color="#FFFFFF" />
        {!item.seen && <View style={styles.unseenBadge} />}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <CustomText fontSize={16} fontWeight="600" style={styles.titleText}>
              {item?.title ?? "--"}
            </CustomText>
            {!item.seen && (
              <View
                style={[styles.unseenDot, { backgroundColor: typeColor }]}
              />
            )}
          </View>
          <CustomText fontSize={12} fontWeight="500" style={styles.timeText}>
            {moment(item.time).format("HH:mm A")}
          </CustomText>
        </View>

        <CustomText numberOfLines={2} style={styles.messageText}>
          {item?.message ?? "--"}
        </CustomText>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={20}
        color="#CBD5E0"
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
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
    borderLeftColor: "transparent",
  },
  unseenCard: {
    backgroundColor: "#F7FAFC",
    borderLeftColor: "#2D67C6",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  unseenBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF4757",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    color: "#1A202C",
    marginRight: 6,
  },
  unseenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeText: {
    color: "#718096",
  },
  messageText: {
    color: "#4A5568",
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    marginLeft: "auto",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingVertical: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  dateText: {
    color: "#2D3748",
    marginBottom: 8,
    textAlign: "center",
  },
  dateDivider: {
    height: 2,
    backgroundColor: "#E2E8F0",
    borderRadius: 1,
  },
  notificationsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#718096",
    fontWeight: "500",
  },
});
