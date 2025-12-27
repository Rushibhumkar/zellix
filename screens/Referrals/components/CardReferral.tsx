import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { shadow1, shadowPrimaryColor } from "../../../const/globalStyle";
import moment from "moment";
import { myConsole } from "../../../hooks/useConsole";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

const CardReferral = ({
  item,
  onPress,
  index,
  selected,
  bgColor,
  onLongPress,
}: any) => {
  return (
    <SlideFadeIn>
      <TouchableOpacity
        key={index}
        style={[
          styles.mainlistcontainer,
          {
            marginTop: index === 0 ? 25 : 12,
            backgroundColor: selected
              ? "rgba(252, 244, 227, 1)"
              : bgColor || "white",
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Left Column: Client Info */}
          <View style={{ width: "40%", paddingEnd: 3 }}>
            <CustomText numberOfLines={1} style={styles.labelText}>
              {item?.clientName || "N/A"}
            </CustomText>
            <CustomText numberOfLines={1} style={styles.valueText}>
              {item?.email || "N/A"}
            </CustomText>
          </View>

          {/* Middle Column: Amount and Status */}
          <View style={{ width: "40%", paddingEnd: 3, paddingStart: 12 }}>
            <CustomText numberOfLines={1} style={styles.labelText}>
              ₹ {item?.referralAmount || 0}
            </CustomText>
            <CustomText numberOfLines={1} style={styles.valueText}>
              {item?.status || "N/A"}
            </CustomText>
          </View>

          {/* Right Column: Date */}
          <View
            style={{
              width: "25%",
              alignItems: "flex-end",
            }}
          >
            <CustomText numberOfLines={1} style={styles.dateText}>
              {moment(item?.createdAt).format("DD/MM/YYYY") || "N/A"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default CardReferral;

// ✅ Header component export
export const HeaderReferralList = () => {
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
          marginHorizontal: 16,
          marginTop: 16,
        },
      ]}
    >
      <View style={{ width: "40%", paddingEnd: 3 }}>
        <SlideFadeIn>
          <CustomText style={styles.headingText}>Client</CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText style={styles.headingText}>Email</CustomText>
        </SlideFadeIn>
      </View>
      <View style={{ width: "40%", paddingEnd: 3 }}>
        <SlideFadeIn>
          <CustomText style={styles.headingText}>Amount</CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText style={styles.headingText}>Status</CustomText>
        </SlideFadeIn>
      </View>
      <View style={{ width: "20%" }}>
        <SlideFadeIn>
          <CustomText style={styles.headingText}>Date</CustomText>
        </SlideFadeIn>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainlistcontainer: {
    borderWidth: 1.8,
    padding: 13,
    borderRadius: 14,
    borderColor: color.borderColor,
    marginHorizontal: 20,
    ...shadowPrimaryColor,
  },
  headingContainer: {
    backgroundColor: "#3E3E3E",
    flexDirection: "row",
    padding: 10,
    borderRadius: 11,
    marginBottom: -8,
    marginTop: 25,
    marginHorizontal: 20,
  },
  headingText: {
    color: "white",
    fontSize: 13,
    marginBottom: 5,
  },
  labelText: {
    color: color.mainTxtColor,
    fontSize: 16,
    textTransform: "capitalize",
  },
  valueText: {
    color: color.strokeColor,
    fontSize: 14,
    marginTop: 5,
    textTransform: "capitalize",
  },
  dateText: {
    color: color.mainTxtColor,
    fontSize: 14,
    marginTop: 10,
    marginRight: 12,
  },
});
