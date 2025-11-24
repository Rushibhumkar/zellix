import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomText from "../../myComponents/CustomText/CustomText";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import Feather from "react-native-vector-icons/Feather";
import { routeBooking, routeMeeting } from "../../utils/routes";
import { sizes } from "../../const";
import { LinearGradient } from "expo-linear-gradient";
import { formatCount } from "../../utils/commonFunctions";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import { routeUser } from "../../utils/routesHRM";

const Card = ({ item, loading }) => {
  const { navigate } = useNavigation();

  // -------------------------------
  // Reusable Single Card Component
  // -------------------------------
  const SingleCard = ({ count, title, icon, onPress, isLoading }) => {
    if (isLoading) {
      return (
        <TouchableOpacity
          style={[styles.cardContainer, { justifyContent: "center" }]}
          activeOpacity={1}
        >
          <SkeletonRow />
        </TouchableOpacity>
      );
    }

    const iconColor = "#4A68FF";

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.rowAlign}>
          <View style={[styles.iconBox, { backgroundColor: `${iconColor}1A` }]}>
            <Feather name={icon} size={20} color={iconColor} />
          </View>

          <View style={styles.textBox}>
            <CustomText style={styles.titleText}>{title}</CustomText>
            <CustomText style={styles.countText}>
              {formatCount(count)}
            </CustomText>
          </View>
        </View>

        <View
          style={[
            styles.progressBar,
            { backgroundColor: iconColor, width: "65%" },
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#2c59feff", "#99c2ffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrapper}
    >
      {/* ROW 1 */}
      <View style={styles.row}>
        <SingleCard
          count={item?.leads ?? 0}
          title="Leads"
          icon="users"
          onPress={() => navigate("allLead2")}
          isLoading={loading}
        />

        <SingleCard
          count={item?.meetings ?? 0}
          title="Meetings"
          icon="calendar"
          onPress={() => navigate(routeMeeting.MeetingsNavigator)}
          isLoading={loading}
        />
      </View>

      {/* ROW 2 */}
      <View style={styles.row}>
        <SingleCard
          count={item?.bookings ?? 0}
          title="Bookings"
          icon="check-square"
          onPress={() => navigate(routeBooking.bookingNavigator)}
          isLoading={loading}
        />

        <SingleCard
          count={item?.users ?? 0}
          title="Employees"
          icon="briefcase"
          onPress={() => navigate("UsersNavigator")}
          isLoading={loading}
        />
      </View>
    </LinearGradient>
  );
};

// ---------------------------------------
// Skeleton Loader
// ---------------------------------------
const SkeletonRow = () => (
  <View style={styles.skeletonWrapper}>
    <SkeletonView wrapperStyle={{ width: 32, height: 32, borderRadius: 16 }} />
    <SkeletonView
      wrapperStyle={{ width: 90, height: 10, borderRadius: 8, marginTop: 12 }}
    />
  </View>
);

// ---------------------------------------
// STYLES
// ---------------------------------------
const styles = StyleSheet.create({
  wrapper: {
    width: sizes.width,
    marginLeft: -20,
    marginTop: -20,
    backgroundColor: "transparent",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardContainer: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  textBox: {
    flex: 1,
  },
  titleText: {
    fontSize: 12,
    color: color.mainTxtColor,
  },
  countText: {
    fontSize: 20,
    fontWeight: "500",
    color: color.mainTxtColor,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  skeletonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
});

export default Card;
