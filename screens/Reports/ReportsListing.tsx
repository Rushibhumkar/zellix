import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { iconWrapperStyle } from "../../const/globalStyle";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import { reportDummyData } from "../../utils/data";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
global.Buffer = Buffer;

const { width } = Dimensions.get("window");

const ReportsListing = () => {
  const { navigate } = useNavigation();
  const verticalScrollRef = React.useRef<any>(null);
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

  const handleExportReport = async (type: "xlsx" | "csv") => {
    try {
      const formattedData = dummyData.map((item, index) => ({
        "S.No": index + 1,
        "Lead ID": item?.leadId || "",
        "Client Name": item?.clientName || "",
        Mobile: item?.mobile || "",
        Project: item?.project || "",
        Source: item?.source || "",
        "Assigned To": item?.assignedTo || "",
        Team: item?.team || "",
        Status: item?.status || "",
        "Follow Up": item?.followUp || "",
        Budget: item?.budget || "",
        City: item?.city || "",
        Meeting: item?.meeting || "",
        "Site Visit": item?.siteVisit || "",
        Booking: item?.booking || "",
        Payment: item?.payment || "",
        "Created At": item?.createdAt || "",
        "Updated At": item?.updatedAt || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
      const excelBuffer = XLSX.write(workbook, {
        type: "binary",
        bookType: type,
      });

      const fileName = `Reports_${Date.now()}.${type}`;

      const fileUri = FileSystem.documentDirectory + fileName;

      const binaryToBase64 = (binary: string) => {
        let bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i) & 0xff;
        }

        return Buffer.from(bytes).toString("base64");
      };

      await FileSystem.writeAsStringAsync(
        fileUri,
        binaryToBase64(excelBuffer),
        {
          encoding: "base64",
        },
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.log("Export Error =>", error);
    }
  };

  return (
    <Container
      style={{
        paddingBottom: 0,
        marginBottom: 0,
      }}
    >
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

            <TouchableOpacity
              style={{ ...iconWrapperStyle }}
              onPress={() => handleExportReport("xlsx")}
            >
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

      <View
        style={{
          flexDirection: "row",
          paddingBottom: 260,
        }}
      >
        {/* FIXED LEFT COLUMN */}
        <View>
          {/* Fixed Header */}
          <View
            style={[
              styles.fixedHeaderCell,
              {
                height: 40,
              },
            ]}
          >
            <Text style={styles.headerText}>{columns[0]}</Text>
          </View>

          {/* Fixed Body */}
          <FlatList
            ref={verticalScrollRef}
            data={tableData}
            keyExtractor={(_, index) => `left-${index}`}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEnabled={false}
            contentContainerStyle={{
              paddingTop: 0,
            }}
            renderItem={({ item: row, index: rowIndex }) => (
              <View
                style={[
                  styles.fixedLeftCell,
                  {
                    backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#f8fafc",
                  },
                ]}
              >
                <Text style={styles.bodyText}>{row[0]}</Text>
              </View>
            )}
          />
        </View>

        {/* HORIZONTAL SCROLLABLE TABLE */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={{
              transform: [{ scale: zoomLevel }],
              transformOrigin: "top left",
            }}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              {columns.slice(1).map((column, index) => (
                <View key={index} style={styles.headerCell}>
                  <Text style={styles.headerText}>{column}</Text>
                </View>
              ))}
            </View>

            {/* Body */}
            <FlatList
              data={tableData}
              keyExtractor={(_, index) => `row-${index}`}
              showsVerticalScrollIndicator={false}
              bounces={false}
              onScroll={(event) => {
                const offsetY = event.nativeEvent.contentOffset.y;

                verticalScrollRef.current?.scrollToOffset({
                  offset: offsetY,
                  animated: false,
                });
              }}
              scrollEventThrottle={16}
              renderItem={({ item: row, index: rowIndex }) => (
                <View
                  style={[
                    styles.bodyRow,
                    {
                      backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#f8fafc",
                      borderTopWidth: rowIndex === 0 ? 0 : 1,
                    },
                  ]}
                >
                  {row.slice(1).map((cell, cellIndex) => (
                    <View
                      key={cellIndex}
                      style={[
                        styles.bodyCell,
                        rowIndex === 0 && {
                          borderTopWidth: 0,
                        },
                      ]}
                    >
                      <Text style={styles.bodyText}>{cell}</Text>
                    </View>
                  ))}
                </View>
              )}
            />
          </View>
        </ScrollView>
      </View>
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

  fixedHeaderCell: {
    width: 120,
    backgroundColor: color.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: color.primary200,
  },

  fixedLeftCell: {
    width: 120,
    height: 40,
    maxHeight: 40,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: color.primary50,
    justifyContent: "center",
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
    fontSize: 12,
    fontWeight: "600",
  },

  tableContainer: {
    marginTop: 0,
    marginLeft: 0,
    paddingTop: 0,
    paddingLeft: 0,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: color.primary50,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 0,
  },

  headerRow: {
    height: 40,
    maxHeight: 40,
    flexDirection: "row",
    backgroundColor: color.primaryColor,
  },

  headerCell: {
    width: 120,
    // minWidth: 100,
    maxWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: color.primary200,
    // justifyContent: "center",
  },

  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },

  bodyRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: color.primary50,
  },

  bodyCell: {
    width: 120,
    // minWidth: 100,
    height: 39,
    maxHeight: 40,
    maxWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: color.primary50,
    justifyContent: "center",
  },

  bodyText: {
    color: color.primary800,
    fontSize: 11,
    fontWeight: "500",
  },
});
