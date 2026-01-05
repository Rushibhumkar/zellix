import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomText from "../../myComponents/CustomText/CustomText";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { routeBooking, routeMeeting, routeRSVP } from "../../utils/routes";
import { sizes } from "../../const";
import { LinearGradient } from "expo-linear-gradient";
import { formatCount } from "../../utils/commonFunctions";
import { color } from "../../const/color";

const Card = ({ item, loading }: any) => {
  const { navigate } = useNavigation();

  // Reusable Card Component
  const SingleCard = ({ count, title, onPress, isLoading }: any) => {
    const progress = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
      if (!isLoading) {
        let targetProgress;

        // Fixed progress percentages for each card type
        switch (title) {
          case "Leads":
            targetProgress = 75;
            break;
          case "Calling Data":
            targetProgress = 60;
            break;
          case "Meetings":
            targetProgress = 55;
            break;
          case "Bookings":
            targetProgress = 45;
            break;
          default:
            targetProgress = 65;
        }

        Animated.timing(progress, {
          toValue: count === 0 ? 1 : targetProgress,
          duration: 700,
          useNativeDriver: false,
        }).start();

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [isLoading]);

    const iconColor = title === "Bookings" ? "#34C759" : "#4A68FF";

    // ---------------------
    // SKELETON MODE
    // ---------------------
    if (isLoading) {
      return (
        <View
          style={{
            width: "47%",
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
          }}
        >
          <SkeletonView
            wrapperStyle={{ width: 40, height: 40, borderRadius: 12 }}
          />
          <View style={{ marginTop: 4, marginLeft: 4 }}>
            <SkeletonView
              wrapperStyle={{ width: 80, height: 10, borderRadius: 5 }}
            />
            <SkeletonView
              wrapperStyle={{
                width: 60,
                height: 14,
                borderRadius: 5,
                marginTop: 6,
              }}
            />
          </View>
          {/* <SkeletonView
            wrapperStyle={{
              width: "100%",
              height: 4,
              borderRadius: 2,
              marginTop: 12,
            }}
          /> */}
        </View>
      );
    }

    // ---------------------
    // NORMAL MODE (Animated)
    // ---------------------
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.rowAlign,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <Animated.View
            style={[styles.iconBox, { backgroundColor: `${iconColor}1A` }]}
          >
            {title === "Leads" && (
              <Feather name="users" size={20} color={iconColor} />
            )}
            {title === "Calling Data" && (
              <Feather name="phone" size={20} color={iconColor} />
            )}
            {title === "Meetings" && (
              <Feather name="calendar" size={20} color={iconColor} />
            )}
            {title === "RSVP" && (
              <MaterialCommunityIcons
                name="ticket-confirmation-outline"
                size={20}
                color={iconColor}
              />
            )}
          </Animated.View>

          <Animated.View style={styles.textBox}>
            <CustomText style={styles.titleText}>{title}</CustomText>
            <CustomText style={styles.countText}>
              {formatCount(count)}
            </CustomText>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: iconColor,
              width:
                count === 0
                  ? "1%"
                  : progress.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
            },
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
          count={item?.callingData ?? 0}
          title="Calling Data"
          onPress={() => navigate("allLead")}
          isLoading={loading}
        />
      </View>

      <View style={styles.row}>
        <SingleCard
          count={item?.meetings ?? 0}
          title="Meetings"
          onPress={() => navigate(routeMeeting.MeetingsNavigator)}
          isLoading={loading}
        />
        <SingleCard
          count={item?.rsvp ?? 0}
          title="RSVP"
          onPress={() => navigate(routeRSVP.RSVPNavigator)}
          isLoading={loading}
        />
      </View>
    </LinearGradient>
  );
};

// STYLES
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    // flexDirection: "row",
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
    marginTop: 8,
  },
  skeletonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
});

export default Card;
