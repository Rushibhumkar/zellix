import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import CustomText from "../myComponents/CustomText/CustomText";
import { color } from "../const/color";

interface TRadio {
  value: string;
  selected: string;
  onChange: (v: string) => void;
  label: string;
  containerStyle?: any;
  circleStyle?: any;
  labelStyle?: any;
}

const CustomRadioButton = ({
  value,
  selected,
  onChange,
  label,
  containerStyle,
  circleStyle,
  labelStyle,
}: TRadio) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, containerStyle]}
      onPress={() => onChange(value)}
    >
      <View style={[styles.circle, circleStyle]}>
        {selected === value && <View style={styles.innerCircle} />}
      </View>
      <CustomText style={[styles.label, labelStyle]}>{label}</CustomText>
    </TouchableOpacity>
  );
};

export default CustomRadioButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: color.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: color.primaryColor,
  },
  label: {
    marginLeft: 10,
    color: color.mainTxtColor,
    fontSize: 15,
  },
});
