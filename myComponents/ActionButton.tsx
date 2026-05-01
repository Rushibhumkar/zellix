import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CustomText from "./CustomText/CustomText";
import { color } from "../const/color";

interface ActionButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  variant?: "primary" | "secondary" | "danger" | "outline";
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconColor?: string;
}

const ActionButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = "primary",
  containerStyle,
  textStyle,
  iconColor,
}: ActionButtonProps) => {
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[`${variant}Button`],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        containerStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline ? color.mainTxtColor : "#FFFFFF"}
        />
      ) : (
        <>
          {!!icon && (
            <Feather
              name={icon}
              size={16}
              color={
                iconColor
                  ? iconColor
                  : isOutline
                    ? color.mainTxtColor
                    : "#FFFFFF"
              }
              style={{ marginRight: 8 }}
            />
          )}

          <CustomText
            style={[
              styles.buttonText,
              isOutline && styles.outlineText,
              textStyle,
            ]}
          >
            {title}
          </CustomText>
        </>
      )}
    </Pressable>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  primaryButton: {
    backgroundColor: color.saffronMango,
  },

  secondaryButton: {
    backgroundColor: "#2563EB",
  },

  dangerButton: {
    backgroundColor: "#DC2626",
  },

  outlineButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.4,
    borderColor: "#CBD5E1",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  outlineText: {
    color: color.mainTxtColor,
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.6,
  },
});
