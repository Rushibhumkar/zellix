import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
  dates?: { startDate: string | Date; endDate: string | Date };
  onDateChange?: (key: "startDate" | "endDate", value: any) => void;
};

export default function ListingSearch({ value, onChangeText, onClose, dates, onDateChange }: Props) {
  return <Animated.View entering={FadeInDown.duration(180)} exiting={FadeOutUp.duration(150)} style={{ paddingTop: 6, paddingBottom: 8 }}>
    <SearchBar variant="hrms" value={value} onChangeText={onChangeText} onClickCancel={onClose} containerStyle={{ marginHorizontal: 16 }} autoFocus isWithAnimation />
    {dates && onDateChange && <View style={{ flexDirection: "row", gap: 10, marginTop: 12, marginHorizontal: 12 }}>
      <View style={{ flex: 1 }}><DatePickerExpo title="Start Date" initialValue={dates.startDate instanceof Date ? dates.startDate.toISOString() : dates.startDate || undefined} maximumDate={dates.endDate ? new Date(dates.endDate) : new Date()} onSelect={(value) => onDateChange("startDate", value || "")} /></View>
      <View style={{ flex: 1 }}><DatePickerExpo title="End Date" initialValue={dates.endDate instanceof Date ? dates.endDate.toISOString() : dates.endDate || undefined} minimumDate={dates.startDate ? new Date(dates.startDate) : undefined} maximumDate={new Date()} onSelect={(value) => onDateChange("endDate", value || "")} /></View>
    </View>}
    {dates && onDateChange && !!(dates.startDate || dates.endDate) && <TouchableOpacity accessibilityRole="button" onPress={() => { onDateChange("startDate", ""); onDateChange("endDate", ""); }} style={{ alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 4, marginHorizontal: 12 }}><Text style={{ color: "#2E67BE", fontSize: 12 }}>Clear dates</Text></TouchableOpacity>}
  </Animated.View>;
}
