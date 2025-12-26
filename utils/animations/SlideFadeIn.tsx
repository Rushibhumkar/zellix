import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

type Props = {
  children: React.ReactNode;
  from?: number; // starting X offset
  duration?: number;
  style?: any;
};

const SlideFadeIn = ({
  children,
  from = -20,
  duration = 600,
  style,
}: Props) => {
  const slideAnim = useRef(new Animated.Value(from)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default SlideFadeIn;
