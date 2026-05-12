import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { iconWrapperStyle } from "../../const/globalStyle";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import { reportDummyData } from "../../utils/data";

const { width } = Dimensions.get("window");

const ReportsListing = () => {
  const { navigate } = useNavigation();

  const [zoomLevel, setZoomLevel] = useState(1);

  const columns = useMemo(
    () => [
      "Lead ID",
      "Client Name",
      "Mobile",
      "Project",
      "Source",
      "Assigned To",
      "Team",
      "Status",
      "Follow Up",
      "Budget",
      "City",
      "Meeting",
      "Site Visit",
      "Booking",
      "Payment",
      "Created At",
      "Updated At",
    ],
    [],
  );

  const dummyData = useMemo(() => reportDummyData || [], []);
  // myConsole("reportDummyDataaa", reportDummyData);
  const tableData = useMemo(
    () =>
      (dummyData || []).map((item) => [
        item?.leadId,
        item?.clientName,
        item?.mobile,
        item?.project,
        item?.source,
        item?.assignedTo,
        item?.team,
        item?.status,
        item?.followUp,
        item?.budget,
        item?.city,
        item?.meeting,
        item?.siteVisit,
        item?.booking,
        item?.payment,
        item?.createdAt,
        item?.updatedAt,
      ]),
    [dummyData],
  );
  const increaseZoom = () => {
    if (zoomLevel < 1.5) {
      setZoomLevel((prev) => prev + 0.1);
    }
  };

  const decreaseZoom = () => {
    if (zoomLevel > 0.7) {
      setZoomLevel((prev) => prev - 0.1);
    }
  };

  return (
    <Container>
      <Header
        title={"Reports"}
        showBackIcon={false}
        totalCount={dummyData?.length}
        isWithAnimation
        showActions={true}
        moduleName={"report"}
        showSearch={false}
        onPressFilter={() => navigate("ReportsFilter")}
        rightSide={
          <View style={styles.headerRightContainer}>
            {/* <TouchableOpacity
              style={{ ...iconWrapperStyle }}
              onPress={decreaseZoom}
            >
              <MaterialIcons name="zoom-out" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ ...iconWrapperStyle }}
              onPress={increaseZoom}
            >
              <MaterialIcons name="zoom-in" size={18} color="#fff" />
            </TouchableOpacity> */}

            <TouchableOpacity style={{ ...iconWrapperStyle }}>
              <Feather name="download" size={18} color={"#fff"} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* <View style={styles.zoomTextContainer}>
        <Text style={styles.zoomText}>
          Zoom : {(zoomLevel * 100).toFixed(0)}%
        </Text>
      </View> */}

      <ScrollView
        vertical
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[
              styles.tableContainer,
              {
                transform: [{ scale: zoomLevel }],
              },
            ]}
          >
            {/* Header Row */}
            <View style={styles.headerRow}>
              {columns.map((column, index) => (
                <View key={index} style={styles.headerCell}>
                  <Text style={styles.headerText}>{column}</Text>
                </View>
              ))}
            </View>

            {/* Body Rows */}
            {tableData.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={[
                  styles.bodyRow,
                  {
                    backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#f8fafc",
                  },
                ]}
              >
                {row.map((cell, cellIndex) => (
                  <View key={cellIndex} style={styles.bodyCell}>
                    <Text style={styles.bodyText}>{cell}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </Container>
  );
};

export default ReportsListing;

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  zoomBtn: {
    height: 38,
    width: 38,
    borderRadius: 10,
    backgroundColor: color.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },

  zoomTextContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  zoomText: {
    color: color.primary800,
    fontSize: 14,
    fontWeight: "600",
  },

  tableContainer: {
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: color.primary50,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginTop: 5,
    marginBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: color.primaryColor,
  },

  headerCell: {
    width: 150,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: color.primary200,
    // justifyContent: "center",
  },

  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  bodyRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: color.primary50,
  },

  bodyCell: {
    width: 150,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: color.primary50,
    justifyContent: "center",
  },

  bodyText: {
    color: color.primary800,
    fontSize: 13,
    fontWeight: "500",
  },
});
