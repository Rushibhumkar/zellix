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
    dummyAttendanceDetails
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
    "raise"
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

  return (
    <ContainerHRM
      // ph={20}
      // pt={20}
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
        renderItem={({ item }) => {
          return item?.heading ? (
            <TitleInDetail title={item?.title} />
          ) : (
            <RowItemDetail
              title={item?.title}
              value={item?.value}
              isDate={item?.isDate}
              isTime={item?.isTime}
              containerStyle={{ marginBottom: item?.mb }}
            />
          );
        }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
        ListFooterComponent={
          <>
            {!!data?.issue && (
              <RowItemDetail
                title={"Issue Status"}
                value={data?.resolve ? "Resolved" : "Unresolved"}
                containerStyle={{ marginBottom: 10 }}
              />
            )}
            {(!!data?.punchInMeetingLocation ||
              !!data?.punchOutMeetingLocation) && (
              <TitleInDetail
                title={"Remote Punch Detail"}
                boxStyle={{ marginVertical: 10 }}
              />
            )}
            {!!data?.punchInMeetingLocation && (
              <RowItemDetail
                title={"Punch In Meeting Location"}
                component={
                  <CustomText>{data?.punchInMeetingLocation}</CustomText>
                }
                containerStyle={{ marginBottom: 10 }}
              />
            )}
            {!!data?.punchInMeetingTime && (
              <RowItemDetail
                title={"Punch In Meeting Time"}
                value={moment(data?.punchInMeetingTime).format(
                  "YYYY-MM-DD HH:mm A"
                )}
                containerStyle={{ marginBottom: 10 }}
              />
            )}
            {!!data?.punchOutMeetingLocation && (
              <RowItemDetail
                title={"Punch Out Meeting Location"}
                // value={data?.punchOutMeetingLocation}
                component={
                  <CustomText>{data?.punchOutMeetingLocation}</CustomText>
                }
                containerStyle={{ marginBottom: 10 }}
              />
            )}
            {!!data?.punchOutMeetingTime && (
              <RowItemDetail
                title={" Punch Out Meeting Time"}
                value={moment(data?.punchOutMeetingTime).format(
                  "h:mm A , DD-MM-YYYY"
                )}
                containerStyle={{ marginBottom: 10 }}
              />
            )}
            <OutlineBtn
              title="Raise Issue"
              containerStyle={{
                width: "35%",
                // margin: 5,
                marginVertical: 20,
              }}
              textStyle={{ fontSize: 16 }}
              onPress={() => {
                setIssueRiseUpdate("raise");
                toggleModal();
              }}
            />
            <View style={{ height: 30 }} />
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <ModalWithBlur
        visible={openModal}
        // onClose={toggleModal}
      >
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

const styles = StyleSheet.create({});
