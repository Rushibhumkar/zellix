import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";

interface TSearchBar {
  onClickCancel: () => void;
  onChangeText: () => void;
  containerStyle: StyleProp<ViewStyle>;
  value: string
}

const SearchBar = ({ onClickCancel, onChangeText, containerStyle, value }: TSearchBar) => {
  return (
    <View
      style={[
        {
          borderWidth: 0.5,
          flexDirection: "row",
          borderRadius: 20,
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          marginHorizontal: 25,
          height: 40
        },
        containerStyle,
      ]}
    >
      <AntDesign name="search1" size={20} />
      <TextInput
        style={{ flex: 1, paddingHorizontal: 10 }}
        placeholder="Search..."
        onChangeText={onChangeText}
        value={value}
      />
      {!!value && <Entypo name="cross" size={20} onPress={onClickCancel} />}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({});
