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
    hasNextPage
  } = useGetNotificationInCRM({ id: user._id });

  const [refreshing, setRefreshing] = useState(false);
  const onEndReach = () => {
    if (hasNextPage && !isLoading && notifiData?.length > 0) {
      fetchNextPage && fetchNextPage()
    }
  }
  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }
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

  // const groupedNotifications = groupNotificationsByDate(user?.notifications);
  const groupedNotifications = groupNotificationsByDate(notifiData ?? []);
  const handleNotificationSeen = async (item) => {
    // myConsole('item', item)
    try {

      if (!item?.seen) {
        await getNotificationSeenById(user?._id, item?._id);
        refetch();
      }
      if (item?.type === "Lead") {
        navigate(routeLead.leadNavigator);
      } else if (item?.type === "Meeting") {
        navigate(routeMeeting.MeetingsNavigator);
      } else if (item?.type === "Booking") {
        navigate(routeBooking.bookingNavigator);
      }
      // getNotification();
    } catch (err) {
      console.log("err", err);
    }
  };


  const NotificationList = ({ item, isDivider }) => {
    return (
      <View>
        <TouchableOpacity
          key={item?._id}
          onPress={() => handleNotificationSeen(item)}
          style={{
            flexDirection: "row",
            gap: 20,
            marginTop: 15,
          }}
        >
          <View
            style={{
              backgroundColor: "#BFBFBF",
              borderRadius: 50,
              height: 50,
              width: 50,
              fontSize: 10,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                position: "relative",
                color: "#FFFFFF",
                fontSize: 25,
                marginTop: 6,
                textTransform: "capitalize",
              }}
            >
              {item?.type?.split("")[0]}
            </Text>
            {!item?.seen && (
              <MaterialIcons
                style={{
                  color: "green",
                  fontSize: 20,
                  position: "absolute",
                  top: 0,
                  right: 0,
                }}
                name="fiber-manual-record"
                size={17}
                color="green"
              />
            )}
          </View>
          <View
            style={{ width: '75%' }}
          >
            <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: 5 }}>
              <Text
                style={{
                  color: "#000000",
                  fontSize: 18,
                  fontWeight: "500",
                }}
              >
                {item?.type}
              </Text>
              <Text
                style={{
                  color: "#000000",
                  fontSize: 14,
                  fontWeight: "400",
                }}
              >
                {moment(item?.time).format("HH:mm A")}
              </Text>
            </View>
            <Text
              style={{
                color: "#000000",
                fontSize: 14,
                fontWeight: "300",
                textAlign: 'justify'
              }}
            >
              {item?.message}
            </Text>
          </View>
        </TouchableOpacity>
        {!isDivider && <View style={styles.dividern}></View>}
      </View>
    );
  };

  return (
    <>
      <Header title={"Notification"} />
      <FlatList
        data={Object.entries(groupedNotifications)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const [section, data] = item;
          return (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>{section}</Text>
              <View style={styles.divider}></View>
              <FlatList
                data={data}
                keyExtractor={(item) => item?._id?.toString()}
                renderItem={({ item, index }) => (
                  <NotificationList
                    item={item}
                    isDivider={index === data?.length - 1}
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReach}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage && <ActivityIndicator
            size={'small'}
            color={'#002E6B'}
          />
        }
        ListEmptyComponent={
          <>
            {isLoading && <LoadingCompo />}
            {notifiData?.length === 0 && <NoDataFound
              height={200}
              width={200}
            />}
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 20 }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: "#FFC857",
    width: "100%",
    margin: "auto",
    alignSelf: "center",
    borderBottomWidth: 1,
  },
  dividern: {
    borderBottomColor: "#131313",
    width: "100%",
    borderBottomWidth: 0.5,
    marginVertical: 10,
  },
  sectionHeader: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "400",
    color: "#000000",
    marginVertical: 15,
  },
});

export default Notification;
