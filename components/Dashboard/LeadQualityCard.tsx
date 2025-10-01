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
import { myConsole } from "../../hooks/useConsole";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { color } from "../../const/color";
import {
  shadowPrimaryColor,
  shadowSecondaryColor,
} from "../../const/globalStyle";

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
      color: "#3A57E8",
      label: "Qualified",
      text: `${Math.round(
        ((selectedData?.Qualified || 0) / (selectedData?.Total || 1)) * 100
      )}%`,
    },
    {
      value: selectedData?.Disqualified || 0,
      color: "#FEC9C9",
      label: "Disqualified",
      text: `${Math.round(
        ((selectedData?.Disqualified || 0) / (selectedData?.Total || 1)) * 100
      )}%`,
    },
    {
      value: selectedData?.Pending || 0,
      color: "#FFA629",
      label: "Pending",
      text: `${Math.round(
        ((selectedData?.Pending || 0) / (selectedData?.Total || 1)) * 100
      )}%`,
    },
  ];

  const total = selectedData?.Total || 0;

  useEffect(() => {
    if (onRefresh) {
      refetchLeadQuality();
    }
  }, [onRefresh]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Lead Quality</Text>

        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          style={styles.dropdown}
        >
          <Text style={styles.dropdownText}>{selectedOption}</Text>
          <Ionicons name="chevron-down" size={16} color="#333" />
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
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {loadingLeadQuality ? (
        <ActivityIndicator style={{ height: 270 }} size="large" color="#000" />
      ) : errorLeadQuality ? (
        <NoDataFound width={250} height={280} />
      ) : (
        <>
          <View style={{ alignItems: "center", marginVertical: 10 }}>
            <PieChart
              data={chartData}
              donut
              radius={80}
              innerRadius={40}
              showText
              textColor="white"
              textSize={12}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text
                    style={{
                      color: "#FEC9C9",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{ fontSize: 18, fontWeight: "bold", color: "#000" }}
                  >
                    {total}
                  </Text>
                </View>
              )}
            />
          </View>

          <View style={styles.labelContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.labelRow}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.labelText}>{item.label}</Text>
                <Text style={styles.labelValue}>{item.value}</Text>
              </View>
            ))}
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: "#B30000" }]} />
              <Text style={styles.labelText}>Lost</Text>
              <Text style={styles.labelValue}>{selectedData?.Lost || 0}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default LeadQualityCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    elevation: 6,
    shadowColor: "#3A57E8",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.8,
    borderColor: color.primary200,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  dropdownText: {
    marginRight: 6,
    color: "#334155",
    fontWeight: "500",
  },
  dropdownList: {
    position: "absolute",
    right: 0,
    top: 32,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    zIndex: 10,
    elevation: 6,
    ...shadowSecondaryColor,
  },
  dropdownItem: {
    padding: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  centerLabel: {
    alignItems: "center",
  },
  labelContainer: {
    marginTop: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  labelText: {
    flex: 1,
    fontSize: 14,
  },
  labelValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
