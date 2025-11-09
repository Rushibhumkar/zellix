import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
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
import { LinearGradient } from "expo-linear-gradient";

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
    <View style={styles.cardContainer}>
      {/* ---------- Header ---------- */}
      <CustomText style={styles.headerTitle}>{header}</CustomText>

      {/* ---------- Dropdown ---------- */}
      <DropdownRNE
        containerStyle={styles.dropdownBox}
        arrOfObj={dropdownList}
        keyValueShowInBox="name"
        keyValueGetOnSelect="value"
        onChange={(selectedValue) => {
          setSelectedItem(selectedValue);
        }}
        initialValue={"total"}
      />

      {/* ---------- Date Pickers ---------- */}
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

      {/* ---------- Chart ---------- */}
      {summaryData?.data?.length > 0 && (
        <View style={{ marginTop: 20 }}>
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
        </View>
      )}

      {/* ---------- Summary List ---------- */}
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
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginHorizontal: 14,
    marginTop: 10,
    shadowColor: color.primaryColor,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    color: "#1E3A8A",
    marginBottom: 16,
  },
  dropdownBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    marginBottom: 18,
  },
  datePickersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  datePickerBox: {
    width: "48%",
  },
  valueCard: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 16,
  },
  summaryContainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#E2E8F0",
    padding: 12,
    backgroundColor: "#F8FAFC",
    marginTop: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  keyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  valueText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#0F172A",
  },
});
