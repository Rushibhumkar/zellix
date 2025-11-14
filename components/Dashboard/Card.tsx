import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomText from "../../myComponents/CustomText/CustomText";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import Feather from "react-native-vector-icons/Feather";
import { routeBooking } from "../../utils/routes";
import { sizes } from "../../const";
import { LinearGradient } from "expo-linear-gradient";

const Card = ({ item, loading }) => {
  const { navigate } = useNavigation();

  // ✅ Reusable Card Component
  const SingleCard = ({ count, title, onPress, isLoading }) => {
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

    const iconColor = title === "Bookings" ? "#34C759" : "#4A68FF";

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Row: Icon + Title + Count */}
        <View style={styles.rowAlign}>
          <View style={[styles.iconBox, { backgroundColor: `${iconColor}1A` }]}>
            {title === "Leads" && (
              <Feather name="users" size={20} color={iconColor} />
            )}
            {title === "Calling Leads" && (
              <Feather name="phone" size={20} color={iconColor} />
            )}
            {title === "Bookings" && (
              <Feather name="check-square" size={20} color={iconColor} />
            )}
            {title === "Team" && (
              <Feather name="briefcase" size={20} color={iconColor} />
            )}
          </View>

          <View style={styles.textBox}>
            <CustomText style={styles.titleText}>{title}</CustomText>
            <CustomText style={styles.countText}>{count}</CustomText>
          </View>
        </View>

        {/* Progress Bar */}
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
      <View style={styles.row}>
        <SingleCard
          count={item?.leads ?? 0}
          title="Leads"
          onPress={() => navigate("allLead2")}
          isLoading={loading}
        />
        <SingleCard
          count={item?.callingData ?? "1.4K"}
          title="Calling Leads"
          onPress={() => navigate("allLead")}
          isLoading={loading}
        />
      </View>

      <View style={styles.row}>
        <SingleCard
          count={item?.bookings ?? 0}
          title="Bookings"
          onPress={() => navigate(routeBooking.bookingNavigator)}
          isLoading={loading}
        />
        <SingleCard
          count={item?.users ?? 0}
          title="Team"
          onPress={() => navigate("usermanagement")}
          isLoading={loading}
        />
      </View>
    </LinearGradient>
  );
};

// ✅ Skeleton Loader
const SkeletonRow = () => (
  <View style={styles.skeletonWrapper}>
    <SkeletonView wrapperStyle={{ width: 32, height: 32, borderRadius: 16 }} />
    <SkeletonView
      wrapperStyle={{ width: 90, height: 10, borderRadius: 8, marginTop: 12 }}
    />
  </View>
);

// ✅ Styles
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
    color: "#6B6B6B",
    fontWeight: "500",
  },
  countText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E1E1E",
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
