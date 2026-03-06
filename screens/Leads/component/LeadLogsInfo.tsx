import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useState } from "react";
import Container from "../../../myComponents/Container/Container";
import Header from "../../../components/Header";
import MainTitle from "../../../myComponents/MainTitle/MainTitle";
import { useGetLogsInfoInLeadDetail } from "../../../hooks/useCRMgetQuerry";
import moment from "moment";
import { roleHRM } from "../../../utils/hrmKeysMatchToBE";
import TabButton from "./TabButton";
import { inLeadStatus } from "../../../utils/data";
import NoDataFound from "../../../myComponents/NoDataFound/NoDataFound";
import { sizes } from "../../../const";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import { shadowPrimaryColor } from "../../../const/globalStyle";

const LeadLogsInfo = ({
  leadId = "",
  setActiveTab,
  activeTab,
  selectLeadType,
}: any) => {
  const logsInfo = useGetLogsInfoInLeadDetail(leadId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    logsInfo.refetch();
    setRefreshing(false);
  };

  return (
    <Container>
      <Header
        title={
          selectLeadType === "calling_data"
            ? "Calling Data Info"
            : "Lead Details"
        }
      />

      <TabButton activeTab={activeTab} setActiveTab={setActiveTab} />

      {logsInfo?.isLoading && <ActivityIndicator />}

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingBottom: 150 }}>
          {!logsInfo?.isLoading && logsInfo?.data?.length === 0 && (
            <View style={styles.noDataContainer}>
              <NoDataFound width={140} height={140} />
            </View>
          )}

          {logsInfo.data?.map((x, i, arr) => {
            const date = moment(x?.assignedAt).format("DD MMM YYYY • hh:mm A");

            const statusTo = inLeadStatus.find((y) => y._id === x?.to)?.name;

            const statusFrom = inLeadStatus.find(
              (y) => y._id === x?.from,
            )?.name;

            return (
              <View key={i} style={styles.card}>
                {/* User Info */}
                <View style={styles.headerRow}>
                  <CustomText style={styles.nameText}>
                    {x?.name || "N/A"}
                  </CustomText>

                  <View style={styles.roleBadge}>
                    <CustomText style={styles.roleText}>
                      {roleHRM[x?.role] || "N/A"}
                    </CustomText>
                  </View>
                </View>

                {/* Status Change */}
                <View style={styles.statusRow}>
                  <View style={styles.statusBox}>
                    <CustomText style={styles.label}>From</CustomText>
                    <CustomText style={styles.value}>
                      {statusFrom || "N/A"}
                    </CustomText>
                  </View>

                  <View style={styles.arrowContainer}>
                    <CustomText style={styles.arrow}>→</CustomText>
                  </View>

                  <View style={styles.statusBox}>
                    <CustomText style={styles.label}>To</CustomText>
                    <CustomText style={styles.value}>
                      {statusTo || "N/A"}
                    </CustomText>
                  </View>
                </View>

                {/* Comments */}
                {(x?.commentFrom || x?.commentTo) && (
                  <View style={styles.commentSection}>
                    {x?.commentFrom && (
                      <View style={styles.commentRow}>
                        <CustomText style={styles.commentLabel}>
                          Comment From
                        </CustomText>
                        <CustomText style={styles.commentText}>
                          {x?.commentFrom}
                        </CustomText>
                      </View>
                    )}

                    {x?.commentTo && (
                      <View style={styles.commentRow}>
                        <CustomText style={styles.commentLabel}>
                          Comment To
                        </CustomText>
                        <CustomText style={styles.commentText}>
                          {x?.commentTo}
                        </CustomText>
                      </View>
                    )}
                  </View>
                )}

                {/* Date */}
                <CustomText style={styles.dateText}>{date || "N/A"}</CustomText>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Container>
  );
};

export default LeadLogsInfo;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  noDataContainer: {
    flex: 1,
    height: sizes.height / 2,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    ...shadowPrimaryColor,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },

  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: color.mainTxtColor,
  },

  roleBadge: {
    backgroundColor: "#E8EEF9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleText: {
    fontSize: 12,
    color: "#2D67C6",
    fontWeight: "600",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  statusBox: {
    flex: 1,
  },

  arrowContainer: {
    width: 40,
    alignItems: "center",
  },

  arrow: {
    fontSize: 20,
    color: "#9CA3AF",
  },

  label: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: color.mainTxtColor,
  },

  commentSection: {
    marginTop: 6,
    marginBottom: 10,
  },

  commentRow: {
    marginBottom: 6,
  },

  commentLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  commentText: {
    fontSize: 13,
    color: color.mainTxtColor,
  },

  dateText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
});
