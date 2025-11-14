import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React, { ReactNode } from "react";
import UpDownIcon from "../../assets/svg/UpDownIcon";
import { color } from "../../const/color";
import CustomText from "../CustomText/CustomText";

interface TMainTitle {
  icon: ReactNode;
  title: string;
  onPress: () => void;
  containerStyle: StyleProp<ViewStyle>;
}

const MainTitle = ({ title, icon, onPress, containerStyle }: TMainTitle) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        containerStyle,
      ]}
      onPress={onPress ? onPress : undefined}
    >
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: color.saffronMango,
          paddingRight: 20,
          paddingBottom: 5,
        }}
      >
        <CustomText
          style={{
            fontSize: 18,
            fontWeight: "500",
            color: color.mainTxtColor,
          }}
        >
          {title ?? "Title"}
        </CustomText>
      </View>
      {icon && <View>{icon}</View>}
    </TouchableOpacity>
  );
};

export default MainTitle;

const styles = StyleSheet.create({});
