import {
  FlatList,
  StyleSheet,
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
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import CustomText from "../../myComponents/CustomText/CustomText";
import { shadowPrimaryColor } from "../../const/globalStyle";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import { Feather } from "@expo/vector-icons";
import ActionButton from "../../myComponents/ActionButton";

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
        "Only letters, numbers, and punctuation allowed",
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

        queryClient.invalidateQueries({
          queryKey: ["getAllCandidates"],
        });

        queryClient.invalidateQueries({
          queryKey: ["getCandidateDetails"],
        });

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
        ? "#16A34A"
        : status === "rescheduled"
          ? "#DC2626"
          : status === "selected"
            ? "#7C3AED"
            : color.saffronMango;

    return (
      <SlideFadeIn>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={() => navigate("CandidateDetails", { item })}
        >
          <View style={styles.avatar}>
            <CustomText style={styles.avatarText}>
              {item?.name?.charAt(0)?.toUpperCase()}
            </CustomText>
          </View>

          <View style={styles.infoContainer}>
            <CustomText style={styles.name}>{item?.name}</CustomText>

            <View style={styles.emailRow}>
              <Feather name="mail" size={13} color="#64748B" />

              <CustomText numberOfLines={1} style={styles.email}>
                {item?.email}
              </CustomText>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: `${statusColor}15`,
                },
              ]}
            >
              <CustomText
                style={[
                  styles.status,
                  {
                    color: statusColor,
                  },
                ]}
              >
                {status.charAt(0).toUpperCase() +
                  status.slice(1).toLowerCase().replace(/_/g, " ")}
              </CustomText>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setSelectedInterview(item);
              setShowOptionsModal(true);
            }}
            style={styles.moreBtn}
          >
            <Feather
              name="more-vertical"
              size={18}
              color={color.mainTxtColor}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </SlideFadeIn>
    );
  };

  return (
    <ContainerHRM headingTitle="Interview">
      {/* OPTIONS MODAL */}

      <ModalWithBlur
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalContainer}>
          {["View Details", "Post Interview", "Reschedule", "Delete"].map(
            (option, index) => {
              const iconName =
                option === "View Details"
                  ? "eye"
                  : option === "Post Interview"
                    ? "clipboard"
                    : option === "Reschedule"
                      ? "calendar"
                      : "trash-2";

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={[styles.optionRow, index !== 3 && styles.optionBorder]}
                  onPress={() => {
                    setShowOptionsModal(false);

                    if (option === "View Details") {
                      navigate("CandidateDetails", {
                        item: selectedInterview,
                      });
                    } else if (option === "Post Interview") {
                      navigate("PostIntProcess", {
                        item: selectedInterview,
                      });
                    } else if (option === "Reschedule") {
                      setShowRescheduleModal(true);
                    } else if (option === "Delete") {
                      popupModal2.wantDelete({
                        onConfirm: async () => {
                          try {
                            await deleteInterview(selectedInterview?._id);

                            popUpConfToast.successMessage(
                              "Interview deleted successfully",
                            );

                            await queryClient.invalidateQueries({
                              queryKey: ["getAllCandidates"],
                            });
                          } catch (err) {
                            console.error("Delete failed", err);

                            popUpConfToast.errorMessage(
                              "Failed to delete interview",
                            );
                          }
                        },
                      });
                    }
                  }}
                >
                  <View style={styles.optionLeft}>
                    <Feather
                      name={iconName}
                      size={18}
                      color={
                        option === "Delete" ? "#DC2626" : color.mainTxtColor
                      }
                    />

                    <CustomText
                      style={[
                        styles.optionText,
                        option === "Delete" && {
                          color: "#DC2626",
                        },
                      ]}
                    >
                      {option}
                    </CustomText>
                  </View>

                  <Feather name="chevron-right" size={18} color="#94A3B8" />
                </TouchableOpacity>
              );
            },
          )}
        </View>
      </ModalWithBlur>

      {/* RESCHEDULE MODAL */}

      <ModalWithBlur
        visible={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.rescheduleModal}>
          <CustomText style={styles.modalTitle}>
            Reschedule Interview
          </CustomText>

          <DatePickerExpo
            title="Enter Date & Time"
            initialValue={rescheduleFormik.values.dateTime}
            mode="datetime"
            onSelect={(v) => rescheduleFormik.setFieldValue("dateTime", v)}
            minimumDate={new Date()}
          />

          {rescheduleFormik.touched.dateTime &&
            rescheduleFormik.errors.dateTime && (
              <CustomText style={styles.errorText}>
                {rescheduleFormik.errors.dateTime}
              </CustomText>
            )}

          <CustomInput
            label="Remark"
            placeholder="Type here..."
            containerStyle={{ marginTop: 10 }}
            multiline
            numberOfLines={4}
            value={rescheduleFormik.values.remark}
            onChangeText={rescheduleFormik.handleChange("remark")}
            errors={
              rescheduleFormik.touched.remark && rescheduleFormik.errors.remark
            }
          />
          <View style={styles.buttonRow}>
            <ActionButton
              title="Cancel"
              variant="outline"
              icon="x"
              onPress={() => {
                rescheduleFormik.resetForm();
                setShowRescheduleModal(false);
              }}
              containerStyle={{ marginRight: 10, minHeight: 40 }}
            />

            <ActionButton
              title={rescheduleLoading ? "Submitting..." : "Submit"}
              loading={rescheduleLoading}
              icon="check"
              variant="primary"
              disabled={rescheduleLoading}
              onPress={rescheduleFormik.handleSubmit}
              containerStyle={{ minHeight: 40 }}
            />
          </View>
        </View>
      </ModalWithBlur>

      {/* MAIN CONTENT */}

      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.headerCard}>
          <View>
            <CustomText style={styles.headerTitle}>
              Schedule Interview
            </CustomText>

            <CustomText style={styles.headerSubtitle}>
              Manage and track candidate interviews
            </CustomText>
          </View>

          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => navigate("ScheduleInterview")}
          >
            <Feather name="plus" size={18} color="#fff" />

            <CustomText style={styles.scheduleButtonText}>Schedule</CustomText>
          </TouchableOpacity>
        </View>

        {/* TITLE ROW */}

        <View style={styles.titleRow}>
          <CustomText style={styles.subHeading}>Interviews</CustomText>

          {/* <TouchableOpacity
            style={styles.exportBtn}
            activeOpacity={0.7}
            onPress={handleExportInterviewsExcel}
          >
            <Feather name="download" size={17} color="#fff" />
          </TouchableOpacity> */}
        </View>

        {/* LIST */}

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={color.mainTxtColor}
            style={{
              marginTop: 300,
            }}
          />
        ) : isError ? (
          <View style={styles.noDataWrapper}>
            <NoDataFound height={200} width={200} />
          </View>
        ) : candidates.length === 0 ? (
          <View style={styles.noDataWrapper}>
            <NoDataFound height={200} width={200} />
          </View>
        ) : (
          <FlatList
            data={candidates}
            keyExtractor={(item) => item?._id}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingBottom: 30,
            }}
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
              isFetchingNextPage ? (
                <ActivityIndicator
                  size="small"
                  color={color.mainTxtColor}
                  style={{
                    marginVertical: 12,
                  }}
                />
              ) : null
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingTop: 18,
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 20,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadowPrimaryColor,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: color.saffronMango,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },

  scheduleButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  subHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: color.saffronMango,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadowPrimaryColor,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4338CA",
  },

  infoContainer: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },

  email: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  status: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  moreBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 22,
    overflow: "hidden",
  },

  optionRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  rescheduleModal: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: color.mainTxtColor,
    marginBottom: 16,
  },

  errorText: {
    fontSize: 13,
    color: "#DC2626",
    marginBottom: 10,
    marginTop: -6,
  },

  noDataWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
});
