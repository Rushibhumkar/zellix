import {
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { AntDesign, EvilIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import { color } from "../../const/color";

interface TSearchBar {
  onClickCancel: () => void;
  onChangeText: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  value: string;
  isWithAnimation?: boolean;
  autoFocus?: boolean;
}

const SearchBar = ({
  onClickCancel,
  onChangeText,
  containerStyle,
  value,
  isWithAnimation = true,
  autoFocus = false,
}: TSearchBar) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // --------------------
  // 🚀 Animation values
  // --------------------
  const scale = useSharedValue(0.7); // start smaller
  const opacity = useSharedValue(0); // fade-in

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }

    return () => {
      if (autoFocus) inputRef.current?.blur?.();
    };
  }, [autoFocus]);

  // --------------------
  // 🎬 Run the animation
  // --------------------
  useEffect(() => {
    if (isWithAnimation) {
      opacity.value = withTiming(1, { duration: 350 });

      scale.value = withSequence(
        withTiming(0.9, { duration: 150 }),
        withSpring(1, { damping: 8 })
      );
    }
  }, []);

  // --------------------
  // 🎨 Animated style (ONLY SEARCH BAR BOUNCES)
  // --------------------
  const animatedSearchBox = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient
      colors={["#2452FA", "#6CA8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBox}
    >
      <Animated.View style={[animatedSearchBox]}>
        <View
          style={[
            styles.container,
            {
              borderColor: isFocused ? color.primaryColor : "#ccc",
            },
            containerStyle,
          ]}
        >
          <EvilIcons name="search" size={20} color={color.strokeColor} />

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search..."
            placeholderTextColor={color.mainTxtColor}
            onChangeText={onChangeText}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            selectionColor={color.primaryColor}
            autoFocus={autoFocus}
          />

          {!!value && (
            <AntDesign
              name="close"
              size={18}
              color={color.mainTxtColor}
              onPress={onClickCancel}
            />
          )}
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  gradientBox: {
    paddingBottom: 21,
    paddingTop: 8,
    marginTop: -6,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  container: {
    flexDirection: "row",
    borderRadius: 16,
    alignItems: "center",
    paddingHorizontal: 12,
    marginHorizontal: 25, // full width ke liye ye correct hai
    height: Platform.OS === "ios" ? 45 : 40,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: color.mainTxtColor,
    fontFamily: Platform.OS === "android" ? "sans-serif" : undefined,
  },
});
