import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";

interface TCustomCheckBox {
  title: string;
  isCheck?: boolean;
  onPress?: (v: boolean) => void;
  marginBottom?: number;
  marginTop?: number;
}
const CustomCheckBox = ({
  title,
  isCheck,
  onPress,
  marginBottom,
  marginTop,
}: TCustomCheckBox) => {
  const [isChecked, setIsChecked] = useState(false);
  const toggleCheckBox = () => {
    !!onPress &&
      setIsChecked((prev) => {
        onPress(!prev);
        return !prev;
      });
  };

  useEffect(() => {
    setIsChecked(isCheck);
  }, [isCheck]);
  return (
    <Pressable
      onPress={toggleCheckBox}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom,
        marginTop,
      }}
    >
      <View style={isChecked ? styles?.checked : styles?.unChecked} />
      <CustomText>{title}</CustomText>
    </Pressable>
  );
};

export default CustomCheckBox;

const styles = StyleSheet.create({
  checked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.saffronMango,
    marginEnd: 10,
    borderWidth: 1,
    borderColor: color.grayBtn,
  },
  unChecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginEnd: 10,
    borderColor: color.grayBtn,
  },
});
