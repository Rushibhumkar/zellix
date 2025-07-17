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
import {
  useGetLogsInfoInLeadDetail,
  useGetUserInfoInLeadDetail,
} from "../../../hooks/useCRMgetQuerry";
import { myConsole } from "../../../hooks/useConsole";
import { getLogsInfoLeadDeatil } from "../../../services/rootApi/leadApi";
import moment from "moment";
import { roleHRM } from "../../../utils/hrmKeysMatchToBE";
import TabButton from "./TabButton";
import { inLeadStatus } from "../../../utils/data";

const logDetailKey = {
  name: "Name",
  from: "Status From",
  to: "Satus To",
  commentTo: "Comment To",
  commentFrom: "Comment From",
};

const LeadLogsInfo = ({ leadId = "", setActiveTab, activeTab }) => {
  const logsInfo = useGetLogsInfoInLeadDetail(leadId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    logsInfo.refetch();
    setRefreshing(false);
  };

  return (
    <Container>
      <Header title={"Lead Details"} />
      <TabButton activeTab={activeTab} setActiveTab={setActiveTab} />
      {logsInfo?.isLoading && <ActivityIndicator />}
      <ScrollView
        style={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingBottom: 150 }}>
          <MainTitle title="Logs" containerStyle={{ marginBottom: 20 }} />
          {logsInfo.data?.map((x, i, arr) => {
            console.log("x", x);
            const date = moment(x?.assignedAt).format("DD/MM/YYYY hh:ss a");
            const statusTo = inLeadStatus.find((y) => y._id === x?.to)?.name;
            const statusFrom = inLeadStatus.find(
              (y) => y._id === x?.from
            )?.name;
            return (
              <View key={i}>
                <RowItem
                  title="Name"
                  containerStyle={{ marginBottom: 10 }}
                  value={`${x?.name} (${roleHRM[x?.role]})` || "N/A"}
                />
                <RowItem
                  title="Status To"
                  containerStyle={{ marginBottom: 10 }}
                  value={statusTo || "N/A"}
                />
                <RowItem
                  title="Status From"
                  containerStyle={{ marginBottom: 10 }}
                  value={statusFrom || "N/A"}
                />
                <RowItem
                  title="Comment To"
                  containerStyle={{ marginBottom: 10 }}
                  value={x?.commentTo || "N/A"}
                />
                <RowItem
                  title="Comment From"
                  containerStyle={{ marginBottom: 10 }}
                  value={x?.commentFrom || "N/A"}
                />
                <RowItem
                  title="Changed AT"
                  containerStyle={{ marginBottom: 10 }}
                  value={date || "N/A"}
                />
                {arr?.length - 1 !== i && (
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
          })}
        </View>
      </ScrollView>
    </Container>
  );
};

export default LeadLogsInfo;

const styles = StyleSheet.create({});
