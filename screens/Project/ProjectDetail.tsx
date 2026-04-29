import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGetProjectById } from "./useQuery/useProject";
import moment from "moment";
import CustomText from "../../myComponents/CustomText/CustomText";
import { routeProject } from "../../utils/routes";
import { color } from "../../const/color";
import { Feather } from "@expo/vector-icons";
import { iconWrapperStyle, shadowPrimaryColor } from "../../const/globalStyle";
import { myConsole } from "../../hooks/useConsole";

const ProjectDetail = () => {
  const { params } = useRoute();
  const { navigate } = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useGetProjectById(params?.item?._id);
  myConsole("dataaaa", data);
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch?.();
    } finally {
      setRefreshing(false);
    }
  };

  const DetailCard = ({ icon, title, value, valueColor }: any) => (
    <View style={styles.detailCard}>
      <View style={styles.leftSection}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={16} color="#2D67C6" />
        </View>

        <View style={{ flex: 1 }}>
          <CustomText style={styles.cardTitle}>{title}</CustomText>

          <CustomText
            numberOfLines={2}
            style={[styles.cardValue, valueColor && { color: valueColor }]}
          >
            {value || "N/A"}
          </CustomText>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <Container>
        <Header title={"Project Details"} />

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2D67C6" />

          <CustomText style={styles.loadingText}>
            Loading Project Details...
          </CustomText>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title={"Project Details"}
        rightSide={
          <Pressable
            onPress={() =>
              navigate(routeProject.ProjectForm, {
                detail: data,
              })
            }
            style={iconWrapperStyle}
          >
            <Feather name="edit-2" size={18} color="#fff" />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.projectIcon}>
              <Feather name="folder" size={24} color="#2D67C6" />
            </View>

            <View style={{ flex: 1 }}>
              <CustomText style={styles.projectName}>
                {data?.projectName || "N/A"}
              </CustomText>

              <View style={styles.heroInfoRow}>
                <Feather name="globe" size={13} color="#64748B" />

                <CustomText style={styles.heroSubText}>
                  {data?.source || "N/A"}
                </CustomText>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <CustomText style={styles.statValue}>
                {data?.totalLeads || 0}
              </CustomText>

              <CustomText style={styles.statLabel}>Leads</CustomText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <CustomText style={styles.statValue}>
                {data?.totalMembers || 0}
              </CustomText>

              <CustomText style={styles.statLabel}>Members</CustomText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <CustomText style={styles.statValue}>
                {data?.isRoadShow ? "Yes" : "No"}
              </CustomText>

              <CustomText style={styles.statLabel}>Road Show</CustomText>
            </View>
          </View>
        </View>

        {/* Details */}
        <CustomText style={styles.sectionTitle}>Project Information</CustomText>

        <DetailCard icon="layout" title="Page Name" value={data?.pageName} />

        <DetailCard icon="hash" title="Form ID" value={data?.formId} />

        <DetailCard
          icon="calendar"
          title="Created On"
          value={moment(data?.createdAt).format("DD MMM YYYY")}
        />

        <DetailCard
          icon="user"
          title="Senior Manager"
          value={data?.srManager?.name}
        />

        {/* Team Members */}
        <CustomText style={styles.sectionTitle}>Team Members</CustomText>

        <View style={styles.memberContainer}>
          {data?.members?.length > 0 ? (
            data?.members?.map((member: any, index: number) => (
              <View key={member?._id || index} style={styles.memberChip}>
                <Feather name="user" size={12} color="#2D67C6" />

                <CustomText style={styles.memberText}>
                  {member?.name} {member?.lastName || ""}
                </CustomText>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <CustomText style={styles.emptyText}>
                No Team Members Assigned
              </CustomText>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

export default ProjectDetail;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    ...shadowPrimaryColor,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  projectIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  projectName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  heroInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },

  heroSubText: {
    fontSize: 13,
    color: "#64748B",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 14,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D67C6",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 14,
    marginTop: 4,
  },

  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    ...shadowPrimaryColor,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 12,
    color: "#64748B",
  },

  cardValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 3,
  },

  memberContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 30,
  },

  memberText: {
    fontSize: 13,
    color: "#2D67C6",
    fontWeight: "600",
  },

  emptyBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    ...shadowPrimaryColor,
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});
