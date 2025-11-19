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
import {
  shadow1,
  shadowPrimaryColor,
  shadowSecondaryColor,
} from "../../const/globalStyle";
import CustomText from "../../myComponents/CustomText/CustomText";

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
          <CustomText style={styles.title}>Lead Project Wise</CustomText>
          <CustomText style={styles.totalText}>Total: {total}</CustomText>
        </View>
        <TouchableOpacity onPress={() => setShowDatePopup(!showDatePopup)}>
          <Entypo
            name="dots-three-vertical"
            size={18}
            color={color.mainTxtColor}
          />
        </TouchableOpacity>
      </View>

      {loadingLeadProjectWise ? (
        <ActivityIndicator
          size="large"
          color={color.mainTxtColor}
          style={{ height: 240 }}
        />
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
          dataPointsColor={color.mainTxtColor}
          startFillColor="#fff"
          startOpacity={0.1}
          endOpacity={0.1}
          yAxisTextStyle={{ color: color.strokeColor }}
          xAxisLabelTextStyle={{
            color: color.strokeColor,
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
              textColor={color.mainTxtColor}
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
              textColor={color.mainTxtColor}
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
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    position: "relative",
    ...shadowPrimaryColor,
    borderLeftWidth: 4,
    borderLeftColor: color.mainTxtColor,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    color: color.titleColor,
    letterSpacing: 0.3,
  },
  totalText: {
    fontSize: 14,
    color: color.mainTxtColor,
    fontWeight: "500",
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
    ...shadowPrimaryColor,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: color.mainTxtColor,
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
