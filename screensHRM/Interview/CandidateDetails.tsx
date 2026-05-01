import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
  Linking,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useRoute } from "@react-navigation/native";

import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import RowItemDetail from "../../myComponentsHRM/Row/RowItemDetail";
import ImageViewModal from "../../myComponentsHRM/ImageViewModal/ImageViewModal";
import { useGetCandidateDetails } from "../../hooks/useGetQuerryHRM";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { changeInterviewStatus } from "../../services/hrmApi/userHrmApi";
import { myConsole } from "../../hooks/useConsole";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { remarkValidate } from "../../utils/validation";
import { useFormik } from "formik";
import * as Yup from "yup";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import moment from "moment";
import { Feather } from "@expo/vector-icons";

const CandidateDetailsScreen = () => {
  const { params } = useRoute();
  const candidate = params?.item;
  const queryClient = useQueryClient();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loadingStatusUpdate, setLoadingStatusUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data, isLoading, isError, refetch, isFetching } =
    useGetCandidateDetails({ id: candidate?._id });

  const handleSubmitStatus = async () => {
    if (!selectedStatus) return;
    setLoadingStatusUpdate(true);

    try {
      await changeInterviewStatus({
        candidateId: candidate?._id,
        newStatus: selectedStatus,
      });
      await queryClient.invalidateQueries({
        queryKey: ["getCandidateDetails"],
      });
      popUpConfToast.successMessage("Status updated successfully");
      setShowStatusModal(false);
    } catch (err) {
      console.error("Status update failed:", err);
      popUpConfToast.errorMessage("Failed to updated status");
    } finally {
      setLoadingStatusUpdate(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      remark: "",
    },
    validationSchema: Yup.object({
      remark: remarkValidate(false, 5, 20),
    }),
    onSubmit: handleSubmitStatus,
  });

  const detail = data?.data;

  const getDisplayValue = (val: any) => {
    if (!val) return "-";
    if (typeof val === "string") return val;
    if (typeof val === "object" && val?.name) return val.name;
    return JSON.stringify(val);
  };

  const candidateDetails = [
    { title: "Name", value: detail?.name + " " + detail?.lastName },
    { title: "Mobile Number", value: detail?.mobile },
    { title: "Email Address", value: detail?.email },
    { title: "Qualification", value: detail?.qualification },
    { title: "Real Estate Experience", value: detail?.realEstateExperience },
    {
      title: "Referred By",
      value: getDisplayValue(detail?.referredBy),
    },
    { title: "Interview Status", value: detail?.interview?.status },
    {
      title: "Interview Date & Time",
      value: detail?.interview?.interviewDatetime,
      isDate: false,
    },
    {
      title: "Attachments",
      key: "attachments",
      value:
        detail?.cv?.beforeInterview &&
        detail.cv.beforeInterview.startsWith("http")
          ? [detail.cv.beforeInterview]
          : [],
    },
  ];

  const handleCall = async () => {
    if (!detail?.mobile) return;

    await Linking.openURL(`tel:${detail?.mobile}`);
  };

  const handleEmail = async () => {
    if (!detail?.email) return;

    await Linking.openURL(`mailto:${detail?.email}`);
  };

  if (isLoading || isError || !detail) {
    return (
      <ContainerHRM ph={20}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={color.saffronMango}
            style={{ marginTop: 300 }}
          />
        ) : (
          <View style={{ flex: 1, paddingVertical: 250 }}>
            <NoDataFound height={200} width={200} />
          </View>
        )}
      </ContainerHRM>
    );
  }

  return (
    <ContainerHRM
      ph={0}
      isBAck={{
        title: "Candidate Details",
        isStatus: () => setShowStatusModal(true),
      }}
    >
      {/* HEADER CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <CustomText style={styles.avatarText}>
            {detail?.name?.charAt(0)?.toUpperCase()}
          </CustomText>
        </View>

        <View style={{ flex: 1 }}>
          <CustomText style={styles.nameText}>
            {detail?.name} {detail?.lastName}
          </CustomText>

          <CustomText style={styles.roleText}>
            {detail?.qualification || "N/A"}
          </CustomText>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                detail?.interview?.status === "selected"
                  ? "#DCFCE7"
                  : detail?.interview?.status === "rejected"
                    ? "#FEE2E2"
                    : "#FEF3C7",
            },
          ]}
        >
          <CustomText
            style={[
              styles.statusText,
              {
                color:
                  detail?.interview?.status === "selected"
                    ? "#15803D"
                    : detail?.interview?.status === "rejected"
                      ? "#DC2626"
                      : "#B45309",
              },
            ]}
          >
            {detail?.interview?.status || "Pending"}
          </CustomText>
        </View>
      </View>

      <FlatList
        data={candidateDetails}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        renderItem={({ item, index }) => (
          <SlideFadeIn>
            <View style={styles.detailCard}>
              <View style={styles.detailTop}>
                <CustomText style={styles.detailTitle}>
                  {item?.title}
                </CustomText>
              </View>

              {item?.key === "attachments" ? (
                <View style={{ marginTop: 12 }}>
                  <ImageViewModal imagesUri={item?.value} />
                </View>
              ) : (
                <View style={styles.valueRow}>
                  <CustomText style={styles.detailValue}>
                    {item?.isDate
                      ? moment(item?.value).format("DD MMM YYYY, hh:mm A")
                      : item?.value || "-"}
                  </CustomText>

                  {item?.title === "Mobile Number" && (
                    <Pressable onPress={handleCall} style={styles.inlineIcon}>
                      <Feather name="phone-call" size={16} color="#2563EB" />
                    </Pressable>
                  )}

                  {item?.title === "Email Address" && (
                    <Pressable onPress={handleEmail} style={styles.inlineIcon}>
                      <Feather name="mail" size={16} color="#2563EB" />
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </SlideFadeIn>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* STATUS MODAL */}
      <ModalWithBlur
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalContainer}>
          <CustomText style={styles.modalTitle}>
            Update Interview Status
          </CustomText>

          <DropdownRNE
            arrOfObj={[
              { name: "Selected", _id: "selected" },
              { name: "Rejected", _id: "rejected" },
              { name: "Not Coming", _id: "notComing" },
            ]}
            initialValue={selectedStatus}
            keyValueGetOnSelect="_id"
            keyValueShowInBox="name"
            placeholder="Select Status"
            onChange={(val) => setSelectedStatus(val)}
          />

          <CustomInput
            label="Remark"
            placeholder="Enter remark..."
            marginBottom={20}
            numberOfLines={4}
            multiline
            value={formik.values.remark}
            onChangeText={formik.handleChange("remark")}
            onBlur={formik.handleBlur("remark")}
            error={formik.touched.remark && formik.errors.remark}
            containerStyle={{ marginTop: 16 }}
            inputStyle={styles.remarkInput}
          />

          <View style={styles.modalBtnRow}>
            <Pressable
              onPress={() => setShowStatusModal(false)}
              style={styles.cancelBtn}
            >
              <CustomText style={styles.cancelBtnText}>Cancel</CustomText>
            </Pressable>

            <Pressable
              onPress={handleSubmitStatus}
              disabled={loadingStatusUpdate}
              style={[
                styles.submitBtn,
                {
                  opacity: loadingStatusUpdate ? 0.6 : 1,
                },
              ]}
            >
              <CustomText style={styles.submitBtnText}>
                {loadingStatusUpdate ? "Submitting..." : "Submit"}
              </CustomText>
            </Pressable>
          </View>
        </View>
      </ModalWithBlur>
    </ContainerHRM>
  );
};

export default CandidateDetailsScreen;

const styles = StyleSheet.create({
  profileCard: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inlineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2563EB",
  },

  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  roleText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },

  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  detailTop: {
    marginBottom: 10,
  },

  detailTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 22,
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
  },

  remarkInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelBtnText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
  },

  submitBtn: {
    flex: 1,
    backgroundColor: color.saffronMango,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
