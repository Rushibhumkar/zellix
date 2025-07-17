import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Button,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Modal from "react-native-modal";
import DateIcon from "../../assets/svg/DateIcon";
import { color } from "../../const/color";

interface TDatePickerExpo {
  boxContainerStyle?: StyleProp<ViewStyle>;
  onSelect: (a: string) => void;
  initialValue?: string;
  title?: string;
  mode?: "date" | "time" | "datetime";
  maximumDate?: any;
  minimumDate?: any;
}

const DatePickerExpo = ({
  boxContainerStyle,
  onSelect,
  initialValue,
  title,
  mode = "date",
  maximumDate,
  minimumDate,
}: TDatePickerExpo) => {
  const [date, setDate] = useState(new Date());
  const [getDate, setGetDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
    // setDate(new Date())
  };
  const onChange = (event, selectedDate) => {
    // ✅ Handle CANCEL action on Android
    if (Platform.OS === "android" && event?.type === "dismissed") {
      // 👇 clear selected date and close pickers
      setGetDate(null);
      onSelect && onSelect(""); // clears the formik field
      setShowPicker(false);
      setShowTimePicker(false);
      return; // stop further execution
    }

    // ✅ For Android
    if (Platform.OS === "android") {
      if (mode === "datetime") {
        if (showPicker && !showTimePicker) {
          // First step: pick the date
          setDate(selectedDate);
          setShowPicker(false);
          setShowTimePicker(true); // then show time picker
        } else {
          // Second step: pick the time
          const finalDate = new Date(date);
          finalDate.setHours(selectedDate.getHours());
          finalDate.setMinutes(selectedDate.getMinutes());
          setShowTimePicker(false);
          setGetDate(finalDate);
          onSelect && onSelect(finalDate); // pass to formik
        }
      } else {
        setShowPicker(false);
        setGetDate(selectedDate);
        onSelect && onSelect(selectedDate);
      }
    } else {
      // ✅ iOS picker
      setDate(selectedDate);
      setGetDate(selectedDate);
      onSelect && onSelect(selectedDate);
    }
  };

  useEffect(() => {
    if (!!initialValue) {
      setGetDate(new Date(initialValue));
      setDate(new Date(initialValue));
    }
  }, [initialValue]);

  return (
    <>
      {/* box showing code */}
      <View style={[boxContainerStyle]}>
        {title && (
          <Text
            style={{
              color: "#000000",
              marginBottom: 10,
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            {title ?? "Date"}
          </Text>
        )}
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            height: 37.5,
            borderColor: "#000000",
            backgroundColor: "#FCFAFA",
            borderWidth: 0.5,
            borderRadius: 10,
            padding: 10,
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            paddingEnd: 20,
          }}
          onPress={toggleDatePicker}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "400",
              color: getDate ? color?.darkBlack : color?.placeholderGrey,
            }}
          >
            {getDate
              ? mode === "datetime"
                ? moment(getDate).format("DD/MM/YYYY hh:mm A")
                : mode === "date"
                ? moment(getDate).format("DD/MM/YYYY")
                : moment(getDate).format("hh:mm A")
              : mode === "datetime"
              ? "DD/MM/YYYY hh:mm A"
              : mode === "date"
              ? "DD/MM/YYYY"
              : "Time"}
          </Text>

          <DateIcon />
        </TouchableOpacity>
      </View>
      {/* date picker code */}
      {Platform.OS === "ios" && (
        <>
          <Modal
            isVisible={showPicker}
            animationIn={"zoomIn"}
            animationOut={"zoomOut"}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 30,
              }}
            >
              {showPicker && (
                <DateTimePicker
                  mode={mode}
                  display="spinner"
                  value={date}
                  onChange={onChange}
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
                />
              )}
              <>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setDate(new Date()); // optional, can skip
                    setGetDate(null); // ⛔ clear selected date
                    onSelect && onSelect(""); // ⛔ clear formik field
                    setShowPicker(false);
                    setShowTimePicker(false);
                  }}
                />

                <Button
                  title="Ok"
                  onPress={() => {
                    onSelect && onSelect(date); // <-- make sure this runs
                    toggleDatePicker();
                  }}
                />
              </>
            </View>
          </Modal>
        </>
      )}
      {Platform.OS === "android" && (
        <>
          {showPicker && (
            <DateTimePicker
              mode="date"
              display="default"
              value={date}
              onChange={onChange}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              mode="time"
              display="default"
              value={date}
              onChange={onChange}
            />
          )}
        </>
      )}
    </>
  );
};

export default DatePickerExpo;

const styles = StyleSheet.create({});
