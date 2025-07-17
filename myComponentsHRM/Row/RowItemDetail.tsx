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
  let customValue = "-";
  if (title === "Interview Date & Time") {
    customValue = !!value ? moment(value).format("DD/MM/YYYY hh:mm A") : "-";
  } else if (isDate) {
    customValue = !!value ? moment(value).format("DD/MM/YYYY") : "-";
  } else if (isTime) {
    customValue = value !== "-" ? moment(value).format("hh:mm A") : "-";
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
        <CustomText numberOfLines={2} style={styles.text}>
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
          style={{
            color: color.darkBlack,
            fontWeight: "600",
            fontSize: 18,
          }}
        >
          :
        </CustomText>
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
            <CustomText style={styles.text2} numberOfLines={1}>
              {!!value ? customValue : "N/A"}
            </CustomText>
          )}
          {/* {!!value && isDate &&
                        <CustomText
                            style={styles.text2}
                            numberOfLines={1}
                        >
                            {!!value ? moment(value).format('DD/MM/YYYY') : 'N/A'}
                        </CustomText>
                    } */}
          {/* {icon && <TouchableOpacity
                        style={{ width: 30 }}
                        onPress={onPressIcon}
                    >
                        {icon === 'whatsapp' && <WhatsappIcon width={15} height={15} />}
                        {icon === 'n/a' && <CustomText>N/A</CustomText>}
                    </TouchableOpacity>} */}
        </View>
      )}
    </View>
  );
};

export default RowItemDetail;

const styles = StyleSheet.create({
  text: {
    color: color.darkBlack,
    fontWeight: "600",
    fontSize: 15,
    textTransform: "capitalize",
  },
  text2: {
    color: color.darkBlack,
    fontWeight: "300",
    fontSize: 14,
    textTransform: "capitalize",
  },
});
