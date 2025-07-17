import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React, { ReactNode } from "react";
import { color } from "../../const/color";
import WhatsappIcon from "../../assets/svg/WhatsappIcon";
import CustomText from "../CustomText/CustomText";

interface TRowItem {
  title: string;
  value?: string;
  containerStyle?: StyleProp<ViewStyle>;
  icon: "whatsapp" | "n/a";
  onPressIcon: () => void;
  component: ReactNode;
}
const RowItem = ({
  title,
  value,
  containerStyle,
  icon,
  onPressIcon,
  component,
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
        <Text numberOfLines={2} style={styles.text}>
          {title ?? "N/A"}
        </Text>
      </View>
      <View
        style={{
          width: "5%",
          paddingHorizontal: 3,
        }}
      >
        <Text
          style={{
            color: color.darkBlack,
            fontWeight: "600",
            fontSize: 18,
          }}
        >
          :
        </Text>
      </View>
      {!!component ? (
        <View
          style={{
            width: "56%",
          }}
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
            <Text
              style={styles.text2}
              //numberOfLines={1}
            >
              {!!value ? value : "N/A"}
            </Text>
          )}
          {icon && (
            <TouchableOpacity style={{ width: 30 }} onPress={onPressIcon}>
              {icon === "whatsapp" && <WhatsappIcon width={15} height={15} />}
              {icon === "n/a" && <CustomText>N/A</CustomText>}
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
    color: color.darkBlack,
    fontWeight: "400",
    fontSize: 15,
    textTransform: "capitalize",
  },
  text2: {
    color: color.darkBlack,
    // fontWeight: "300",
    fontSize: 14,
    textTransform: "capitalize",
  },
});
