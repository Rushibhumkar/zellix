import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CustomText from "../../myComponents/CustomText/CustomText";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { color } from "../../const/color";
import { useGetAttendanceChart } from "../../hooks/useGetQuerryHRM";
import { formatCount } from "../../utils/commonFunctions";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

const CARD_CONFIG = [
  {
    key: "present",
    title: "Present",
    icon: "account-group",
    color: "#27C46F",
  },
  {
    key: "absent",
    title: "Absent",
    icon: "account-cancel",
    color: "#FF3E5A",
  },
  {
    key: "leave",
    title: "Leave",
    icon: "account-off",
    color: "#FF8107",
  },
  {
    key: "halfDay",
    title: "Half Day",
    icon: "clock-outline",
    color: "#8B5CF6",
  },
  {
    key: "remoteCheckIn",
    title: "Remote",
    icon: "wifi",
    color: "#457EF2",
  },
  {
    key: "leaveApplications",
    title: "Request",
    icon: "file-document-outline",
    color: "#0EA5E9",
  },
];

const CardHRM = () => {
  const { width: windowWidth, fontScale } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const availableWidth = containerWidth || Math.max(0, windowWidth - 32);
  const columns = Math.max(1, Math.min(3, Math.floor((availableWidth + 12) / (150 * fontScale + 12))));
  const cardWidth = Math.floor((availableWidth - (columns - 1) * 12) / columns);
  const { data, isLoading, isError } = useGetAttendanceChart({
    isEnable: true,
  });

  if (!data || isLoading || isError) {
    return null;
  }

  return (
    <View
      style={styles.cardsContainer}
      onLayout={({ nativeEvent }) => setContainerWidth(nativeEvent.layout.width)}
    >
      {CARD_CONFIG.map((item) => (
        <SingleCard
          key={item.key}
          number={formatCount(data?.[item.key]) ?? 0}
          title={item.title}
          icon={item.icon}
          color={item.color}
          width={cardWidth}
        />
      ))}
    </View>
  );
};

const SingleCard = ({ number, title, icon, color, width }: any) => (
  <TouchableOpacity style={[styles.cardContainer, { width }]} activeOpacity={0.85}>
    <SlideFadeIn>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      </View>
    </SlideFadeIn>
    <View style={styles.detailsBox}>
      <SlideFadeIn>
        <CustomText style={styles.numberText} numberOfLines={1}>{number}</CustomText>
      </SlideFadeIn>
      <SlideFadeIn>
        <CustomText style={styles.titleText} numberOfLines={1}>{title}</CustomText>
      </SlideFadeIn>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    minHeight: 80,
    paddingVertical: 14,
    paddingHorizontal: 10,
    ...shadowPrimaryColor,
  },
  iconBox: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  detailsBox: {
    flex: 1,
    minWidth: 0,
  },
  numberText: {
    fontSize: 18,
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  titleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
});

export default CardHRM;
