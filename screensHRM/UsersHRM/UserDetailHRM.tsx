import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CustomText from "../../myComponents/CustomText/CustomText";
import { myConsole } from "../../hooks/useConsole";
import { useNavigation, useRoute } from "@react-navigation/native";
import { dummyUserDetail } from "../../utils/dummyData";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { color } from "../../const/color";
import OutlineBtn from "../../myComponents/OutlineBtn/OutlineBtn";
import { routeUser } from "../../utils/routesHRM";
import { useUserDetailHRM } from "../../hooks/useGetQuerryHRM";
import {
  deleteDeviceId,
  leadPoolRestriction,
  updateUserAccountStatus,
  userApproved,
} from "../../services/hrmApi/userHrmApi";
import * as Linking from "expo-linking";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import ImageViewModal from "../../myComponentsHRM/ImageViewModal/ImageViewModal";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import LeadPoolRestriction from "./components/LeadpoolRestriction";
import DeleteIcon from "../../assets/svg/DeleteIcon";
import { popupModal2 } from "../../utils/toastFunction";
import { useAppToast } from "../../components/AppToast";
import moment from "moment";
import { getUserStatusHRM, userStatusHRM } from "../../utils/hrmKeysMatchToBE";
import { queryKeyHRM } from "../../utils/queryKeys";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";

