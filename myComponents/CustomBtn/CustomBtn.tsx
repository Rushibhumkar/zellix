import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import { color } from "../../const/color";
import CustomText from "../CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface TCustomBtn {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradientContStyle?: StyleProp<ViewStyle>;
  isLoaderColor?: string;
}

const CustomBtn = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  containerStyle,
  textStyle,
  isLoaderColor,
  gradientContStyle,
}: TCustomBtn) => {
  const loaderColor = isLoaderColor ?? color.white;

  return (
    <TouchableOpacity
      onPress={isLoading || disabled ? undefined : onPress}
      activeOpacity={isLoading || disabled ? 1 : 0.8}
      style={[
        styles.shadowWrapper, // ✅ shadow applied here
        containerStyle,
        disabled && { opacity: 0.8 },
      ]}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? ["#cccccc", "#cccccc"] : ["#2E67BE", "#4985F2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.gradientContainer, gradientContStyle]}
      >
        <View style={styles.textView}>
          <SlideFadeIn>
            <CustomText
              style={[
                styles.text,
                { color: disabled ? color?.textGray : color.white },
                textStyle,
              ]}
            >
              {title}
            </CustomText>
          </SlideFadeIn>
          {isLoading && (
            <ActivityIndicator
              style={{ marginStart: 4 }}
              color={disabled ? color?.textGray : loaderColor}
              size={"small"}
            />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CustomBtn;

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  gradientContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  textView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
    color: color.white,
  },
});
