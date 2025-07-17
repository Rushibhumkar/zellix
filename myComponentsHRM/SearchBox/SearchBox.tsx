import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import OutlineBtn from "../../myComponents/OutlineBtn/OutlineBtn";
import CustomText from "../../myComponents/CustomText/CustomText";

interface search {
  search: string;
  startDate: string;
  endDate: string;
}
interface TSearchBox {
  onPressSubmit: (v: search) => void;
  initialValue: search;
  hideFiles?: {
    search: boolean;
    startDate: boolean;
    endDate: boolean;
  };
}

const initial = {
  search: "",
  startDate: "",
  endDate: "",
};
const SearchBox = ({ onPressSubmit, initialValue, hideFiles }: TSearchBox) => {
  const [search, setSearch] = useState(initial);

  useEffect(() => {
    !!initialValue && setSearch(initialValue);
  }, [initialValue]);
  const handleSearch = (key: "search" | "startDate" | "endDate", val) => {
    setSearch((prev) => {
      return {
        ...prev,
        [key]: val,
      };
    });
  };

  return (
    <Pressable
      style={{
        backgroundColor: "white",
        borderRadius: 8,
        padding: 20,
      }}
      onPress={() => Keyboard.dismiss()}
    >
      {!hideFiles?.startDate && (
        <DatePickerExpo
          title="Start Date"
          boxContainerStyle={{ marginBottom: 10 }}
          onSelect={(v) => handleSearch("startDate", v)}
          initialValue={search?.startDate}
        />
      )}
      {!hideFiles?.endDate && (
        <DatePickerExpo
          title="End Date"
          boxContainerStyle={{ marginBottom: 10 }}
          onSelect={(v) => handleSearch("endDate", v)}
          initialValue={search?.endDate}
        />
      )}
      {!hideFiles?.search && (
        <CustomInput
          label="Search"
          marginBottom={15}
          onChangeText={(v) => handleSearch("search", v)}
          value={search?.search}
        />
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 10,
        }}
      >
        <OutlineBtn
          title="Clear"
          containerStyle={{ width: 70 }}
          onPress={() => {
            !!onPressSubmit && onPressSubmit(initial);
            popUpConfToast.popUpClose();
          }}
          textStyle={{ fontSize: 13 }}
        />
        <CustomBtn
          title="Search"
          containerStyle={{ width: 70 }}
          onPress={() => {
            !!onPressSubmit && onPressSubmit(search);
            popUpConfToast.popUpClose();
          }}
          textStyle={{ fontSize: 13 }}
        />
      </View>
    </Pressable>
  );
};

export default SearchBox;

const styles = StyleSheet.create({});