const UserDetailHRM = () => {
  const navigation = useNavigation();
  const { goBack, navigate } = navigation;
  const { params } = useRoute();
  const paramsData = params?.item;
  const queryClient = useQueryClient();
  const { user } = useSelector(selectUser);

  const [isPoolRestrict, setIsPoolRestrict] = useState(
    params?.item?.isPoolRestrict,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubSup = [
    roleEnum.sub_admin,
    roleEnum.sup_admin,
    roleEnum.developer,
  ].includes(user?.role);
  const { data, isLoading, refetch } = useUserDetailHRM({
    id: params?.item?.from === "nav" ? params?.item?.dataId : params?.item?._id,
  });
  const targetUserId = data?._id || (params?.item?.from === "nav" ? params?.item?.dataId : params?.item?._id);
  const canManageAccount =
    [roleEnum.sup_admin, roleEnum.hr, roleEnum.developer].includes(user?.role) &&
    Boolean(data?._id) &&
    String(user?._id) !== String(targetUserId) &&
    (user?.role !== roleEnum.hr ||
      ![roleEnum.sup_admin, roleEnum.developer].includes(data?.role));
  const accountInactive = data?.accountStatus === "inactive" || ["resign", "terminated"].includes(data?.activeStatus);
  const [accountStatusSaving, setAccountStatusSaving] = useState(false);
  const [pendingInactiveReason, setPendingInactiveReason] = useState<"resigned" | "terminated" | null>(null);
  const [lastWorkingDay, setLastWorkingDay] = useState<Date | null>(null);

  const [useDetail, setUseDetail] = useState(dummyUserDetail);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  };

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
          if (el?.key === "activeStatus") {
            return {
              ...el,
              value: userStatusHRM[getUserStatusHRM(data)],
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
      // popUpConfToast.plzWait({
      //   bodyComponent: () => <PleaseWait />,
      // });
      let resUserApprove = await userApproved({ id: params?.item?._id });
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["getAllUserHRM"],
      });
      toast.success(resUserApprove?.message ?? "--");
    } catch (err) {
      console.log("errUserApprove", err);
    }
  };

  //
  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (e) {
      console.log("refreshInUser", e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

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

  const toast = useAppToast();

  const confirmAccountStatus = (isActive: boolean, reason?: "resigned" | "terminated") => {
    if (!isActive && reason) {
      setPendingInactiveReason(reason);
      setLastWorkingDay(null);
      return;
    }
    const title = isActive ? "Activate employee account?" : `Mark employee ${reason}?`;
    const message = isActive
      ? "This employee can sign in again. Previously reassigned leads stay with their current owners."
      : "This blocks login, clears device access, disconnects active sessions, and reassigns active leads.";
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: isActive ? "Activate" : "Confirm",
        style: isActive ? "default" : "destructive",
        onPress: async () => {
          if (!targetUserId || accountStatusSaving) return;
          setAccountStatusSaving(true);
          try {
            const result = await updateUserAccountStatus(String(targetUserId), { isActive, ...(reason ? { reason } : {}) });
            await Promise.all([
              refetch(),
              queryClient.invalidateQueries({ queryKey: [queryKeyHRM.getAllUserHRM] }),
            ]);
            toast.success(result?.message || "Account status updated");
          } catch (error: any) {
            toast.error(error?.response?.data?.message || "Unable to update account status");
          } finally {
            setAccountStatusSaving(false);
          }
        },
      },
    ]);
  };

  const submitInactiveStatus = async () => {
    if (!targetUserId || !pendingInactiveReason || !lastWorkingDay || accountStatusSaving) {
      if (!lastWorkingDay) toast.error("Last working day is required");
      return;
    }
    setAccountStatusSaving(true);
    try {
      const result = await updateUserAccountStatus(String(targetUserId), {
        isActive: false,
        reason: pendingInactiveReason,
        lastWorkingDay,
      });
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: [queryKeyHRM.getAllUserHRM] }),
      ]);
      setPendingInactiveReason(null);
      setLastWorkingDay(null);
      toast.success(result?.message || "Account status updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to update account status");
    } finally {
      setAccountStatusSaving(false);
    }
  };

  const sendValue = async (value: boolean) => {
    try {
      const sendData = { userId: params?.item?._id, isPoolRestrict: value };
      const response = await leadPoolRestriction(sendData);

      if (response?.success) {
        toast.success("Updated successfully");

        await refetch(); // Ensure fresh data before navigation
        queryClient.invalidateQueries(["getAllUserHRM"]); // Refresh query cache
        navigate(routeUser.AllUSersHRM);
      } else {
        throw new Error(response?.message || "Failed to update");
      }
    } catch (error) {
      console.error("Error sending switch value:", error);
      toast.error("Failed to update restriction. Please try again.");
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
      toast.error("User ID not found.");
      return;
    }

    popupModal2.wantDelete({
      onConfirm: async () => {
        try {
          popupModal2.wantLoading();
          const res = await deleteDeviceId({ id: userId });
          myConsole("Devices cleared response:", res);
          toast.success("Devices cleared successfully");
          refetch();
        } catch (error) {
          console.error(
            "Error deleting devices:",
            error?.response?.data || error.message,
          );
          toast.error("Failed to clear devices. Please try again.");
        }
      },
      title: "Do you want to Delete",
    });
  };

  const handleOpenAttachment = (url: string) => {
    if (!url) return;
    Linking.openURL(url);
  };

  return (
    <ContainerHRM
      isBAck={{
        title: "User Details",
        isGoBack: () => goBack(),
        isEdit: () =>
          navigate(routeUser.AddUserHRM, {
            item: paramsData,
          }),
      }}
      isLoading={isLoading}
    >
      <View style={styles.container}>
        {/* TOP ACTION CARD */}
        <View style={styles.topCard}>
          {canManageAccount && (
            <View style={styles.accountSection}>
              <View style={styles.accountHeader}>
                <View>
                  <CustomText style={styles.accountLabel}>Account status</CustomText>
                  <CustomText style={styles.accountHint}>Manage this employee's access</CustomText>
                </View>
                <View style={[styles.accountBadge, accountInactive && styles.accountBadgeInactive]}>
                  <CustomText style={[styles.accountBadgeText, accountInactive && styles.accountBadgeTextInactive]}>
                    {userStatusHRM[getUserStatusHRM(data)]}
                  </CustomText>
                </View>
              </View>
              {accountInactive ? (
                <TouchableOpacity disabled={accountStatusSaving} onPress={() => confirmAccountStatus(true)} style={[styles.accountAction, styles.accountActionActive]}>
                  <CustomText style={styles.accountActionText}>Activate Account</CustomText>
                </TouchableOpacity>
              ) : (
                <View style={styles.accountActions}>
                  <TouchableOpacity disabled={accountStatusSaving} onPress={() => confirmAccountStatus(false, "resigned")} style={[styles.accountAction, styles.accountActionResigned]}>
                    <CustomText style={styles.accountActionText}>Mark Resigned</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity disabled={accountStatusSaving} onPress={() => confirmAccountStatus(false, "terminated")} style={[styles.accountAction, styles.accountActionTerminated]}>
                    <CustomText style={styles.accountActionText}>Terminate</CustomText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          <View style={styles.switchRow}>
            <View>
              <CustomText style={styles.switchTitle}>
                Lead Pool Restriction
              </CustomText>

              <CustomText style={styles.switchSubTitle}>
                Restrict user from lead pool access
              </CustomText>
            </View>

            <Switch
              trackColor={{
                false: "#CBD5E1",
                true: "#BFDBFE",
              }}
              thumbColor={isPoolRestrict ? "#2563EB" : "#FFFFFF"}
              ios_backgroundColor="#CBD5E1"
              onValueChange={toggleSwitch}
              value={isPoolRestrict}
            />
          </View>

          {isSubSup && params?.item?.status !== "approved" && (
            <View style={styles.actionRow}>
              <CustomBtn
                title="Accept"
                containerStyle={styles.acceptBtn}
                textStyle={styles.acceptBtnText}
                onPress={userApprovedByAdmin}
                isLoading={isLoadingApprove}
              />

              <OutlineBtn
                title="Send to Update"
                onPress={() =>
                  navigate(routeUser.SendToUpdate, {
                    item: params?.item,
                  })
                }
                containerStyle={styles.updateBtn}
                textStyle={styles.updateBtnText}
              />
            </View>
          )}
        </View>

        {/* DETAIL LIST */}
        <FlatList
          data={useDetail}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
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
              return (
                <View style={styles.headingContainer}>
                  <CustomText style={styles.headingText}>
                    {item?.title}
                  </CustomText>
                </View>
              );
            }

            return (
              <View
                style={[
                  styles.infoCard,
                  {
                    marginBottom: item?.mb || 12,
                  },
                ]}
              >
                <View style={[styles.leftSection, { flex: 1 }]}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>
                      {item?.title?.charAt(0)}
                    </CustomText>
                  </View>

                  <View style={{ flex: 1, overflow: "hidden" }}>
                    <CustomText style={styles.label}>{item?.title}</CustomText>

                    {isDevices ? (
                      <View style={styles.actionRowItem}>
                        <View style={{ flex: 1 }}>
                          <CustomText style={styles.value} numberOfLines={3}>
                            {Array.isArray(item?.value)
                              ? item?.value.join(", ")
                              : item?.value || "-"}
                          </CustomText>
                        </View>

                        {isSubSup && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleDeleteDevices}
                            style={styles.actionIcon}
                          >
                            <Feather name="trash-2" size={16} color="#DC2626" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      <View style={styles.valueRow}>
                        <CustomText style={styles.value}>
                          {item?.isDate
                            ? (typeof item?.value === "string" && item.value !== "-" ||
                                typeof item?.value === "number" || item?.value instanceof Date) &&
                              moment(item.value).isValid()
                              ? moment(item.value).format("DD MMM YYYY")
                              : "N/A"
                            : item?.value || "-"}
                        </CustomText>

                        {item?.key === "mobile" && !!item?.value && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleCall(item?.value)}
                            style={styles.actionIcon}
                          >
                            <Feather
                              name="phone-call"
                              size={16}
                              color="#2563EB"
                            />
                          </TouchableOpacity>
                        )}

                        {item?.key === "email" && !!item?.value && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleEmail(item?.value)}
                            style={styles.actionIcon}
                          >
                            <Feather name="mail" size={16} color="#2563EB" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {isAtt.includes(item?.key) && (
                      <View
                        style={{
                          marginTop: 12,
                        }}
                      >
                        <ImageViewModal imagesUri={item?.value} />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* MODAL */}
        <ModalWithBlur visible={openModal?.open}>
          <LeadPoolRestriction
            heading="Lead Pool Restriction"
            subHeadingText="Do you want to restrict this user from the lead pool?"
            onPressSubmit={handleSubmitRestriction}
            onPressCancel={() => toggleModal(" ")}
            isLoading={isSubmitting}
          />
        </ModalWithBlur>
        <ModalWithBlur visible={Boolean(pendingInactiveReason)}>
          <View style={styles.lastWorkingModal}>
            <CustomText style={styles.lastWorkingTitle}>
              {pendingInactiveReason === "resigned" ? "Mark employee resigned" : "Terminate employee"}
            </CustomText>
            <CustomText style={styles.lastWorkingHint}>
              Select the employee's last working day. This field is required.
            </CustomText>
            <DatePickerExpo
              title="Last working day *"
              initialValue={lastWorkingDay ? lastWorkingDay.toISOString() : undefined}
              onSelect={(value: any) => setLastWorkingDay(value ? new Date(value) : null)}
            />
            <View style={styles.lastWorkingActions}>
              <TouchableOpacity
                disabled={accountStatusSaving}
                style={[styles.lastWorkingButton, styles.lastWorkingCancel]}
                onPress={() => {
                  setPendingInactiveReason(null);
                  setLastWorkingDay(null);
                }}
              >
                <CustomText>Cancel</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={accountStatusSaving || !lastWorkingDay}
                style={[styles.lastWorkingButton, styles.lastWorkingConfirm, !lastWorkingDay && { opacity: 0.5 }]}
                onPress={submitInactiveStatus}
              >
                <CustomText style={styles.accountActionText}>
                  {accountStatusSaving ? "Saving..." : "Confirm"}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </ModalWithBlur>
      </View>
    </ContainerHRM>
  );
};

export default UserDetailHRM;

const styles = StyleSheet.create({
  accountSection: {
    paddingBottom: 18,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E6ECF5",
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  accountLabel: { color: "#1E293B", fontSize: 15, fontWeight: "700" },
  accountHint: { color: "#64748B", fontSize: 12, marginTop: 3 },
  accountBadge: {
    backgroundColor: "#EAF6ED",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  accountBadgeInactive: { backgroundColor: "#FFF1E9" },
  accountBadgeText: { color: "#217A3A", fontSize: 12, fontWeight: "700" },
  accountBadgeTextInactive: { color: "#A64B20" },
  accountActions: { flexDirection: "row", gap: 10 },
  accountAction: {
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  accountActionActive: { backgroundColor: "#26754A", alignSelf: "stretch" },
  accountActionResigned: { flex: 1, backgroundColor: "#A86218" },
  accountActionTerminated: { flex: 1, backgroundColor: "#B63B3B" },
  accountActionText: { color: "#fff", fontSize: 13, fontWeight: "700", textAlign: "center" },
  container: {
    flex: 1,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  actionRowItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  attachmentRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  topCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  switchTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },

  switchSubTitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 12,
  },

  acceptBtn: {
    flex: 1,
    borderRadius: 12,
    minHeight: 46,
  },

  acceptBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },

  updateBtn: {
    flex: 1,
    borderRadius: 12,
    minHeight: 46,
  },

  updateBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 260,
  },

  headingContainer: {
    marginTop: 8,
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
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    color: "#2563EB",
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 20,
  },

  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  lastWorkingModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 18,
  },
  lastWorkingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  lastWorkingHint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 18,
  },
  lastWorkingActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  lastWorkingButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  lastWorkingCancel: {
    backgroundColor: "#F1F5F9",
  },
  lastWorkingConfirm: {
    backgroundColor: "#B63B3B",
  },
});
