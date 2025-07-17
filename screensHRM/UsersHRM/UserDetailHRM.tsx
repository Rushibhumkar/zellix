import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CustomText from "../../myComponents/CustomText/CustomText";
import { myConsole } from "../../hooks/useConsole";
import RowItem from "../../myComponents/RowItem/RowItem";
import TitleInDetail from "../../myComponentsHRM/TitleHRM/TitleInDetail";
import RowItemDetail from "../../myComponentsHRM/Row/RowItemDetail";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import { dummyUserDetail } from "../../utils/dummyData";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { color } from "../../const/color";
import OutlineBtn from "../../myComponents/OutlineBtn/OutlineBtn";
import { routeUser } from "../../utils/routesHRM";
import { useUserDetailHRM } from "../../hooks/useGetQuerryHRM";
import {
  deleteDeviceId,
  leadPool,
  leadPoolRestriction,
  userApproved,
} from "../../services/hrmApi/userHrmApi";
import { useQueryClient } from "@tanstack/react-query";
import { statusHRM } from "../../utils/hrmKeysMatchToBE";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import PleaseWait from "../../myComponentsHRM/PleaseWait/PleaseWait";
import LoadingModal from "../../myComponentsHRM/LoadingCompo/LoadingModal";
import { queryKeyHRM } from "../../utils/queryKeys";
import ImageViewModal from "../../myComponentsHRM/ImageViewModal/ImageViewModal";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import LeaveAppRemark from "../LeaveHRM/components/LeaveAppRemark";
import { leaveApproveReject } from "../../services/hrmApi/leaveHrmApi";
import LeadPoolRestriction from "./components/LeadpoolRestriction";
import DeleteIcon from "../../assets/svg/DeleteIcon";
import { popupModal2 } from "../../utils/toastFunction";

