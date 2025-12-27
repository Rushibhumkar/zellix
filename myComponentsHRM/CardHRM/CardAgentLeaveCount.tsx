import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React from "react";
import { useGetAgentLeaveCount } from "../../hooks/useGetQuerryHRM";
import { myConsole } from "../../hooks/useConsole";
import { shadowPrimaryColor } from "../../const/globalStyle";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

/* ---------------- SingleCard Component ---------------- */
const SingleCard = ({ title, number }: any) => {
  return (
    <View style={styles.card}>
      <SlideFadeIn>
        <CustomText style={styles.cardNumber}>{number}</CustomText>
      </SlideFadeIn>
      <SlideFadeIn>
        <CustomText style={styles.cardTitle}>{title}</CustomText>
      </SlideFadeIn>
    </View>
  );
};

/* ---------------- Main Component ---------------- */
const CardAgentLeaveCount = () => {
  const { data, isLoading } = useGetAgentLeaveCount({
    isEnable: true,
  });

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SingleCard title="Total Leaves" number={data?.totalLeaves ?? 0} />
        <SingleCard title="Unused Leaves" number={data?.unusedLeaves ?? 0} />
        <SingleCard title="Used Leaves" number={data?.usedLeaves ?? 0} />
      </View>
    </View>
  );
};

export default CardAgentLeaveCount;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 8,
  },

  row: {
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 10,
    width: "98%",
  },
  card: {
    width: 100,
    height: 70,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    ...shadowPrimaryColor,
  },

  cardNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: color.mainTxtColor,
  },

  cardTitle: {
    fontSize: 12,
    marginTop: 4,
    color: color.mainTxtColor,
  },

  loaderContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
