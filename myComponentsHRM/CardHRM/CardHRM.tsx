import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CustomText from "../../myComponents/CustomText/CustomText";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import { useGetAttendanceChart } from "../../hooks/useGetQuerryHRM";
import { formatCount } from "../../utils/commonFunctions";

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
  const { data, isLoading, isError } = useGetAttendanceChart({
    isEnable: true,
  });

  useEffect(() => {
    if (data) {
      myConsole("getAttendanceChartss", data);
    }
  }, [data]);

  if (!data || isLoading || isError) {
    return null;
  }

  return (
    <View style={styles.cardsContainer}>
      {CARD_CONFIG.map((item) => (
        <SingleCard
          key={item.key}
          number={formatCount(data?.[item.key]) ?? 0}
          title={item.title}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </View>
  );
};

const SingleCard = ({ number, title, icon, color }) => (
  <TouchableOpacity style={styles.cardContainer} activeOpacity={0.85}>
    <View style={[styles.iconBox, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={24} color="#fff" />
    </View>
    <View style={styles.detailsBox}>
      <CustomText style={styles.numberText}>{number}</CustomText>
      <CustomText style={styles.titleText}>{title}</CustomText>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    width: "31%", // ✅ 3 columns
    paddingVertical: 14,
    paddingHorizontal: 10,
    ...shadowPrimaryColor,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  detailsBox: {
    flex: 1,
  },
  numberText: {
    fontSize: 18,
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  titleText: {
    fontSize: 12,
    fontWeight: "600",
    color: color.strokeColor,
    marginTop: 2,
  },
});

export default CardHRM;
