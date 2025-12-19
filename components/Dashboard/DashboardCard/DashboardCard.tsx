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
import { shadowPrimaryColor } from "../../../const/globalStyle";
import { formatCount } from "../../../utils/commonFunctions";

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
          <LinearGradient
            key={item?._id}
            colors={["#FFFFFF", "#F8FAFC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerCard}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.mainValues}>
                <View style={styles.valueItem}>
                  <CustomText style={styles.valueLabel}>
                    Property Value
                  </CustomText>
                  <CustomText style={styles.primaryValue}>
                    {formatCount(item?.total?.total)}
                  </CustomText>
                </View>
                <View style={styles.valueItem}>
                  <CustomText style={styles.valueLabel}>
                    Gross {"\n"}Revenue
                  </CustomText>
                  <CustomText style={styles.primaryValue}>
                    {formatCount(item?.commission?.total)}
                  </CustomText>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.expandBtn}
              >
                <View style={styles.expandBtnInner}>
                  <DownArrow
                    width={16}
                    height={16}
                    style={{
                      transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Expanded Section */}
            {isExpanded && (
              <View style={styles.expandedSection}>
                <View style={styles.divider} />
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <CustomText style={styles.detailLabel}>
                      Net Revenue
                    </CustomText>
                    <CustomText style={styles.detailValue}>
                      {formatCount(item?.clientLoyalty?.total)}
                    </CustomText>
                  </View>
                  <View style={styles.detailItem}>
                    <CustomText style={styles.detailLabel}>
                      Client Loyalty
                    </CustomText>
                    <CustomText style={styles.detailValue}>
                      {formatCount(item?.netCommission?.total)}
                    </CustomText>
                  </View>
                  <View style={styles.detailItem}>
                    <CustomText style={styles.detailLabel}>Broker</CustomText>
                    <CustomText style={styles.detailValue}>
                      {formatCount(item?.brokerReferral?.total)}
                    </CustomText>
                  </View>
                </View>
                <View style={[styles.divider, { marginBottom: 0 }]} />
              </View>
            )}
          </LinearGradient>
        ))
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyContent}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={color.primaryColor} />
                <CustomText style={styles.loadingText}>
                  Loading summary data...
                </CustomText>
              </View>
            ) : (
              <View style={styles.noDataContent}>
                <NoDataFound width={150} height={150} />
                <CustomText style={styles.noDataText}>
                  No summary data available
                </CustomText>
                <CustomText style={styles.noDataSubtext}>
                  Try adjusting your filters or date range
                </CustomText>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    ...shadowPrimaryColor,
    borderLeftWidth: 4,
    borderLeftColor: color.mainTxtColorFade,
  },
  titleText: {
    fontSize: 17,
    color: color.titleColor,
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  dropdownSection: {
    marginBottom: 20,
  },
  dropdownBox: {
    width: "100%",
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
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  innerCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: color.mainTxtColorFade,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mainValues: {
    flex: 1,
    flexDirection: "row",
    gap: 24,
  },
  valueItem: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: color.strokeColor,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  primaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  expandBtn: {
    padding: 8,
    marginLeft: 8,
  },
  expandBtnInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  expandedSection: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: color.strokeColor,
    marginVertical: 16,
  },
  detailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: color.strokeColor,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
  emptyState: {
    marginVertical: 40,
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  noDataContent: {
    alignItems: "center",
    gap: 12,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginTop: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});
