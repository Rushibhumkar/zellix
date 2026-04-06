import {
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React, { useState } from "react";
import { color } from "../../const/color";
import CustomText from "../CustomText/CustomText";
import { shadow2 } from "../../const/globalStyle";
import { Feather } from "@expo/vector-icons";

interface TCustomInput {
  value: string | number;
  onChangeText: (value: string) => void;
  label?: string;
  errors?: string;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  onBlur?: (e: any) => void;
  props?: TextInputProps;
  inputStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  marginBottom?: number;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  isShadow?: boolean;
  showPasswordToggle?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "number-pad"
    | "url"
    | "decimal-pad";
}

const CustomInput = React.forwardRef<TextInput, TCustomInput>(
  (
    {
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
      editable = true,
      multiline,
      numberOfLines,
      leftIcon,
      isShadow = false,
      keyboardType = "default",
      inputContainerStyle,
      showPasswordToggle = false,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hidePassword, setHidePassword] = useState(
      showPasswordToggle ? true : props?.secureTextEntry === true,
    );

    return (
      <View style={[{ marginBottom }, containerStyle]}>
        {!!label && <CustomText style={styles.inputLabel}>{label}</CustomText>}

        <View
          style={[
            styles.inputContainer,
            {
              borderColor: isFocused ? "#2d68c672" : "#739fe141",
            },
            isShadow && shadow2,
            inputContainerStyle,
          ]}
        >
          {leftIcon && leftIcon}

          <TextInput
            ref={ref}
            value={typeof value === "number" ? value.toString() : value}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            style={[styles.inputText, inputStyle]}
            placeholder={placeholder || label || "Enter value"}
            placeholderTextColor={color.mainTxtColorFade}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            secureTextEntry={
              showPasswordToggle ? hidePassword : props?.secureTextEntry
            }
            {...props}
          />

          {showPasswordToggle && (
            <TouchableOpacity
              onPress={() => setHidePassword((p) => !p)}
              style={{ paddingRight: 6 }}
            >
              <Feather
                name={hidePassword ? "eye-off" : "eye"}
                size={20}
                color={color.color1}
              />
            </TouchableOpacity>
          )}
        </View>

        {!!errors && <CustomText style={styles.errorText}>{errors}</CustomText>}
      </View>
    );
  },
);

export default React.memo(CustomInput);

const styles = StyleSheet.create({
  inputLabel: {
    color: color.mainTxtColor,
    marginBottom: 6,
    marginLeft: 2,
    fontSize: 16,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.8,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 12 : 4,
    backgroundColor: "#fff",
  },
  inputText: {
    flex: 1,
    color: color.mainTxtColor,
    fontFamily: Platform.OS === "android" ? "sans-serif" : undefined,
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
});
