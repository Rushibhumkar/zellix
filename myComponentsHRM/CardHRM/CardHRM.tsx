import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { color } from "../../const/color";
import {
  shadow1,
  shadow2,
  shadowLight,
  shadowSecondaryColor,
} from "../../const/globalStyle";
import { myConsole } from "../../hooks/useConsole";
import { useGetAttendanceChart } from "../../hooks/useGetQuerryHRM";
import CustomText from "../../myComponents/CustomText/CustomText";

interface TCardHRM {
  title?: string;
  isLoading?: boolean;
  count?: number;
  obj0?: {
    count: number;
    title: string;
  };
  obj1?: {};
  obj2?: {};
  obj3?: {};
}

const CardHRM = ({ obj0, obj1, obj2, obj3 }: TCardHRM) => {
  const { data, isLoading } = useGetAttendanceChart({ isEnable: true });
  const numb = data ?? {};

  const getCardColor = (index) => {
    const colors = ["#2D67C6", "#4ECDC4", "#FF6B6B", "#45B7D1"];
    return colors[index];
  };

  const cards = [
    {
      title: "Present Employee",
      number: numb?.present,
      color: getCardColor(0),
    },
    {
      title: "Employees On leave",
      number: numb?.leave,
      color: getCardColor(1),
    },
    { title: "Employees Absent", number: numb?.absent, color: getCardColor(2) },
    {
      title: "Remote Checked-IN",
      number: numb?.remoteCheckIn,
      color: getCardColor(3),
    },
  ];

  return (
    <View style={styles.cardsContainer}>
      {cards.map((card, index) => (
        <SingleCard
          key={index}
          title={card.title}
          number={card.number}
          color={card.color}
        />
      ))}
    </View>
  );
};

export default CardHRM;

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  cardContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "47%",
    minHeight: 90,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android shadow
    elevation: 6,
  },
  numberText: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "800",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
    color: "#4A5568",
    lineHeight: 16,
  },
});

export const SingleCard = ({ number, title, color }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.8}>
      <CustomText style={[styles.numberText, { color }]}>
        {number ?? "0"}
      </CustomText>
      <CustomText style={styles.titleText}>{title ?? "-"}</CustomText>
    </TouchableOpacity>
  );
};
