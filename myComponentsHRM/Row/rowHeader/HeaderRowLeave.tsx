import { StyleSheet, View } from "react-native";
import React from "react";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

const HeaderRowLeave = () => {
  return (
    <LinearGradient
      colors={["#2E67BE", "#4985F2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 14,
          justifyContent: "space-between",
          flexDirection: "row",
          marginBottom: 15,
          marginHorizontal: 8,
        },
      ]}
    >
      <View style={styles.row1}>
        <SlideFadeIn>
          <CustomText style={styles.text1}>
            Name
            {/* {item?.name} */}
          </CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText style={styles.text2}>
            Role
            {/* {item?.days} */}
          </CustomText>
        </SlideFadeIn>
      </View>
      <View style={styles.row2}>
        <SlideFadeIn>
          <CustomText style={styles.text1}>
            Days
            {/* {roleHRM[item?.role]} */}
          </CustomText>
        </SlideFadeIn>
        {/* <CustomText style={styles.text2}>03</CustomText> */}
      </View>
      <View style={styles.row3}>
        <SlideFadeIn>
          <CustomText color={"white"} fontSize={14} fontWeight="600">
            {/* {statusHRM[item?.status]} */}
            Status
          </CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText style={styles.text2}>
            Date
            {/* {moment(item?.createdAt).format('DD/MM/YYYY') ?? 'NA'} */}
          </CustomText>
        </SlideFadeIn>
      </View>
    </LinearGradient>
  );
};

export default HeaderRowLeave;

const styles = StyleSheet.create({
  row1: {
    width: "50%",
    gap: 5,
    // backgroundColor: 'red'
  },
  row2: {
    width: "20%",
    gap: 5,
    // backgroundColor: 'green'
  },
  row3: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    // backgroundColor: 'blue'
  },
  text1: {
    fontSize: 14,
    fontWeight: "400",
    color: "white",
    // marginBottom: 5
  },
  text2: {
    fontSize: 12,
    fontWeight: "300",
    color: "white",
    // marginBottom: 5
  },
});
