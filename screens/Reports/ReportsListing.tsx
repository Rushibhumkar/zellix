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
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
global.Buffer = Buffer;

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{
          paddingBottom: 0,
          marginBottom: 0,
        }}
      >
        <View
          style={{
            margin: 0,
            padding: 0,
            alignSelf: "flex-start",
            transform: [{ scale: zoomLevel }],
            transformOrigin: "top left",
          }}
        >
          {/* Sticky Header */}
          <View
            style={[
              styles.headerRow,
              {
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1000,
              },
            ]}
          >
            {columns.map((column, index) => (
              <View
                key={index}
                style={[
                  styles.headerCell,
                  index === 0 && {
                    position: "absolute",
                    left: 0,
                    zIndex: 3000,
                    backgroundColor: color.primaryColor,
                  },
                ]}
              >
                <Text style={styles.headerText}>{column}</Text>
              </View>
            ))}
          </View>

          {/* Vertical Scroll */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            style={{
              flexGrow: 0,
            }}
            contentContainerStyle={{
              paddingTop: 40,
              margin: 0,
              paddingLeft: 0,
              paddingBottom: 120,
              flexGrow: 0,
            }}
          >
            <View style={styles.tableContainer}>
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
                    <View
                      key={cellIndex}
                      style={[
                        styles.bodyCell,
                        cellIndex === 0 && [
                          styles.stickyColumn,
                          {
                            backgroundColor:
                              rowIndex % 2 === 0 ? "#fff" : "#f8fafc",
                          },
                        ],
                      ]}
                    >
                      <Text style={styles.bodyText}>{cell}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
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

  stickyColumn: {
    position: "absolute",
    left: 0,
    zIndex: 2000,
    backgroundColor: "#fff",
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
    flexDirection: "row",
    backgroundColor: color.primaryColor,
    paddingLeft: 120,
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
    paddingLeft: 120,
  },

  bodyCell: {
    width: 120,
    // minWidth: 100,
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
