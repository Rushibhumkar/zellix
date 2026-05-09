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
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { iconWrapperStyle, shadowPrimaryColor } from "../../const/globalStyle";
import { toggleProjectActiveStatus } from "../../services/rootApi/projectApi";
import { useAppToast } from "../../components/AppToast";
import { useQueryClient } from "@tanstack/react-query";
import { popUpConfToast } from "../../utils/toastModalByFunction";

const ProjectDetail = () => {
  const { params } = useRoute();
  const { navigate } = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useGetProjectById(params?.item?._id);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch?.();
    setRefreshing(false);
  };

  const toast = useAppToast();

  const handleToggleActive = () => {
    popUpConfToast.confirmModal({
      message: data?.isActive
        ? "Do you want to deactivate this campaign?"
        : "Do you want to activate this campaign?",
      buttonText: data?.isActive ? "Deactivate" : "Activate",
      clickOnConfirm: async () => {
        const payload = {
          isActive: !data?.isActive,
          activeStatus: !data?.isActive,
        };

        const res = await toggleProjectActiveStatus({
          id: params?.item?._id,
          data: payload,
        });

        if (!res?.success) {
          popUpConfToast.errorMessage(res?.message);
          return;
        }

        popUpConfToast.successMessage(res?.message);

        await queryClient.invalidateQueries({
          queryKey: ["getProjectById", params?.item?._id],
        });
      },
    });
  };

  const DetailCard = ({ icon, title, value }: any) => (
    <View style={styles.detailCard}>
      <Feather name={icon} size={16} color="#2D67C6" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <CustomText style={styles.cardTitle}>{title}</CustomText>
        <CustomText numberOfLines={2} style={styles.cardValue}>
          {value || "N/A"}
        </CustomText>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <Container>
        <Header title={"Project Details"} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2D67C6" />
        </View>
      </Container>
    );
  }
  return (
    <Container>
      <Header
        title={"Project Details"}
        rightSide={
          data ? (
            <>
              <Pressable
                onPress={() =>
                  navigate(routeProject.ProjectForm, {
                    detail: data,
                  })
                }
                style={iconWrapperStyle}
              >
                <Feather name="edit-2" size={16} color="#fff" />
              </Pressable>
              <Pressable
                onPress={handleToggleActive}
                style={styles.deactivateBtn}
              >
                <CustomText style={styles.deactivateText}>
                  {data?.isActive ? "Deactivate" : "Activate"}
                </CustomText>
              </Pressable>
            </>
          ) : null
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 🔥 HERO */}
        <View style={styles.hero}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <Feather name="folder" size={24} color="#2D67C6" />
            </View>

            <View style={{ flex: 1 }}>
              <CustomText style={styles.title}>{data?.projectName}</CustomText>

              <CustomText style={styles.sub}>{data?.source}</CustomText>
            </View>
          </View>

          <View style={styles.stats}>
            <Stat label="Leads" value={data?.totalLeads} />
            <Stat label="Members" value={data?.members?.length} />
            <Stat label="Active" value={data?.activeStatus ? "Yes" : "No"} />
          </View>
        </View>

        {/* INFO */}
        <CustomText style={styles.section}>Project Info</CustomText>

        <DetailCard title="Page Name" value={data?.pageName} icon="layout" />
        <DetailCard title="Form ID" value={data?.formId} icon="hash" />
        <DetailCard
          title="Created"
          value={moment(data?.createdAt).format("DD MMM YYYY")}
          icon="calendar"
        />
        <DetailCard
          title="Manager"
          value={`${data?.srManager?.name || ""} ${
            data?.srManager?.lastName || ""
          }`}
          icon="user"
        />

        {/* MEMBERS */}
        <CustomText style={[styles.section, { marginTop: 16 }]}>
          Team Members
        </CustomText>

        <View style={styles.members}>
          {data?.members?.map((m: any, i: number) => (
            <View key={i} style={styles.member}>
              <View style={styles.avatar}>
                <CustomText style={styles.avatarText}>
                  {m?.user?.name?.charAt(0)}
                </CustomText>
              </View>

              <View style={{ flex: 1 }}>
                <CustomText style={styles.memberName}>
                  {m?.user?.name} {m?.user?.lastName}
                </CustomText>

                <CustomText style={styles.memberSub}>
                  {m?.user?.role} • {m?.assignedLeadsCount} leads
                </CustomText>
              </View>

              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: m?.isActive ? "#22C55E" : "#EF4444" },
                ]}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
};

const Stat = ({ label, value }: any) => (
  <View style={styles.stat}>
    <CustomText style={styles.statValue}>{value || 0}</CustomText>
    <CustomText style={styles.statLabel}>{label}</CustomText>
  </View>
);

export default ProjectDetail;

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  hero: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    ...shadowPrimaryColor,
  },

  row: { flexDirection: "row", alignItems: "center" },

  icon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: { fontSize: 18, fontWeight: "700" },
  sub: { fontSize: 13, color: "#64748B", marginTop: 4 },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  stat: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#2D67C6" },
  statLabel: { fontSize: 12, color: "#64748B" },

  section: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    ...shadowPrimaryColor,
  },

  cardTitle: { fontSize: 12, color: "#64748B" },
  cardValue: { fontSize: 15, fontWeight: "600" },

  members: { marginTop: 5 },

  member: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    ...shadowPrimaryColor,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2D67C6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: { color: "#fff", fontWeight: "700" },

  memberName: { fontSize: 14, fontWeight: "600" },
  memberSub: { fontSize: 12, color: "#64748B" },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  deactivateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFEAEA",
    borderWidth: 1,
    borderColor: "#FF4D4F",
    alignItems: "center",
    justifyContent: "center",
  },

  deactivateText: {
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "600",
  },
});
