import React, { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface IconWrapperProps {
  children: ReactNode;
  gradientColors?: readonly string[];
  containerStyle?: StyleProp<ViewStyle>;
}

const IconWrapper = ({
  children,
  gradientColors = ["#2E67BE", "#4985F2"] as const,
  containerStyle,
}: IconWrapperProps) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        {
          padding: 7,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 8,
        },
        containerStyle,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

export default IconWrapper;
