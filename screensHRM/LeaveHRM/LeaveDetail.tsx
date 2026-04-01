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
import TitleInDetail from "../../myComponentsHRM/TitleHRM/TitleInDetail";
import RowItemDetail from "../../myComponentsHRM/Row/RowItemDetail";
import { useRoute } from "@react-navigation/native";
import { useGetLeaveDetail } from "../../hooks/useGetQuerryHRM";
import { myConsole } from "../../hooks/useConsole";
import { roleHRM, statusHRM, statusKeyHRM } from "../../utils/hrmKeysMatchToBE";
import { color } from "../../const/color";
import {
  leaveApprove,
  leaveApproveReject,
  leaveReject,
} from "../../services/hrmApi/leaveHrmApi";
import { useQueryClient } from "@tanstack/react-query";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import PleaseWait from "../../myComponentsHRM/PleaseWait/PleaseWait";
import ImageViewModal from "../../myComponentsHRM/ImageViewModal/ImageViewModal";
import { queryKeyHRM } from "../../utils/queryKeys";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import LeaveAppRemark from "./components/LeaveAppRemark";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import { useAppToast } from "../../components/AppToast";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import RenderRow from "../../myComponents/RenderRow";
import * as Clipboard from "expo-clipboard";

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
    which: "Approve", //Reject
  });
  // console.log("remarks", remarks);
  myConsole("leaveDetailById", leaveDetailById);
  useEffect(() => {
    let aa = dummyLeaveDetail?.map((el, i) => {
      if (data?.hasOwnProperty(el?.key)) {
        if (!!el?.subKey) {
          return {
            ...el,
            value: data[el?.key]?.[el?.subKey],
          };
        } else {
          return { ...el, value: data[el?.key] };
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
      // popUpConfToast.plzWait({
      //   bodyComponent: () => <PleaseWait />,
      // });
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
    } catch (e) {
      console.log("refreshInLeaveDetail", e);
    } finally {
      setRefreshing(false);
    }
  };
  //
  const toggleModal = (value: "Approve" | "Reject" | " " | "Cancel") => {
    console.log("value", value);
    setOpenModal((prev) => {
      return {
        ...prev,
        open: !prev.open,
        which: value,
      };
    });
    value === " " && setRemarks("");
  };

  return (
    <ContainerHRM
      isLoading={isLoadingDetail}
      ph={20}
      // pt={20}
      isBAck={{
        title: "Leave Detail",
      }}
    >
      {!isAgentTl && (
        <>
          {[statusKeyHRM.approved, statusKeyHRM.cancel]?.indexOf(
            data?.status,
          ) === -1 && (
            <View
              style={{
                flexDirection: "row",
                paddingBottom: 10,
                paddingTop: 20,
                alignSelf: "flex-end",
              }}
            >
              <CustomBtn
                title="Accept"
                containerStyle={{
                  minWidth: "32%",
                  marginEnd: 20,
                }}
                textStyle={{
                  fontSize: 14,
                }}
                // onPress={() => handleApproveReject('leaveApproveById')}
                onPress={() => toggleModal("Approve")}
                // isLoading={isLoading.approve}
              />
              <OutlineBtn
                title="Reject"
                textStyle={{
                  fontSize: 14,
                }}
                containerStyle={{
                  minWidth: "32%",
                }}
                // onPress={() => handleApproveReject('leaveRejectById')}
                // isLoading={isLoading.reject}
                onPress={() => toggleModal("Reject")}
              />
            </View>
          )}
          {data?.status === statusKeyHRM.approved && (
            <OutlineBtn
              title="Cancel"
              textStyle={{
                fontSize: 14,
              }}
              containerStyle={{
                minWidth: "30%",
                margin: 10,
                marginBottom: 2,
              }}
              // onPress={() => handleApproveReject('leaveRejectById')}
              // isLoading={isLoading.reject}
              onPress={() => toggleModal("Cancel")}
            />
          )}
        </>
      )}

      <FlatList
        data={leaveDetailById}
        renderItem={({ item, index }) => {
          console.log("index", index);
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
              <TitleInDetail title={item?.title} boxStyle={{ marginTop: 12 }} />
            );
          }

          return (
            <View style={{ marginBottom: item?.mb }}>
              {item?.key === "attachments" ? (
                <ImageViewModal imagesUri={item?.value} />
              ) : (
                <RenderRow
                  label={item?.title}
                  value={
                    item?.isDate
                      ? new Date(item?.value).toLocaleDateString()
                      : item?.value
                  }
                />
              )}
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={
          <FlatList
            data={data?.respondentDetails ?? []}
            renderItem={({ item, index }) => {
              return (
                <RespondentDetails
                  item={item}
                  isFirst={index === 0}
                  isLast={index === data?.respondentDetails?.length - 1}
                  toast={toast}
                />
              );
            }}
          />
        }
        contentContainerStyle={{
          paddingBottom: 180,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    <View style={styles.card}>
      {isFirst && (
        <CustomText style={styles.sectionTitle}>Respondent Details</CustomText>
      )}

      {/* TOP ROW */}
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

      {/* CONTACT ROW */}
      <View style={styles.contactRow}>
        {/* PHONE */}
        <TouchableOpacity
          style={styles.iconBox}
          onPress={() => Linking.openURL(`tel:${item?.mobile}`)}
          onLongPress={() => handleCopy(item?.mobile, "Mobile number")}
        >
          <Feather name="phone" size={18} color="#2E67BE" />
        </TouchableOpacity>

        {/* EMAIL */}
        <TouchableOpacity
          style={styles.iconBox}
          onPress={() => Linking.openURL(`mailto:${item?.email}`)}
          onLongPress={() => handleCopy(item?.email, "Email")}
        >
          <Feather name="mail" size={18} color="#2E67BE" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E6EAF0",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E67BE",
    marginBottom: 10,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E8EEF7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E67BE",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F3A4A",
    marginBottom: 4,
  },

  subRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  subText: {
    fontSize: 13,
    color: "#8C97A8",
    marginRight: 4,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  iconBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#F5F8FD",
    borderRadius: 10,
    marginHorizontal: 4,
  },
});
