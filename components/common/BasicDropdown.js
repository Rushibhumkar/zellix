import React, { useState } from "react";
import {StyleSheet, View} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const BasicDropdown = ({ selectData, placeholder, setValue, value }) => {
  const [isFocus, setIsFocus] = useState(false);
  return (
    <View>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "#000000" }]}
        data={selectData}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    marginTop: 10,
    height: 37.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
});

export default BasicDropdown;
