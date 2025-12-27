import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomText from "../../../myComponents/CustomText/CustomText";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";
import { color } from "../../../const/color";

const HeaderRowUserAtt = () => {
  return (
    <View
      style={[
        {
          padding: 10,
          borderRadius: 8,
          justifyContent: "space-between",
          flexDirection: "row",
          backgroundColor: color.mainTxtColor,
          gap: 5,
        },
      ]}
    >
      <View style={styles.row1}>
        <SlideFadeIn>
          <CustomText style={styles.text1}>Date</CustomText>
        </SlideFadeIn>
      </View>
      <View style={styles.row2}>
        <SlideFadeIn>
          <CustomText style={styles.text1}>Punch-In</CustomText>
        </SlideFadeIn>
      </View>
      <View style={styles.row3}>
        <SlideFadeIn>
          <CustomText style={styles.text1} color={"white"}>
            Punch-Out
          </CustomText>
        </SlideFadeIn>
        {/* <CustomText style={styles.text2}>
          {moment(item?.createdAt).format("DD/MM/YYYY")}
        </CustomText> */}
      </View>
      <View style={styles.row4}>
        <SlideFadeIn>
          <CustomText style={styles.text1}>Status</CustomText>
        </SlideFadeIn>
      </View>
    </View>
  );
};

export default HeaderRowUserAtt;

const styles = StyleSheet.create({
  row1: {
    width: "24%",
    // justifyContent: 'flex-start',
    // alignItems: 'center',
    gap: 5,
    // backgroundColor: 'red'
  },
  row2: {
    width: "24%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    // backgroundColor: 'blue'
  },
  row3: {
    width: "24%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    // backgroundColor: 'green'
  },
  row4: {
    width: "24%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    // backgroundColor: 'red'
  },
  text1: {
    fontSize: 14,
    fontWeight: "400",
    color: "white",
  },
  text2: {
    fontSize: 12,
    fontWeight: "300",
    color: "white",
  },
});
