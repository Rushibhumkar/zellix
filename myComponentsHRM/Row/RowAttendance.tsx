import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import CustomText from "../../myComponents/CustomText/CustomText";
import {
  punchType,
  roleHRM,
  statusAttend,
  statusColorAttend,
} from "../../utils/hrmKeysMatchToBE";
import moment from "moment";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";

interface TRowAttendance {
  containerStyle?: StyleProp<ViewStyle>;
  onPress: () => void;
  item: {
    // punchedIn:string;
    // punchedInType:string;
    // punchedOut:string;
    // punchedOutType:string;
    // createdAt:string;
    name: string;
    role: string;
    punchedInType: string;
    status: string;
    createdAt: string;
    issue: boolean;
    resolve: boolean;
  };
}
const RowAttendance = ({ containerStyle, onPress, item }: TRowAttendance) => {
  // myConsole('item', item)
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          borderWidth: 1.8,
          borderColor: color.borderColor,
          padding: 10,
          borderRadius: 14,
          justifyContent: "space-between",
          flexDirection: "row",
        },
        containerStyle,
      ]}
    >
      <View style={styles.row1}>
        <CustomText style={styles.text1}>{item?.name}</CustomText>
        <CustomText style={styles.text2}>{roleHRM[item?.role]}</CustomText>
      </View>
      <View style={styles.row2}>
        <CustomText
          style={{ textTransform: "capitalize" }}
          fontWeight="900"
          color={
            item?.punchedInType === "office"
              ? color?.strokeColor
              : color?.mainTxtColor
          }
        >
          {punchType[item?.punchedInType]}
        </CustomText>
        {
          <CustomText
            // style={styles.text1}
            fontWeight="600"
            color={!!item?.resolve ? color?.strokeColor : color?.strokeColor}
            numberOfLines={1}
          >
            {!item?.issue ? "-" : item?.resolve ? "Resolve" : "Unresolved"}
          </CustomText>
        }
      </View>
      <View style={styles.row3}>
        <CustomText
          style={styles.text1}
          color={statusColorAttend[item?.status]}
        >
          {statusAttend[item?.status]}
        </CustomText>
        <CustomText style={styles.text2}>
          {moment(item?.createdAt).format("DD/MM/YYYY")}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default RowAttendance;

const styles = StyleSheet.create({
  row1: {
    width: "50%",
    gap: 5,
    // backgroundColor: 'red'
  },
  row2: {
    width: "20%",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'green'
  },
  row3: {
    width: "30%",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'blue'
  },
  text1: {
    fontSize: 14,
    fontWeight: "400",
    color: color.mainTxtColor,
  },
  text2: {
    fontSize: 12,
    fontWeight: "300",
    color: color.strokeColor,
  },
});
