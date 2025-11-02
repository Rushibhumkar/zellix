import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { color } from "../../const/color";
import { shadowLight, shadowPrimaryColor } from "../../const/globalStyle";
import { routeBooking, routeLead, routeMeeting } from "../../utils/routes";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import CustomText from "../../myComponents/CustomText/CustomText";

const Card = ({ item, loading }) => {
  const { navigate } = useNavigation();

  /* ----------------------------------------
     SingleCard: Reusable mini card component
  ---------------------------------------- */
  const SingleCard = ({ count, title, onPress, isLoading }) => {
    return (
      <>
        {!isLoading ? (
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <CustomText style={styles.countText}>{count}</CustomText>
            <CustomText style={styles.titleText}>{title}</CustomText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cardContainer, { justifyContent: "center" }]}
            activeOpacity={1}
          >
            <SkeletonRow />
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <SingleCard
          count={item?.leads ?? 0}
          title={"Leads"}
           onPress={() => navigate("allLead2")}
          isLoading={loading}
        />
          {/* <SingleCard
          count={item?.meetings ?? 0}
          title={"Meetings"}
          onPress={() => navigate(routeMeeting.MeetingsNavigator)}
          isLoading={loading}
        /> */}
        <SingleCard
          count={item?.callingData ?? 0}
          title={"Calling Data"}
         onPress={() => navigate("allLead")}
          isLoading={loading}
        />
      </View>

      <View style={styles.row}>
        <SingleCard
          count={item?.bookings ?? 0}
          title={"Bookings"}
          onPress={() => navigate(routeBooking.bookingNavigator)}
          isLoading={loading}
        />
        <SingleCard
          count={item?.users ?? 0}
          title={"Employees"}
          onPress={() => navigate("usermanagement")}
          isLoading={loading}
        />
      </View>
    </View>
  );
};

/* ----------------------------------------
   Skeleton Loader for Loading State
---------------------------------------- */
const SkeletonRow = () => {
  return (
    <View style={styles.skeletonWrapper}>
      <SkeletonView
        wrapperStyle={{
          width: 32,
          height: 32,
          borderRadius: 16,
        }}
      />
      <SkeletonView
        wrapperStyle={{
          width: 90,
          height: 10,
          borderRadius: 8,
          marginTop: 12,
        }}
      />
    </View>
  );
};

/* ----------------------------------------
   Styles
---------------------------------------- */
const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardContainer: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    ...shadowPrimaryColor,
  },
  countText: {
    fontSize: 26,
    fontWeight: "900",
    color: color.primaryColor ?? "#1E1E1E",
    textAlign: "center",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  skeletonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
});

export default Card;
