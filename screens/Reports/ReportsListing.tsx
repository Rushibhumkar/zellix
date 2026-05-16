import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather, AntDesign } from "@expo/vector-icons";
import { iconWrapperStyle } from "../../const/globalStyle";
import { color } from "../../const/color";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
import { useGetLeadCallReports } from "../../services/rootApi/reportsApi";
import { myConsole } from "../../hooks/useConsole";
import CustomText from "../../myComponents/CustomText/CustomText";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
global.Buffer = Buffer;

const { width } = Dimensions.get("window");

const ReportsListing = () => {
  const navigation: any = useNavigation();
  const { navigate } = useNavigation();

  const route: any = useRoute();

  const filters = route?.params?.filters;

  const selectedStartDate = filters?.startDate || null;

  const selectedEndDate = filters?.endDate || null;

  const selectedLeadType = filters?.leadType || "lead";

  const selectedPnls = filters?.pnls || [];

  const selectedTeams = filters?.teams || [];

  const selectedUsers = filters?.users || [];

  const {
    data: leadCallReports,
    isLoading,
    isError,
  } = useGetLeadCallReports({
    startDate: selectedStartDate,
    endDate: selectedEndDate,
    // startDate: null,
    // endDate: null,
    leadType: selectedLeadType,
    pnls: selectedPnls,
    teams: selectedTeams,
    users: selectedUsers,
  });
  // myConsole("leadCallReports", leadCallReports);
  const verticalScrollRef = React.useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const columns = useMemo(
    () => [
      "S.No",
      "User Name",
      "User Email",
      "Total Calls",
      "Connected",
      "Not Connected",
      "Positive",
      "Negative",
      "Inbound",
      "Outbound",
      "Connection %",
      "Avg Duration",
      "Total Duration",
    ],
    [],
  );

  const reportData = useMemo(
    () => leadCallReports?.data || [],
    [leadCallReports],
  );

  // const reportData = useMemo(() => {
  //   const apiData = leadCallReports?.data || [];

  //   return Array(29)
  //     .fill(apiData[0])
  //     .map((item, index) => ({
  //       ...item,
  //       userName: `${item?.userName} ${index + 1}`,
  //     }));
  // }, [leadCallReports]);

  // myConsole("reportDummyDataaa", reportDummyData);
  const tableData = useMemo(
    () =>
      (reportData || []).map((item: any, index: number) => [
        index + 1,
        item?.userName || "-",
        item?.userEmail || "-",
        item?.totalCalls || 0,
        item?.connectedCalls || 0,
        item?.notConnectedCalls || 0,
        item?.positiveCalls || 0,
        item?.negativeCalls || 0,
        item?.inboundCalls || 0,
        item?.outboundCalls || 0,
        item?.connectionRate || 0,
        item?.avgDuration || 0,
        item?.totalDuration || 0,
      ]),
    [reportData],
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
      const formattedData = reportData.map((item: any, index: number) => ({
        "S.No": index + 1,
        "User Name": item?.userName || "",
        "User Email": item?.userEmail || "",
        "Total Calls": item?.totalCalls || 0,
        Connected: item?.connectedCalls || 0,
        "Not Connected": item?.notConnectedCalls || 0,
        Positive: item?.positiveCalls || 0,
        Negative: item?.negativeCalls || 0,
        Inbound: item?.inboundCalls || 0,
        Outbound: item?.outboundCalls || 0,
        "Connection %": item?.connectionRate || 0,
        "Avg Duration": item?.avgDuration || 0,
        "Total Duration": item?.totalDuration || 0,
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

  const columnWidths: any = {
    0: 40, // S.No
    1: 140, // User Name
    2: 200, // Email
    3: 80, // Total Calls
    4: 80, // Connected
    5: 100, // Not Connected
    6: 80, // Positive
    7: 80, // Negative
    8: 80, // InBound
    9: 80, // OutBound
    10: 98, // Connection%
    11: 96, // Avg Duration
    12: 100, // Total Duration
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
        totalCount={reportData?.length || 0}
        isWithAnimation
        showActions={true}
        moduleName={"report"}
        showSearch={false}
        rightSide={
          <View style={styles.headerRightContainer}>
            {/* <TouchableOpacity
              style={{ ...iconWrapperStyle }}
              onPress={decreaseZoom}
            >
              <MaterialIcons name="zoom-out" size={18} color="#fff" />
            </TouchableOpacity> */}

            <View>
              {(selectedStartDate ||
                selectedEndDate ||
                selectedLeadType !== "lead" ||
                selectedPnls?.length > 0 ||
                selectedTeams?.length > 0 ||
                selectedUsers?.length > 0) && (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    borderRadius: 50,
                    backgroundColor: "#ffffff",
                    zIndex: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#d8d8d8",
                  }}
                  onPress={() => {
                    navigate("ReportsListing", {
                      filters: {
                        startDate: null,
                        endDate: null,
                        leadType: "lead",
                        pnls: [],
                        teams: [],
                        users: [],
                      },
                    });
                  }}
                >
                  <AntDesign
                    name="close"
                    size={10}
                    color={color.mainTxtColor}
                    style={{ padding: 2 }}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{ ...iconWrapperStyle }}
                onPress={() =>
                  navigate("ReportsFilter", {
                    filters: {
                      startDate: selectedStartDate,
                      endDate: selectedEndDate,
                      leadType: selectedLeadType,
                      pnls: selectedPnls,
                      teams: selectedTeams,
                      users: selectedUsers,
                    },
                  })
                }
              >
                <Feather
                  name="filter"
                  size={18}
                  color={
                    selectedStartDate ||
                    selectedEndDate ||
                    selectedLeadType !== "lead" ||
                    selectedPnls?.length > 0 ||
                    selectedTeams?.length > 0 ||
                    selectedUsers?.length > 0
                      ? color.mainTxtColor
                      : "#fff"
                  }
                />
              </TouchableOpacity>
            </View>

            {!isLoading && !isError && !!reportData?.length && (
              <TouchableOpacity
                style={{ ...iconWrapperStyle }}
                onPress={() => handleExportReport("xlsx")}
              >
                <Feather name="download" size={18} color={"#fff"} />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* <View style={styles.zoomTextContainer}>
        <Text style={styles.zoomText}>
          Zoom : {(zoomLevel * 100).toFixed(0)}%
        </Text>
      </View> */}

      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            size={"small"}
            color={color.mainTxtColor}
            style={{ marginBottom: 4 }}
          />
          <CustomText style={{ color: color.mainTxtColor }}>
            Loading reports...
          </CustomText>
        </View>
      ) : isError ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CustomText style={{ color: color.mainTxtColor }}>
            Failed to load reports
          </CustomText>
        </View>
      ) : !reportData?.length ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NoDataFound
            width={180}
            height={180}
            style={{ marginBottom: 16, marginTop: -24 }}
          />
          <CustomText style={{ color: color.mainTxtColor }}>
            No reports found
          </CustomText>
        </View>
      ) : (
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
                      height: tableData?.length - 1 === rowIndex ? 39 : 40,
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
                  <View
                    key={index}
                    style={[
                      styles.headerCell,
                      {
                        width: columnWidths[index + 1] || 120,
                      },
                    ]}
                  >
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
                        backgroundColor:
                          rowIndex % 2 === 0 ? "#fff" : "#f8fafc",
                        borderTopWidth: rowIndex === 0 ? 0 : 1,
                      },
                    ]}
                  >
                    {row.slice(1).map((cell: any, cellIndex: number) => (
                      <View
                        key={cellIndex}
                        style={[
                          styles.bodyCell,
                          {
                            width: columnWidths[cellIndex + 1] || 120,
                          },
                          rowIndex === 0 && {
                            borderTopWidth: 0,
                          },
                          rowIndex === tableData?.length - 1 && {
                            borderBottomWidth: 1,
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
      )}
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
    width: 70,
    backgroundColor: color.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: color.primary200,
  },

  fixedLeftCell: {
    width: 70,
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
    // maxWidth: 160,
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
    // maxWidth: 160,
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
