import { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";
import moment from "moment";
import { roleHRM } from "../../utils/hrmKeysMatchToBE";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import { myConsole } from "../../hooks/useConsole";

interface TRowItem {
  title: string;
  value?: string;
  containerStyle?: StyleProp<ViewStyle>;
  icon?: "whatsapp" | "n/a";
  onPressIcon?: () => void;
  component?: ReactNode;
  isDate?: boolean;
  isTime?: boolean;
}
const RowItemDetail = ({
  title,
  value,
  containerStyle,
  icon,
  onPressIcon,
  component,
  isDate,
  isTime,
}: TRowItem) => {
  const safeValue = Array.isArray(value) ? value.join(", ") : value;
  const safeTitle =
    typeof title === "string"
      ? title
      : typeof title === "object" && "props" in title
        ? (title.props?.children ?? "N/A")
        : "N/A";
  let customValue = "-";
  if (safeTitle === "Interview Date & Time") {
    customValue =
      value && moment(value).isValid()
        ? moment(value).format("DD/MM/YYYY hh:mm A")
        : "-";
  } else if (isDate) {
    customValue =
      value && moment(value).isValid()
        ? moment(value).format("DD/MM/YYYY")
        : "-";
  } else if (isTime) {
    customValue =
      value && moment(value).isValid() ? moment(value).format("hh:mm A") : "-";
  } else if (title === "Role") {
    customValue = roleHRM[value];
  } else {
    customValue = value;
  }

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
        <SlideFadeIn>
          <CustomText numberOfLines={2} style={styles.text}>
            {title ?? "N/A"}
          </CustomText>
        </SlideFadeIn>
      </View>
      <View
        style={{
          width: "5%",
          paddingHorizontal: 3,
        }}
      >
        <SlideFadeIn>
          <CustomText
            style={{
              color: color.mainTxtColor,
              fontWeight: "600",
              fontSize: 18,
            }}
          >
            :
          </CustomText>
        </SlideFadeIn>
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
          {customValue !== "-" && (
            <SlideFadeIn>
              <CustomText style={styles.text2} numberOfLines={1}>
                {customValue}
              </CustomText>
            </SlideFadeIn>
          )}

          {/* {!!value && isDate && (
            <CustomText style={styles.text2} numberOfLines={1}>
              {!!value ? moment(value).format("DD/MM/YYYY") : "N/A"}
            </CustomText>
          )} */}
          {/* {icon && (
            <TouchableOpacity style={{ width: 30 }} onPress={onPressIcon}>
              {icon === "whatsapp" && <WhatsappIcon width={15} height={15} />}
              {icon === "n/a" && <CustomText>N/A</CustomText>}
            </TouchableOpacity>
          )} */}
        </View>
      )}
    </View>
  );
};

export default RowItemDetail;

const styles = StyleSheet.create({
  text: {
    color: color.mainTxtColor,
    fontWeight: "600",
    fontSize: 15,
    textTransform: "capitalize",
  },
  text2: {
    color: color.mainTxtColor,
    fontWeight: "400",
    fontSize: 14,
    textTransform: "capitalize",
  },
});
