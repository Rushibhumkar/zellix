import { TouchableOpacity, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface TCustomCheckBox {
  title: string;
  isCheck?: boolean;
  onPress?: (v: boolean) => void;
  marginBottom?: number;
  marginTop?: number;
}

const CustomCheckBox = ({
  title,
  isCheck = false,
  onPress,
  marginBottom,
  marginTop,
}: TCustomCheckBox) => {
  const [isChecked, setIsChecked] = useState(isCheck);

  const toggleCheckBox = () => {
    const updated = !isChecked;
    setIsChecked(updated);
    onPress?.(updated);
  };

  useEffect(() => {
    setIsChecked(isCheck);
  }, [isCheck]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={toggleCheckBox}
      style={{
        flexDirection: "row",
        marginBottom,
        marginTop,
        alignItems: "center",
      }}
    >
      <View style={isChecked ? styles.checked : styles.unChecked} />
      <SlideFadeIn>
        <CustomText style={{ color: color.mainTxtColor }}>{title}</CustomText>
      </SlideFadeIn>
    </TouchableOpacity>
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
    borderColor: color.mainTxtColor,
  },
  unChecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginEnd: 10,
    borderColor: color.strokeColor,
  },
});
