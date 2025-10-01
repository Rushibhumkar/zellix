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
      {label && <Text style={styles.inputlable}>{label ?? "label"}</Text>}
      <TextInput
        value={typeof value === "number" ? value.toString() : value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          inputStyle,
          {
            borderColor: isFocused ? color.primaryColor : color.primary200, // ⬅️ add
            borderWidth: isFocused ? 1 : 0.5, // ⬅️ add
          },
        ]}
        placeholder={placeholder ? placeholder : label ? label : "placeholder"}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur && onBlur();
        }}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        {...props}
      />
      {errors && <Text style={styles.errorText}>{errors}</Text>}
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
    // marginTop: 10,
    // height: 37.5,
    borderColor: color.primary200,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    //width: "100%",
  },
  errorText: {
    color: "red",
    marginTop: 0,
  },
});
