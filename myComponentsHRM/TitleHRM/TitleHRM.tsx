import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import CustomText from "../../myComponents/CustomText/CustomText";
import { Feather, Ionicons } from "@expo/vector-icons";
import { color } from "../../const/color";
import { iconWrapperStyle, shadowPrimaryColor } from "../../const/globalStyle";
import { LinearGradient } from "expo-linear-gradient";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface TTitleHRM {
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  marginBottom?: number;
  marginTop?: number;
  onPressFilter?: () => void;
}
const TitleHRM = ({
  title,
  containerStyle,
  marginBottom,
  marginTop,
  onPressFilter,
}: TTitleHRM) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: !!onPressFilter ? 6 : marginBottom ? marginBottom : 0,
          marginTop,
        },
        containerStyle,
      ]}
    >
      <View>
        <SlideFadeIn>
          <CustomText
            fontSize={16}
            fontWeight="600"
            style={{ color: color.mainTxtColor, marginLeft: 4 }}
          >
            {title ?? "  Employees on Leave Today"}
          </CustomText>
        </SlideFadeIn>
      </View>
      {!!onPressFilter && (
        <SlideFadeIn from={-10}>
          <LinearGradient
            colors={["#2E67BE", "#4985F2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              borderRadius: 12,
              padding: 6,
              borderColor: "#ffffff29",
              borderWidth: 2,
              ...shadowPrimaryColor,
            }}
          >
            <TouchableOpacity onPress={onPressFilter}>
              <Feather name="filter" size={20} color={color.white} />
            </TouchableOpacity>
          </LinearGradient>
        </SlideFadeIn>
      )}
    </View>
  );
};

export default TitleHRM;

const styles = StyleSheet.create({});
