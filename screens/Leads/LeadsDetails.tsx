import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  AppState,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import { myConsole } from "../../hooks/useConsole";
import { useGetLeadById } from "../../hooks/useCRMgetQuerry";
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
  leadStatusUpdate,
  useLatestMeetings,
} from "../../services/rootApi/leadApi";
import {
  FOLLOWUP_REQUIRED_STATUSES,
  formatRoleName,
  inLeadStatus,
  NOTE_REQUIRED_STATUSES,
  roleEnum,
  statusObj,
} from "../../utils/data";
import { queryKeyCRM } from "../../utils/queryKeys";
import { routeLead, routeMeeting } from "../../utils/routes";
import AddNote from "./component/AddNote";
import NotesCard from "./component/NotesCard";
import TabButton from "./component/TabButton";
import MeetingInfo from "./component/MeetingInfo";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomModal from "../../myComponents/CustomModal/CustomModal";
import { sendFollowUpNotification } from "../../services/rootApi/notificationApi";
import {
  checkPermission,
  formatDate,
  getInitials,
  truncateString,
} from "../../utils/commonFunctions";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { color } from "../../const/color";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import {
  headerIconWrapperStyle,
  shadowPrimaryColor,
} from "../../const/globalStyle";
import { useAppToast } from "../../components/AppToast";
import { initiateCall } from "../../services/rootApi/callApi";
import AssignmentRow from "./component/AssignmentRow";
import ActionButton from "./component/ActionButton";
import * as Clipboard from "expo-clipboard";
import { useFormik } from "formik";
import { changeStatusSchema } from "../../utils/validation";
import { createCallLog } from "../../services/rootApi/callLogsApi";
import CelebrationModal from "./component/CelebrationModal";

