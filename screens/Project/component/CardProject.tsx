import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { shadow1, shadowPrimaryColor } from "../../../const/globalStyle";
import CustomText from "../../../myComponents/CustomText/CustomText";
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "../../../const/color";
import SlideFadeIn from "../../../utils/animations/SlideFadeIn";

const CardProject = ({
  item,
  onPress,
  index,
  selected,
  bgColor,
  onLongPress,
  onPressClaim,
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
              ? color.primaryFade
              : bgColor
              ? bgColor
              : "white",
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "45%", paddingEnd: 3 }}>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.mainTxtColor,
                // fontWeight: "700",
                fontSize: 16,
                textTransform: "capitalize",
              }}
            >
              {item?.source || "N/A"}
            </CustomText>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.strokeColor,
                fontWeight: "400",
                marginTop: 5,
                textTransform: "capitalize",
              }}
            >
              {item?.projectName || "N/A"}
            </CustomText>
          </View>
          <View style={{ width: "40%", paddingEnd: 3 }}>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.mainTxtColor,
                fontWeight: "400",
                fontSize: 15,
                textTransform: "capitalize",
              }}
            >
              {item?.pageName || "N/A"}
            </CustomText>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.strokeColor,
                fontWeight: "400",
                fontSize: 15,
                textTransform: "capitalize",
                marginTop: 5,
              }}
            >
              {moment(item?.createdAt).format("DD/MM/YYYY") || "N/A"}
            </CustomText>
          </View>
          <View style={{ width: "15%", paddingEnd: 3, alignItems: "center" }}>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.mainTxtColor,
                fontWeight: "400",
                fontSize: 15,
                textTransform: "capitalize",
              }}
            >
              {item?.totalLeads || "0"}
            </CustomText>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.mainTxtColor,
                fontWeight: "400",
                fontSize: 15,
                textTransform: "capitalize",
                marginTop: 5,
              }}
            >
              {item?.totalMembers || "0"}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

export default CardProject;

export const HeaderProjectList = () => {
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
      <View style={{ width: "45%", paddingEnd: 3 }}>
        <SlideFadeIn>
          <CustomText color="white" marginBottom={5}>
            Source
          </CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText color="white">Project Name</CustomText>
        </SlideFadeIn>
      </View>
      <View style={{ width: "40%", paddingEnd: 3 }}>
        <SlideFadeIn>
          <CustomText color="white" marginBottom={5}>
            Page Name
          </CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText color="white">Creation Date</CustomText>
        </SlideFadeIn>
      </View>
      <View style={{ width: "15%", paddingEnd: 3 }}>
        <SlideFadeIn>
          <CustomText color="white" marginBottom={5} numberOfLines={1}>
            Leads
          </CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText color="white" numberOfLines={1}>
            Members
          </CustomText>
        </SlideFadeIn>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainlistcontainer: {
    marginTop: 25,
    borderWidth: 1.8,
    padding: 13,
    borderRadius: 14,
    borderColor: color.borderColor,
    marginHorizontal: 20,
    ...shadowPrimaryColor,
  },
});
