import { StyleSheet, View, ActivityIndicator } from "react-native";
import React from "react";
import CustomText from "../../../myComponents/CustomText/CustomText";
import CustomBtn from "../../../myComponents/CustomBtn/CustomBtn";
import { color } from "../../../const/color";
import DropdownRNE from "../../../myComponents/DropdownRNE/DropdownRNE";

interface TLeadPoolRestriction {
  onPressSubmit: () => void;
  onPressCancel: () => void;
  onChangeText?: (v: string) => void;
  heading: string;
  subHeadingText: string;
  isLoading?: boolean; // ✅ Add isLoading prop
  isDropDown?: {
    arrOfObj: [];
    onChange: (v: string) => void;
  };
}

const LeadPoolRestriction = ({
  heading,
  subHeadingText,
  onPressSubmit,
  onPressCancel,
  isLoading = false, // ✅ Default false
  isDropDown,
}: TLeadPoolRestriction) => {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 15,
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <CustomText
          fontSize={18}
          fontWeight="600"
          style={{ textTransform: "capitalize" }}
        >
          {heading ?? "---------"}
        </CustomText>
      </View>

      <View
        style={{
          marginBottom: 25,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isDropDown && (
          <DropdownRNE
            label="Status"
            containerStyle={{ marginBottom: 15 }}
            arrOfObj={isDropDown?.arrOfObj}
            mode="modal"
            onChange={isDropDown?.onChange}
            isSearch
          />
        )}
        <CustomText fontSize={16} fontWeight="400" marginBottom={7}>
          {subHeadingText}
        </CustomText>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <CustomBtn
          title="Yes"
          containerStyle={{ paddingHorizontal: 25 }}
          textStyle={{ fontSize: 12, fontWeight: "700" }}
          onPress={onPressSubmit}
          isLoading={isLoading} // ✅ Show loader on submit
          disabled={isLoading} // ✅ Disable while loading
        />
        <CustomBtn
          title="No"
          containerStyle={{
            backgroundColor: color.dullRed,
            paddingHorizontal: 25,
          }}
          textStyle={{ fontSize: 12, fontWeight: "700" }}
          onPress={onPressCancel}
          disabled={isLoading} // ✅ Disable cancel if loading
        />
      </View>
    </View>
  );
};

export default LeadPoolRestriction;
