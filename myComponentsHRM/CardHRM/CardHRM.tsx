import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CustomText from "../../myComponents/CustomText/CustomText";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { color } from "../../const/color";

const CARD_COLORS = [
  "#27C46F", // Present
  "#FF8107", // On Leave
  "#FF3E5A", // Absent
  "#457EF2", // Remote
];

const ICONS = [
  "account-group", // Present
  "account-off", // On Leave
  "account-cancel", // Absent
  "wifi", // Remote
];

const CARD_TITLES = ["Present", "On Leave", "Absent", "Remote"];

const CardHRM = ({ obj0, obj1, obj2, obj3 }) => {
  // Replace with actual data logic if needed
  const numb = {
    present: obj0?.count ?? 0,
    leave: obj1?.count ?? 0,
    absent: obj2?.count ?? 0,
    remoteCheckIn: obj3?.count ?? 0,
  };

  const dataArr = [
    {
      number: numb.present,
      title: CARD_TITLES[0],
      icon: ICONS[0],
      color: CARD_COLORS[0],
    },
    {
      number: numb.leave,
      title: CARD_TITLES[1],
      icon: ICONS[1],
      color: CARD_COLORS[1],
    },
    {
      number: numb.absent,
      title: CARD_TITLES[2],
      icon: ICONS[2],
      color: CARD_COLORS[2],
    },
    {
      number: numb.remoteCheckIn,
      title: CARD_TITLES[3],
      icon: ICONS[3],
      color: CARD_COLORS[3],
    },
  ];

  return (
    <View style={styles.cardsContainer}>
      {dataArr.map((card, idx) => (
        <SingleCard
          key={idx}
          number={card.number}
          title={card.title}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </View>
  );
};

const SingleCard = ({ number, title, icon, color }) => (
  <TouchableOpacity style={styles.cardContainer} activeOpacity={0.85}>
    <View style={[styles.iconBox, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={26} color="#fff" />
    </View>
    <View style={styles.detailsBox}>
      <CustomText style={styles.numberText}>{number ?? "0"}</CustomText>
      <CustomText style={styles.titleText}>{title ?? "-"}</CustomText>
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
    width: "47%",
    paddingLeft: 16,
    paddingVertical: 12,
    ...shadowPrimaryColor,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  detailsBox: {
    flex: 1,
    alignItems: "flex-start",
  },
  numberText: {
    fontSize: 22,
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "600",
    color: color.strokeColor,
  },
});

export default CardHRM;
