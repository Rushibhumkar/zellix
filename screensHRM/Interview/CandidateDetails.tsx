import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
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
  myConsole("detailaaa", detail);
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
      ph={20}
      isBAck={{
        title: "Candidate Details",
        isStatus: () => setShowStatusModal(true),
      }}
    >
      <CustomText
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: color.saffronMango,
          marginBottom: 16,
          marginTop: 20,
        }}
      >
        Personal Details
      </CustomText>

      <FlatList
        data={candidateDetails}
        renderItem={({ item }) => (
          <RowItemDetail
            title={item?.title}
            value={item?.value}
            isDate={item?.isDate}
            containerStyle={{ marginBottom: 14 }}
            component={
              item?.key === "attachments" && (
                <ImageViewModal imagesUri={item?.value} />
              )
            }
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListFooterComponent={<View style={{ height: 50 }} />}
      />

      {/* ✅ MODAL START */}
      <ModalWithBlur
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      >
        <CustomText
          style={{
            fontSize: 16,
            fontWeight: "bold",
            borderBottomWidth: 1,
            paddingBottom: 6,
            borderColor: color.saffronMango,
            marginBottom: 14,
          }}
        >
          Status Change
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
          placeholder="Type Here...."
          marginBottom={20}
          numberOfLines={4}
          multiline
          value={formik.values.remark}
          onChangeText={formik.handleChange("remark")}
          onBlur={formik.handleBlur("remark")}
          error={formik.touched.remark && formik.errors.remark}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <Pressable
            onPress={() => setShowStatusModal(false)}
            style={{
              backgroundColor: "red",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmitStatus}
            disabled={loadingStatusUpdate}
            style={{
              backgroundColor: color.saffronMango,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              opacity: loadingStatusUpdate ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {loadingStatusUpdate ? "Submitting..." : "Submit"}
            </Text>
          </Pressable>
        </View>
      </ModalWithBlur>
      {/* ✅ MODAL END */}
    </ContainerHRM>
  );
};

export default CandidateDetailsScreen;
