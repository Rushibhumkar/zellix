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
          <Text style={styles.title}>Closing Lead Project Wise</Text>
          <Text style={styles.totalText}>Total: {total}</Text>
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
          <Text style={styles.dateLabel}>Start Date</Text>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={styles.dateBox}
          >
            <Text>{startDate.toLocaleDateString("en-GB")}</Text>
          </TouchableOpacity>

          <Text style={styles.dateLabel}>End Date</Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={styles.dateBox}
          >
            <Text>{endDate.toLocaleDateString("en-GB")}</Text>
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalText: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  datePopup: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    elevation: 6,
    zIndex: 20,
    width: 250,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
