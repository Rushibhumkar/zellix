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

const MeetingInfo = ({ leadId = "", setActiveTab, activeTab }) => {
  const logsInfo = useLatestMeetings(leadId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    logsInfo.refetch();
    setRefreshing(false);
  };

  return (
    <Container>
      <Header title="Lead Details" />
      <TabButton activeTab={activeTab} setActiveTab={setActiveTab} />
      {logsInfo?.isLoading && <ActivityIndicator />}
      <ScrollView
        style={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingBottom: 150 }}>
          <MainTitle
            title="Meeting Information"
            containerStyle={{ marginBottom: 20 }}
          />

          {logsInfo.data && logsInfo.data.length > 0 ? (
            logsInfo.data.map((x, i, arr) => {
              const meeting = x?.latestMeeting || {};
              const date = meeting?.scheduleDate
                ? moment(meeting.scheduleDate).format("DD/MM/YYYY , hh:mm A")
                : "N/A";

              return (
                <View key={x._id}>
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
                        <CustomText>N/A</CustomText>
                      )
                    }
                  />
                  {arr.length - 1 !== i && (
                    <View
                      style={{
                        borderWidth: 0.5,
                        marginVertical: 10,
                        borderColor: "gray",
                      }}
                    />
                  )}
                </View>
              );
            })
          ) : (
            <CustomText>Meeting information is not available</CustomText>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

export default MeetingInfo;
