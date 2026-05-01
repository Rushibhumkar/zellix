import React, { useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../../myComponents/CustomText/CustomText";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import OutlineBtn from "../../myComponents/OutlineBtn/OutlineBtn";
import { dummyLeaveDetail } from "../../utils/dummyData";
import { useRoute } from "@react-navigation/native";
import { useGetLeaveDetail } from "../../hooks/useGetQuerryHRM";
import { myConsole } from "../../hooks/useConsole";
import { statusKeyHRM } from "../../utils/hrmKeysMatchToBE";
import { color } from "../../const/color";
import { leaveApproveReject } from "../../services/hrmApi/leaveHrmApi";
import { useQueryClient } from "@tanstack/react-query";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import LeaveAppRemark from "./components/LeaveAppRemark";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import { useAppToast } from "../../components/AppToast";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { shadowPrimaryColor } from "../../const/globalStyle";
import ActionButton from "../../myComponents/ActionButton";

const whichStatus = {
  Cancel: "leaveCancelById",
  Approve: "leaveApproveById",
  Reject: "leaveRejectById",
};

const LeaveDetail = () => {
  const toast = useAppToast();
  const { params } = useRoute();
  const { user } = useSelector(selectUser);

  const isAgentTl =
    user?.role === roleEnum.agent || user?.role === roleEnum.team_lead;

  const queryClient = useQueryClient();

  const [leaveDetailById, setLeaveDetailById] = useState(dummyLeaveDetail);

  const {
    data,
    isLoading: isLoadingDetail,
    refetch,
    isRefetching,
  } = useGetLeaveDetail({
    id: params?.item?.from === "nav" ? params?.item?.dataId : params?.item?._id,
  });

  const [refreshing, setRefreshing] = useState(false);

  const [remarks, setRemarks] = useState("");

  const [openModal, setOpenModal] = useState({
    open: false,
    which: "Approve",
  });

  useEffect(() => {
    let aa = dummyLeaveDetail?.map((el) => {
      if (data?.hasOwnProperty(el?.key)) {
        if (!!el?.subKey) {
          return {
            ...el,
            value: data[el?.key]?.[el?.subKey],
          };
        } else {
          return {
            ...el,
            value: data[el?.key],
          };
        }
      } else return el;
    });

    setLeaveDetailById(aa);
  }, [data, isRefetching]);

  const handleApproveReject = async (
    key: "leaveRejectById" | "leaveApproveById",
  ) => {
    try {
      toggleModal(" ");

      let resAcceptRejectLeave = await leaveApproveReject({
        key: key,
        id: params?.item?._id,
        remarks: remarks,
      });

      refetch();

      queryClient?.invalidateQueries({
        queryKey: ["getAllLeave"],
      });

      !!resAcceptRejectLeave &&
        toast.success(resAcceptRejectLeave?.message ?? "--");
    } catch (error) {}
  };

  const onRefresh = () => {
    try {
      setRefreshing(true);
      refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleModal = (value: "Approve" | "Reject" | " " | "Cancel") => {
    setOpenModal((prev) => ({
      ...prev,
      open: !prev.open,
      which: value,
    }));

    value === " " && setRemarks("");
  };

  const InfoCard = ({ icon, label, value }: any) => (
    <View style={styles.infoCard}>
      <View style={styles.infoLeft}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={16} color="#2E67BE" />
        </View>

        <View style={{ flex: 1 }}>
          <CustomText style={styles.infoLabel}>{label}</CustomText>

          <CustomText style={styles.infoValue}>{value || "N/A"}</CustomText>
        </View>
      </View>
    </View>
  );

  return (
    <ContainerHRM
      isLoading={isLoadingDetail}
      // ph={12}
      isBAck={{
        title: "Leave Detail",
      }}
    >
      {/* ACTION BUTTONS */}
      {!isAgentTl && (
        <View style={styles.actionContainer}>
          {[statusKeyHRM.approved, statusKeyHRM.cancel]?.indexOf(
            data?.status,
          ) === -1 && (
            <>
              <ActionButton
                title="Approve"
                icon="check"
                variant="primary"
                onPress={() => toggleModal("Approve")}
                containerStyle={styles.actionBtn}
              />

              <ActionButton
                title="Reject"
                icon="x"
                variant="outline"
                onPress={() => toggleModal("Reject")}
                containerStyle={styles.actionBtn}
              />
            </>
          )}

          {data?.status === statusKeyHRM.approved && (
            <ActionButton
              title="Cancel Leave"
              icon="slash"
              variant="danger"
              onPress={() => toggleModal("Cancel")}
              containerStyle={styles.cancelActionBtn}
            />
          )}
        </View>
      )}

      <FlatList
        data={leaveDetailById}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{
          paddingBottom: 180,
          paddingTop: 10,
          paddingHorizontal: 12,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const respondentData = {
            name: leaveDetailById?.find((i) => i?.key === "name")?.value,

            role: leaveDetailById?.find((i) => i?.key === "role")?.value,

            mobile: leaveDetailById?.find((i) => i?.key === "mobile")?.value,

            email: leaveDetailById?.find((i) => i?.key === "email")?.value,
          };

          if (
            item?.heading &&
            item?.title?.toLowerCase().includes("respondent")
          ) {
            return (
              <RespondentDetails item={respondentData} isFirst toast={toast} />
            );
          }

          if (["name", "role", "mobile", "email"].includes(item?.key)) {
            return null;
          }

          if (item?.heading) {
            return (
              <CustomText style={styles.sectionHeading}>
                {item?.title}
              </CustomText>
            );
          }

          return (
            <InfoCard
              icon={
                item?.key === "status"
                  ? "check-circle"
                  : item?.key === "leaveType"
                    ? "calendar"
                    : item?.key === "reason"
                      ? "file-text"
                      : item?.key === "fromDate"
                        ? "clock"
                        : "info"
              }
              label={item?.title}
              value={
                item?.isDate
                  ? new Date(item?.value).toLocaleDateString()
                  : item?.value
              }
            />
          );
        }}
        ListFooterComponent={
          <FlatList
            scrollEnabled={false}
            data={data?.respondentDetails ?? []}
            renderItem={({ item, index }) => (
              <RespondentDetails
                item={item}
                isFirst={index === 0}
                toast={toast}
              />
            )}
          />
        }
      />

      <ModalWithBlur visible={openModal?.open}>
        <LeaveAppRemark
          heading={`${openModal?.which} Leave`}
          onPressCancel={() => toggleModal(" ")}
          onChangeText={(v) => setRemarks(v)}
          onPressSubmit={() =>
            handleApproveReject(whichStatus[openModal?.which])
          }
        />
      </ModalWithBlur>
    </ContainerHRM>
  );
};

export default LeaveDetail;

const RespondentDetails = ({ item, isFirst, toast }: any) => {
  const getInitials = (name: string) => {
    if (!name) return "";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;

    await Clipboard.setStringAsync(text);

    toast.success(`${label} copied to clipboard`);
  };

  return (
    <View style={styles.respondentCard}>
      {isFirst && (
        <CustomText style={styles.sectionHeading}>
          Respondent Details
        </CustomText>
      )}

      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <CustomText style={styles.avatarText}>
            {getInitials(item?.name || "")}
          </CustomText>
        </View>

        <View style={{ flex: 1 }}>
          <CustomText style={styles.name}>{item?.name ?? "N/A"}</CustomText>

          <CustomText style={styles.subText}>{item?.role ?? "-"}</CustomText>
        </View>
      </View>

      <View style={styles.contactRow}>
        <TouchableOpacity
          style={styles.contactBox}
          onPress={() => Linking.openURL(`tel:${item?.mobile}`)}
          onLongPress={() => handleCopy(item?.mobile, "Mobile Number")}
        >
          <Feather name="phone" size={18} color="#2E67BE" />

          <CustomText style={styles.contactText}>Call</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactBox}
          onPress={() => Linking.openURL(`mailto:${item?.email}`)}
          onLongPress={() => handleCopy(item?.email, "Email")}
        >
          <Feather name="mail" size={18} color="#2E67BE" />

          <CustomText style={styles.contactText}>Email</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
  },

  actionBtn: {
    flex: 1,
    minHeight: 48,
  },

  cancelActionBtn: {
    width: "100%",
    minHeight: 48,
  },

  approveBtn: {
    minWidth: "32%",
    borderRadius: 12,
  },

  rejectBtn: {
    minWidth: "32%",
    borderRadius: 12,
  },

  cancelBtn: {
    minWidth: "38%",
    borderRadius: 12,
  },

  btnText: {
    fontSize: 14,
  },

  rejectText: {
    fontSize: 14,
  },

  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 18,
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    ...shadowPrimaryColor,
  },

  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 4,
  },

  respondentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    ...shadowPrimaryColor,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8EEF7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E67BE",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  subText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  contactRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },

  contactBox: {
    flex: 1,
    backgroundColor: "#F5F8FD",
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  contactText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "600",
    color: "#2E67BE",
  },
});
