import { StyleSheet, Text, View, ViewStyle } from "react-native";
import React from "react";
import CustomText from "../CustomText/CustomText";
import { shadow2 } from "../../const/globalStyle";
import NoDataIcon from "../../assets/svg/NoDataIcon";
import { color } from "../../const/color";

interface TNoDataFound {
  height?: number;
  width?: number;
  style?: ViewStyle;
  showTxt?: boolean;
}
const NoDataFound = ({
  height,
  width,
  style,
  showTxt = false,
}: TNoDataFound) => {
  return (
    <View
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
          height: height ?? 200,
          marginTop: 20,
        },
        style,
      ]}
    >
      <NoDataIcon height={height} width={width} />
      {showTxt && (
        <CustomText
          color={color.primaryColor}
          style={{ marginTop: 26, fontSize: 18 }}
        >
          No data found
        </CustomText>
      )}
    </View>
  );
};

export default NoDataFound;

const styles = StyleSheet.create({});
