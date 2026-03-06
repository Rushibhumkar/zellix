import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import { myConsole } from "../../hooks/useConsole";
import { useGetLeadById, useGetMeeting } from "../../hooks/useCRMgetQuerry";
import useModal from "../../hooks/useModal";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import CustomText from "../../myComponents/CustomText/CustomText";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import RowItem from "../../myComponents/RowItem/RowItem";
import { selectUser, setCallDetect } from "../../redux/userSlice";
import {
  deleteLead,
  leadStatusUpdate,
  useLatestMeetings,
} from "../../services/rootApi/leadApi";
import {
  formatRoleName,
  inLeadStatus,
  leadTypeObj,
  roleEnum,
  statusObj,
  userTypes,
} from "../../utils/data";
import { queryKeyCRM } from "../../utils/queryKeys";
import { routeLead, routeMeeting } from "../../utils/routes";
import AddNote from "./component/AddNote";
import NotesCard from "./component/NotesCard";
import LeadUserInfo from "./component/LeadUserInfo";
import LeadLogsInfo from "./component/LeadLogsInfo";
import TabButton from "./component/TabButton";
import MeetingInfo from "./component/MeetingInfo";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomModal from "../../myComponents/CustomModal/CustomModal";
import CancelIcon from "../../assets/svg/CancelIcon";
import { sendFollowUpNotification } from "../../services/rootApi/notificationApi";
import {
  checkPermission,
  formatDate,
  getInitials,
} from "../../utils/commonFunctions";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { color } from "../../const/color";
import { AntDesign, Feather, Fontisto } from "@expo/vector-icons";
import {
  headerIconWrapperStyle,
  iconWrapperStyle,
  shadowPrimaryColor,
} from "../../const/globalStyle";
import IconWrapper from "../../components/IconWrapper";
import { useAppToast } from "../../components/AppToast";
import { initiateCall } from "../../services/rootApi/callApi";
import AssignmentRow from "./component/AssignmentRow";
import ActionButton from "./component/ActionButton";
import * as Clipboard from "expo-clipboard";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import NotesSection from "./component/NotesSection";

const extractStringObj = (input) => {
  const parsedInput = JSON.parse(input);
  const result = {};
  for (let key in parsedInput) {
    if (parsedInput?.hasOwnProperty(key)) {
      const keyVal = key
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/[^\w\s]/g, "") // Remove non-word characters (like periods)
        .trim(); // Trim any extra spaces

      // Add the transformed key-value pair to the result object
      result[keyVal] = parsedInput[key];
    }
  }
  return result;
};

const formatDateTime = (date, time) => {
  let d = moment(date).format("DD/MM/YYYY") || "N/A";
  let h = moment(time).format("hh:mm A") || "N/A";
  return `${d}, ${h}`;
};

const combineDateAndTime = (dateStr, timeStr) => {
  return moment
    .utc({
      year: moment.utc(dateStr).year(),
      month: moment.utc(dateStr).month(), // 0-indexed (0 = January)
      date: moment.utc(dateStr).date(),
      hour: moment.utc(timeStr).hour(),
      minute: moment.utc(timeStr).minute(),
      second: moment.utc(timeStr).second(),
      millisecond: moment.utc(timeStr).millisecond(),
    })
    .toISOString();
};