const extractStringObj = (input: any) => {
  try {
    const parsedInput = typeof input === "string" ? JSON.parse(input) : input;

    // ✅ New Format -> Array
    if (Array.isArray(parsedInput)) {
      return parsedInput.map((obj) => {
        const formattedObj = {};
        let createdAt = obj?._at || null;

        Object.keys(obj || {}).forEach((key) => {
          if (key !== "_at") {
            const formattedKey = key
              .replace(/_/g, " ")
              .replace(/[^\w\s]/g, "")
              .trim();

            formattedObj[formattedKey] = obj[key];
          }
        });

        return {
          questions: formattedObj,
          createdAt,
        };
      });
    }

    // ✅ Old Format -> Object
    const result = {};

    for (let key in parsedInput) {
      if (parsedInput?.hasOwnProperty(key)) {
        const keyVal = key
          .replace(/_/g, " ")
          .replace(/[^\w\s]/g, "")
          .trim();

        result[keyVal] = parsedInput[key];
      }
    }

    return [
      {
        questions: result,
        createdAt: parsedInput?._at || null,
      },
    ];
  } catch (err) {
    return [];
  }
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
  const navigation = useNavigation();
  const { navigate } = useNavigation();
  const { user, lead } = useSelector(selectUser);

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStatus, setCelebrationStatus] = useState<string>("");

  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  const appState = useRef(AppState.currentState);

  const [isCallTracking, setIsCallTracking] = useState(false);

  const [isDialerOpened, setIsDialerOpened] = useState(false);

  const isDialerOpenedRef = useRef(false);

  const isCallTrackingRef = useRef(false);

  const isCallLogSentRef = useRef(false);

  const callStartTimeRef = useRef<number | null>(null);

  const isSubSupSrMng =
    user?.role === roleEnum?.sub_admin ||
    user?.role === roleEnum?.sup_admin ||
    user?.role === roleEnum?.sr_manager;

  const { params } = useRoute();

  const shouldTriggerCall = params?.triggerCall;

  const modalNote = useModal();
  const [activeTab, setActiveTab] = useState(1);
  // let detail = params?.item;
  // let detail = {};
  let details = params?.item;

  let selectLeadType = params?.selectLeadType ?? detail?.type ?? details?.type;

  const from = params?.from;
  const remindersActiveTab = params?.remindersActiveTab;
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

  const [callMeta, setCallMeta] = useState<{
    initiatedAt: number | null;
    finishedAt: number | null;
  } | null>(null);

  //
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState({});
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null);
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
    user?.role === "sr_manager" ||
    user?.role === "team_lead" ||
    user?.role === "sub_admin" ||
    detail?.assign?._id === user?._id;

  const [noteUpdate, setNoteUpdate] = useState<any>(null);

  const [tdForFUT, setTdForFUT] = useState({
    date: null,
    time: null,
  });

  const FUTModal = useModal();

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

  const handleCelebrationCreateMeeting = () => {
    setShowCelebration(false);
    navigate(routeMeeting.MeetingsNavigator, {
      params: {
        detail: {
          lead: { _id: detail?._id },
          status: celebrationStatus,
          userId: user?._id,
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
    try {
      //console.log("1. Call Icon Clicked");

      await dispatch(
        setCallDetect({
          isCall: true,
          leadId: detail?._id,
        }),
      );

      console.log("2. setCallDetect completed");

      setIsDialerOpened(true);

      isDialerOpenedRef.current = true;

      // console.log("3. isDialerOpened set to TRUE");

      //console.log("4. Opening Dialer...");

      // await Linking.openURL(`tel:+${917972755589}`);
      await Linking.openURL(`tel:+${detail?.clientMobile}`);
      // await Linking.openURL(`tel:+${918097097583}`);

      //console.log("5. Linking.openURL executed");
    } catch (err) {
      console.log("❌ Call error", err);
    }
  };

  useEffect(() => {
    //console.log("🟢 AppState Listener Mounted");

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // console.log("━━━━━━━━━━━━━━━━━━━━━━");
      // console.log("📱 AppState Changed");
      // console.log("Previous State =>", appState.current);
      // console.log("Next State =>", nextAppState);
      // console.log("isDialerOpened =>", isDialerOpened);
      // console.log("isCallTracking =>", isCallTracking);
      // console.log("callStartTime =>", callStartTime);

      // App moved to background AFTER user clicked CALL
      if (isDialerOpenedRef.current && nextAppState === "background") {
        // console.log("✅ CALL START DETECTED");

        isCallLogSentRef.current = false;

        const startTime = Date.now();

        setCallStartTime(startTime);

        callStartTimeRef.current = startTime;

        setCallMeta({
          initiatedAt: startTime,
          finishedAt: null,
        });

        setIsCallTracking(true);

        isCallTrackingRef.current = true;

        setIsDialerOpened(false);

        isDialerOpenedRef.current = false;

        setIsDialerOpened(false);

        // console.log("✅ isCallTracking TRUE");
        // console.log("✅ isDialerOpened FALSE");
      }

      // User returned to app
      if (appState.current === "background" && nextAppState === "active") {
        console.log("🟡 APP RETURNED TO FOREGROUND");
        console.log("CURRENT APP STATE =>", nextAppState);
        if (callStartTimeRef.current && isCallTrackingRef.current) {
          const endTime = Date.now();

          setCallMeta((prev) =>
            prev
              ? {
                  ...prev,
                  finishedAt: endTime,
                }
              : null,
          );

          console.log("⏱️ Timer Ended At =>", endTime);

          const durationInSeconds = Math.floor(
            (endTime - callStartTimeRef.current) / 1000,
          );

          // console.log(
          //   "🔥 Actual Call Duration In Seconds =>",
          //   durationInSeconds,
          // );

          // console.log("✅ Opening Change Status Popup");

          setShowChangeStatusPopup(true);

          setCallStartTime(null);

          setIsCallTracking(false);

          // console.log("✅ Timer Reset Done");
        } else {
          console.log("❌ No active call tracking found");
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      console.log("🔴 AppState Listener Removed");

      subscription.remove();
    };
  }, [callStartTime, isCallTracking, isDialerOpened]);

  useEffect(() => {
    if (shouldTriggerCall && detail?._id) {
      navToCall();
    }
  }, [shouldTriggerCall, detail?._id]);

  const deleteNotes = async (notesId: any) => {
    try {
      setIsLoadingDelete(notesId);

      const res = await axiosInstance.delete(
        `api/lead/notes/${detail?._id}/${notesId}`,
      );

      toast.success(res?.data?.message || "Note deleted successfully");

      refetchLeadDetail();
    } catch (err: any) {
      myConsole("errrrr", err);
      toast.error(err?.response?.data?.message || "Failed to delete note");
    } finally {
      setIsLoadingDelete("");
    }
  };

  const hitCreateCallLog = async (statusAfterCall?: string) => {
    console.log("hitcreatecalllogs");

    // ✅ STOP duplicate calls
    if (isCallLogSentRef.current) return;

    try {
      if (!callMeta?.initiatedAt || !callMeta?.finishedAt) return;

      const durationInSec = Math.floor(
        (callMeta.finishedAt - callMeta.initiatedAt) / 1000,
      );

      let callType: "not_connected" | "positive" | "negative" | "connected" =
        "connected";

      // ❌ very short call
      if (durationInSec < 12) {
        callType = "not_connected";
      }

      // ✅ status based
      if (statusAfterCall) {
        const positiveStatuses = [
          "deal_booked",
          "active_hot",
          "meeting_done",
          "meeting_scheduled",
          "claimed",
          "followUp_required",
          "call_back",
          "active_cold",
          "nr_event",
          "assign",
          "re_assigned",
        ];

        const negativeStatuses = [
          "not_interested",
          "not_interested_buy_later",
          "lost",
          "disqualified",
          "wrong_details",
          "deal_cancelled",
          "not_able_to_connect",
          "no_response",
          "broker",
        ];

        const neutralStatuses = [
          "followUp_required",
          "call_back",
          "active_cold",
          "nr_event",
          "assign",
          "re_assigned",
        ];

        if (positiveStatuses.includes(statusAfterCall)) {
          callType = "positive";
        } else if (negativeStatuses.includes(statusAfterCall)) {
          callType = "negative";
        } else if (neutralStatuses.includes(statusAfterCall)) {
          callType = "connected";
        }
      }

      // ❌ cancel case
      if (!statusAfterCall && durationInSec >= 12) {
        callType = "connected";
      }

      isCallLogSentRef.current = true; // ✅ lock

      const res = await createCallLog({
        userId: user?._id,
        leadId: detail?._id,
        type: callType,
        initiatedAt: new Date(callMeta.initiatedAt).toISOString(),
        finishedAt: new Date(callMeta.finishedAt).toISOString(),
        ...(statusAfterCall && { leadStatusAfterCall: statusAfterCall }),
      });

      // myConsole("ressssssss", res);

      if (res?.success) {
        toast.success(res?.message || "Call log created successfully");

        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getLeadDetailById, detail?._id],
        });

        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getLead],
        });

        queryClient.invalidateQueries({
          queryKey: ["getLeadCallReports"],
        });

        refetchLeadDetail();
      } else {
        toast.error(res?.message || "Failed to create call log");
      }

      setCallMeta(null);
    } catch (err: any) {
      console.log("❌ createCallLog error", err);

      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while creating call log";

      toast.error(errMsg);
    }
  };

  // useEffect(() => {
  //   if (!!detail?.statusChangedAt) {
  //     setTdForFUT({
  //       date: detail?.followUpTime || null,
  //       time: detail?.followUpTime || null,
  //     });
  //   }
  // }, [detail?.statusChangedAt]);

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

      if (selectLeadType !== "calling_data") {
        if (
          NOTE_REQUIRED_STATUSES.includes(fields.status) &&
          !formik.values.note?.trim()
        ) {
          toast.error("Note is required for this status.");
          return;
        }

        if (
          fields?.status &&
          FOLLOWUP_REQUIRED_STATUSES.includes(fields.status) &&
          (!tdForFUT?.date || !tdForFUT?.time)
        ) {
          toast.error("Follow up time is required for this status.");
          return;
        }
      }

      setStatusLoading(true);

      const payload = {
        status: fields.status,
        ...(fields.statusInfo && { statusInfo: fields.statusInfo }),
        ...(formik.values.note && { note: formik.values.note }),
        ...(tdForFUT?.date &&
          tdForFUT?.time && {
            followUpTime: combineDateAndTime(tdForFUT.date, tdForFUT.time),
          }),
      };
      // myConsole("payloadddd", payload);
      const res = await leadStatusUpdate({
        id: detail?._id,
        data: payload,
      });
      // myConsole("ressssss", res);
      setTdForFUT({ date: null, time: null });
      formik.resetForm();
      setFields((prev) => ({
        ...prev,
        statusInfo: "",
      }));

      toast.success(res?.data?.message || "Status updated successfully");

      if (
        fields.status === "meeting_scheduled" ||
        fields.status === "meeting_done"
      ) {
        setCelebrationStatus(fields.status);
        setShowCelebration(true);
      }

      await hitCreateCallLog(fields.status);
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLeadDetailById, detail?._id],
      });

      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
      });

      await queryClient.refetchQueries({ queryKey: ["all-reminders"] });

      FUTModal.closeModal();
      setShowActionsMenu(false);
      setShowChangeStatusPopup(false);
      setStatusLoading(false);
    } catch (err: any) {
      myConsole("errrrrr", err);
      toast.error(err?.response?.data?.message || "Failed to update status");
      FUTModal.closeModal();
      setShowActionsMenu(false);
      setShowChangeStatusPopup(false);
      setStatusLoading(false);
      setTdForFUT({ date: null, time: null });
      formik.resetForm();
      setFields((prev) => ({
        ...prev,
        statusInfo: "",
      }));
    } finally {
      FUTModal.closeModal();
      setShowActionsMenu(false);
      setShowChangeStatusPopup(false);
      setStatusLoading(false);
      setTdForFUT({ date: null, time: null });
      formik.resetForm();
      setFields((prev) => ({
        ...prev,
        statusInfo: "",
      }));
    }
  };

  const formik = useFormik({
    initialValues: {
      status: fields?.status || "",
      note: "",
    },
    enableReinitialize: true,
    validationSchema: changeStatusSchema,
    onSubmit: (values) => {
      setFields((prev) => ({
        ...prev,
        status: values.status,
        comments: values.note,
      }));
      handleChangeStatusSubmit();
    },
  });

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
    if (!text) return;
    await Clipboard.setStringAsync(text);
    toast?.success?.("Copied to clipboard");
  };

  const isFUTSubmitDisabled = !tdForFUT?.date || !tdForFUT?.time;

  // 🔥 Activity Summary Data
  const lastActivityTime = detail?.updatedAt || detail?.createdAt;

  const totalCalls = detail?.callCount || 0;
  const totalNotes = detail?.notes?.length || 0;
  const totalStatusChanges = detail?.statusHistory?.length || 0;

  const filteredLeadStatus = inLeadStatus.filter(
    (s) => s._id !== "assign" && s._id !== "re_assigned",
  );

  const unActionableStatuses = ["claimed", "assign", "re_assigned", "new"];

  const handleChangeStatusToClaim = async (id: any) => {
    try {
      const payload = {
        status: "claimed",
      };

      const res = await leadStatusUpdate({
        id,
        data: payload,
      });

      toast.success(res?.data?.message || "Status updated successfully");

      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLeadDetailById, id],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const isSubmitDisabled =
    selectLeadType !== "calling_data" &&
    ((fields?.status &&
      NOTE_REQUIRED_STATUSES.includes(fields.status) &&
      !formik.values.note?.trim()) ||
      (fields?.status &&
        FOLLOWUP_REQUIRED_STATUSES.includes(fields.status) &&
        (!tdForFUT?.date || !tdForFUT?.time)));

  useEffect(() => {
    if (showChangeStatusPopup) {
      setShowActionsMenu(false);
    }
  }, [showChangeStatusPopup]);

  useEffect(() => {
    return () => {
      // ✅ app unmount / kill
      if (callMeta?.initiatedAt && callMeta?.finishedAt) {
        hitCreateCallLog();
      }
    };
  }, [callMeta]);

  useEffect(() => {
    if (!showChangeStatusPopup) {
      FUTModal.closeModal(); // ✅ ensure closed
    }
  }, [showChangeStatusPopup]);

  const hasValidAdditionalQuestionsV2 =
    Array.isArray(detail?.additionalQuestionsV2) &&
    detail.additionalQuestionsV2.some(
      (item) => Array.isArray(item?.questions) && item.questions.length > 0,
    );

  const additionalQuestionsData = hasValidAdditionalQuestionsV2
    ? detail.additionalQuestionsV2
    : detail?.additionalQuestions
      ? extractStringObj(detail.additionalQuestions)
      : [];

  const showContactDetails =
    user?.role === roleEnum?.sup_admin || user?.role === roleEnum?.sub_admin;

  const canShowContactDetails =
    !["assign", "new", "re_assigned"].includes(detail?.status) ||
    user?.role === roleEnum?.sup_admin ||
    user?.role === roleEnum?.sub_admin;

  // myConsole("tdForFUTtt", tdForFUT);
  // myConsole("detail?", detail);
  // myConsole("additionalQuestions =>", detail?.additionalQuestions);
  // myConsole("additionalQuestionsv2 =>", detail?.additionalQuestionsV2);

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
              (selectLeadType ?? detail?.type ?? details?.type) ===
              "calling_data"
                ? "Calling Data Info"
                : "Lead Details"
            }
            onBack={() => {
              if (from === "reminders") {
                navigation.navigate("Reminders", {
                  remindersActiveTab,
                });
              } else if (from === "callLogs") {
                navigation.goBack();
              } else {
                navigate(routeLead.allLead, {
                  tabType: selectLeadType ?? detail?.type ?? details?.type,
                });
              }
            }}
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
          {showActionsMenu && !showChangeStatusPopup && !FUTModal.visible && (
            <TouchableWithoutFeedback onPress={() => setShowActionsMenu(false)}>
              <View style={styles.actionsOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.actionsModal}>
                    {user?._id !== detail?.assign?._id &&
                      user?.role !== roleEnum.agent && (
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
                      )}
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
                          setTdForFUT({ date: null, time: null }); // reset
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
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          )}

          {/* <----------- Send follow up notification popup ---------------> */}
          <ModalWithBlur
            visible={showNotiPopup}
            onClose={() => setShowNotiPopup(false)}
          >
            <View style={styles.modalContent}>
              <CustomText style={styles.title}>
                Send follow up notification
              </CustomText>
              {/* <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 0,
                  right: 6,
                  marginTop: 0,
                }}
                onPress={() => {
                  setShowNotiPopup(false);
                  // hitCreateCallLog();
                }}
              >
                <AntDesign name="close" size={22} color={color.mainTxtColor} />
              </TouchableOpacity> */}
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
                  <ActivityIndicator color={"white"} />
                ) : (
                  <CustomText style={styles.buttonText}>Submit</CustomText>
                )}
              </TouchableOpacity>
            </View>
          </ModalWithBlur>

          {/* <---------------- Change Status popup -------------> */}
          <ModalWithBlur
            visible={showChangeStatusPopup}
            onClose={() => {
              setShowChangeStatusPopup(false);
              hitCreateCallLog();

              FUTModal.closeModal();
            }}
            minHeight={"55%"}
          >
            <View style={styles.modalContent}>
              <CustomText style={styles.title}>Change Status</CustomText>

              {/* <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 0,
                  right: -16,
                  marginTop: 4,
                }}
                onPress={() => {
                  setShowChangeStatusPopup(false);
                  hitCreateCallLog();
                }}
              >
                <AntDesign name="close" size={22} color={color.mainTxtColor} />
              </TouchableOpacity> */}

              <DropdownRNE
                placeholder="Select Status"
                arrOfObj={filteredLeadStatus}
                keyValueGetOnSelect="_id"
                keyValueShowInBox="name"
                initialValue={fields?.status}
                onChange={(v) => onChange("status", v)}
                mode="auto"
                dropdownStyle={{ height: 45 }}
                disabledItems={["claimed", "assign", "re_assigned"]}
              />
              {!!fields?.status && fields?.status !== "claimed" && (
                <>
                  <View style={{ marginTop: 15 }}>
                    <CustomText style={styles.label}>
                      Follow Up Time{" "}
                      {fields?.status &&
                        FOLLOWUP_REQUIRED_STATUSES.includes(fields.status) && (
                          <CustomText style={{ color: "red" }}> *</CustomText>
                        )}
                    </CustomText>

                    <TouchableOpacity
                      onPress={() => {
                        FUTModal.openModal();
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: color.borderColor,
                        borderRadius: 12,
                        padding: 12,
                        marginTop: 6,
                      }}
                    >
                      <CustomText style={{ color: color.mainTxtColor }}>
                        {tdForFUT?.date && tdForFUT?.time
                          ? formatDateTime(tdForFUT.date, tdForFUT.time)
                          : "Select Date & Time"}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                  <CustomInput
                    label={
                      <>
                        Notes
                        {fields?.status &&
                          NOTE_REQUIRED_STATUSES.includes(fields.status) && (
                            <CustomText style={{ color: "red" }}> *</CustomText>
                          )}
                      </>
                    }
                    value={formik.values.note}
                    onChangeText={formik.handleChange("note")}
                    errors={formik.touched.note && formik.errors.note}
                    onBlur={formik.handleBlur("note")}
                    placeholder="Add note"
                    multiline
                    numberOfLines={3}
                    marginBottom={10}
                    // inputContainerStyle={{
                    //   // height: 160,
                    //   backgroundColor: "red",
                    //   alignSelf: "flex-start",
                    // }}
                    containerStyle={{ marginTop: 8 }}
                    inputStyle={{ height: 140 }}
                  />
                  <CustomModal
                    visible={FUTModal.visible}
                    onClose={FUTModal.closeModal}
                    hasBackdrop
                  >
                    <View
                      style={{
                        backgroundColor: "white",
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
                          marginTop: 20,
                          // width: 100,
                          // alignSelf: "center",
                        }}
                        onPress={() => {
                          FUTModal.closeModal(); // ✅ only close modal, no API call
                        }}
                        isLoading={isLoading}
                        textStyle={{ fontSize: 14 }}
                        disabled={isFUTSubmitDisabled}
                      />
                    </View>
                  </CustomModal>
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    marginTop: 20,
                    backgroundColor: isSubmitDisabled
                      ? color.primaryFade
                      : color.mainTxtColor,
                  },
                ]}
                onPress={handleChangeStatusSubmit}
                disabled={statusLoading || isSubmitDisabled}
              >
                {statusLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <CustomText
                    style={[
                      styles.buttonText,
                      {
                        color: isSubmitDisabled
                          ? color.mainTxtColorFade
                          : color.white,
                      },
                    ]}
                  >
                    Submit
                  </CustomText>
                )}
              </TouchableOpacity>
            </View>
          </ModalWithBlur>

          <ScrollView
            style={{
              paddingHorizontal: 12,
              paddingVertical: 20,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={refetchLeadDetail}
              />
            }
          >
            <View style={{ paddingBottom: 150 }}>
              {isLoadingQuery && (
                <ActivityIndicator
                  style={{ marginVertical: 10 }}
                  color={color.mainTxtColor}
                />
              )}
              {/* -------------------- CARD 1 -------------------- */}
              {detail && (
                <View
                  style={[
                    styles.card,
                    detail?.isDuplicate && styles.duplicateCard,
                  ]}
                >
                  {/* Top Section */}
                  <View style={styles.topRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitials(detail?.clientName || "")}
                      </Text>
                    </View>

                    <View style={{ flex: 1, maxWidth: "70%" }}>
                      <Text style={styles.name}>
                        {detail?.clientName || "N/A"}
                      </Text>

                      {!!detail?.isDuplicate && (
                        <View style={styles.detailDuplicateBadge}>
                          <Feather name="copy" size={12} color="#FACC15" />

                          <Text style={styles.detailDuplicateText}>
                            Duplicate Lead
                          </Text>
                        </View>
                      )}

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        {!!detail?.source && (
                          <Text style={styles.subText}>
                            {detail?.source} {`•`}
                          </Text>
                        )}
                        {!!detail?.name && (
                          <Text style={[styles.subText, { fontSize: 13 }]}>
                            {truncateString(detail?.name, 32)}
                          </Text>
                        )}
                      </View>
                      {detail && (
                        <TouchableOpacity
                          style={styles.statusBadge}
                          onPress={() => setShowChangeStatusPopup(true)}
                          disabled={["assign", "new", "re_assigned"].includes(
                            detail?.status,
                          )}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: [
                                  "assign",
                                  "new",
                                  "re_assigned",
                                ].includes(detail?.status)
                                  ? color.mainTxtColorFade
                                  : "#2E67BE",
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {statusObj[detail?.status]}
                          </Text>
                          {!["assign", "new", "re_assigned"].includes(
                            detail?.status,
                          ) && (
                            <MaterialIcons
                              name="change-circle"
                              size={20}
                              color={color.mainTxtColor}
                            />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                    {/* <TouchableOpacity
                    style={{
                      ...headerIconWrapperStyle,
                      backgroundColor: `${color.mainTxtColor}10`,
                      position: "absolute",
                      top: 0,
                      right: 0,
                    }}
                    onPress={() => setShowChangeStatusPopup(true)}
                  >
                    <MaterialIcons
                      name="change-circle"
                      size={24}
                      color={color.mainTxtColor}
                    />
                  </TouchableOpacity> */}
                  </View>
                  {(detail?.status === "assign" ||
                    detail?.status === "re_assigned" ||
                    detail?.status === "new") && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: color.mainTxtColor,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 12,
                        borderRadius: 12,
                        marginTop: 8,
                      }}
                      onPress={() => handleChangeStatusToClaim(detail?._id)}
                    >
                      <CustomText
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                      >
                        Claim Lead
                      </CustomText>
                    </TouchableOpacity>
                  )}
                  {/* Action Buttons */}
                  {!["assign", "new", "re_assigned"].includes(
                    detail?.status,
                  ) && (
                    <View style={styles.actionRow}>
                      {detail?.clientMobile && (
                        <ActionButton
                          label="Call"
                          icon="phone-call"
                          onPress={() => navToCall()}
                        />
                      )}

                      {detail?.whatsapp && (
                        <ActionButton
                          label="WhatsApp"
                          icon="message-circle"
                          onPress={() => Linking.openURL(detail?.whatsapp)}
                        />
                      )}

                      {detail?.clientEmail && (
                        <ActionButton
                          label="Email"
                          icon="mail"
                          onPress={() => openMail(detail?.clientEmail)}
                        />
                      )}

                      {detail?.clientMobile && (
                        <ActionButton
                          label="SMS"
                          icon="message-square"
                          onPress={() =>
                            Linking.openURL(`sms:${detail?.clientMobile}`)
                          }
                        />
                      )}
                    </View>
                  )}

                  {detail?.clientMobile && canShowContactDetails && (
                    <View style={styles.divider} />
                  )}

                  {/* Mobile */}
                  {detail?.clientMobile && canShowContactDetails && (
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
                          <Text style={styles.value}>
                            {detail?.clientMobile}
                          </Text>
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
                  )}

                  {/* Email */}
                  {detail?.clientEmail && canShowContactDetails && (
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
                          <Text style={styles.value}>
                            {detail?.clientEmail}
                          </Text>
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
                  )}
                </View>
              )}

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

              {additionalQuestionsData?.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Additional Questions</Text>
                  <View style={styles.divider} />
                  {additionalQuestionsData?.map(
                    (item: any, parentIndex: number) => (
                      <View
                        key={parentIndex}
                        style={[
                          styles.questionGroupCard,
                          // {
                          //   borderBottomColor: "#000",
                          //   borderBottomWidth:
                          //     parentIndex ===
                          //     additionalQuestionsData?.length - 1
                          //       ? 0
                          //       : 1,
                          // },
                        ]}
                      >
                        {!!(
                          item?.createdAt ||
                          item?.submittedAt ||
                          detail?.createdAt
                        ) && (
                          <View style={styles.questionDateContainer}>
                            <Text style={styles.questionDateText}>
                              {moment(
                                item?.submittedAt ||
                                  item?.createdAt ||
                                  detail?.createdAt,
                              ).format("DD MMM YYYY, hh:mm A")}
                            </Text>

                            <View style={styles.dateUnderline} />
                          </View>
                        )}
                        {(Array.isArray(item?.questions)
                          ? item.questions.map((q) => [
                              q?.label || q?.key,
                              q?.answer,
                            ])
                          : Object.entries(item?.questions || {})
                        )?.map(([key, value]: any, index: number) => {
                          return (
                            <View
                              key={`${parentIndex}-${index}`}
                              style={[
                                styles.compactQaRow,
                                { paddingTop: index === 0 ? 4 : 0 },
                                index ===
                                  Object.entries(item?.questions || {})
                                    ?.length -
                                    1 && {
                                  borderBottomWidth: 0,
                                  paddingBottom: 0,
                                  marginBottom: 0,
                                },
                              ]}
                            >
                              <Text style={styles.questionLabel}>
                                Q.{" "}
                                <Text style={styles.compactQuestion}>
                                  {String(key).charAt(0).toUpperCase() +
                                    String(key).slice(1)}
                                </Text>
                              </Text>

                              <Text style={styles.answerLabel}>
                                A.{" "}
                                <Text style={styles.compactAnswer}>
                                  {(typeof value === "string"
                                    ? value
                                        .replace(/_/g, " ")
                                        .replace(/\s+/g, " ")
                                        .trim()
                                    : value !== undefined &&
                                        value !== null &&
                                        typeof value !== "object"
                                      ? String(value)
                                      : "N/A"
                                  )
                                    .charAt(0)
                                    .toUpperCase() +
                                    (typeof value === "string"
                                      ? value
                                          .replace(/_/g, " ")
                                          .replace(/\s+/g, " ")
                                          .trim()
                                      : value !== undefined &&
                                          value !== null &&
                                          typeof value !== "object"
                                        ? String(value)
                                        : "N/A"
                                    ).slice(1)}
                                </Text>
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ),
                  )}
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
        <Container style={{ flex: 1, position: "relative" }}>
          <Header
            title={
              selectLeadType === "calling_data"
                ? "Calling Data Info"
                : "Lead Details"
            }
            onBack={() => {
              if (from === "reminders") {
                navigation.navigate("Reminders", {
                  remindersActiveTab,
                });
              } else if (from === "callLogs") {
                navigation.goBack();
              } else {
                navigate(routeLead.allLead, {
                  tabType: selectLeadType ?? detail?.type ?? details?.type,
                });
              }
            }}
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
                myConsole("iddd", i);
                deleteNotes(i);
              }}
              isLoadingDelete={isLoadingDelete}
            />
          </ScrollView>
          <TouchableOpacity
            onPress={() => {
              setNoteUpdate(null);
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

      {/* {activeTab === 3 && (
        <LeadLogsInfo
          selectLeadType={selectLeadType}
          leadId={detail?._id}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )} */}
      {activeTab === 3 && (
        <MeetingInfo
          selectLeadType={selectLeadType}
          leadId={params?.item?._id}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBackPress={() => {
            if (from === "reminders") {
              navigation.navigate("Reminders", {
                remindersActiveTab,
              });
            } else if (from === "callLogs") {
              navigation.goBack();
            } else {
              navigate(routeLead.allLead, {
                tabType: selectLeadType ?? detail?.type ?? details?.type,
              });
            }
          }}
        />
      )}

      {isAdminOrAssigne && (
        <AddNote
          modal={modalNote}
          leadID={detail?._id}
          refetch={refetchLeadDetail}
          notesId={noteUpdate?.notesId}
          remark={noteUpdate?.note}
        />
      )}
      <CelebrationModal
        visible={showCelebration}
        status={celebrationStatus}
        onCreateMeeting={handleCelebrationCreateMeeting}
        onClose={() => setShowCelebration(false)}
      />
    </>
  );
};

export default LeadsDetails;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? 30 : 12,
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
    paddingHorizontal: 12,
    paddingVertical: 16,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E8EEF7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarText: {
    fontSize: 18,
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
  },

  statusBadge: {
    backgroundColor: "#E6EEF9",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: color.mainTxtColor,
    marginRight: 8,
  },

  statusText: {
    color: "#2E67BE",
    fontWeight: "600",
    fontSize: 13,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 6,
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
    fontSize: 14,
    color: color.mainTxtColor,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
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
  compactQaRow: {
    // paddingBottom: 2,
    // paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },

  questionGroupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    // borderWidth: 1,
    // borderColor: "#E9EEF5",
  },

  questionDateContainer: {
    // backgroundColor: "#2E67BE15",
    alignSelf: "flex-start",
    // paddingHorizontal: 14,
    // borderRadius: 30,
    // paddingVertical: 5,
    // marginBottom: 10,
  },

  questionDateText: {
    color: "#2E67BE",
    fontWeight: "700",
    fontSize: 12,
  },
  dateUnderline: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#64748B",
  },

  duplicateCard: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1.2,
    borderColor: "#FACC15",
  },

  detailDuplicateBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FACC15",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
    gap: 5,
    marginBottom: 6,
  },

  detailDuplicateText: {
    color: "#FACC15",
    fontSize: 12,
    fontWeight: "700",
  },

  questionLabel: {
    fontSize: 14,
    color: color.mainTxtColor,
    fontWeight: "700",
    // marginBottom: 2,
    lineHeight: 22,
  },

  answerLabel: {
    fontSize: 14,
    color: "#16A34A",
    fontWeight: "700",
    lineHeight: 22,
  },

  compactQuestion: {
    fontSize: 14,

    color: "#334155",
    fontWeight: "500",
    lineHeight: 22,
  },

  compactAnswer: {
    fontSize: 14,

    color: "#64748B",
    fontWeight: "500",
    lineHeight: 22,
  },
});
