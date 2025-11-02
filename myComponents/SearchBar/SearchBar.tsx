import {
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { color } from "../../const/color";

interface TSearchBar {
  onClickCancel: () => void;
  onChangeText: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
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
        styles.container,
        {
          borderColor: isFocused ? color.primaryColor : "#ccc",
        },
        containerStyle,
      ]}
    >
      <AntDesign name="search" size={20} color={color.primary200} />
      <TextInput
        style={styles.input}
        placeholder="Search..."
        placeholderTextColor="#888" // ✅ visible placeholder on white
        onChangeText={onChangeText}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectionColor={color.primaryColor}
      />
      {!!value && (
        <Entypo name="cross" size={20} color="#444" onPress={onClickCancel} />
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    flexDirection: "row",
    borderRadius: 20,
    alignItems: "center",
    paddingHorizontal: 12,
    marginHorizontal: 25,
    height: 45,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: "#000", // ✅ ensure text is visible on Android production builds
    fontFamily: Platform.OS === "android" ? "sans-serif" : undefined, // ✅ fix release font issue
  },
});
