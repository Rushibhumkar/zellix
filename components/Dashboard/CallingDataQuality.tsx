import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import moment from "moment";
import { PieChart } from "react-native-gifted-charts";

import CustomText from "../../myComponents/CustomText/CustomText";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";

import { color } from "../../const/color";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { useGetCallingDataQuality } from "../../hooks/useCRMgetQuerry";
import { myConsole } from "../../hooks/useConsole";
import { formatCount } from "../../utils/commonFunctions";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

const CallingDataQuality = ({ onRefresh }: any) => {
  const [startDate, setStartDate] = useState(
    moment("2025-06-01", "YYYY-MM-DD")
  );

  const [endDate, setEndDate] = useState(moment("2025-12-31", "YYYY-MM-DD"));

  const {
    data,
    isFetching,
    isError,
    refetch: refetchCallingData,
  } = useGetCallingDataQuality(startDate, endDate);

  const leadCount = data?.leadCount || {};

  const total = leadCount?.Total || 0;

  const chartData = [
    {
      value: leadCount?.Qualified || 0,
      color: "#3B82F6",
    },
    {
      value: leadCount?.Disqualified || 0,
      color: "#60A5FA",
    },
    {
      value: leadCount?.Pending || 0,
      color: "#93C5FD",
    },
    {
      value: leadCount?.Lost || 0,
      color: "#E5E7EB",
    },
  ];

  useEffect(() => {
    if (onRefresh) refetchCallingData();
  }, [onRefresh]);
  return (
    <View style={styles.card}>
      {/* ---------- Title ---------- */}
      <SlideFadeIn from={-10}>
        <CustomText style={styles.title}>Calling Data Quality</CustomText>
      </SlideFadeIn>

      {/* ---------- Date Pickers ---------- */}
      <SlideFadeIn from={-10}>
        <View style={styles.dateRow}>
          <DatePickerExpo
            title="Start Date"
            boxContainerStyle={styles.dateBox}
            onSelect={setStartDate}
            initialValue={startDate}
          />
          <DatePickerExpo
            title="End Date"
            boxContainerStyle={styles.dateBox}
            onSelect={setEndDate}
            initialValue={endDate}
          />
        </View>
      </SlideFadeIn>

      {/* ---------- Loader ---------- */}
      {isFetching && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      {/* ---------- Error / No Data ---------- */}
      {!isFetching && (isError || total === 0) && (
        <NoDataFound width={180} height={180} />
      )}

      {/* ---------- Chart ---------- */}
      {!isFetching && total > 0 && (
        <>
          <SlideFadeIn from={0}>
            <View style={styles.chartWrapper}>
              <PieChart
                data={chartData}
                donut
                radius={80}
                innerRadius={45}
                strokeColor="#F8FAFC"
                strokeWidth={2}
                centerLabelComponent={() => (
                  <View style={styles.centerLabel}>
                    <Text style={styles.centerValue}>{formatCount(total)}</Text>
                    <Text style={styles.centerText}>Total</Text>
                  </View>
                )}
              />
            </View>

            {/* ---------- Legend ---------- */}
            <SlideFadeIn from={-10}>
              <View style={styles.legendContainer}>
                <View style={styles.legendColumn}>
                  {/* Qualified */}
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.square, { backgroundColor: "#3B82F6" }]}
                    />
                    <View style={styles.labelValueView}>
                      <Text style={styles.legendLabel}>Qualified</Text>
                      <Text style={styles.legendValue}>
                        {formatCount(leadCount?.Qualified) || 0}
                      </Text>
                    </View>
                  </View>

                  {/* Pending */}
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.square, { backgroundColor: "#93C5FD" }]}
                    />
                    <View style={styles.labelValueView}>
                      <Text style={styles.legendLabel}>Pending</Text>
                      <Text style={styles.legendValue}>
                        {formatCount(leadCount?.Pending) || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.legendColumn}>
                  {/* Disqualified */}
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.square, { backgroundColor: "#60A5FA" }]}
                    />
                    <View style={styles.labelValueView}>
                      <Text style={styles.legendLabel}>Disqualified</Text>
                      <Text style={styles.legendValue}>
                        {formatCount(leadCount?.Disqualified) || 0}
                      </Text>
                    </View>
                  </View>

                  {/* Lost */}
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.square, { backgroundColor: "#E5E7EB" }]}
                    />
                    <View style={styles.labelValueView}>
                      <Text style={styles.legendLabel}>Lost</Text>
                      <Text style={styles.legendValue}>
                        {formatCount(leadCount?.Lost) || 0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </SlideFadeIn>
          </SlideFadeIn>
        </>
      )}
    </View>
  );
};

export default CallingDataQuality;

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginHorizontal: 14,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: color.mainTxtColorFade,
    ...shadowPrimaryColor,
  },
  title: {
    fontSize: 17,
    fontWeight: "500",
    color: color.titleColor,
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateBox: {
    width: "48%",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  chartWrapper: {
    alignItems: "center",
    marginTop: 10,
  },
  centerLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  legendColumn: {
    flex: 1,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },

  legendLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: color.strokeColor,
  },

  legendValue: {
    fontSize: 14,
    fontWeight: "600",
    color: color.mainTxtColor,
  },

  centerValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  centerText: {
    fontSize: 14,
    color: "#64748B",
  },
  square: {
    width: 12,
    height: 12,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "500",
    color: color.mainTxtColor,
  },
  labelValueView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
