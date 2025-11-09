import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { color } from "../../../const/color";
import CustomText from "../../../myComponents/CustomText/CustomText";
import DropdownRNE from "../../../myComponents/DropdownRNE/DropdownRNE";
import DownArrow from "../../../assets/svg/DownArrow";
import DatePickerExpo from "../../../myComponents/DatePickerExpo/DatePickerExpo";
import { summary } from "../../../services/hrmApi/userHrmApi";
import { summaryList } from "../../../utils/data";
import moment from "moment";
import NoDataFound from "../../../myComponents/NoDataFound/NoDataFound";
import { LinearGradient } from "expo-linear-gradient";

// Horizontal separator
const Line = () => <View style={styles.line} />;

// Helper for formatting values
const formatText = (value) => {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(value);
  }
  return value;
};

export default function DashboardCard({ title = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startDate, setStartDate] = useState(moment().startOf("month"));
  const [endDate, setEndDate] = useState(moment());
  const [selectedItem, setSelectedItem] = useState("confirm_business");
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
          value: selectedItem || "total",
        };

        const data = await summary(details);
        setSummaryData(data);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, [startDate, endDate, selectedItem]);

  return (
    <View style={styles.cardWrapper}>
      {/* Header */}
      <CustomText style={styles.titleText}>{title}</CustomText>

      {/* Dropdown & Date Pickers */}
      <View style={styles.dropdownSection}>
        <DropdownRNE
          containerStyle={styles.dropdownBox}
          placeholder="Select Value"
          arrOfObj={summaryList}
          keyValueShowInBox="name"
          keyValueGetOnSelect="value"
          onChange={(v) => setSelectedItem(v)}
          initialValue={"confirm_business"}
        />

        <View style={styles.datePickersRow}>
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
      </View>

      {/* Summary Cards */}
      {summaryData?.data?.length > 0 ? (
        summaryData?.data?.map((item) => (
          <View key={item?._id} style={styles.innerCard}>
            <View style={styles.headerRow}>
              <View style={styles.valueBlock}>
                <CustomText style={styles.labelText}>
                  Sum of Property Value
                </CustomText>
                <CustomText style={styles.valueText}>
                  {formatText(item?.total?.total)}
                </CustomText>
              </View>
              <View style={styles.valueBlock}>
                <CustomText style={styles.labelText}>
                  Sum of Gross Revenue
                </CustomText>
                <CustomText style={styles.valueText}>
                  {formatText(item?.commission?.total)}
                </CustomText>
              </View>
              <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.expandBtn}
              >
                <DownArrow
                  width={20}
                  height={20}
                  style={{
                    transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Expanded Section */}
            {isExpanded && (
              <View>
                <Line />
                <View style={styles.detailsRow}>
                  <View style={styles.detailBox}>
                    <CustomText style={styles.labelText}>
                      Sum of Net Revenue
                    </CustomText>
                    <CustomText style={styles.valueText}>
                      {formatText(item?.clientLoyalty?.total)}
                    </CustomText>
                  </View>
                  <View style={styles.detailBox}>
                    <CustomText style={styles.labelText}>
                      Sum of Client Loyalty
                    </CustomText>
                    <CustomText style={styles.valueText}>
                      {formatText(item?.netCommission?.total)}
                    </CustomText>
                  </View>
                  <View style={styles.detailBox}>
                    <CustomText style={styles.labelText}>
                      Sum of Broker
                    </CustomText>
                    <CustomText style={styles.valueText}>
                      {formatText(item?.brokerReferral?.total)}
                    </CustomText>
                  </View>
                </View>
                <Line />
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={color.primaryColor} />
          ) : (
            <NoDataFound width={200} height={200} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#FFFFFF",
    // borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: color.primaryColor,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  titleText: {
    fontSize: 20,
    color: "#1E3A8A",
    marginBottom: 16,
  },
  dropdownSection: {
    marginBottom: 20,
  },
  dropdownBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  datePickersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  datePickerBox: {
    width: "48%",
  },
  innerCard: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueBlock: {
    width: "40%",
  },
  labelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  valueText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  expandBtn: {
    padding: 4,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  detailBox: {
    width: "32%",
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginVertical: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
});
