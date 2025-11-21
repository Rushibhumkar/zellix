import { ActivityIndicator, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { BarChart } from "react-native-gifted-charts";
import { shadowPrimaryColor } from "../../const/globalStyle";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomText from "../../myComponents/CustomText/CustomText";
import { WIDTH } from "../../const/deviceInfo";
import NoDataIcon from "../../assets/svg/NoDataIcon";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import { color } from "../../const/color";

const CommissionGraph = ({ isLoading, item }) => {
  const [chart, setChart] = useState([]);

  useEffect(() => {
    if (item?.weeklyCommission?.length) {
      const temp = item.weeklyCommission.map((el) => ({
        value: el?.totalCommission / 100000,
        label: el?.dayOfWeek,
        frontColor: "#177AD5",
        topLabelComponent: () => (
          <CustomText style={styles.topLabel}>
            {el?.totalCommission / 100000}
          </CustomText>
        ),
      }));
      setChart(temp);
    } else {
      setChart([]);
    }
  }, [isLoading]);

  const handleSelect = (type) => {
    let source = item?.[type] || [];
    const temp = source.map((el) => ({
      value: el?.totalCommission / 100000,
      label:
        type === "weeklyCommission"
          ? el?.dayOfWeek
          : type === "monthlyCommission"
          ? el?.month
          : el?.year,
      frontColor: "#177AD5",
      topLabelComponent: () => (
        <CustomText style={styles.topLabel}>
          {el?.totalCommission / 100000}
        </CustomText>
      ),
    }));
    setChart(temp);
  };

  return (
    <View style={styles.card}>
      {!isLoading ? (
        <View>
          {/* ---------- Header ---------- */}
          <View style={styles.headerRow}>
            <CustomText style={styles.title}>Commission</CustomText>
            <View style={styles.dropdownBox}>
              <DropdownRNE
                arrOfObj={[
                  { name: "Weekly", _id: "weeklyCommission" },
                  { name: "Monthly", _id: "monthlyCommission" },
                  { name: "Yearly", _id: "yearlyCommission" },
                ]}
                initialValue={"weeklyCommission"}
                keyValueGetOnSelect="_id"
                keyValueShowInBox="name"
                label=""
                placeholder=" "
                onChange={(a) => handleSelect(a)}
                labelTextStyle={{ color: "white" }}
              />
            </View>
          </View>

          {/* ---------- Bar Chart ---------- */}
          {chart?.length > 0 ? (
            <View style={styles.chartWrapper}>
              <BarChart
                barWidth={26}
                barBorderRadius={6}
                frontColor="#177AD5"
                data={chart}
                yAxisThickness={0}
                xAxisThickness={0}
                noOfSections={5}
                yAxisLabelSuffix="L"
                width={WIDTH - 140}
                hideRules
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <NoDataIcon width={120} height={120} />
              <CustomText style={styles.noDataText}>
                No data available
              </CustomText>
            </View>
          )}
        </View>
      ) : (
        <Loader />
      )}
    </View>
  );
};

export default CommissionGraph;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    ...shadowPrimaryColor,
    borderLeftWidth: 4,
    borderLeftColor: color.mainTxtColorFade,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    color: "#1E3A8A",
    marginBottom: 6,
  },
  dropdownBox: {
    width: 130,
    backgroundColor: "#F9FAFB",
  },
  chartWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 10,
  },
  topLabel: {
    color: "#2563EB",
    marginBottom: 6,
    fontSize: 11,
    fontWeight: "600",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  noDataText: {
    marginTop: 8,
    color: color.strokeColor,
    fontSize: 14,
  },
});

/* ---------------- Loader ---------------- */
const Loader = () => (
  <View>
    <View style={stylesLoader.loaderHeader}>
      <SkeletonView
        wrapperStyle={{
          width: 100,
          height: 25,
          borderRadius: 10,
        }}
      />
      <SkeletonView
        wrapperStyle={{
          width: 140,
          height: 30,
          borderRadius: 10,
        }}
      />
    </View>
    <View style={stylesLoader.loaderBody}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  </View>
);

const stylesLoader = StyleSheet.create({
  loaderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingVertical: 20,
  },
  loaderBody: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
});
