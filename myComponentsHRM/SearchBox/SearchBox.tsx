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
import moment from "moment";

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

const getDefaultDates = () => ({
  search: "",
  startDate: moment().subtract(11, "months").startOf("month").toDate(),
  endDate: moment().endOf("month").toDate(),
});

const initial = getDefaultDates();
const SearchBox = ({ onPressSubmit, initialValue, hideFiles }: TSearchBox) => {
  const [search, setSearch] = useState(getDefaultDates());

  useEffect(() => {
    if (initialValue) {
      setSearch({
        search: initialValue?.search || "",
        startDate:
          initialValue?.startDate ||
          moment().subtract(11, "months").startOf("month").toDate(),
        endDate: initialValue?.endDate || moment().endOf("month").toDate(),
      });
    }
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      style={{
        width: "100%",
      }}
    >
      <Pressable
        style={{
          backgroundColor: "white",
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 30,
          width: "100%",
        }}
        onPress={() => Keyboard.dismiss()}
      >
        {!hideFiles?.startDate && (
          <DatePickerExpo
            title="Start Date"
            boxContainerStyle={{ marginBottom: 10 }}
            onSelect={(v) => handleSearch("startDate", v)}
            initialValue={search?.startDate}
            maximumDate={
              search?.endDate ? new Date(search.endDate) : new Date()
            }
          />
        )}
        {!hideFiles?.endDate && (
          <DatePickerExpo
            title="End Date"
            boxContainerStyle={{ marginBottom: 10 }}
            onSelect={(v) => handleSearch("endDate", v)}
            initialValue={search?.endDate}
            minimumDate={
              search?.startDate ? new Date(search.startDate) : undefined
            }
            maximumDate={new Date()}
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
              const resetData = getDefaultDates();

              setSearch(resetData);

              !!onPressSubmit && onPressSubmit(resetData);
              popUpConfToast.closeBottomSheet();
            }}
          />

          <ActionButton
            title="Search"
            icon="search"
            variant="primary"
            containerStyle={{ minHeight: 40 }}
            onPress={() => {
              !!onPressSubmit && onPressSubmit(search);
              popUpConfToast.closeBottomSheet();
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
