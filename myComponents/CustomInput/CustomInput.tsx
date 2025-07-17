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
import React from "react";

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
  return (
    <View style={[{ marginBottom }, containerStyle]}>
      {label && <Text style={styles.inputlable}>{label ?? "label"}</Text>}
      <TextInput
        value={typeof value === "number" ? value.toString() : value}
        onChangeText={onChangeText}
        style={[styles.input, inputStyle]}
        placeholder={placeholder ? placeholder : label ? label : "placeholder"}
        onBlur={onBlur}
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
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 5,
    //width: "100%",
  },
  errorText: {
    color: "red",
    marginTop: 0,
  },
});
