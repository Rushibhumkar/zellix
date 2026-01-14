import moment from "moment";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { selectUser } from "../../redux/userSlice";
import { getNotificationSeenById } from "../../services/rootApi/userApi";
import { getNotificationById } from "../../services/rootApi/userApi";
import { setNotication } from "../../redux/userSlice";
import { useGetNotificationInCRM } from "../../hooks/useGetQuerryHRM";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { routeBooking, routeLead, routeMeeting } from "../../utils/routes";
import { myConsole } from "../../hooks/useConsole";
import CustomText from "../../myComponents/CustomText/CustomText";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import { color } from "../../const/color";
import { shadowPrimaryColor } from "../../const/globalStyle";

const Notification = () => {
  const { user } = useSelector(selectUser);
  const { navigate } = useNavigation();
  const dispatch = useDispatch();
  const {
    data: notifiData,
    isLoading,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useGetNotificationInCRM({ id: user._id });

  const [refreshing, setRefreshing] = useState(false);
  const onEndReach = () => {
    if (hasNextPage && !isLoading && notifiData?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };
  const groupNotificationsByDate = (notifications) => {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");

    return notifications.reduce((acc, notification) => {
      const notificationDate = moment(notification?.time).startOf("day");
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

  const { data: permission = {} } = useGetUserPermission(user?._id);
  // myConsole('permisisons',permission);

  const canViewBookingDetails = checkPermission(
    permission,
    "Bookings",
    "viewDetails",
    user?.role
  );
  const canViewBookings = checkPermission(
    permission,
    "Bookings",
    "sidebar",
    user?.role
  );
  const canViewMeetings = checkPermission(
    permission,
    "Meeting",
    "sidebar",
    user?.role
  );

  // const groupedNotifications = groupNotificationsByDate(user?.notifications);
  const groupedNotifications = groupNotificationsByDate(notifiData ?? []);
  const handleNotificationSeen = async (item) => {
    try {
      if (!item?.seen) {
        await getNotificationSeenById(user?._id, item?._id);
        refetch();
      }

      if (item?.type === "Lead") {
        navigate("allLead2");
        return;
      }

      if (item?.type === "Meeting") {
        if (!canViewMeetings) {
          Alert.alert(
            "Access Denied",
            "You don't have access to view meetings."
          );
          return;
        }

        if (item?.dataId) {
          navigate(routeMeeting.MeetingsNavigator, {
            screen: routeMeeting.MeetingDetails,
            params: { item: { _id: item.dataId } },
          });
        } else {
          navigate(routeMeeting.MeetingsNavigator);
        }
        return;
      }

      if (item?.type === "Booking") {
        if (!canViewBookings) {
          Alert.alert(
            "Access Denied",
            "You don't have access to view bookings."
          );
          return;
        }

        if (!canViewBookingDetails && item?.dataId) {
          Alert.alert(
            "Access Denied",
            "You don't have access to view booking details."
          );
          return;
        }

        if (item?.dataId) {
          navigate(routeBooking.bookingNavigator, {
            screen: routeBooking.BookingDetail,
            params: { item: { _id: item.dataId } },
          });
        } else {
          navigate(routeBooking.bookingNavigator);
        }
        return;
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      Lead: "#FF6B6B",
      Meeting: "#4ECDC4",
      Booking: "#45B7D1",
      Default: "#95A5A6",
    };
    return colors[type] || colors.Default;
  };

  const getTypeIcon = (type) => {
    const icons = {
      Lead: "person",
      Meeting: "event",
      Booking: "book",
      Default: "notifications",
    };
    return icons[type] || icons.Default;
  };

  const NotificationList = ({ item, isDivider }) => {
    const typeColor = getTypeColor(item?.type);

    return (
      <TouchableOpacity
        key={item?._id}
        onPress={() => handleNotificationSeen(item)}
        style={[
          styles.notificationCard,
          !item?.seen && styles.unseenNotification,
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: typeColor }]}>
          <MaterialIcons
            name={getTypeIcon(item?.type)}
            size={24}
            color="#FFFFFF"
          />
          {!item?.seen && (
            <View style={styles.unseenDot}>
              <MaterialIcons
                name="fiber-manual-record"
                size={12}
                color="#FF4757"
              />
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.typeContainer}>
              <CustomText style={styles.typeText}>{item?.type}</CustomText>
              {!item?.seen && (
                <View
                  style={[styles.statusDot, { backgroundColor: typeColor }]}
                />
              )}
            </View>
            <CustomText style={styles.timeText}>
              {moment(item?.time).format("HH:mm A")}
            </CustomText>
          </View>

          <CustomText style={styles.messageText}>{item?.message}</CustomText>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={20}
          color={color.mainTxtColorFade}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Header title={"Notification"} />
      <View style={styles.container}>
        <FlatList
          data={Object.entries(groupedNotifications)}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => {
            const [section, data] = item;
            return (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderContainer}>
                  <CustomText style={styles.sectionHeader}>
                    {section}
                  </CustomText>
                  <View style={styles.sectionDivider} />
                </View>
                <View style={styles.notificationsList}>
                  {data.map((notification, index) => (
                    <NotificationList
                      key={notification?._id?.toString()}
                      item={notification}
                      isDivider={index === data?.length - 1}
                    />
                  ))}
                </View>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReach}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size={"small"} color={"#2D67C6"} />
              </View>
            )
          }
          ListEmptyComponent={
            <>
              {isLoading && <LoadingCompo />}
              {notifiData?.length === 0 && (
                <View style={styles.emptyContainer}>
                  <NoDataFound height={200} width={200} />
                  <CustomText style={styles.emptyText}>
                    No notifications yet
                  </CustomText>
                </View>
              )}
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2D67C6"]}
              tintColor={"#2D67C6"}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: color.mainTxtColor,
    marginBottom: 8,
    textAlign: "left",
  },
  sectionDivider: {
    height: 2,
    backgroundColor: "#E2E8F0",
    borderRadius: 1,
  },
  notificationsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    ...shadowPrimaryColor,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  unseenNotification: {
    backgroundColor: "#F7FAFC",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  unseenDot: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 1,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeText: {
    color: color.mainTxtColor,
    fontSize: 16,
    fontWeight: "600",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeText: {
    color: color.strokeColor,
    fontSize: 12,
    fontWeight: "500",
  },
  messageText: {
    color: color.strokeColor,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  chevron: {
    marginLeft: "auto",
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
    marginTop: 16,
    fontWeight: "500",
  },
});

export default Notification;
