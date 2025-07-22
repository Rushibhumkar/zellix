import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import { useNavigation } from "@react-navigation/native";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import {
  deleteInterview,
  downloadInterviewsExcel,
} from "../../services/hrmApi/userHrmApi";
import * as Yup from "yup";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useGetAllCandidates } from "../../hooks/useGetQuerryHRM";
import { color } from "../../const/color";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { rescheduleInterview } from "../../services/hrmApi/userHrmApi";
import { useQueryClient } from "@tanstack/react-query";
import { popupModal2 } from "../../utils/toastFunction";
import ExportIcon from "../../assets/svg/ExportIcon";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { useFormik } from "formik";
import { myConsole } from "../../hooks/useConsole";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { checkPermission } from "../../utils/commonFunctions";

const InterviewMain = () => {
  const { navigate } = useNavigation();
  const { user } = useSelector(selectUser);
  const queryClient = useQueryClient();
  const {
    data: candidates,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllCandidates({ search: "" });

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const rescheduleSchema = Yup.object().shape({
    dateTime: Yup.date().required("Select date & time"),
    remark: Yup.string()
      .trim()
      .matches(
        /^[a-zA-Z0-9\s.,'-]+$/,
        "Only letters, numbers, and punctuation allowed"
      )
      .min(5, "Minimum 5 characters required")
      .max(200, "Maximum 200 characters allowed")
      .required("Remark is required"),
  });

  const rescheduleFormik = useFormik({
    initialValues: {
      dateTime: "",
      remark: "",
    },
    validationSchema: rescheduleSchema,
    onSubmit: async (values) => {
      try {
        setRescheduleLoading(true);
        await rescheduleInterview({
          candidateId: selectedInterview?._id,
          stage: "reschedule",
          time: values.dateTime,
          remarks: values.remark,
        });
        popUpConfToast.successMessage("Interview rescheduled successfully!");
        setShowRescheduleModal(false);
        queryClient.invalidateQueries({ queryKey: ["getAllCandidates"] });
        queryClient.invalidateQueries({ queryKey: ["getCandidateDetails"] });
        rescheduleFormik.resetForm();
      } catch (e) {
        console.error(e);
        popUpConfToast.errorMessage("Failed to reschedule");
      } finally {
        setRescheduleLoading(false);
      }
    },
  });

  const handleExportInterviewsExcel = async () => {
    try {
      const excelData = await downloadInterviewsExcel();

      const base64Data = excelData?.file?.split(",")[1] || "";
      const fileName = "interviews.xlsx";
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        popUpConfToast.errorMessage("Sharing not available on this device");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Share Interviews Excel",
        UTI: "com.microsoft.excel.xlsx",
      });

      popUpConfToast.successMessage(`Exported successfully!`);
    } catch (error) {
      console.error("Export failed", error);
      popUpConfToast.errorMessage("Failed to export Excel file");
    }
  };

  const renderItem = ({ item }) => {
    const status = item?.interview?.status || "pending";
    const statusColor =
      status === "scheduled"
        ? "green"
        : status === "rescheduled"
        ? "red"
        : status === "selected"
        ? "#8e44ad"
        : color.saffronMango;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigate("CandidateDetails", { item })}
        >
          <Text style={styles.name}>{item?.name}</Text>
          <Text style={styles.email}>{item?.email}</Text>
        </TouchableOpacity>
        <Text style={[styles.status, { color: statusColor }]}>
          {status.charAt(0).toUpperCase() +
            status.slice(1).toLowerCase().replace(/_/g, " ")}
        </Text>

        <TouchableOpacity
          onPress={() => {
            setSelectedInterview(item);
            setShowOptionsModal(true);
          }}
        >
          <Text style={styles.more}>More</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <ContainerHRM>
      <ModalWithBlur
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
      >
        {["View Details", "Post Interview", "Reschedule", "Delete"].map(
          (option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setShowOptionsModal(false);
                if (option === "View Details")
                  navigate("CandidateDetails", { item: selectedInterview });
                else if (option === "Post Interview")
                  navigate("PostIntProcess", { item: selectedInterview });
                else if (option === "Reschedule") {
                  setShowOptionsModal(false);
                  setShowRescheduleModal(true);
                } else if (option === "Delete") {
                  popupModal2.wantDelete({
                    onConfirm: async () => {
                      try {
                        await deleteInterview(selectedInterview?._id);
                        popUpConfToast.successMessage(
                          "Interview deleted successfully"
                        );
                        // Popup.hide();
                        await queryClient.invalidateQueries({
                          queryKey: ["getAllCandidates"],
                        });
                      } catch (err) {
                        console.error("Delete failed", err);
                        popUpConfToast.errorMessage(
                          "Failed to delete interview"
                        );
                      }
                    },
                  });
                }
              }}
              style={{
                paddingVertical: 12,
                borderBottomWidth: index !== 3 ? 1 : 0,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontSize: 16, textAlign: "center" }}>
                {option}
              </Text>
            </TouchableOpacity>
          )
        )}
        <TouchableOpacity
          style={{
            alignSelf: "flex-end",
            backgroundColor: color.saffronMango,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
          onPress={() => setShowOptionsModal(false)}
        >
          <Text style={{ color: "#fff" }}>Cancel</Text>
        </TouchableOpacity>
      </ModalWithBlur>

      <ModalWithBlur
        visible={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
      >
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Reschedule Time
          </Text>
          <DatePickerExpo
            title="Enter Date & Time"
            initialValue={rescheduleFormik.values.dateTime}
            mode="datetime"
            onSelect={(v) => rescheduleFormik.setFieldValue("dateTime", v)}
            minimumDate={new Date()}
          />
          {rescheduleFormik.touched.dateTime &&
            rescheduleFormik.errors.dateTime && (
              <Text style={[styles.errorText, { marginBottom: 14 }]}>
                {rescheduleFormik.errors.dateTime}
              </Text>
            )}
          <CustomInput
            label="Remark"
            placeholder="Type here..."
            multiline
            numberOfLines={4}
            value={rescheduleFormik.values.remark}
            onChangeText={rescheduleFormik.handleChange("remark")}
            errors={
              rescheduleFormik.touched.remark && rescheduleFormik.errors.remark
            }
          />
          <CustomBtn
            title={rescheduleLoading ? "Submitting..." : "Submit"}
            disabled={rescheduleLoading}
            onPress={rescheduleFormik.handleSubmit}
          />
          <CustomBtn
            title="Cancel"
            onPress={() => setShowRescheduleModal(false)}
            containerStyle={{
              backgroundColor: "red",
              marginTop: 4,
            }}
            titleStyle={{ color: "white" }}
          />
        </View>
      </ModalWithBlur>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Schedule Interview</Text>
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => navigate("ScheduleInterview")}
          >
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={styles.subHeading}>Interviews</Text>
          <TouchableOpacity activeOpacity={0.6} onPress={() => null}>
            <ExportIcon />
          </TouchableOpacity>
        </View>

        {/* List */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={color.saffronMango}
            style={{ marginTop: 300 }}
          />
        ) : isError ? (
          <View style={{ flex: 1, paddingVertical: 200 }}>
            <NoDataFound height={200} width={200} />
          </View>
        ) : (
          <FlatList
            data={candidates}
            keyExtractor={(item) => item?._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["getAllCandidates"],
                  })
                }
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? <ActivityIndicator size="small" /> : null
            }
          />
        )}
      </View>
    </ContainerHRM>
  );
};

export default InterviewMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: `#fff`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.saffronMango,
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#4a3c1a",
  },
  scheduleButton: {
    backgroundColor: color.saffronMango,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  scheduleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 0.7,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    fontWeight: "600",
    fontSize: 15,
  },
  email: {
    fontSize: 13,
    color: "#666",
  },
  status: {
    marginHorizontal: 10,
    fontWeight: "bold",
    marginRight: 40,
  },
  more: {
    color: "#333",
    textDecorationLine: "underline",
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginBottom: 10,
  },
});
