import React, { useCallback, useMemo, useState } from "react";
import {
  Animated,
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
import {
  Feather,
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome6,
} from "@expo/vector-icons";
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
import { formatSeconds } from "../../utils/commonFunctions";
global.Buffer = Buffer;

const { width } = Dimensions.get("window");

const ReportsListing = () => {
  const navigation: any = useNavigation();
  const { navigate } = useNavigation();
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const route: any = useRoute();

  const filters = route?.params?.filters;

  const selectedStartDate = filters?.startDate || null;

  const selectedEndDate = filters?.endDate || null;

  const selectedLeadType = filters?.leadType || "";

  const selectedPnls = filters?.pnls || [];

  const selectedTeams = filters?.teams || [];

  const selectedAgents = filters?.agents || [];

  const {
    data: leadCallReports,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetLeadCallReports({
    startDate: selectedStartDate,
    endDate: selectedEndDate,
    // startDate: null,
    // endDate: null,
    leadType: selectedLeadType,
    pnls: selectedPnls,
    teams: selectedTeams,
    agents: selectedAgents,
  });
  // myConsole("leadCallReports", leadCallReports);
  const verticalScrollRef = React.useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [userNameSortOrder, setUserNameSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [connectionSortOrder, setConnectionSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [avgDurationSortOrder, setAvgDurationSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [totalDurationSortOrder, setTotalDurationSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [emailSortOrder, setEmailSortOrder] = useState<"none" | "asc" | "desc">(
    "none",
  );

  const [totalCallsSortOrder, setTotalCallsSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [connectedSortOrder, setConnectedSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [notConnectedSortOrder, setNotConnectedSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [positiveSortOrder, setPositiveSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [negativeSortOrder, setNegativeSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [inboundSortOrder, setInboundSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const [outboundSortOrder, setOutboundSortOrder] = useState<
    "none" | "asc" | "desc"
  >("none");

  const columns = useMemo(
    () => [
      // "S.No",
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

  const resetAllSorts = () => {
    setUserNameSortOrder("none");
    setEmailSortOrder("none");
    setTotalCallsSortOrder("none");
    setConnectedSortOrder("none");
    setNotConnectedSortOrder("none");
    setPositiveSortOrder("none");
    setNegativeSortOrder("none");
    setInboundSortOrder("none");
    setOutboundSortOrder("none");
    setConnectionSortOrder("none");
    setAvgDurationSortOrder("none");
    setTotalDurationSortOrder("none");
  };

  const reportData = useMemo(() => {
    const data = [...(leadCallReports?.data || [])];

    if (userNameSortOrder === "asc") {
      return data.sort((a: any, b: any) =>
        (a?.userName || "").localeCompare(b?.userName || ""),
      );
    }

    if (userNameSortOrder === "desc") {
      return data.sort((a: any, b: any) =>
        (b?.userName || "").localeCompare(a?.userName || ""),
      );
    }

    if (connectionSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.connectionRate || 0) - (b?.connectionRate || 0),
      );
    }

    if (connectionSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.connectionRate || 0) - (a?.connectionRate || 0),
      );
    }

    if (avgDurationSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.avgDuration || 0) - (b?.avgDuration || 0),
      );
    }

    if (avgDurationSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.avgDuration || 0) - (a?.avgDuration || 0),
      );
    }

    if (totalDurationSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.totalDuration || 0) - (b?.totalDuration || 0),
      );
    }

    if (totalDurationSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.totalDuration || 0) - (a?.totalDuration || 0),
      );
    }
    if (emailSortOrder === "asc") {
      return data.sort((a: any, b: any) =>
        (a?.userEmail || "").localeCompare(b?.userEmail || ""),
      );
    }

    if (emailSortOrder === "desc") {
      return data.sort((a: any, b: any) =>
        (b?.userEmail || "").localeCompare(a?.userEmail || ""),
      );
    }

    if (totalCallsSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.totalCalls || 0) - (b?.totalCalls || 0),
      );
    }

    if (totalCallsSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.totalCalls || 0) - (a?.totalCalls || 0),
      );
    }

    if (connectedSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.connectedCalls || 0) - (b?.connectedCalls || 0),
      );
    }

    if (connectedSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.connectedCalls || 0) - (a?.connectedCalls || 0),
      );
    }

    if (notConnectedSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) =>
          (a?.notConnectedCalls || 0) - (b?.notConnectedCalls || 0),
      );
    }

    if (notConnectedSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) =>
          (b?.notConnectedCalls || 0) - (a?.notConnectedCalls || 0),
      );
    }

    if (positiveSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.positiveCalls || 0) - (b?.positiveCalls || 0),
      );
    }

    if (positiveSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.positiveCalls || 0) - (a?.positiveCalls || 0),
      );
    }

    if (negativeSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.negativeCalls || 0) - (b?.negativeCalls || 0),
      );
    }

    if (negativeSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.negativeCalls || 0) - (a?.negativeCalls || 0),
      );
    }

    if (inboundSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.inboundCalls || 0) - (b?.inboundCalls || 0),
      );
    }

    if (inboundSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.inboundCalls || 0) - (a?.inboundCalls || 0),
      );
    }

    if (outboundSortOrder === "asc") {
      return data.sort(
        (a: any, b: any) => (a?.outboundCalls || 0) - (b?.outboundCalls || 0),
      );
    }

    if (outboundSortOrder === "desc") {
      return data.sort(
        (a: any, b: any) => (b?.outboundCalls || 0) - (a?.outboundCalls || 0),
      );
    }

    return data;
  }, [
    leadCallReports,
    userNameSortOrder,
    connectionSortOrder,
    avgDurationSortOrder,
    totalDurationSortOrder,
    emailSortOrder,
    totalCallsSortOrder,
    connectedSortOrder,
    notConnectedSortOrder,
    positiveSortOrder,
    negativeSortOrder,
    inboundSortOrder,
    outboundSortOrder,
  ]);

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
        // index + 1,
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
        formatSeconds(item?.avgDuration || 0, "short"),
        formatSeconds(item?.totalDuration || 0, "short"),
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

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  React.useEffect(() => {
    if (isFetching) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateAnim.stopAnimation();

      rotateAnim.setValue(0);
    }
  }, [isFetching]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getNextSortState = (current: "none" | "asc" | "desc") => {
    if (current === "none") return "asc";

    if (current === "asc") return "desc";

    return "none";
  };

  const handleUserNameSort = () => {
    const next = getNextSortState(userNameSortOrder);

    resetAllSorts();

    setUserNameSortOrder(next);
  };
  const handleConnectionSort = () => {
    const next = getNextSortState(connectionSortOrder);

    resetAllSorts();

    setConnectionSortOrder(next);
  };

  const handleAvgDurationSort = () => {
    const next = getNextSortState(avgDurationSortOrder);

    resetAllSorts();

    setAvgDurationSortOrder(next);
  };

  const handleTotalDurationSort = () => {
    const next = getNextSortState(totalDurationSortOrder);

    resetAllSorts();

    setTotalDurationSortOrder(next);
  };

  const handleEmailSort = () => {
    const next = getNextSortState(emailSortOrder);

    resetAllSorts();

    setEmailSortOrder(next);
  };

  const handleTotalCallsSort = () => {
    const next = getNextSortState(totalCallsSortOrder);

    resetAllSorts();

    setTotalCallsSortOrder(next);
  };

  const handleConnectedSort = () => {
    const next = getNextSortState(connectedSortOrder);

    resetAllSorts();

    setConnectedSortOrder(next);
  };

  const handleNotConnectedSort = () => {
    const next = getNextSortState(notConnectedSortOrder);

    resetAllSorts();

    setNotConnectedSortOrder(next);
  };

  const handlePositiveSort = () => {
    const next = getNextSortState(positiveSortOrder);

    resetAllSorts();

    setPositiveSortOrder(next);
  };

  const handleNegativeSort = () => {
    const next = getNextSortState(negativeSortOrder);

    resetAllSorts();

    setNegativeSortOrder(next);
  };

  const handleInboundSort = () => {
    const next = getNextSortState(inboundSortOrder);

    resetAllSorts();

    setInboundSortOrder(next);
  };

  const handleOutboundSort = () => {
    const next = getNextSortState(outboundSortOrder);

    resetAllSorts();

    setOutboundSortOrder(next);
  };

  const handleExportReport = async (type: "xlsx" | "csv") => {
    try {
      const formattedData = reportData.map((item: any, index: number) => ({
        // "S.No": index + 1,
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
        "Avg Duration": formatSeconds(item?.avgDuration || 0, "short"),

        "Total Duration": formatSeconds(item?.totalDuration || 0, "short"),
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
    // 0: 40, // S.No
    0: 140, // User Name
    1: 210, // Email
    2: 100, // Total Calls
    3: 100, // Connected
    4: 110, // Not Connected
    5: 80, // Positive
    6: 80, // Negative
    7: 80, // InBound
    8: 90, // OutBound
    9: 110, // Connection%
    10: 110, // Avg Duration
    11: 110, // Total Duration
  };

  const getColumnSortOrder = (column: string) => {
    switch (column) {
      case "User Email":
        return emailSortOrder;

      case "Total Calls":
        return totalCallsSortOrder;

      case "Connected":
        return connectedSortOrder;

      case "Not Connected":
        return notConnectedSortOrder;

      case "Positive":
        return positiveSortOrder;

      case "Negative":
        return negativeSortOrder;

      case "Inbound":
        return inboundSortOrder;

      case "Outbound":
        return outboundSortOrder;

      case "Connection %":
        return connectionSortOrder;

      case "Avg Duration":
        return avgDurationSortOrder;

      case "Total Duration":
        return totalDurationSortOrder;

      default:
        return "none";
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
                !!selectedLeadType ||
                selectedPnls?.length > 0 ||
                selectedTeams?.length > 0 ||
                selectedAgents?.length > 0) && (
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
                        leadType: "",
                        pnls: [],
                        teams: [],
                        agents: [],
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
                      agents: selectedAgents,
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
                    !!selectedLeadType ||
                    selectedPnls?.length > 0 ||
                    selectedTeams?.length > 0 ||
                    selectedAgents?.length > 0
                      ? color.mainTxtColor
                      : "#fff"
                  }
                />
              </TouchableOpacity>
            </View>
            {!isLoading && (
              <TouchableOpacity
                style={{ ...iconWrapperStyle }}
                activeOpacity={0.8}
                onPress={handleRefresh}
                disabled={isFetching}
              >
                <Animated.View
                  style={{
                    transform: [{ rotate: spin }],
                  }}
                >
                  <MaterialCommunityIcons
                    name="refresh"
                    size={18}
                    // color={isFetching ? "#d1d5db" : "#fff"}
                    color={"#fff"}
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
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

      {isLoading || isFetching ? (
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
            {isFetching ? "Refreshing reports..." : "Loading reports..."}
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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleUserNameSort}
              style={[
                styles.fixedHeaderCell,
                {
                  height: 40,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text style={styles.headerText}>{columns[0]}</Text>

              {userNameSortOrder === "none" ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 6,
                  }}
                >
                  <FontAwesome6 name="arrow-up-long" size={10} color="#fff" />

                  <FontAwesome6 name="arrow-down-long" size={10} color="#fff" />
                </View>
              ) : userNameSortOrder === "asc" ? (
                <FontAwesome6 name="arrow-up-long" size={10} color="#fff" />
              ) : (
                <FontAwesome6 name="arrow-down-long" size={10} color="#fff" />
              )}
            </TouchableOpacity>

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
                  <Text style={styles.bodyText} numberOfLines={2}>
                    {row[0]}
                  </Text>
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
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={
                        ![
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
                        ].includes(column)
                      }
                      onPress={() => {
                        if (column === "Connection %") {
                          handleConnectionSort();
                        }

                        if (column === "Avg Duration") {
                          handleAvgDurationSort();
                        }

                        if (column === "Total Duration") {
                          handleTotalDurationSort();
                        }
                        if (column === "User Email") {
                          handleEmailSort();
                        }

                        if (column === "Total Calls") {
                          handleTotalCallsSort();
                        }

                        if (column === "Connected") {
                          handleConnectedSort();
                        }

                        if (column === "Not Connected") {
                          handleNotConnectedSort();
                        }

                        if (column === "Positive") {
                          handlePositiveSort();
                        }

                        if (column === "Negative") {
                          handleNegativeSort();
                        }

                        if (column === "Inbound") {
                          handleInboundSort();
                        }

                        if (column === "Outbound") {
                          handleOutboundSort();
                        }
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.headerText}>{column}</Text>

                      {[
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
                      ].includes(column) && (
                        <>
                          {getColumnSortOrder(column) === "none" ? (
                            <View
                              style={{
                                flexDirection: "row",
                                marginLeft: 4,
                              }}
                            >
                              <FontAwesome6
                                name="arrow-up-long"
                                size={9}
                                color="#fff"
                              />

                              <FontAwesome6
                                name="arrow-down-long"
                                size={9}
                                color="#fff"
                              />
                            </View>
                          ) : (
                            <FontAwesome6
                              name={
                                getColumnSortOrder(column) === "asc"
                                  ? "arrow-up-long"
                                  : "arrow-down-long"
                              }
                              size={9}
                              color="#fff"
                            />
                          )}
                        </>
                      )}
                    </TouchableOpacity>
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
                        <Text style={styles.bodyText}>
                          {cell}
                          {cellIndex === 8 ? " %" : ""}
                        </Text>
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
    width: 140,
    backgroundColor: color.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: color.primary200,
  },

  fixedLeftCell: {
    width: 140,
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
