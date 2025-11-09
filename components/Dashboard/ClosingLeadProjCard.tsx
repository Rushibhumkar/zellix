import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Entypo } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGetClosingLeadProjectWise } from "../../hooks/useCRMgetQuerry";
import { myConsole } from "../../hooks/useConsole";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { color } from "../../const/color";
import {
  shadowPrimaryColor,
  shadowSecondaryColor,
} from "../../const/globalStyle";
import CustomText from "../../myComponents/CustomText/CustomText";

const ClosingLeadProjCard = ({ onRefresh }) => {
  const [showDatePopup, setShowDatePopup] = useState(false);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const {
    data: closingLeadProjectWise,
    isFetching: loadingClosingLeadProjectWise,
    isError: errorClosingLeadProjectWise,
    refetch: refetchClosingLeadProjectWise,
  } = useGetClosingLeadProjectWise(startDate, endDate);

  useEffect(() => {
    refetchClosingLeadProjectWise();
  }, [startDate, endDate]);

  useEffect(() => {
    if (onRefresh) {
      refetchClosingLeadProjectWise();
    }
  }, [onRefresh]);

  const transformedData =
    closingLeadProjectWise?.leadCount?.map((item) => ({
      value: item.count,
      label:
        item.projectName.length > 10
          ? item.projectName.slice(0, 10) + "..."
          : item.projectName,
      frontColor: color.saffronMango,
      spacing: 20,
    })) || [];

  const total = transformedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <CustomText style={styles.title}>
            Closing Lead Project Wise
          </CustomText>
          <CustomText style={styles.totalText}>Total: {total}</CustomText>
        </View>
        <TouchableOpacity onPress={() => setShowDatePopup(!showDatePopup)}>
          <Entypo name="dots-three-vertical" size={18} color="#333" />
        </TouchableOpacity>
      </View>

      {loadingClosingLeadProjectWise ? (
        <ActivityIndicator size="large" color="#000" style={{ height: 270 }} />
      ) : errorClosingLeadProjectWise ? (
        <NoDataFound width={250} height={280} />
      ) : (
        <BarChart
          barWidth={35}
          noOfSections={5}
          barBorderRadius={6}
          frontColor={color.saffronMango}
          data={transformedData}
          yAxisThickness={1}
          xAxisThickness={1}
          yAxisColor="#ccc"
          xAxisColor="#ccc"
          yAxisTextStyle={{ color: "#888" }}
          xAxisLabelTextStyle={{ color: "#444", fontSize: 12 }}
          spacing={60}
          maxValue={Math.max(...transformedData.map((d) => d.value), 1)}
          stepHeight={50}
        />
      )}

      {showDatePopup && (
        <View style={styles.datePopup}>
          <CustomText style={styles.dateLabel}>Start Date</CustomText>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={styles.dateBox}
          >
            <CustomText>{startDate.toLocaleDateString("en-GB")}</CustomText>
          </TouchableOpacity>

          <CustomText style={styles.dateLabel}>End Date</CustomText>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={styles.dateBox}
          >
            <CustomText>{endDate.toLocaleDateString("en-GB")}</CustomText>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) setStartDate(selectedDate);
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) setEndDate(selectedDate);
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default ClosingLeadProjCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    position: "relative",
    ...shadowPrimaryColor,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  datePopup: {
    position: "absolute",
    top: 55,
    right: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    zIndex: 30,
    width: 250,
    shadowColor: "#1E293B",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 10,
    marginBottom: 5,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});
