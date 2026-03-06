import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomText from "../../myComponents/CustomText/CustomText";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { routeMeeting, routeRSVP } from "../../utils/routes";
import { sizes } from "../../const";
import { LinearGradient } from "expo-linear-gradient";
import { formatCount } from "../../utils/commonFunctions";
import { color } from "../../const/color";

const Card = ({ item, loading }: any) => {
  const { navigate } = useNavigation();

  const SingleCard = ({ count, title, onPress, isLoading }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      if (!isLoading) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [isLoading]);

    // 🎨 Different colors for different cards
    let cardBg = "#ffffff";
    let iconColor = "#4A68FF";
    let iconBg = "#EEF1FF";

    if (title === "Meetings") {
      cardBg = "#E8FFF3";
      iconColor = "#00B96B";
      iconBg = "#CFF7E4";
    }

    if (title === "RSVP") {
      cardBg = "#FFF4E6";
      iconColor = "#FF8C42";
      iconBg = "#FFE2CC";
    }

    if (isLoading) {
      return (
        <View style={styles.skeletonCard}>
          <SkeletonView
            wrapperStyle={{ width: 32, height: 32, borderRadius: 20 }}
          />
          <SkeletonView
            wrapperStyle={{
              width: 50,
              height: 10,
              borderRadius: 6,
              marginTop: 4,
            }}
          />
          <SkeletonView
            wrapperStyle={{
              width: 60,
              height: 8,
              borderRadius: 6,
              marginTop: 6,
            }}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.cardContainer, { backgroundColor: cardBg }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: "center",
          }}
        >
          <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
            {title === "Leads" && (
              <Feather name="users" size={16} color={iconColor} />
            )}
            {title === "Calling Data" && (
              <Feather name="phone" size={16} color={iconColor} />
            )}
            {title === "Meetings" && (
              <Feather name="calendar" size={16} color={iconColor} />
            )}
            {title === "RSVP" && (
              <MaterialCommunityIcons
                name="ticket-confirmation-outline"
                size={16}
                color={iconColor}
              />
            )}
          </View>

          <CustomText style={styles.countText}>{formatCount(count)}</CustomText>

          <CustomText style={styles.titleText}>{title}</CustomText>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      style={styles.wrapper}
      colors={["#2452faff", "#7aadfa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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

const styles = StyleSheet.create({
  wrapper: {
    width: sizes.width,
    marginLeft: -20,
    marginTop: -20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardContainer: {
    width: "23%",
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: "center",
    elevation: 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
  titleText: {
    fontSize: 12,
    color: color.mainTxtColor,
  },
  skeletonCard: {
    width: "24%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
});

export default Card;
