// FadeInView.tsx
import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface FadeProps {
  children: React.ReactNode;
  duration?: number;
  style?: ViewStyle | ViewStyle[];
}

const FadeInView = ({ children, duration = 600, style }: FadeProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

export default FadeInView;
