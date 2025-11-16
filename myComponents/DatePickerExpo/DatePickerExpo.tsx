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
import { color } from "../../const/color";
import CustomText from "../CustomText/CustomText";
import { Feather } from "@expo/vector-icons";

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
    if (Platform.OS === "ios") {
      setShowPicker(true); // always use modal for iOS
    } else {
      if (mode === "time") {
        setShowTimePicker(true);
      } else {
        setShowPicker(true);
      }
    }
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
        setShowTimePicker(false); // ✅ close modal after OK
        setGetDate(selectedDate);
        onSelect && onSelect(selectedDate);
      }
    } else {
      setShowPicker(false);
      setShowTimePicker(false); // ✅ close modal after OK
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
          <CustomText
            style={{
              color: color.mainTxtColor,
              marginBottom: 6,
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            {title ?? "Date"}
          </CustomText>
        )}
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            height: 39.5,
            borderColor: color.mainTxtColorFade,
            backgroundColor: "#ecf2f9ff",
            borderWidth: 1.2,
            borderRadius: 14,
            padding: 10,
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            paddingEnd: 20,
          }}
          onPress={toggleDatePicker}
        >
          <CustomText
            style={{
              fontSize: 14,
              fontWeight: "400",
              color: getDate ? color?.mainTxtColor : color?.mainTxtColorFade,
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
          </CustomText>

          <Feather name="calendar" size={18} color={color.mainTxtColor} />
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
                  mode={mode} // ✅ ensure time mode works too
                  display="spinner"
                  value={date}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
                  textColor={color.mainTxtColor}
                  accentColor={color.mainTxtColor}
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
                  color={color.darkBlack}
                />
                <Button
                  title="Ok"
                  onPress={() => {
                    setGetDate(date);
                    onSelect && onSelect(date);
                    setShowPicker(false);
                    setShowTimePicker(false);
                  }}
                  color={color.darkBlack}
                />
              </>
            </View>
          </Modal>
        </>
      )}
      {Platform.OS === "android" && (
        <>
          {showPicker && mode !== "time" && (
            <DateTimePicker
              mode={mode === "datetime" ? "date" : "date"}
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