const UserDetailHRM = () => {
  const navigation = useNavigation(); // ✅ Define navigation at the top
  const { goBack, navigate } = navigation;
  const { params } = useRoute();
  const paramsData = params?.item;
  const queryClient = useQueryClient();
  const { user } = useSelector(selectUser);

  const [isPoolRestrict, setIsPoolRestrict] = useState(
    params?.item?.isPoolRestrict
  );
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Add loading state
  const [isDeleting, setIsDeleting] = useState(false);
  const isSubSup =
    user?.role === roleEnum.sub_admin || user?.role === roleEnum.sup_admin;
  const { data, isLoading, refetch } = useUserDetailHRM({
    id: params?.item?.from === "nav" ? params?.item?.dataId : params?.item?._id,
  });

  const [useDetail, setUseDetail] = useState(dummyUserDetail);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let aa = dummyUserDetail?.map((el, i) => {
      if (data?.hasOwnProperty(el?.key)) {
        if (!!el?.subKey) {
          return {
            ...el,
            value: data[el?.key][el?.subKey],
          };
        } else {
          if (el?.key === "name") {
            return {
              ...el,
              value: `${data?.name} ${data?.lastName}`,
            };
          }
          return { ...el, value: data[el?.key] };
        }
      } else return el;
    });
    setUseDetail(aa);
  }, [data]);

  const userApprovedByAdmin = async () => {
    try {
      popUpConfToast.plzWait({
        bodyComponent: () => <PleaseWait />,
      });
      let resUserApprove = await userApproved({ id: params?.item?._id });
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["getAllUserHRM"],
      });
      popUpConfToast.successMessage(resUserApprove?.message ?? "--");
    } catch (err) {
      console.log("errUserApprove", err);
    }
  };

  //
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      refetch();
    } catch (e) {
      console.log("refreshInUser", e);
    } finally {
      setRefreshing(false);
    }
  };

  const [openModal, setOpenModal] = useState({
    open: false,
    which: "Approve",
  });

  const toggleModal = async (value: "Approve" | "Cancel") => {
    setOpenModal((prev) => ({
      ...prev,
      open: !prev.open,
      which: value,
    }));
  };
  const toggleSwitch = () => {
    toggleModal("Approve"); // Open modal instead of setting state directly
  };

  // const sendValue = async (value: boolean) => {
  //   try {
  //     const sendData = { userId: params?.item?._id, isPoolRestrict: value };

  //     const response = await leadPoolRestriction(sendData);
  //     if (response?.success) {
  //       popUpConfToast.successMessage("Updated successfully");
  //       navigate(routeUser.AllUSersHRM) ;
  //       refetch() ;
  //     } else {
  //       throw new Error(response?.message || "Failed to update");
  //     }
  //   } catch (error) {
  //     console.error("Error sending switch value:", error);
  //     popUpConfToast.errorMessage(
  //       "Failed to update restriction. Please try again."
  //     );
  //   }
  // };
  const sendValue = async (value: boolean) => {
    try {
      const sendData = { userId: params?.item?._id, isPoolRestrict: value };
      const response = await leadPoolRestriction(sendData);

      if (response?.success) {
        popUpConfToast.successMessage("Updated successfully");

        await refetch(); // Ensure fresh data before navigation
        queryClient.invalidateQueries(["getAllUserHRM"]); // Refresh query cache
        navigate(routeUser.AllUSersHRM);
      } else {
        throw new Error(response?.message || "Failed to update");
      }
    } catch (error) {
      console.error("Error sending switch value:", error);
      popUpConfToast.errorMessage(
        "Failed to update restriction. Please try again."
      );
    }
  };

  const handleSubmitRestriction = async () => {
    const newValue = !isPoolRestrict;
    setIsSubmitting(true); // ✅ Start loading
    setIsPoolRestrict(newValue); // Optimistic update

    try {
      await sendValue(newValue); // ✅ Send to API
      toggleModal(" "); // ✅ Close modal
    } catch (error) {
      console.error("Error updating pool restriction:", error);
      setIsPoolRestrict(!newValue); // ❌ Revert if API call fails
    } finally {
      setIsSubmitting(false); // ✅ Stop loading
    }
  };
  const handleDeleteDevices = async () => {
    const userId = params?.item?._id;

    if (!userId) {
      console.error("User ID is missing");
      popUpConfToast.errorMessage("User ID not found.");
      return;
    }

    popupModal2.wantDelete({
      onConfirm: async () => {
        try {
          popupModal2.wantLoading();
          const res = await deleteDeviceId({ id: userId });
          myConsole("Devices cleared response:", res);
          popUpConfToast.successMessage("Devices cleared successfully");
          refetch();
        } catch (error) {
          console.error(
            "Error deleting devices:",
            error?.response?.data || error.message
          );
          popUpConfToast.errorMessage(
            "Failed to clear devices. Please try again."
          );
        }
      },
      title: "Do you want to Delete",
    });
  };

  return (
    <ContainerHRM
      isBAck={{
        title: "User Details",
        isGoBack: () => goBack(),
        isEdit: () => navigate(routeUser.AddUserHRM, { item: paramsData }),
      }}
      isLoading={isLoading}
    >
      <View>
        <View style={styles.leadPoolText}>
          <CustomText style={{ marginHorizontal: 20, fontWeight: "bold" }}>
            Lead Pool Restriction
          </CustomText>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isPoolRestrict ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isPoolRestrict}
          />
        </View>

        {isSubSup && (
          <>
            {params?.item?.status !== "approved" && (
              <View
                style={{
                  flexDirection: "row",
                  margin: 20,
                }}
              >
                <CustomBtn
                  title="Accept"
                  containerStyle={{
                    minWidth: "30%",
                    marginEnd: 20,
                  }}
                  textStyle={{
                    fontSize: 14,
                  }}
                  onPress={userApprovedByAdmin}
                  isLoading={isLoadingApprove}
                />
                <OutlineBtn
                  title="Send to Update"
                  onPress={() =>
                    navigate(routeUser.SendToUpdate, { item: params?.item })
                  }
                  textStyle={{
                    fontSize: 14,
                  }}
                />
              </View>
            )}
          </>
        )}
        <FlatList
          data={useDetail}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            paddingTop: 10,
            paddingHorizontal: 20,
            paddingBottom: 150,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const isAtt = [
              "addressProof",
              "bankStatements",
              "resume",
              "emiratesId",
              "pancard",
              "aadharCard",
              "sscDuc",
              "hscDuc",
              "degreeCertificate",
            ];

            const isDevices = item?.key === "devices";

            if (isDevices && (!isSubSup || item?.value?.length === 0)) {
              return null;
            }

            if (item?.heading) {
              return <TitleInDetail title={item?.title} />;
            }

            return (
              <RowItemDetail
                title={<CustomText>{item?.title}</CustomText>}
                value={
                  isDevices ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 8,
                      }}
                    >
                      <CustomText
                        style={{
                          fontSize: 14,
                          fontWeight: "300",
                          maxWidth: 150,
                        }}
                        // numberOfLines={2}
                        // ellipsizeMode="tail"
                      >
                        {Array.isArray(item?.value)
                          ? item?.value.join(", ")
                          : item?.value ?? "-"}
                      </CustomText>

                      {isSubSup && <DeleteIcon onPress={handleDeleteDevices} />}
                    </View>
                  ) : (
                    item?.value ?? "-"
                  )
                }
                containerStyle={{ marginBottom: item?.mb }}
                component={
                  isAtt.includes(item?.key) && (
                    <ImageViewModal imagesUri={item?.value} />
                  )
                }
                isDate={item?.isDate}
              />
            );
          }}
        />

        <ModalWithBlur visible={openModal?.open}>
          <LeadPoolRestriction
            heading="Lead Pool Restriction"
            subHeadingText="Do you want to restrict this user from the lead pool?"
            onPressSubmit={handleSubmitRestriction}
            onPressCancel={() => toggleModal(" ")}
            isLoading={isSubmitting} // ✅ Pass loading state
          />
        </ModalWithBlur>
      </View>
    </ContainerHRM>
  );
};

export default UserDetailHRM;

const styles = StyleSheet.create({
  leadPoolText: { flexDirection: "row", alignItems: "center" },
});
