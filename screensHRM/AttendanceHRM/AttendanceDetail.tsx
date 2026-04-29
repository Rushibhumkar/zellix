import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import RowItemDetail from "../../myComponentsHRM/Row/RowItemDetail";
import TitleInDetail from "../../myComponentsHRM/TitleHRM/TitleInDetail";
import { dummyAttendanceDetails } from "../../utils/dummyData";
import { useRoute } from "@react-navigation/native";
import { myConsole } from "../../hooks/useConsole";
import { useGetAttendanceDetail } from "../../hooks/useGetQuerryHRM";
import OutlineBtn from "../../myComponents/OutlineBtn/OutlineBtn";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import LeaveAppRemark from "../LeaveHRM/components/LeaveAppRemark";
import { attendanceStatus } from "../../utils/hrmKeysMatchToBE";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import {
  issueResolveAdmin,
  issueRiseAgent,
} from "../../services/hrmApi/attendanceApi";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import PleaseWait from "../../myComponentsHRM/PleaseWait/PleaseWait";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import moment from "moment";
import CustomText from "../../myComponents/CustomText/CustomText";

const AttendanceDetail = () => {
  const [attendanceDetailById, setAttendanceDetailById] = useState(
    dummyAttendanceDetails,
  );
  const { params } = useRoute();
  const { user } = useSelector(selectUser);
  const isAgent = user?.role === roleEnum.agent;
  const isSubSup =
    user?.role === roleEnum.sub_admin || user?.role === roleEnum.sup_admin;
  const attendanceId = params?.item?._id;
  const queryClient = useQueryClient();
  //
  const { data, isLoading, refetch } = useGetAttendanceDetail({
    id: params?.item?.from === "nav" ? params?.item?.dataId : attendanceId,
  });
  const [openModal, setOpenModal] = useState(false);
  const [formValue, setFormValue] = useState({
    remarks: "",
  });
  const [issueRiseUpdate, setIssueRiseUpdate] = useState<"raise" | "update">(
    "raise",
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let aa = dummyAttendanceDetails?.map((el, i) => {
      if (data?.hasOwnProperty(el?.key)) {
        if (!!el?.subKey) {
          return {
            ...el,
            value: data[el?.key]?.[el?.subKey],
          };
        } else {
          if (el?.key === "resolve") {
            return {
              ...el,
              value: !!data[el?.key] ? "Resolved" : "Unresolved",
            };
          } else {
            return { ...el, value: data[el?.key] };
          }
        }
      } else return el;
    });
    setAttendanceDetailById(aa);
  }, [data]);

  const toggleModal = () => {
    setOpenModal((prev) => !prev);
  };

  const handleFormValues = (key: "remarks" | "status", value) => {
    setFormValue((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const handleIssue = async () => {
    toggleModal();
    try {
      popUpConfToast.plzWait({
        bodyComponent: () => <PleaseWait />,
      });
      if (isAgent) {
        let res = await issueRiseAgent({
          id: attendanceId,
          data: {
            remarks: formValue.remarks,
          },
        });
        refetch();
        queryClient.invalidateQueries({
          queryKey: [queryKeyHRM.getAllAttendance],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeyHRM.getIssueAttendance],
        });
        popUpConfToast.successMessage(res?.message);
      } else {
        let res = await issueResolveAdmin({
          id: attendanceId,
          data: {
            remarks: formValue.remarks,
            status: formValue.status,
          },
        });
        refetch();
        queryClient.invalidateQueries({
          queryKey: ["getAllAttendance"],
        });
        queryClient.invalidateQueries({
          queryKey: ["getSingleUserAttList", params?.item?.user],
        });
        popUpConfToast.successMessage(res?.message);
      }
    } catch (error) {
      popUpConfToast.errorMessage();
    } finally {
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    try {
      refetch();
    } catch (e) {
      console.log("refreshInLeaveDetail", e);
    } finally {
      setRefreshing(false);
    }
  };
  myConsole("dataaaaa", data);
  return (
    <ContainerHRM
      isBAck={{
        title: "Attendance Details",
        isEdit:
          isSubSup &&
          (() => {
            setIssueRiseUpdate("update");
            toggleModal();
          }),
      }}
      isLoading={isLoading}
    >
      <FlatList
        data={attendanceDetailById ?? []}
        keyExtractor={(_, index) => `${index}`}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          return item?.heading ? (
            <View style={styles.headingContainer}>
              <CustomText style={styles.headingText}>{item?.title}</CustomText>
            </View>
          ) : (
            <View
              style={[
                styles.infoCard,
                {
                  marginBottom: item?.mb || 12,
                },
              ]}
            >
              <View style={styles.leftSection}>
                <View style={styles.iconBox}>
                  <CustomText style={styles.iconText}>
                    {item?.title?.charAt(0)}
                  </CustomText>
                </View>

                <View style={{ flex: 1 }}>
                  <CustomText style={styles.label}>{item?.title}</CustomText>

                  <CustomText style={styles.value}>
                    {item?.value || "N/A"}
                  </CustomText>
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <>
            {!!data?.issue && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: data?.resolve ? "#DCFCE7" : "#FEE2E2",
                      },
                    ]}
                  >
                    <CustomText
                      style={[
                        styles.iconText,
                        {
                          color: data?.resolve ? "#15803D" : "#DC2626",
                        },
                      ]}
                    >
                      !
                    </CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>Issue Status</CustomText>

                    <CustomText
                      style={[
                        styles.value,
                        {
                          color: data?.resolve ? "#15803D" : "#DC2626",
                        },
                      ]}
                    >
                      {data?.resolve ? "Resolved" : "Unresolved"}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            {(!!data?.punchInMeetingLocation ||
              !!data?.punchOutMeetingLocation) && (
              <View style={styles.headingContainer}>
                <CustomText style={styles.headingText}>
                  Remote Punch Detail
                </CustomText>
              </View>
            )}

            {!!data?.punchInMeetingLocation && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>P</CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>
                      Punch In Location
                    </CustomText>

                    <CustomText style={styles.value}>
                      {data?.punchInMeetingLocation}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            {!!data?.punchInMeetingTime && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>T</CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>Punch In Time</CustomText>

                    <CustomText style={styles.value}>
                      {moment(data?.punchInMeetingTime).format(
                        "YYYY-MM-DD HH:mm A",
                      )}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            {!!data?.punchOutMeetingLocation && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>P</CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>
                      Punch Out Location
                    </CustomText>

                    <CustomText style={styles.value}>
                      {data?.punchOutMeetingLocation}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            {!!data?.punchOutMeetingTime && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>T</CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>Punch Out Time</CustomText>

                    <CustomText style={styles.value}>
                      {moment(data?.punchOutMeetingTime).format(
                        "h:mm A , DD-MM-YYYY",
                      )}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            <OutlineBtn
              title="Raise Issue"
              containerStyle={styles.issueBtn}
              textStyle={styles.issueBtnText}
              onPress={() => {
                setIssueRiseUpdate("raise");
                toggleModal();
              }}
            />

            <View style={{ height: 40 }} />
          </>
        }
      />

      <ModalWithBlur visible={openModal}>
        <LeaveAppRemark
          heading={
            issueRiseUpdate === "raise" ? "Raise Issue" : "Update Status"
          }
          onPressCancel={toggleModal}
          onChangeText={(v) => handleFormValues("remarks", v)}
          isDropDown={
            !isAgent && {
              arrOfObj: attendanceStatus,
              onChange: (v) => handleFormValues("status", v),
            }
          }
          onPressSubmit={handleIssue}
        />
      </ModalWithBlur>
    </ContainerHRM>
  );
};

export default AttendanceDetail;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    paddingBottom: 160,
  },

  headingContainer: {
    marginTop: 14,
    marginBottom: 12,
  },

  headingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D67C6",
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  issueBtn: {
    width: "45%",
    marginTop: 14,
    borderRadius: 12,
    alignSelf: "flex-end",
  },

  issueBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
