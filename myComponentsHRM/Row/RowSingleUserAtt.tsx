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
import { statusAttend, statusColorAttend } from "../../utils/hrmKeysMatchToBE";
import moment from "moment";
import { color } from "../../const/color";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface TRowSingleUserAtt {
  item: {
    createdAt: string;
    punchedIn: string;
    punchedOut: string;
    punchedInType: "remote" | "office";
    punchedOutType: "remote" | "office";
    status: string;
    issue: boolean;
    resolve: boolean;
  };
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}
const RowSingleUserAtt = ({
  item,
  onPress,
  containerStyle,
}: TRowSingleUserAtt) => {
  return (
    <TouchableOpacity
      onPress={!!onPress ? onPress : undefined}
      activeOpacity={0.5}
      style={[
        {
          borderWidth: 1.4,
          borderColor: color.borderColor,
          padding: 10,
          borderRadius: 12,
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexDirection: "row",
          gap: 5,
        },
        containerStyle,
      ]}
    >
      <View style={styles.row1}>
        <SlideFadeIn>
          <CustomText style={{ color: color.mainTxtColor }} fontSize={13}>
            {!!item?.createdAt
              ? moment(item?.createdAt).format("DD/MM/YYYY")
              : "-"}
          </CustomText>
        </SlideFadeIn>
      </View>
      <View style={styles.row2}>
        <SlideFadeIn>
          <CustomText style={styles.text1} color="green">
            {!!item?.punchedIn
              ? moment(item?.punchedIn).format("hh:mm A")
              : "-"}
          </CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText
            style={{ textTransform: "capitalize" }}
            fontWeight="900"
            color={
              item?.punchedInType === "office"
                ? color?.mainTxtColorFade
                : color?.mainTxtColor
            }
          >
            {item?.punchedInType ?? "-"}
          </CustomText>
        </SlideFadeIn>
      </View>
      <View style={styles.row3}>
        <SlideFadeIn>
          <CustomText style={styles.text1} color={"red"}>
            {!!item?.punchedOut
              ? moment(item?.punchedOut).format("hh:mm A")
              : "-"}
          </CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText
            style={{ textTransform: "capitalize" }}
            fontWeight="900"
            color={
              item?.punchedOutType === "office"
                ? color?.mainTxtColorFade
                : color?.mainTxtColor
            }
          >
            {item?.punchedOutType ?? "-"}
          </CustomText>
        </SlideFadeIn>
        {/* <CustomText style={styles.text2}>
          {moment(item?.createdAt).format("DD/MM/YYYY")}
        </CustomText> */}
      </View>
      <View style={styles.row4}>
        <SlideFadeIn>
          <CustomText
            style={styles.text1}
            color={statusColorAttend[item?.status]}
          >
            {statusAttend[item?.status] ?? "-"}
          </CustomText>
        </SlideFadeIn>
        {!!item?.issue && (
          <SlideFadeIn>
            <CustomText
              numberOfLines={1}
              fontWeight="900"
              color={
                !!item?.resolve ? color?.mainTxtColorFade : color?.mainTxtColor
              }
            >
              {!!item?.resolve ? "Resolved" : "Unresolved"}
            </CustomText>
          </SlideFadeIn>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RowSingleUserAtt;

const styles = StyleSheet.create({
  row1: {
    width: "24%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    // backgroundColor: "red",
  },
  row2: {
    width: "24%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    // backgroundColor: 'blue'
  },
  row3: {
    width: "24%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    // backgroundColor: 'green'
  },
  row4: {
    width: "24%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    // backgroundColor: 'red'
  },
  text1: {
    fontSize: 14,
    fontWeight: "400",
    // color: 'white'
  },
  text2: {
    fontSize: 12,
    fontWeight: "300",
  },
});
