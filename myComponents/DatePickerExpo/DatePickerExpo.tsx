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
  minuteInterval?: number;
  iosDisplay?: "default" | "spinner" | "compact" | "inline";
}

const DatePickerExpo = ({
  boxContainerStyle,
  onSelect,
  initialValue,
  title,
  mode = "date",
  maximumDate,
  minimumDate,
  minuteInterval,
  iosDisplay = "spinner",
}: TDatePickerExpo) => {
  const [date, setDate] = useState(new Date());
  const [getDate, setGetDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const clampToRange = (value: Date) => {
    if (minimumDate && value < new Date(minimumDate)) return new Date(minimumDate);
    if (maximumDate && value > new Date(maximumDate)) return new Date(maximumDate);
    return value;
  };

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
      onSelect && onSelect(null);
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
          const validDate = clampToRange(finalDate);
          setShowTimePicker(false);
          setGetDate(validDate);
          onSelect && onSelect(validDate); // pass to formik
        }
      } else {
        setShowPicker(false);
        setShowTimePicker(false); // ✅ close modal after OK
        const validDate = clampToRange(selectedDate);
        setGetDate(validDate);
        onSelect && onSelect(validDate);
      }
    } else {
      setShowPicker(false);
      setShowTimePicker(false); // ✅ close modal after OK
      setGetDate(selectedDate);
      onSelect && onSelect(selectedDate);
    }
  };
  useEffect(() => {
    if (
      initialValue &&
      initialValue !== "null" &&
      initialValue !== "undefined" &&
      moment(initialValue).isValid()
    ) {
      const d = new Date(initialValue);

      setGetDate(d);
      setDate(d);
    } else {
      setGetDate(null);
      setDate(new Date());
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
        <Modal
          isVisible={showPicker}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          swipeDirection="down"
          onSwipeComplete={() => {
            setShowPicker(false);
            setShowTimePicker(false);
          }}
          onBackdropPress={() => {
            setShowPicker(false);
            setShowTimePicker(false);
          }}
          style={styles.bottomModal}
          backdropOpacity={0.35}
          useNativeDriver
          hideModalContentWhileAnimating
        >
          <View style={styles.bottomSheet}>
            {/* Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <TouchableOpacity
                onPress={() => {
                  setDate(new Date());
                  setGetDate(null);
                  onSelect && onSelect(null);
                  setShowPicker(false);
                  setShowTimePicker(false);
                }}
              >
                <CustomText style={styles.cancelText}>Cancel</CustomText>
              </TouchableOpacity>

              <CustomText style={styles.sheetTitle}>
                Select {mode === "time" ? "Time" : "Date"}
              </CustomText>

              <TouchableOpacity
                onPress={() => {
                  if (date) {
                    const finalDate = clampToRange(new Date(date));

                    setGetDate(finalDate);

                    onSelect && onSelect(finalDate);
                  }

                  setShowPicker(false);
                  setShowTimePicker(false);
                }}
              >
                <CustomText style={styles.doneText}>Done</CustomText>
              </TouchableOpacity>
            </View>

            {/* Picker */}
            <View style={styles.pickerContainer}>
              <DateTimePicker
                mode={mode}
                display={iosDisplay}
                value={date || new Date()}
                onChange={(event, selectedDate) => {
                  const current =
                    selectedDate || new Date(event?.nativeEvent?.timestamp);

                  setDate(current);
                }}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                textColor={color.mainTxtColor}
                accentColor={color.mainTxtColor}
                themeVariant="light"
                minuteInterval={minuteInterval}
              />
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === "android" && (
        <>
          {showPicker && mode !== "time" && (
            <DateTimePicker
              mode={mode === "datetime" ? "date" : "date"}
              display="default"
              value={date || new Date()}
              onChange={onChange}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              minuteInterval={minuteInterval}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              mode="time"
              display="default"
              value={date || new Date()}
              onChange={onChange}
              minuteInterval={minuteInterval}
            />
          )}
        </>
      )}
    </>
  );
};

export default DatePickerExpo;

const styles = StyleSheet.create({
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingBottom: 24,
    overflow: "hidden",
  },

  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 14,
  },

  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: color.mainTxtColor,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },

  doneText: {
    fontSize: 15,
    fontWeight: "700",
    color: color.mainTxtColor,
  },

  pickerContainer: {
    backgroundColor: "#ffffff",
    paddingBottom: 10,
    alignSelf: "center",
  },
});
