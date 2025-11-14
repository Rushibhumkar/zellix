import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import React, { useState } from "react";
import { color } from "../../const/color";
import CustomText from "../CustomText/CustomText";
import { shadow2 } from "../../const/globalStyle";

interface TCustomInput {
  value: string | number;
  onChangeText: (value: string) => void;
  label: string;
  errors: string;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  onBlur?: () => void;
  props?: TextInputProps;
  inputStyle?: StyleProp<ViewStyle>;
  marginBottom?: number;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  isShadow?: boolean;
}

const CustomInput = ({
  value,
  onChangeText,
  label,
  errors,
  containerStyle,
  placeholder,
  onBlur,
  props,
  inputStyle,
  marginBottom,
  editable,
  multiline,
  numberOfLines,
  leftIcon,
  isShadow = false,
}: TCustomInput) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[{ marginBottom }, containerStyle]}>
      {label && (
        <CustomText style={styles.inputlable}>{label ?? "label"}</CustomText>
      )}
      <View
        style={[
          styles.input,
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: leftIcon ? 4 : Platform.OS === "ios" ? 12 : 2,
          },
          {
            borderColor: isFocused ? "#2d68c672" : "#739fe141",
            borderWidth: isFocused ? 1.8 : 1.8,
          },
          isShadow && { ...shadow2 },
        ]}
      >
        {leftIcon && leftIcon}
        <TextInput
          value={typeof value === "number" ? value.toString() : value}
          onChangeText={onChangeText}
          style={[
            {
              color: color.mainTxtColor,
              flex: 1,
              fontFamily: Platform.OS === "android" ? "sans-serif" : undefined,
            },
            inputStyle,
          ]}
          placeholder={placeholder || label || "placeholder"}
          placeholderTextColor={color.mainTxtColorFade} // ✅ visible placeholder
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          {...props}
        />
      </View>

      {errors && <CustomText style={styles.errorText}>{errors}</CustomText>}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  inputlable: {
    color: color.mainTxtColor,
    marginBottom: 6,
    marginLeft: 2,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderColor: color.strokeColor,
    backgroundColor: "#ffffffff",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 6 : 2,
    color: "#000000", // ✅ Explicitly add this
  },

  errorText: {
    color: "red",
    marginTop: 0,
  },
});
