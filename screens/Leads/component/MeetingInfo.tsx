import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import Container from "../../../myComponents/Container/Container";
import Header from "../../../components/Header";
import MainTitle from "../../../myComponents/MainTitle/MainTitle";
import RowItem from "../../../myComponents/RowItem/RowItem";
import { useLatestMeetings } from "../../../services/rootApi/leadApi";
import moment from "moment";
import TabButton from "./TabButton";
import { Feather } from "@expo/vector-icons";
import { navigateToMapApp } from "../../../utils/navigateToMapApp";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { sizes } from "../../../const";
import { color } from "../../../const/color";
import NoDataFound from "../../../myComponents/NoDataFound/NoDataFound";

const MeetingInfo = ({
  leadId = "",
  setActiveTab,
  activeTab,
  selectLeadType,
  onBackPress,
}: any) => {
  const meetingsInfo = useLatestMeetings(leadId);
  const [refreshing, setRefreshing] = useState(false);
  const meetings = meetingsInfo?.data?.meetings ?? [];
  const totalMeetings = meetingsInfo?.data?.totalMeetings ?? meetings.length;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await meetingsInfo.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Container>
      <Header
        title={
          selectLeadType === "calling_data"
            ? "Calling Data Info"
            : "Lead Details"
        }
        onBack={onBackPress}
      />
      <TabButton activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView
        style={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingBottom: 150 }}>
          <View style={styles.titleRow}>
            <MainTitle
              title="Meeting Information"
              containerStyle={styles.title}
            />
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>Total: {totalMeetings}</Text>
            </View>
          </View>

          {meetingsInfo?.isLoading ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                minHeight: sizes.height / 2,
              }}
            >
              <ActivityIndicator size="large" color={color.mainTxtColor} />
            </View>
          ) : !meetingsInfo?.isLoading && meetings.length > 0 ? (
            meetings.map((x, i) => {
              const meeting = x?.meeting || x?.latestMeeting || {};
              const date = meeting?.scheduleDate
                ? moment(meeting.scheduleDate).format("DD/MM/YYYY , hh:mm A")
                : "N/A";

              return (
                <View
                  key={x?.meetingEntryId || meeting?._id || `${x?._id}-${i}`}
                  style={styles.meetingCard}
                >
                  <View style={styles.meetingCardHeader}>
                    <Text style={styles.meetingNumber}>
                      Meeting {totalMeetings - i}
                    </Text>
                    {i === 0 && (
                      <View style={styles.latestBadge}>
                        <Text style={styles.latestBadgeText}>Latest</Text>
                      </View>
                    )}
                  </View>
                  <RowItem
                    title="Date"
                    containerStyle={{ marginBottom: 10 }}
                    value={date}
                  />
                  <RowItem
                    title="Status"
                    containerStyle={{ marginBottom: 10 }}
                    value={meeting?.status || "N/A"}
                  />
                  <RowItem
                    title="Scheduled Location"
                    containerStyle={{ marginBottom: 10 }}
                    value={meeting?.location || "N/A"}
                  />
                  <RowItem
                    title="Remarks"
                    containerStyle={{ marginBottom: 10 }}
                    value={meeting?.remarks || "N/A"}
                  />
                  <RowItem
                    title="Location Permission"
                    containerStyle={{ marginBottom: 10 }}
                    value={meeting?.isLocationGranted ? "Granted" : "Denied"}
                  />
                  <RowItem
                    title="Scheduled Location View"
                    containerStyle={{ marginBottom: 10 }}
                    component={
                      meeting?.coordinates?.lat ? (
                        <Feather
                          name="map-pin"
                          size={25}
                          color="#2D67C6"
                          onPress={() => {
                            navigateToMapApp(meeting?.coordinates);
                          }}
                        />
                      ) : (
                        <CustomText color={color.mainTxtColor}>N/A</CustomText>
                      )
                    }
                  />
                </View>
              );
            })
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                minHeight: sizes.height / 2,
              }}
            >
              <NoDataFound width={140} height={140} />
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

export default MeetingInfo;

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  title: {
    flex: 1,
  },
  totalBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#E8F0FE",
  },
  totalBadgeText: {
    color: "#2D67C6",
    fontSize: 12,
    fontWeight: "700",
  },
  meetingCard: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  meetingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  meetingNumber: {
    color: color.mainTxtColor,
    fontSize: 16,
    fontWeight: "700",
  },
  latestBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
  },
  latestBadgeText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "700",
  },
});
