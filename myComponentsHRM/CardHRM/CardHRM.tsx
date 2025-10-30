import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { color } from "../../const/color";
import {
  shadow1,
  shadow2,
  shadowLight,
  shadowSecondaryColor,
} from "../../const/globalStyle";
import { myConsole } from "../../hooks/useConsole";
import { useGetAttendanceChart } from "../../hooks/useGetQuerryHRM";
import CustomText from "../../myComponents/CustomText/CustomText";

interface TCardHRM {
  title?: string;
  isLoading?: boolean;
  count?: number;
  obj0?: {
    count: number;
    title: string;
  };
  obj1?: {};
  obj2?: {};
  obj3?: {};
}
const CardHRM = ({
  // isLoading,
  obj0,
  obj1,
  obj2,
  obj3,
}: TCardHRM) => {
  // let
  const { data, isLoading } = useGetAttendanceChart({ isEnable: true });
  const numb = data ?? {};

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        paddingHorizontal: 10,
        marginBottom: 30,
      }}
    >
      <SingleCard title={"Present Employee"} number={numb?.present} />
      <SingleCard title={"Employees On leave"} number={numb?.leave} />
      <SingleCard title={"Employees Absent"} number={numb?.absent} />
      <SingleCard title={"Remote Checked-IN"} number={numb?.remoteCheckIn} />
      {/* {[1, 2, 3, 4].map((e) => {
                return <SingleCard key={e} />
            })} */}
    </View>
  );
};

export default CardHRM;

const styles = StyleSheet.create({
  cardcontainer: {
    padding: 10,
    backgroundColor: color.paleGrey,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: color.secondaryColor,
    width: "48%",
    ...shadowSecondaryColor,
    // minHeight: 65
  },
});

export const SingleCard = ({ number, title }) => {
  return (
    <TouchableOpacity
      style={styles.cardcontainer}
      // onPress={onPress}
      activeOpacity={0.9}
    >
      <CustomText
        style={{
          fontSize: 24,
          textAlign: "center",
          color: color.hrmYellowText,
          fontWeight: "900",
        }}
      >
        {number ?? "0"}
      </CustomText>
      <CustomText
        style={{
          fontSize: 12,
          textAlign: "center",
          color: "#131313",
          fontWeight: "600",
        }}
      >
        {title ?? "-"}
      </CustomText>
    </TouchableOpacity>
  );
};
