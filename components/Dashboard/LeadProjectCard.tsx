import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Entypo } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGetLeadProjectWise } from "../../hooks/useCRMgetQuerry";
import { myConsole } from "../../hooks/useConsole";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { color } from "../../const/color";

const LeadProjectCard = ({ onRefresh }) => {
  const [showDatePopup, setShowDatePopup] = useState(false);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const {
    data: leadProjectWise,
    isFetching: loadingLeadProjectWise,
    isError: errorLeadProjectWise,
    refetch: refetchLeadProjectWise,
  } = useGetLeadProjectWise(startDate, endDate);

  const transformedData =
    leadProjectWise?.leadCount?.map((item) => ({
      value: item.count,
      label:
        item.projectName.length > 10
          ? item.projectName.slice(0, 10) + "..."
          : item.projectName,
    })) || [];

  const total = transformedData.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    refetchLeadProjectWise();
  }, [startDate, endDate]);

  useEffect(() => {
    if (onRefresh) {
      refetchLeadProjectWise();
    }
  }, [onRefresh]);

  //   myConsole("leadProjectWiseeee", leadProjectWise);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lead Project Wise</Text>
          <Text style={styles.totalText}>Total: {total}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowDatePopup(!showDatePopup)}>
          <Entypo name="dots-three-vertical" size={18} color="#333" />
        </TouchableOpacity>
      </View>

      {loadingLeadProjectWise ? (
        <ActivityIndicator size="large" color="#000" style={{ height: 240 }} />
      ) : errorLeadProjectWise ? (
        <NoDataFound width={220} height={240} />
      ) : (
        <LineChart
          data={transformedData}
          thickness={2}
          color={color.saffronMango}
          curved
          hideRules={false}
          yAxisColor="#ccc"
          xAxisColor="#ccc"
          noOfSections={4}
          maxValue={Math.max(...transformedData.map((d) => d.value), 5)}
          areaChart={false}
          //   showDataPoint
          dataPointsColor="#555"
          startFillColor="#fff"
          startOpacity={0.1}
          endOpacity={0.1}
          yAxisTextStyle={{ color: "#666" }}
          xAxisLabelTextStyle={{
            color: "#666",
            transform: [{ rotate: "-25deg" }],
          }}
          isAnimated
          showValuesAsDataPointsText
          dataPointsHeight={6}
          dataPointsWidth={6}
          textFontSize={12}
          spacing={40}
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

export default LeadProjectCard;

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
