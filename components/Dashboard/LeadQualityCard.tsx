// LeadQualityCard.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { useGetLeadQuality } from "../../hooks/useCRMgetQuerry";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import { shadowPrimaryColor } from "../../const/globalStyle";

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

  const total = selectedData?.Total || 0;

  const chartData = [
    {
      value: selectedData?.Qualified || 0,
      color: "#3B82F6", // Blue (Qualified)
    },
    {
      value: selectedData?.Disqualified || 0,
      color: "#60A5FA", // Lighter blue (Disqualified)
    },
    {
      value: selectedData?.Pending || 0,
      color: "#93C5FD", // Soft blue (Pending)
    },
    {
      value: selectedData?.Lost || 0,
      color: "#E5E7EB", // Light gray (Lost)
    },
  ];

  useEffect(() => {
    if (onRefresh) refetchLeadQuality();
  }, [onRefresh]);

  if (loadingLeadQuality)
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );

  if (errorLeadQuality)
    return (
      <View style={styles.card}>
        <NoDataFound width={220} height={250} />
      </View>
    );

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

      {/* ---------- Chart ---------- */}
      <View style={styles.chartWrapper}>
        <PieChart
          data={chartData}
          donut
          radius={80}
          innerRadius={45}
          showText={false}
          strokeColor="#F8FAFC"
          strokeWidth={2}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerValue}>{total}</Text>
              <Text style={styles.centerText}>Total</Text>
            </View>
          )}
        />
      </View>

      {/* ---------- Legend ---------- */}
      <View style={styles.legendContainer}>
        <View style={styles.legendColumn}>
          {/* Qualified */}
          <View style={styles.legendItem}>
            <View style={[styles.square, { backgroundColor: "#3B82F6" }]} />
            <View>
              <Text style={styles.legendLabel}>Qualified</Text>
              <Text style={styles.legendValue}>
                {selectedData?.Qualified || 0} (
                {Math.round(
                  ((selectedData?.Qualified || 0) / (total || 1)) * 100
                )}
                %)
              </Text>
            </View>
          </View>

          {/* Pending */}
          <View style={styles.legendItem}>
            <View style={[styles.square, { backgroundColor: "#93C5FD" }]} />
            <View>
              <Text style={styles.legendLabel}>Pending</Text>
              <Text style={styles.legendValue}>
                {selectedData?.Pending || 0} (
                {Math.round(
                  ((selectedData?.Pending || 0) / (total || 1)) * 100
                )}
                %)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.legendColumn}>
          {/* Disqualified */}
          <View style={styles.legendItem}>
            <View style={[styles.square, { backgroundColor: "#60A5FA" }]} />
            <View>
              <Text style={styles.legendLabel}>Disqualified</Text>
              <Text style={styles.legendValue}>
                {selectedData?.Disqualified || 0} (
                {Math.round(
                  ((selectedData?.Disqualified || 0) / (total || 1)) * 100
                )}
                %)
              </Text>
            </View>
          </View>

          {/* Lost */}
          <View style={styles.legendItem}>
            <View style={[styles.square, { backgroundColor: "#E5E7EB" }]} />
            <View>
              <Text style={styles.legendLabel}>Lost</Text>
              <Text style={styles.legendValue}>
                {selectedData?.Lost || 0} (
                {Math.round(((selectedData?.Lost || 0) / (total || 1)) * 100)}%)
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LeadQualityCard;

/* ------------------------------------
   STYLES (exact visual fidelity)
------------------------------------ */
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
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 17,
    fontWeight: "500",
    color: color.titleColor,
  },
  chartWrapper: {
    alignItems: "center",
  },
  centerLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  centerText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingHorizontal: 8,
  },
  legendColumn: {
    flex: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },

  square: {
    width: 12,
    height: 12,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: color.strokeColor,
    fontWeight: "500",
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 0.8,
    borderColor: "#CBD5E1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
    color: color.mainTxtColor,
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
    color: color.mainTxtColor,
    fontWeight: "500",
  },
});
