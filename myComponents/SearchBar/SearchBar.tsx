import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import React, { useState } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { color } from "../../const/color";

interface TSearchBar {
  onClickCancel: () => void;
  onChangeText: (text: string) => void;
  containerStyle: StyleProp<ViewStyle>;
  value: string;
}

const SearchBar = ({
  onClickCancel,
  onChangeText,
  containerStyle,
  value,
}: TSearchBar) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: isFocused ? color.primaryColor : "#ccc",
          flexDirection: "row",
          borderRadius: 20,
          alignItems: "center",
          paddingHorizontal: 12,
          marginHorizontal: 25,
          height: 45,
        },
        containerStyle,
      ]}
    >
      <AntDesign name="search" size={20} color={color.primary200} />
      <TextInput
        style={{ flex: 1, paddingHorizontal: 10 }}
        placeholder="Search..."
        onChangeText={onChangeText}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {!!value && <Entypo name="cross" size={20} onPress={onClickCancel} />}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({});
