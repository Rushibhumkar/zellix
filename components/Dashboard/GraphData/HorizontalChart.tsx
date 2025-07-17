import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomText from "../../../myComponents/CustomText/CustomText";

const HorizontalBarChart = ({ data, maxValue = 100 }) => {
  return (
    <View style={styles.chartContainer}>
      {/* Grid lines rendered behind the bar area */}
      <GridLines />
      {data.map((item, index) => {
        const barWidth = (item.value / maxValue) * 100;
        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barArea}>
              {/* Grey Background Bar (Full Width) */}
              <View style={styles.barBackground} />
              {/* Golden Fill Bar */}
              <View style={[styles.barFill, { width: `${barWidth}%` }]} />
              {/* Label Positioned Inside */}
              <CustomText style={styles.label}>{item.label}</CustomText>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const GridLines = () => {
  const gridPositions = [0, 25, 50, 75, 100];
  return (
    <View style={styles.gridLinesContainer}>
      {gridPositions.map((pos, idx) => (
        <View key={idx} style={[styles.gridLine, { left: `${pos}%` }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    marginVertical: 10,
    paddingRight: 10, // Ensures bars align with last grid line
    paddingTop: 20,
  },
  gridLinesContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  gridLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#ccc",
  },
  barContainer: {
    marginBottom: 20,
    zIndex: 1, // Ensure bars render above grid lines
  },
  barArea: {
    width: "100%", // Ensure bars extend fully
    height: 40,
    backgroundColor: "transparent",
    position: "relative",
    justifyContent: "center",
  },
  barBackground: {
    position: "absolute",
    width: "100%", // Ensures it touches the last grid line
    height: "100%",
    backgroundColor: "#F0F0F0", // Grey Background
  },
  barFill: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#FFC857", // Golden Fill
  },
  label: {
    position: "absolute",
    alignSelf: "flex-start",
    fontSize: 14,
    color: "#000",
    paddingLeft: 20,
    fontWeight: "500",
  },
});

export default HorizontalBarChart;
