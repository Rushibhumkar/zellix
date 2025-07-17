import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { useGetUserInfoInLeadDetail } from "../../../hooks/useCRMgetQuerry";
import Header from "../../../components/Header";
import MainTitle from "../../../myComponents/MainTitle/MainTitle";
import RowItem from "../../../myComponents/RowItem/RowItem";
import { myConsole } from "../../../hooks/useConsole";
import Container from "../../../myComponents/Container/Container";
import { roleHRM } from "../../../utils/hrmKeysMatchToBE";
import moment from "moment";
import TabButton from "./TabButton";
import CustomText from "../../../myComponents/CustomText/CustomText";

const LeadUserInfo = ({ leadId = "", onTabPress, activeTab, setActiveTab }) => {
  const userInfo = useGetUserInfoInLeadDetail(leadId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    userInfo.refetch();
    setRefreshing(false);
  };

  return (
    <Container>
      <Header title={"Lead Details"} />
      <TabButton activeTab={activeTab} setActiveTab={setActiveTab} />
      {userInfo?.isLoading && <ActivityIndicator />}
      <ScrollView
        style={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingBottom: 150 }}>
          <MainTitle
            title="Current Assigned User"
            containerStyle={{ marginBottom: 20 }}
          />
          <RowItem
            title="Name"
            value={userInfo.data?.[0]?.name || "N/A"}
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Role"
            value={roleHRM[userInfo.data?.[0]?.role] || "N/A"}
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Additional"
            component={
              <CustomText>{userInfo.data?.[0]?.additional || "N/A"}</CustomText>
            }
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Assigned At"
            value={
              moment(userInfo.data?.[0]?.createdAt).format(
                "DD/MM/YYYY hh:ss a"
              ) || "N/A"
            }
            containerStyle={{ marginBottom: 20 }}
          />
          {userInfo.data?.length > 1 && (
            <MainTitle
              title="Previous Assigned User"
              containerStyle={{ marginBottom: 20 }}
            />
          )}
          {userInfo.data?.length > 1 &&
            userInfo.data?.map((x, i, arr) => {
              return (
                <View key={i}>
                  {i !== 0 && (
                    <View>
                      <RowItem
                        title="Name"
                        value={x?.name || "N/A"}
                        containerStyle={{ marginBottom: 10 }}
                      />
                      <RowItem
                        title="Role"
                        value={roleHRM[x?.role] || "N/A"}
                        containerStyle={{ marginBottom: 10 }}
                      />
                      <RowItem
                        title="Additional"
                        component={
                          <CustomText>{x?.additional || "N/A"}</CustomText>
                        }
                        containerStyle={{ marginBottom: 10 }}
                      />
                      <RowItem
                        title="Assigned At"
                        value={
                          moment(x?.createdAt).format("DD/MM/YYYY") || "N/A"
                        }
                        containerStyle={{ marginBottom: 20 }}
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
                  )}
                </View>
              );
            })}
        </View>
      </ScrollView>
    </Container>
  );
};

export default LeadUserInfo;

const styles = StyleSheet.create({});
