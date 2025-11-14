import {
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { AntDesign, Entypo, EvilIcons } from "@expo/vector-icons";
import { color } from "../../const/color";
import { LinearGradient } from "expo-linear-gradient";

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
    <LinearGradient
      colors={["#2452FA", "#6CA8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingBottom: 21,
        paddingTop: 8,
        marginTop: -6,
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
      }}
    >
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
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor={color.mainTxtColor} // ✅ visible placeholder on white
          onChangeText={onChangeText}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={color.primaryColor}
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
    </LinearGradient>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 16,
    alignItems: "center",
    paddingHorizontal: 12,
    marginHorizontal: 25,
    height: Platform.OS === "ios" ? 45 : 40,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: color.mainTxtColor, // ✅ ensure text is visible on Android production builds
    fontFamily: Platform.OS === "android" ? "sans-serif" : undefined, // ✅ fix release font issue
  },
});
