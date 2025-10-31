import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { useGetLeadQuality } from "../../hooks/useCRMgetQuerry";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { color } from "../../const/color";
import { shadowPrimaryColor } from "../../const/globalStyle";
import CustomText from "../../myComponents/CustomText/CustomText";

const LeadQualityCard = ({ onRefresh }) => {
  const {
    data: leadQuality,
    isFetching: loadingLeadQuality,
    isError: errorLeadQuality,
    refetch: refetchLeadQuality,
  } = useGetLeadQuality();

  const [selectedOption, setSelectedOption] = useState("Yesterday");
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownOptions = ["Yesterday", "Weekly", "Monthly", "Yearly"];

  const formattedKey = selectedOption.toLowerCase();
  const selectedData = leadQuality?.[formattedKey] || {};

  const chartData = [
    {
      value: selectedData?.Qualified || 0,
      color: "#4C8BFE",
      label: "Qualified",
      text: `${Math.round(
        ((selectedData?.Qualified || 0) / (selectedData?.Total || 1)) * 100
      )}%`,
    },
    {
      value: selectedData?.Disqualified || 0,
      color: "#FF8A80",
      label: "Disqualified",
      text: `${Math.round(
        ((selectedData?.Disqualified || 0) / (selectedData?.Total || 1)) * 100
      )}%`,
    },
    {
      value: selectedData?.Pending || 0,
      color: "#FFC047",
      label: "Pending",
      text: `${Math.round(
        ((selectedData?.Pending || 0) / (selectedData?.Total || 1)) * 100
      )}%`,
    },
  ];

  const total = selectedData?.Total || 0;

  useEffect(() => {
    if (onRefresh) refetchLeadQuality();
  }, [onRefresh]);

  return (
    <View style={styles.card}>
      {/* ---------- Header ---------- */}
      <View style={styles.header}>
        <CustomText style={styles.title}>Lead Quality</CustomText>

        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          style={styles.dropdown}
        >
          <CustomText style={styles.dropdownText}>{selectedOption}</CustomText>
          <Ionicons name="chevron-down" size={16} color={color.primary800} />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownList}>
            {dropdownOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSelectedOption(option);
                  setShowDropdown(false);
                }}
                style={styles.dropdownItem}
              >
                <CustomText style={styles.dropdownOption}>{option}</CustomText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ---------- Content ---------- */}
      {loadingLeadQuality ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primaryColor} />
        </View>
      ) : errorLeadQuality ? (
        <NoDataFound width={220} height={250} />
      ) : (
        <>
          {/* Pie Chart */}
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              donut
              radius={90}
              innerRadius={45}
              showText
              textColor="#fff"
              textSize={12}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <CustomText style={styles.totalText}>Total</CustomText>
                  <CustomText style={styles.totalValue}>{total}</CustomText>
                </View>
              )}
            />
          </View>

          {/* Legends */}
          <View style={styles.legendContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <CustomText style={styles.legendLabel}>{item.label}</CustomText>
                <CustomText style={styles.legendValue}>{item.value}</CustomText>
              </View>
            ))}

            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "#B30000" }]} />
              <CustomText style={styles.legendLabel}>Lost</CustomText>
              <CustomText style={styles.legendValue}>
                {selectedData?.Lost || 0}
              </CustomText>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default LeadQualityCard;

/* ------------------------------------
   Modern Dashboard Styling
------------------------------------ */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#1E293B",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    ...shadowPrimaryColor,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 0.3,
    fontFamily: "System",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 0.8,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
    color: "#334155",
    fontFamily: "System",
  },
  dropdownList: {
    position: "absolute",
    right: 0,
    top: 36,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 10,
    elevation: 5,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownOption: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  loadingContainer: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  centerLabel: {
    alignItems: "center",
  },
  totalText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 4,
  },
  legendContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  legendValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
});