const LeadsDetails = () => {
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const { navigate } = useNavigation();
  const { user, lead } = useSelector(selectUser);
  const isSubSupSrMng =
    user?.role === roleEnum?.sub_admin ||
    user?.role === roleEnum?.sup_admin ||
    user?.role === roleEnum?.sr_manager;

  const { params } = useRoute();

  const modalNote = useModal();
  const [activeTab, setActiveTab] = useState(1);
  // let detail = params?.item;
  // let detail = {};
  let details = params?.item;

  let selectLeadType = params?.selectLeadType;
  //detail nam se state btao waha leadDetailById ka data save kro ##start
  // const { data: detail, isLoading: isLoadingQuery } = useGetLeadDetail(params?.item?._id);
  const {
    data: detail,
    isLoading: isLoadingQuery,
    isFetching,
    refetch: refetchLeadDetail,
  } = useGetLeadById(params?.item?._id);

  const useLatest = useLatestMeetings(params?.item?._id);

  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const [timePickerKey, setTimePickerKey] = useState(0);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  //
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState({});
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showChangeStatusPopup, setShowChangeStatusPopup] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    setFields({
      comments: detail?.comments ?? "",
      status: detail?.status ?? "",
      statusInfo: detail?.statusInfo ?? "",
    });
  }, [detail]);

  const [isMailAvail, setIsMailAvail] = useState(false);
  const isAdminOrAssigne =
    user?.role === "sup_admin" ||
    user?.role === "sub_admin" ||
    detail?.assign?._id === user?._id;

  const [noteUpdate, setNoteUpdate] = useState();

  const [tdForFUT, setTdForFUT] = useState({
    date: new Date(),
    time: new Date(),
  });

  const FUTModal = useModal();

  //
  const isLeadEdit =
    (user?.role === roleEnum?.sup_admin ||
      user?.role === roleEnum?.sub_admin) &&
    detail?._id;

  const handleConvertToMeeting = () => {
    navigate(routeMeeting.MeetingsNavigator, {
      params: {
        detail: {
          lead: {
            _id: details?._id,
          },
        },
      },
      screen: routeMeeting.AddMeeting,
      initial: false,
    });
  };

  const handleStatusUpdate = async () => {
    setIsLoading(true);
    try {
      let validate = () => {
        for (const key in fields) {
          if (fields.hasOwnProperty(key)) {
            if (!fields[key]) {
              return false;
            }
          }
        }
        return true;
      };
      if (true) {
        let sendData = {
          ...(fields.comments && { comments: fields.comments }),
          ...(fields.status && { status: fields.status }),
          ...(fields.statusInfo && { statusInfo: fields.statusInfo }),
          ...(fields.status === "followUp_required" && {
            followUpTime: combineDateAndTime(tdForFUT.date, tdForFUT.time),
          }),
        };

        let res = await leadStatusUpdate({
          id: detail?._id,
          data: sendData,
        });

        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getLeadDetailById, detail?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getLead],
        });
        // queryClient.invalidateQueries({
        //   queryKey: [queryKeyCRM.getLead],
        // });
        toast.success(res?.data?.message || "Operation successful");
        // await dispatch(getAllLeadFunc());
        // setIsVisible(true);
        // setMessage(res?.data);
        // navigate(routeLead.allLead);
      }
    } catch (err) {
      myConsole("err in leadStatusUpdate", err);
      toast.error(err?.response?.data ?? "Server error");
    } finally {
      setIsLoading(false);
      FUTModal.closeModal();
    }
  };
  const onChange = (key, value) => {
    setFields((prev) => {
      return { ...prev, [key]: value };
    });
  };
  const openMail = (mailAddress) => {
    MailComposer.composeAsync({
      recipients: [`${mailAddress}`],
    });
  };

  useEffect(() => {
    async function checkAvailabilityMail() {
      let isMailAvailTemp = await MailComposer.isAvailableAsync();
      setIsMailAvail(isMailAvailTemp);
    }
    checkAvailabilityMail();
  }, []);

  const navToCall = async () => {
    await dispatch(
      setCallDetect({
        isCall: true,
        leadId: detail?._id,
      }),
    );
    await Linking.openURL(`tel:+${detail?.clientMobile}`);
  };

  const handleDeleteLead = async () => {
    try {
      setDeleteLoading(true);

      await deleteLead([detail?._id]);

      toast.success("Lead deleted successfully");

      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
      });

      navigate(routeLead.allLead);
    } catch (err: any) {
      toast.error(
        err?.message || err?.response?.data?.message || "Failed to delete lead",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteNotes = async (notesId: any) => {
    try {
      setIsLoadingDelete(notesId);
      await axiosInstance.delete(`api/notes/${detail?._id}/${notesId}`);
      refetchLeadDetail();
    } catch {
      setIsLoadingDelete("");
    } finally {
      setIsLoadingDelete("");
    }
  };

  useEffect(() => {
    if (!!detail?.statusChangedAt) {
      setTdForFUT({
        date: detail?.followUpTime || new Date(),
        time: detail?.followUpTime || new Date(),
      });
    }
  }, [detail?.statusChangedAt]);
  const [notiMsg, setNotiMsg] = useState("");
  const [showNotiPopup, setShowNotiPopup] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!notiMsg.trim()) {
        toast.error("Please enter a message.");
        return;
      }

      setIsNotificationLoading(true);

      let payload = {
        leadId: detail?._id,
        message: notiMsg,
      };

      // API call
      let res = await sendFollowUpNotification(payload);

      // ✅ Extract proper message from response
      const successMsg =
        res?.data?.message || res?.message || "Notification sent successfully!";

      toast.success(successMsg);

      setNotiMsg("");
      setShowNotiPopup(false);

      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLeadDetailById, detail?._id],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
      });
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send notification";
      toast.error(errMsg);
    } finally {
      setIsNotificationLoading(false);
      setNotiMsg("");
      setShowNotiPopup(false);
    }
  };

  const handleChangeStatusSubmit = async () => {
    try {
      if (!fields?.status) {
        toast.error("Please select status.");
        return;
      }

      setStatusLoading(true);

      const payload: any = {
        status: fields.status,
        ...(fields.statusInfo && { statusInfo: fields.statusInfo }),
        ...(fields.status === "followUp_required" && {
          followUpTime: combineDateAndTime(tdForFUT.date, tdForFUT.time),
        }),
      };

      const res = await leadStatusUpdate({
        id: detail?._id,
        data: payload,
      });

      toast.success(res?.data?.message || "Status updated successfully");

      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLeadDetailById, detail?._id],
      });

      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
      });

      setShowChangeStatusPopup(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const { data: permission = {} } = useGetUserPermission(user?._id);

  const canEditLead = checkPermission(permission, "Leads", "edit", user?.role);

  const handleCall = async (leadId: any) => {
    try {
      const res = await initiateCall({ leadId });

      const successMsg =
        res?.message || res?.data?.message || "Call initiated successfully";

      toast.success(successMsg);

      myConsole("Call started", res);
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to initiate call";

      toast.error(errorMsg);

      myConsole("Call failed", err);
    }
  };

  const roundToNext5Min = (date: Date) => {
    const d = new Date(date);
    const minutes = d.getMinutes();
    const remainder = minutes % 5;

    if (remainder !== 0) {
      d.setMinutes(minutes + (5 - remainder));
    }

    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  };

  const handleCopy = async (text: any) => {
    console.log("clieked");
    if (!text) return;
    await Clipboard.setStringAsync(text);
    toast?.success?.("Copied to clipboard");
  };

  const isFUTSubmitDisabled = !tdForFUT?.date || !tdForFUT?.time;

  // 🔥 Activity Summary Data
  const lastActivityTime = detail?.updatedAt || detail?.createdAt;

  const totalCalls = detail?.callLogs?.length || 0;
  const totalNotes = detail?.notes?.length || 0;
  const totalStatusChanges = detail?.statusHistory?.length || 0;

  // myConsole("detailll", detail);
  return (
    <>
      {activeTab === 1 && (
        <Container>
          <CustomModelMessage
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            message={message}
            onClose={() => {
              setIsVisible(false);
              setMessage(null);
            }}
          />
          <Header
            title={
              selectLeadType === "calling_data"
                ? "Calling Data Info"
                : "Lead Details"
            }
            onBack={() => navigate(routeLead.allLead)}
            rightSide={
              <>
                {isLeadEdit && canEditLead && (
                  <TouchableOpacity
                    onPress={() => navigate(routeLead.AddLeads, { detail })}
                    style={{ ...headerIconWrapperStyle }}
                  >
                    <Feather name="edit-2" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowActionsMenu(!showActionsMenu)}
                  style={{ ...headerIconWrapperStyle }}
                >
                  <Feather name="more-vertical" size={18} color="#fff" />
                </TouchableOpacity>
              </>
            }
          />
          <TabButton activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 🔥 Three Dot Action Modal */}
          {showActionsMenu && (
            <TouchableWithoutFeedback onPress={() => setShowActionsMenu(false)}>
              <View style={styles.actionsOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.actionsModal}>
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => {
                        setShowActionsMenu(false);
                        setShowNotiPopup(true);
                      }}
                    >
                      <CustomText style={styles.actionTextItem}>
                        Send Follow Up
                      </CustomText>
                    </TouchableOpacity>
                    {user?._id === detail?.assign?._id && (
                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={handleConvertToMeeting}
                      >
                        <CustomText style={styles.actionTextItem}>
                          Convert to Meeting
                        </CustomText>
                      </TouchableOpacity>
                    )}

                    {/* Change Status */}
                    {isAdminOrAssigne && (
                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => {
                          setShowActionsMenu(false);
                          setShowChangeStatusPopup(true);
                        }}
                      >
                        <CustomText style={styles.actionTextItem}>
                          Change Status
                        </CustomText>
                      </TouchableOpacity>
                    )}
                    {/* <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => {
                        setShowActionsMenu(false);
                      }}
                    >
                      <CustomText style={styles.actionTextItem}>
                        Reassign Data
                      </CustomText>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                      style={[styles.actionItem, { borderBottomWidth: 0 }]}
                      onPress={() => {
                        setShowActionsMenu(false);

                        popUpConfToast.confirmModal({
                          message: "Are you sure you want to delete this lead?",
                          clickOnConfirm: handleDeleteLead,
                        });
                      }}
                    >
                      <CustomText
                        style={[styles.actionTextItem, { color: "#FF3B30" }]}
                      >
                        Delete Data
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          )}

          {/* <----------- Send follow up notification popup---------------> */}
          <ModalWithBlur
            visible={showNotiPopup}
            onClose={() => setShowNotiPopup(false)}
          >
            <View style={styles.modalContent}>
              <CustomText style={styles.title}>
                Send follow up notification
              </CustomText>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 0,
                  right: -16,
                  marginTop: 4,
                }}
                onPress={() => setShowNotiPopup(false)}
              >
                <AntDesign name="close" size={22} color={color.mainTxtColor} />
              </TouchableOpacity>
              <CustomText style={styles.label}>Message</CustomText>
              <TextInput
                style={styles.input}
                multiline
                numberOfLines={4}
                value={notiMsg}
                onChangeText={setNotiMsg}
                placeholderTextColor={color.strokeColor}
                placeholder="Enter your message"
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={isNotificationLoading}
              >
                {isNotificationLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <CustomText style={styles.buttonText}>Submit</CustomText>
                )}
              </TouchableOpacity>
            </View>
          </ModalWithBlur>

          {/* <----------------Change Status popup-------------> */}
          <ModalWithBlur
            visible={showChangeStatusPopup}
            onClose={() => setShowChangeStatusPopup(false)}
          >
            <View style={styles.modalContent}>
              <CustomText style={styles.title}>Change Status</CustomText>

              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 0,
                  right: -16,
                  marginTop: 4,
                }}
                onPress={() => setShowChangeStatusPopup(false)}
              >
                <AntDesign name="close" size={22} color={color.mainTxtColor} />
              </TouchableOpacity>

              <CustomText style={styles.label}>Status</CustomText>

              <DropdownRNE
                placeholder="Select Status"
                arrOfObj={inLeadStatus}
                keyValueGetOnSelect="_id"
                keyValueShowInBox="name"
                initialValue={fields?.status}
                onChange={(v) => onChange("status", v)}
                mode="auto"
                dropdownStyle={{ height: 45 }}
              />

              {fields?.status === "followUp_required" && (
                <View style={{ marginTop: 15 }}>
                  <CustomText style={styles.label}>Follow Up Time</CustomText>

                  <TouchableOpacity
                    onPress={() => FUTModal.openModal()}
                    style={{
                      borderWidth: 1,
                      borderColor: color.borderColor,
                      borderRadius: 12,
                      padding: 12,
                      marginTop: 6,
                    }}
                  >
                    <CustomText>
                      {formatDateTime(tdForFUT.date, tdForFUT.time)}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={handleChangeStatusSubmit}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <CustomText style={styles.buttonText}>Submit</CustomText>
                )}
              </TouchableOpacity>
            </View>
          </ModalWithBlur>

          <ScrollView
            style={{ padding: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={refetchLeadDetail}
              />
            }
          >
            <View style={{ paddingBottom: 150 }}>
              {isLoadingQuery && (
                <ActivityIndicator style={{ marginVertical: 10 }} />
              )}
              {/* -------------------- CARD 1 -------------------- */}
              <View style={styles.card}>
                {/* Top Section */}
                <View style={styles.topRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(detail?.clientName || "")}
                      {/* getinitailsfunco */}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                      {detail?.clientName || "N/A"}
                    </Text>

                    <Text style={styles.subText}>
                      {leadTypeObj[detail?.type]} • {detail?.source}
                    </Text>

                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {statusObj[detail?.status]}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <ActionButton
                    label="Call"
                    icon="phone-call"
                    onPress={() => navToCall()}
                  />
                  <ActionButton
                    label="WhatsApp"
                    icon="message-circle"
                    onPress={() => Linking.openURL(detail?.whatsapp)}
                  />
                  <ActionButton
                    label="Email"
                    icon="mail"
                    onPress={() => openMail(detail?.clientEmail)}
                  />
                  <ActionButton
                    label="SMS"
                    icon="message-square"
                    onPress={() =>
                      Linking.openURL(`sms:${detail?.clientMobile}`)
                    }
                  />
                </View>

                <View style={styles.divider} />

                {/* Mobile */}
                <View style={styles.infoRow}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Feather name="phone" size={18} color="#7A869A" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.label}>MOBILE</Text>
                      <Text style={styles.value}>{detail?.clientMobile}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#9b9b9b18",
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                    onPress={() => handleCopy(detail?.clientMobile)}
                  >
                    <Feather name="copy" size={16} color={"#9b9b9b"} />
                  </TouchableOpacity>
                </View>

                {/* Email */}
                <View style={styles.infoRow}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Feather name="mail" size={18} color="#7A869A" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.label}>EMAIL</Text>
                      <Text style={styles.value}>{detail?.clientEmail}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#9b9b9b18",
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                    onPress={() => handleCopy(detail?.clientEmail)}
                  >
                    <Feather name="copy" size={16} color={"#9b9b9b"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* -------------------- CARD 2 -------------------- */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Assignment Info</Text>
                <View style={styles.divider} />

                <AssignmentRow
                  icon="user"
                  label="Assigned To"
                  value={detail?.assign?.name}
                />
                <AssignmentRow
                  icon="user"
                  label="Assigned By"
                  value={
                    detail?.assignedUsers?.[detail.assignedUsers.length - 1]
                      ?.assignByName || "-"
                  }
                />
                <AssignmentRow
                  icon="calendar"
                  label="Assigned On"
                  value={formatDate(detail?.assignedAt, "dd/mm/yyyy hh:MM")}
                />
                <AssignmentRow
                  icon="briefcase"
                  label="Role"
                  value={formatRoleName(detail?.assign?.role)}
                />
              </View>

              {!!detail?.additionalQuestions && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Additional Questions</Text>
                  <View style={styles.divider} />
                  {Object.entries(
                    extractStringObj(detail?.additionalQuestions),
                  ).map(([key, value], index) => {
                    return (
                      <AssignmentRow
                        key={index}
                        label={key}
                        value={value || "N/A"}
                        icon={null}
                      />
                    );
                  })}
                </View>
              )}

              {/* -------------------- CARD 3 : Activity Summary -------------------- */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Activity Summary</Text>

                <View style={styles.divider} />

                {/* Last Activity */}
                <AssignmentRow
                  icon="clock"
                  label="Last Activity"
                  value={
                    lastActivityTime
                      ? moment(lastActivityTime).fromNow()
                      : "N/A"
                  }
                />

                {/* Total Calls */}
                <AssignmentRow
                  icon="phone"
                  label="Total Calls"
                  value={totalCalls}
                />

                {/* Status Changes */}
                <AssignmentRow
                  icon="refresh-cw"
                  label="Status Updates"
                  value={totalStatusChanges}
                />

                {/* Notes */}
                <AssignmentRow
                  icon="file-text"
                  label="Notes"
                  value={totalNotes}
                />
              </View>

              {detail?.callLogs?.length > 0 && (
                <MainTitle
                  title="Call logs"
                  containerStyle={{ marginBottom: 20 }}
                />
              )}
              {detail?.callLogs?.length > 0 &&
                detail?.callLogs?.map((el, i) => {
                  const duration = moment.duration(el?.duration, "seconds");
                  return (
                    <RowItem
                      key={el?._id || i}
                      title={`Call Info ${i + 1}`}
                      value={`${duration.hours()}:${duration.minutes()}:${duration.seconds()} , ${moment(
                        el?.callTime,
                      ).format("MM-DD-YYYY HH:mm")}`}
                      containerStyle={{ marginBottom: 10 }}
                    />
                  );
                })}
            </View>
          </ScrollView>
        </Container>
      )}

      {/* {activeTab === 2 && (
        <LeadUserInfo
          selectLeadType={selectLeadType}
          leadId={detail?._id}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )} */}

      {activeTab === 2 && (
        <LeadLogsInfo
          selectLeadType={selectLeadType}
          leadId={detail?._id}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      {activeTab === 3 && (
        <MeetingInfo
          selectLeadType={selectLeadType}
          leadId={params?.item?._id}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      {activeTab === 4 && (
        <Container style={{ flex: 1, position: "relative" }}>
          <Header
            title="Lead Details"
            onBack={() => navigate(routeLead.allLead)}
          />
          <TabButton activeTab={activeTab} setActiveTab={setActiveTab} />

          <ScrollView
            style={{ padding: 16, flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={refetchLeadDetail}
              />
            }
          >
            {/* notes */}
            <NotesCard
              noteArr={detail?.notes}
              onEdit={(v) => {
                setNoteUpdate(v);
                modalNote.openModal();
              }}
              onDelete={(i) => {
                deleteNotes(i);
              }}
              isLoadingDelete={isLoadingDelete}
            />
          </ScrollView>
          <TouchableOpacity
            onPress={() => {
              setNoteUpdate({});
              modalNote.openModal();
            }}
            style={{
              position: "absolute",
              bottom: 140,
              right: 20,
              height: 42,
              width: 42,
              borderRadius: 21,
              backgroundColor: color.mainTxtColor,
              justifyContent: "center",
              alignItems: "center",
              ...shadowPrimaryColor,
            }}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </Container>
      )}
      <CustomModal
        visible={FUTModal.visible}
        onClose={FUTModal.closeModal}
        hasBackdrop
      >
        <View
          style={{
            backgroundColor: "white",
            width: 300,
            padding: 20,
            borderRadius: 10,
          }}
        >
          <MainTitle title="Select Date and Time" />
          <View style={{ height: 15 }} />
          <DatePickerExpo
            title="Date"
            minimumDate={new Date()}
            boxContainerStyle={{ marginBottom: 15 }}
            onSelect={(v) => {
              setTdForFUT((prev) => ({
                ...prev,
                date: v || null,
              }));
            }}
            initialValue={tdForFUT.date}
          />
          <DatePickerExpo
            key={timePickerKey}
            title="Time"
            mode="time"
            minuteInterval={5} // 👈 ADD THIS (00,05,10...)
            minimumDate={
              moment(tdForFUT.date).isSame(new Date(), "day")
                ? new Date() // 👈 SAME DAY → past time block
                : undefined
            }
            boxContainerStyle={{ marginBottom: 20 }}
            onSelect={(v) => {
              setTdForFUT((prev) => ({
                ...prev,
                time: v ? roundToNext5Min(new Date(v)) : null,
              }));
            }}
            initialValue={tdForFUT.time}
          />

          <CustomBtn
            title="Submit"
            containerStyle={{
              marginBottom: 20,
              width: 100,
              alignSelf: "center",
            }}
            onPress={handleStatusUpdate}
            isLoading={isLoading}
            textStyle={{ fontSize: 14 }}
            disabled={isFUTSubmitDisabled}
          />
        </View>
      </CustomModal>

      {isAdminOrAssigne && (
        <AddNote
          modal={modalNote}
          leadID={detail?._id}
          refetch={refetchLeadDetail}
          notesId={noteUpdate?.id}
          remark={noteUpdate?.note}
        />
      )}
    </>
  );
};

export default LeadsDetails;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    // padding: 20,
    width: "90%",
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: color.mainTxtColor,
  },
  input: {
    borderWidth: 1,
    borderColor: color.borderColor,
    color: color.mainTxtColor,
    borderRadius: 12,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  button: {
    backgroundColor: color.saffronMango,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  container: {
    padding: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E8EEF7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E67BE",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E67BE",
  },

  subText: {
    fontSize: 14,
    color: "#6B778C",
    marginVertical: 4,
  },

  statusBadge: {
    backgroundColor: "#E6EEF9",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },

  statusText: {
    color: "#2E67BE",
    fontSize: 12,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },

  actionBox: {
    alignItems: "center",
    width: "23%",
  },

  actionIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "#F0F4FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E67BE",
  },

  divider: {
    height: 1,
    backgroundColor: "#E6EAF0",
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },

  label: {
    fontSize: 12,
    color: "#8C97A8",
    letterSpacing: 1,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F3A4A",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E67BE",
  },

  assignmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },

  assignmentLabel: {
    flex: 1,
    marginLeft: 12,
    color: "#6B778C",
    fontSize: 15,
  },

  assignmentValue: {
    fontWeight: "600",
    fontSize: 16,
    color: "#2F3A4A",
  },

  actionsOverlay: {
    position: "absolute",
    top: 90, // adjust if needed
    right: 20,
    left: 0,
    bottom: 0,
    zIndex: 999,
  },

  actionsModal: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  actionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  actionTextItem: {
    fontSize: 15,
    color: color.mainTxtColor,
  },
});
