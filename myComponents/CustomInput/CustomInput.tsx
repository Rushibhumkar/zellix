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
}: TCustomInput) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[{ marginBottom }, containerStyle]}>
      {label && (
        <CustomText style={styles.inputlable}>{label ?? "label"}</CustomText>
      )}
      <TextInput
        value={typeof value === "number" ? value.toString() : value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          inputStyle,
          {
            borderColor: isFocused ? color.primaryColor : color.primary200,
            borderWidth: isFocused ? 1 : 0.5,
            color: "#000", // ✅ force visible
            fontFamily: Platform.OS === "android" ? "sans-serif" : undefined, // ✅ fix release font issue
          },
        ]}
        placeholder={placeholder || label || "placeholder"}
        placeholderTextColor="#888" // ✅ visible placeholder
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

      {errors && <CustomText style={styles.errorText}>{errors}</CustomText>}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  inputlable: {
    color: "#000000",
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderColor: color.primary200,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    color: "#000000", // ✅ Explicitly add this
  },

  errorText: {
    color: "red",
    marginTop: 0,
  },
});
