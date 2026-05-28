import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import OutlineBtn from "../../myComponents/OutlineBtn/OutlineBtn";
import CustomText from "../../myComponents/CustomText/CustomText";
import ActionButton from "../../myComponents/ActionButton";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      style={{
        justifyContent: "flex-end",
      }}
    >
      <Pressable
        style={{
          backgroundColor: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: 35,
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
        <View style={styles.buttonRow}>
          <ActionButton
            title="Clear"
            icon="x"
            variant="outline"
            containerStyle={{ marginRight: 10, minHeight: 40 }}
            onPress={() => {
              setSearch(initial);
              !!onPressSubmit && onPressSubmit(initial);
              popUpConfToast.popUpClose();
            }}
          />

          <ActionButton
            title="Search"
            icon="search"
            variant="primary"
            containerStyle={{ minHeight: 40 }}
            onPress={() => {
              !!onPressSubmit && onPressSubmit(search);
              popUpConfToast.popUpClose();
            }}
          />
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

export default SearchBox;

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
