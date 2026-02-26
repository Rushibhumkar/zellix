import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React, { ReactNode } from "react";
import { color } from "../../const/color";
import WhatsappIcon from "../../assets/svg/WhatsappIcon";
import CustomText from "../CustomText/CustomText";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import IconWrapper from "../../components/IconWrapper";

interface TRowItem {
  title: string;
  value?: string;
  containerStyle?: StyleProp<ViewStyle>;
  icon?: "whatsapp" | "n/a";
  onPressIcon?: () => void;
  component?: ReactNode;
  titleTextStyle?: StyleProp<TextStyle>;
  valueTextStyle?: StyleProp<TextStyle>;
}
const RowItem = ({
  title,
  value,
  containerStyle,
  icon,
  onPressIcon,
  component,
  titleTextStyle,
  valueTextStyle,
}: TRowItem) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          width: "100%",
          // flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        },
        containerStyle,
      ]}
    >
      <View
        style={{
          width: "35%",
        }}
      >
        <CustomText numberOfLines={2} style={[styles.text, titleTextStyle]}>
          {title ?? "N/A"}
        </CustomText>
      </View>
      <View
        style={{
          width: "5%",
          paddingHorizontal: 3,
        }}
      >
        <CustomText
          style={[
            {
              color: color.mainTxtColor,
              fontWeight: "600",
              fontSize: 18,
            },
            valueTextStyle,
          ]}
        >
          :
        </CustomText>
      </View>
      {!!component ? (
        <View
          style={[
            {
              width: "56%",
            },
            valueTextStyle,
          ]}
        >
          {component}
        </View>
      ) : (
        <View
          style={{
            width: "56%",
          }}
        >
          {!!value && (
            <CustomText
              style={styles.text2}
              //numberOfLines={1}
            >
              {!!value ? value : "N/A"}
            </CustomText>
          )}
          {icon && (
            <TouchableOpacity
              style={{ alignSelf: "flex-end" }}
              onPress={onPressIcon}
            >
              {icon === "whatsapp" && (
                <IconWrapper gradientColors={["#00C950", "#00A63E"]}>
                  <FontAwesome name="whatsapp" size={16} color={color.white} />
                </IconWrapper>
              )}
              {icon === "n/a" && (
                <CustomText style={{ color: color.mainTxtColor }}>
                  N/A
                </CustomText>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default RowItem;

const styles = StyleSheet.create({
  text: {
    color: color.mainTxtColor,
    fontWeight: "400",
    fontSize: 15,
    textTransform: "capitalize",
  },
  text2: {
    color: color.mainTxtColor,
    // fontWeight: "300",
    fontSize: 14,
    textTransform: "capitalize",
  },
});
