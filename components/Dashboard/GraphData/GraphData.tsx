import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import CustomText from "../../../myComponents/CustomText/CustomText";
import DropdownRNE from "../../../myComponents/DropdownRNE/DropdownRNE";
import HorizontalBarChart from "./HorizontalChart";
import { color } from "../../../const/color";
import {
  confirmedBusiness,
  executedBusiness,
} from "../../../services/hrmApi/userHrmApi";
import {
  confirmedBusinessList,
  ExpressionOfInterestList,
} from "../../../utils/data";
import DatePickerExpo from "../../../myComponents/DatePickerExpo/DatePickerExpo";
import moment from "moment";
import NoDataFound from "../../../myComponents/NoDataFound/NoDataFound";
import { myConsole } from "../../../hooks/useConsole";

export default function GraphData({
  header,
  leftSubItems = [],
  rightSubValue = [],
}) {
  const [selectedItem, setSelectedItem] = useState("total");
  const [startDate, setStartDate] = useState(moment().startOf("month"));
  const [endDate, setEndDate] = useState(moment());
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
      console.warn("Invalid date range: Start Date must be before End Date.");
      return;
    }

    const fetchSummaryData = async () => {
      setIsLoading(true);
      setSummaryData(null);
      try {
        const details = {
          endDate: endDate,
          startDate: startDate,
          value: selectedItem?.value || "total",
        };

        const fetchApi =
          header === "Expression of Interest"
            ? executedBusiness
            : confirmedBusiness;

        const data = await fetchApi(details);
        setSummaryData(data);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, [startDate, endDate, selectedItem, header]);

  const dropdownList =
    header === "Expression of Interest"
      ? ExpressionOfInterestList
      : confirmedBusinessList;

  const formatLabel = (string) => {
    return string
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <View style={{ margin: 10, padding: 10 }}>
      <CustomText
        style={{
          fontWeight: "500",
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        {header}
      </CustomText>

      <View style={styles.mainContainer}>
        <DropdownRNE
          containerStyle={{ width: "70%" }}
          arrOfObj={dropdownList}
          keyValueShowInBox="name"
          keyValueGetOnSelect="value"
          onChange={(selectedValue) => {
            setSelectedItem(selectedValue);
          }}
          initialValue={"total"}
        />

        <View style={styles.datePickersContainer}>
          <DatePickerExpo
            title="Start Date"
            boxContainerStyle={styles.datePickerBox}
            onSelect={setStartDate}
            initialValue={startDate}
          />
          <DatePickerExpo
            title="End Date"
            boxContainerStyle={styles.datePickerBox}
            onSelect={setEndDate}
            initialValue={endDate}
          />
        </View>

        {summaryData?.data?.length > 0 && (
          <>
            <CustomText
              style={{ fontSize: 15, color: color.green, fontWeight: "600" }}
            >
              Total
            </CustomText>
            <CustomText style={{ fontSize: 15, fontWeight: "bold" }}>
              {summaryData?.data?.reduce(
                (sum, item) => sum + (item.totalValue || 0),
                0
              )}{" "}
              AED
            </CustomText>

            <CustomText style={{ fontSize: 15, fontWeight: "600" }}>
              {startDate
                ? new Date(startDate).toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "February 2025"}
            </CustomText>

            <HorizontalBarChart
              data={summaryData.data.map((item) => ({
                label: `${formatLabel(item.status)}: ${item.totalValue}`,
                value: item.totalValue,
              }))}
              maxValue={Math.max(
                ...summaryData.data.map((item) => item.totalValue),
                100
              )}
            />
          </>
        )}

        <View style={styles.summaryContainer}>
          {summaryData?.data?.length > 0 ? (
            summaryData?.data?.map((item, index) => (
              <View key={index} style={styles.rowContainer}>
                <CustomText style={styles.keyText}>
                  {formatLabel(item.status.substring(0, 25))}
                </CustomText>
                <CustomText style={styles.valueText}>
                  {item?.totalValue || "N/A"}
                </CustomText>
              </View>
            ))
          ) : (
            <>
              {isLoading ? (
                <ActivityIndicator />
              ) : (
                <NoDataFound width={200} height={200} />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: 1,
    borderColor: "#2D67C6",
    padding: 10,
    borderRadius: 8,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  keyText: {
    fontSize: 14,
    fontWeight: "400",
  },
  valueText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  datePickerBox: {
    marginBottom: 20,
    width: "47%",
  },
  datePickersContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  summaryContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: color.gray,
    padding: 10,
    backgroundColor: "#FCFAFA",
  },
});
