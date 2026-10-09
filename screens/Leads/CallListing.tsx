import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { color } from "../../const/color";
import { useFormik } from "formik";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomText from "../../myComponents/CustomText/CustomText";
import MobileInput from "../../myComponents/MobileInput/MobileInput";
import {
  addManualLeadNegativeStatuses,
  addManualLeadPositiveStatuses,
  clientLookingForOptions,
  DIAL_PAD,
  FOLLOWUP_REQUIRED_STATUSES_ONLY_POSITIVE,
  inLeadStatus,
  leadNeutralStatuses,
} from "../../utils/data";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { addManualLeadSchema } from "../../utils/validation";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { useAppToast } from "../../components/AppToast";
import { useQueryClient } from "@tanstack/react-query";
import {
  createCallLog,
  useCallLogsByUserId,
  useLongCallReviews,
  useReviewPnls,
  updateLongCallReviewStatus,
  updateCallLogFlag,
  ReviewStatus,
} from "../../services/rootApi/callLogsApi";
import { queryKeyCRM } from "../../utils/queryKeys";
import { myConsole } from "../../hooks/useConsole";
import { normalizeAnswer } from "../../utils/commonFunctions";
import { createLeadFromCalling } from "../../services/rootApi/leadApi";
import { useGetMyCallLogs } from "../../services/rootApi/callApi";
import CallLogCard from "./component/CallLogCard";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import moment from "moment";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { routeLead } from "../../utils/routes";
import {
  getDataJson,
  removeItemValue,
  storeData,
} from "../../hooks/useAsyncStorage";
import { getAppSettings } from "../../services/rootApi/api";
import { useQuery } from "@tanstack/react-query";
import {
  CONFIRMED_CALL_MARKER,
  PENDING_CALL_KEY,
  isConfirmedPendingCall,
} from "../../utils/pendingCallStorage";
import {
  getTrackedCallDurationSeconds,
  isShortCallDuration,
} from "../../utils/callOutcome";

const QUICK_NEGATIVE_STATUSES = [
  { label: "Broker", value: "broker" },
  { label: "No Response", value: "no_response" },
  { label: "Not Interested", value: "not_interested" },
] as const;

const CallListing = () => {
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const route: any = useRoute();
  const { navigate, goBack } = useNavigation();
  const { user, lead } = useSelector(selectUser);
  const userId = route?.params?.userId;
  const userName = route?.params?.userName;
  const from = route?.params?.from;
  const insets = useSafeAreaInsets();
  const canReviewLongCalls = ["sup_admin", "sr_manager", "pnl"].includes(
    user?.role,
  );
  const [activeTab, setActiveTab] = useState<"all" | "long">(
    canReviewLongCalls && route?.params?.tab === "long" ? "long" : "all",
  );
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    route?.params?.status === "approved" || route?.params?.status === "rejected"
      ? route.params.status
      : "pending",
  );
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [selectedPnlId, setSelectedPnlId] = useState("");
  const [showPnlPicker, setShowPnlPicker] = useState(false);

  useEffect(() => {
    if (canReviewLongCalls && route?.params?.tab === "long") {
      setActiveTab("long");
      if (["pending", "approved", "rejected"].includes(route?.params?.status)) {
        setReviewStatus(route.params.status);
      }
    }
  }, [canReviewLongCalls, route?.params?.tab, route?.params?.status]);

  // ✅ NEW
  const DURATION_THRESHOLD_SEC = 20 * 60; // 20 min
  // const DURATION_THRESHOLD_SEC = 30;
  // Temporary development-only offset to test the Hours field in the duration modal.
  // const TEST_CALL_INITIATED_AT_OFFSET_MS = __DEV__ ? 61 * 60 * 1000 : 0;
  const TEST_CALL_INITIATED_AT_OFFSET_MS = 0;
  const [showDurationEditor, setShowDurationEditor] = useState(false);
  const [editHours, setEditHours] = useState("");
  const [editMinutes, setEditMinutes] = useState("");
  const [editSeconds, setEditSeconds] = useState("");
  const pendingResumeRef = useRef<{
    number: string;
    initiatedAt: number;
    endTime: number;
  } | null>(null);

  const [tdForFUT, setTdForFUT] = useState({
    date: null,
    time: null,
  });
  const [followUpError, setFollowUpError] = useState("");
  const [timePickerKey, setTimePickerKey] = useState(0);
  const [showDialPad, setShowDialPad] = useState(false);
  const [maxAllowedMinutes, setMaxAllowedMinutes] = useState(0);
  const [maxAllowedSeconds, setMaxAllowedSeconds] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const appState = useRef(AppState.currentState);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [calledNumber, setCalledNumber] = useState("");
  const isCallingRef = useRef(false);
  const dialRequestAcceptedRef = useRef(false);
  const [leadType, setLeadType] = useState<"interested" | "not_interested">(
    "not_interested",
  );
  const isResumingRef = useRef(false);
  const isHandlingResumeAlertRef = useRef(false);
  const resumeModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const callReturnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialerCancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const myLogsQuery = useGetMyCallLogs(10);
  const reviewLogsQuery = useLongCallReviews(
    canReviewLongCalls && activeTab === "long",
    reviewStatus,
    selectedPnlId,
  );
  const pnlQuery = useReviewPnls(
    user?.role === "sup_admin" && activeTab === "long",
  );

  const { data: appSettingsData } = useQuery({
    queryKey: ["getAppSettings"],
    queryFn: () => getAppSettings().then((res) => res?.data),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const canShowCancelBtn =
    appSettingsData?.data?.calling?.canShowCancelBtnForCreateLog ?? true;

  const userLogsQuery = useCallLogsByUserId(userId);

  const activeQuery =
    activeTab === "long"
      ? reviewLogsQuery
      : userId
        ? userLogsQuery
        : myLogsQuery;

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isError,
    error,
  } = activeQuery;

  const onRefresh = async () => {
    await refetch();
  };

  const [callMeta, setCallMeta] = useState<{
    initiatedAt: number | null;
    finishedAt: number | null;
  } | null>(null);

  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  const isCallTrackingRef = useRef(false);
  const dialedNumberRef = useRef("");
  const callStartTimeRef = useRef<number | null>(null);

  const isCallLogSentRef = useRef(false);

  const callDurationInSeconds = getTrackedCallDurationSeconds(callMeta);
  const isShortCall = isShortCallDuration(callDurationInSeconds);

  const filteredLeadStatus = inLeadStatus.filter((item) =>
    !isShortCall && leadType === "interested"
      ? addManualLeadPositiveStatuses.includes(item._id)
      : addManualLeadNegativeStatuses.includes(item._id),
  );

  const callLogs = useMemo(() => {
    return (
      data?.pages?.flatMap(
        (page) => page?.data || page?.results || page?.callLogs || [],
      ) || []
    );
  }, [data]);

  const changeReviewStatus = async (
    ids: string[],
    status: "approved" | "rejected",
  ) => {
    if (!ids.length) return;
    try {
      await updateLongCallReviewStatus(ids, status);
      setSelectedReviewIds([]);
      toast.success(`${ids.length} call(s) ${status}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["longCallReviews"] }),
        queryClient.invalidateQueries({ queryKey: ["getMyCallLogs"] }),
        queryClient.invalidateQueries({ queryKey: ["callLogsByUserId"] }),
      ]);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Unable to update call review",
      );
    }
  };

  const changeFlagState = async (ids: string[], isFlagged: boolean) => {
    if (!ids.length) return;
    try {
      const response = await updateCallLogFlag(ids, isFlagged);
      setSelectedReviewIds([]);
      toast.success(response?.message || `${ids.length} call(s) updated`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["longCallReviews"] }),
        queryClient.invalidateQueries({ queryKey: ["getMyCallLogs"] }),
        queryClient.invalidateQueries({ queryKey: ["callLogsByUserId"] }),
      ]);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Only calls of 5 minutes or more can be flagged or unflagged",
      );
    }
  };

  const toggleReviewSelection = (id: string) => {
    setSelectedReviewIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const formattedNumber = useMemo(() => {
    return phoneNumber;
  }, [phoneNumber]);

  // const handlePress = (digit: string) => {
  //   setPhoneNumber((prev) => prev + digit);
  // };

  const handlePress = (digit: string) => {
    setPhoneNumber((prev) => {
      if (prev.length >= 15) return prev; // max 15 digits

      const cursorPos = selection.start ?? prev.length;
      const updated = prev.slice(0, cursorPos) + digit + prev.slice(cursorPos);

      console.log("PHONE NUMBER TYPED =>", updated);

      // ✅ cursor ko naye digit ke turant baad move karo
      setSelection({ start: cursorPos + 1, end: cursorPos + 1 });

      return updated;
    });
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => {
      if (!prev.length) return prev;

      const updated = prev.slice(0, -1);
      setSelection({ start: updated.length, end: updated.length });

      return updated;
    });
  };

  const handleCall = async (mobile?: string) => {
    const numberToCall = typeof mobile === "string" ? mobile : phoneNumber;

    console.log("CALLING NUMBER =>", numberToCall);

    if (!numberToCall || typeof numberToCall !== "string") {
      return;
    }
    try {
      isCallingRef.current = true;
      dialRequestAcceptedRef.current = false;
      isCallLogSentRef.current = false;
      console.log("TYPE OF NUMBER =>", typeof numberToCall, numberToCall);
      dialedNumberRef.current = String(numberToCall);

      await Linking.openURL(`tel:${numberToCall}`);

      dialRequestAcceptedRef.current = true;
      if (callStartTimeRef.current) {
        await storeData(
          PENDING_CALL_KEY,
          JSON.stringify({
            number: dialedNumberRef.current,
            initiatedAt: callStartTimeRef.current,
            confirmation: CONFIRMED_CALL_MARKER,
          }),
        );
      }
    } catch (err) {
      isCallingRef.current = false;
      dialRequestAcceptedRef.current = false;
      dialedNumberRef.current = "";
      await removeItemValue(PENDING_CALL_KEY);
      console.log("Call Error", err);
    }
  };
  // ✅ NEW: resumes a call that was in-progress when the app got killed

  const resumePendingCallIfAny = async () => {
    if (isResumingRef.current || isHandlingResumeAlertRef.current) return;

    const pending = await getDataJson(PENDING_CALL_KEY);
    if (!pending) return;
    if (!isConfirmedPendingCall(pending)) {
      await removeItemValue(PENDING_CALL_KEY);
      return;
    }
    if (!pending?.number || !pending?.initiatedAt) return;

    console.log("✅ RESUMING PENDING CALL =>", pending);

    isResumingRef.current = true;

    const endTime = Date.now();

    await removeItemValue(PENDING_CALL_KEY);

    const diffSec = Math.floor((endTime - pending.initiatedAt) / 1000);
    if (diffSec > DURATION_THRESHOLD_SEC) {
      setPhoneNumber("");
      setCallStartTime(null);
      isCallingRef.current = false;
      isCallTrackingRef.current = false;
      callStartTimeRef.current = null;
      setShowDialPad(false);
      pendingResumeRef.current = null;
      setShowDurationEditor(false);
      setCallMeta(null);
      isResumingRef.current = false;
      return;
    }

    // format initiated time
    const initiatedDate = new Date(pending.initiatedAt);
    const isToday = new Date().toDateString() === initiatedDate.toDateString();

    const formattedTime = initiatedDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const formattedDateTime = isToday
      ? formattedTime
      : initiatedDate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        formattedTime;

    // A native Alert briefly changes AppState on some Android devices. Stop
    // call tracking before showing it so the return-to-active event cannot
    // start a second call-end flow behind the alert.
    isCallingRef.current = false;
    isCallTrackingRef.current = false;
    callStartTimeRef.current = null;
    isHandlingResumeAlertRef.current = true;

    Alert.alert(
      "Missed Call Log",
      `Called number: ${pending.number}\n\nA call was initiated at ${formattedDateTime}.\n\nPlease log this call to update your call records.`,
      [
        {
          text: "OK",
          onPress: () => {
            isResumingRef.current = false;
            isHandlingResumeAlertRef.current = false;

            // Wait for the native alert window to finish dismissing before
            // mounting React Native's Modal. Opening both during the same
            // native transition can leave an invisible modal backdrop that
            // makes the call-list screen appear frozen.
            if (resumeModalTimerRef.current) {
              clearTimeout(resumeModalTimerRef.current);
            }
            resumeModalTimerRef.current = setTimeout(() => {
              resumeModalTimerRef.current = null;
              finalizeCallAndOpenLead(
                pending.number,
                pending.initiatedAt,
                endTime,
              );
            }, 300);
          },
        },
      ],
      { cancelable: false },
    );
  };

  // ✅ NEW: finalize call meta + open lead modal (shared by both flows)
  const finalizeCallAndOpenLead = (
    number: string,
    initiatedAt: number,
    finishedAt: number,
  ) => {
    const durationInSeconds = Math.max(
      0,
      Math.floor((finishedAt - initiatedAt) / 1000),
    );

    setCallMeta({ initiatedAt, finishedAt });
    setCalledNumber(number);
    formik.setFieldValue("clientMobile", number);

    if (isShortCallDuration(durationInSeconds)) {
      setLeadType("not_interested");
      formik.setFieldValue("leadType", "not_interested");
      formik.setFieldValue("status", "");
    }

    setPhoneNumber("");
    setCallStartTime(null);
    isCallingRef.current = false;
    isCallTrackingRef.current = false;
    callStartTimeRef.current = null;
    setShowDialPad(false);
    setShowLeadModal(true);
  };

  // ✅ NEW: decides whether duration looks reliable (<=25min) or needs manual edit
  // const handleCallEnd = (
  //   number: string,
  //   initiatedAt: number,
  //   endTime: number,
  // ) => {
  //   const diffSec = Math.floor((endTime - initiatedAt) / 1000);

  //   if (diffSec > DURATION_THRESHOLD_SEC) {
  //     // duration looks unreliable (app was likely closed for a while) — ask user to confirm/edit
  //     pendingResumeRef.current = { number, initiatedAt, endTime };
  //     setEditMinutes("");
  //     setEditSeconds("");
  //     setShowDurationEditor(true);
  //     return;
  //   }

  //   finalizeCallAndOpenLead(number, initiatedAt, endTime);
  // };

  const handleCallEnd = (
    number: string,
    initiatedAt: number,
    endTime: number,
  ) => {
    const diffSec = Math.floor((endTime - initiatedAt) / 1000);

    if (diffSec > DURATION_THRESHOLD_SEC) {
      pendingResumeRef.current = null;
      setShowDurationEditor(false);
      setShowLeadModal(false);
      setCallMeta(null);
      setPhoneNumber("");
      setCallStartTime(null);
      isCallingRef.current = false;
      isCallTrackingRef.current = false;
      callStartTimeRef.current = null;
      setShowDialPad(false);
      return;
    }

    finalizeCallAndOpenLead(number, initiatedAt, endTime);
  };

  // ✅ NEW: called when user confirms the edited duration
  const confirmEditedDuration = () => {
    if (!pendingResumeRef.current) return;

    const hours = maxAllowedMinutes > 60 ? parseInt(editHours || "0", 10) : 0;
    const mins = parseInt(editMinutes || "0", 10);
    const secs = parseInt(editSeconds || "0", 10);
    const { number, initiatedAt } = pendingResumeRef.current;

    const adjustedFinishedAt =
      initiatedAt + (hours * 60 * 60 + mins * 60 + secs) * 1000;

    setShowDurationEditor(false);
    pendingResumeRef.current = null;

    finalizeCallAndOpenLead(number, initiatedAt, adjustedFinishedAt);
  };

  const formatCallInitiatedAt = (timestamp?: number | null) => {
    if (!timestamp) return "";

    const initiatedDate = new Date(timestamp);
    const isToday = new Date().toDateString() === initiatedDate.toDateString();
    const time = initiatedDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return isToday
      ? time
      : `${initiatedDate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}, ${time}`;
  };

  useEffect(() => {
    // covers case: app was killed mid-call and relaunched into this screen
    resumePendingCallIfAny();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log(
        `🔵 AppState changed: ${appState.current} → ${nextAppState} at ${new Date().toISOString()}`,
        {
          isCallingRef: isCallingRef.current,
          isCallTrackingRef: isCallTrackingRef.current,
        },
      );

      // iOS briefly reports `active` between accepting the native Call prompt
      // and transferring to the Phone app. Do not treat that transient active
      // state as Cancel; the following background transition confirms a call.
      if (nextAppState !== "active" && dialerCancelTimerRef.current) {
        clearTimeout(dialerCancelTimerRef.current);
        dialerCancelTimerRef.current = null;
      }

      // Call started
      if (isCallingRef.current && nextAppState === "background") {
        const startTime = Date.now() - TEST_CALL_INITIATED_AT_OFFSET_MS;

        setCallStartTime(startTime);
        callStartTimeRef.current = startTime;

        setCallMeta({
          initiatedAt: startTime,
          finishedAt: null,
        });

        isCallTrackingRef.current = true;
        // A real phone call is the transition that sends the app to the
        // background. Persist it here (rather than waiting for openURL's
        // promise, which iOS may not resume before the app is terminated).
        storeData(
          PENDING_CALL_KEY,
          JSON.stringify({
            number: dialedNumberRef.current,
            initiatedAt: startTime,
            confirmation: CONFIRMED_CALL_MARKER,
          }),
        ).catch((error) => console.log("Pending call save error", error));
      }

      // Returned from call — app was only backgrounded, NOT killed (normal case)
      if (
        nextAppState === "active" &&
        isCallTrackingRef.current &&
        callStartTimeRef.current
      ) {
        const endTime = Date.now();
        console.log("PHONE NUMBER ON RETURN =>", phoneNumber);
        setCallMeta((prev) =>
          prev
            ? {
                ...prev,
                finishedAt: endTime,
              }
            : null,
        );

        const mobile = dialedNumberRef.current;

        console.log("PHONE NUMBER =>", phoneNumber);
        console.log("FORMATTED MOBILE =>", mobile);
        const initiatedAt = callStartTimeRef.current;
        if (callReturnTimerRef.current)
          clearTimeout(callReturnTimerRef.current);
        callReturnTimerRef.current = setTimeout(() => {
          callReturnTimerRef.current = null;
          if (!dialRequestAcceptedRef.current) {
            setCallMeta(null);
            setCallStartTime(null);
            isCallingRef.current = false;
            isCallTrackingRef.current = false;
            callStartTimeRef.current = null;
            dialedNumberRef.current = "";
            removeItemValue(PENDING_CALL_KEY);
            return;
          }

          removeItemValue(PENDING_CALL_KEY);
          handleCallEnd(mobile, initiatedAt, endTime);
          dialRequestAcceptedRef.current = false;
        }, 350);
      }
      if (
        nextAppState === "active" &&
        isCallingRef.current &&
        !isCallTrackingRef.current
      ) {
        if (dialerCancelTimerRef.current) {
          clearTimeout(dialerCancelTimerRef.current);
        }
        dialerCancelTimerRef.current = setTimeout(() => {
          dialerCancelTimerRef.current = null;
          if (
            appState.current !== "active" ||
            !isCallingRef.current ||
            isCallTrackingRef.current
          ) {
            return;
          }

          isCallingRef.current = false;
          dialRequestAcceptedRef.current = false;
          dialedNumberRef.current = "";
          removeItemValue(PENDING_CALL_KEY);
        }, 750);
      }
      // ❌ REMOVED: the aggressive fallback that fired on every "active" transition
      // (it was misfiring on the brief "inactive" blip from iOS's tel: confirmation dialog)

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (resumeModalTimerRef.current) {
        clearTimeout(resumeModalTimerRef.current);
        resumeModalTimerRef.current = null;
      }
      if (callReturnTimerRef.current) {
        clearTimeout(callReturnTimerRef.current);
        callReturnTimerRef.current = null;
      }
      if (dialerCancelTimerRef.current) {
        clearTimeout(dialerCancelTimerRef.current);
        dialerCancelTimerRef.current = null;
      }
    };
  }, []);

  const hitCreateCallLog = async (
    statusAfterCall?: string,
    comment?: string,
    leadId?: string,
  ) => {
    console.log("hitcreatecalllogs");
    console.log("========== CALL LOG START ==========");
    console.log("callMeta =>", callMeta);
    console.log("calledNumber =>", calledNumber);
    console.log("statusAfterCall =>", statusAfterCall);

    // ✅ STOP duplicate calls
    if (isCallLogSentRef.current) return;

    try {
      if (!callMeta?.initiatedAt || !callMeta?.finishedAt) return;

      const durationInSec = Math.floor(
        (callMeta.finishedAt - callMeta.initiatedAt) / 1000,
      );
      console.log("CALL DURATION (SEC) =>", durationInSec);

      if (durationInSec > DURATION_THRESHOLD_SEC) {
        setCallMeta(null);
        return;
      }

      // ✅ ye statuses hamesha "not_connected" force karenge, chahe duration/status kuch bhi ho
      const FORCE_NOT_CONNECTED_STATUSES = [
        "no_response",
        "not_able_to_connect",
        "wrong_details",
      ];

      let callType: "not_connected" | "positive" | "negative" | "connected" =
        "connected";

      // ✅ status based (pehle set karo, phir override rules apply karenge)
      if (statusAfterCall) {
        if (addManualLeadPositiveStatuses.includes(statusAfterCall)) {
          callType = "positive";
        } else if (addManualLeadNegativeStatuses.includes(statusAfterCall)) {
          callType = "negative";
        } else if (leadNeutralStatuses.includes(statusAfterCall)) {
          callType = "connected";
        }
      }

      // ❌ cancel case (no status selected)
      if (!statusAfterCall && durationInSec >= 15) {
        callType = "connected";
      }
      // Calls up to and including 60 seconds are always not connected.
      if (isShortCallDuration(durationInSec)) {
        callType = "not_connected";
      }

      // ❌ FORCE RULE 2: specific statuses => hamesha not_connected,
      // chahe duration kuch bhi ho
      if (
        statusAfterCall &&
        FORCE_NOT_CONNECTED_STATUSES.includes(statusAfterCall)
      ) {
        callType = "not_connected";
      }

      isCallLogSentRef.current = true; // ✅ lock

      const payload = {
        userId: user?._id,

        ...(leadId
          ? {
              sourceType: "lead",
              leadId,
            }
          : {
              sourceType: "manual",
              phoneNumber: calledNumber?.replace(/-/g, "") || "",
            }),

        type: callType,
        initiatedAt: new Date(callMeta.initiatedAt).toISOString(),
        finishedAt: new Date(callMeta.finishedAt).toISOString(),

        ...(statusAfterCall && {
          leadStatusAfterCall: statusAfterCall,
        }),

        ...(comment?.trim() && {
          comment: comment.trim(),
        }),
      };

      myConsole("payloadofcalllogres", payload);
      const res = await createCallLog(payload);

      myConsole("calllogsresponses", res);

      // myConsole("resssss", res);

      if (res?.success) {
        toast.success(res?.message || "Call log created successfully");

        // queryClient.invalidateQueries({
        //   queryKey: ["getLeadCallReports"],
        // });
        queryClient.invalidateQueries({
          queryKey: ["getMyCallLogs"],
        });
      } else {
        toast.error(res?.message || "Failed to create call log");
      }

      setCallMeta(null);
    } catch (err: any) {
      myConsole("❌ RESPONSE DATA =>", err?.response?.data?.message);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while creating call log";
      toast.error(errMsg);
    }
  };

  useEffect(() => {
    console.log("SHOW LEAD MODAL =>", showLeadModal);
  }, [showLeadModal]);

  const formik = useFormik({
    initialValues: {
      leadType: "not_interested",
      clientName: "",
      clientMobile: "",
      clientEmail: "",
      status: "",
      comment: "",
      clientAddress: "",
      clientLookingFor: "",
      projectLookingFor: "",
      budget: "",
      howManyBedroomsLookingFor: "",
    },
    validationSchema: addManualLeadSchema,
    validateOnMount: false,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      if (
        isShortCall &&
        (leadType === "interested" ||
          addManualLeadPositiveStatuses.includes(values.status))
      ) {
        toast.error(
          "Calls of 60 seconds or less cannot be marked as Interested or Positive.",
        );
        return;
      }

      const payload = {
        ...values,
        mobile: values.clientMobile?.replace("+", ""),
        leadType,
      };

      // console.log("FORM PAYLOAD =>", payload);

      const isFollowUpRequired =
        FOLLOWUP_REQUIRED_STATUSES_ONLY_POSITIVE.includes(values.status);

      if (isFollowUpRequired && (!tdForFUT?.date || !tdForFUT?.time)) {
        setFollowUpError("Please select follow-up date and time.");
        return;
      }

      setFollowUpError("");

      if (leadType === "interested") {
        const additionalQuestions = {
          ...(values.clientAddress?.trim() && {
            client_address: normalizeAnswer(values.clientAddress),
          }),

          ...(values.projectLookingFor?.trim() && {
            project_looking_for: normalizeAnswer(values.projectLookingFor),
          }),

          ...(values.budget?.trim() && {
            budget: normalizeAnswer(values.budget),
          }),

          ...(values.clientLookingFor?.trim() && {
            client_looking_for: normalizeAnswer(values.clientLookingFor),
          }),

          ...(values.howManyBedroomsLookingFor?.trim() && {
            how_many_bedrooms_looking_for: normalizeAnswer(
              values.howManyBedroomsLookingFor,
            ),
          }),
        };

        const leadPayload = {
          clientName: values.clientName?.trim(),
          clientEmail: values.clientEmail?.trim() || "no_reply@skgestates.com",
          clientMobile: values.clientMobile?.replace(/[^0-9]/g, ""),
          status: values.status,
          ...(tdForFUT?.date &&
            tdForFUT?.time && {
              followUpTime: combineDateAndTime(tdForFUT.date, tdForFUT.time),
            }),
          ...(values.comment?.trim() && {
            comment: values.comment.trim(),
          }),

          ...(Object.keys(additionalQuestions).length > 0 && {
            additionalQuestions,
          }),
        };

        myConsole("CREATE LEAD V2 PAYLOAD =>", leadPayload);

        try {
          const leadRes = await createLeadFromCalling(leadPayload);

          myConsole("CREATE LEAD V2 RESPONSE =>", leadRes);
          // myConsole("LEAD RESPONSE SUCCESS =>", leadRes?.success);
          // myConsole("LEAD RESPONSE MESSAGE =>", leadRes?.message);
          // myConsole("LEAD RESPONSE DATA =>", leadRes?.data);

          if (!leadRes?.success) {
            toast.error(leadRes?.message || "Lead creation failed");
            return;
          }
          const generatedLeadId = leadRes?.data?._id;
          toast.success(leadRes?.message || "Lead created successfully");

          await hitCreateCallLog(
            values.status,
            values.comment,
            generatedLeadId,
          );

          setShowLeadModal(false);
          formik.resetForm();
          setTdForFUT({
            date: null,
            time: null,
          });
          setLeadType("not_interested");

          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLead],
          });

          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getDashboardCount],
          });
          // goBack();
          return;
        } catch (err: any) {
          myConsole("CREATE LEAD ERROR =>", err?.response?.data || err);

          toast.error(
            err?.response?.data?.message ||
              err?.message ||
              "Lead creation failed",
          );

          return;
        }
      }

      await hitCreateCallLog(values.status, values.comment);

      setShowLeadModal(false);
      formik.resetForm();
      setTdForFUT({
        date: null,
        time: null,
      });
      setLeadType("not_interested");
      // goBack();

      return;
    },
  });

  const formatDateTime = (date, time) => {
    let d = moment(date).format("DD/MM/YYYY") || "N/A";
    let h = moment(time).format("hh:mm A") || "N/A";
    return `${d}, ${h}`;
  };

  const combineDateAndTime = (dateStr, timeStr) => {
    return moment
      .utc({
        year: moment.utc(dateStr).year(),
        month: moment.utc(dateStr).month(),
        date: moment.utc(dateStr).date(),
        hour: moment.utc(timeStr).hour(),
        minute: moment.utc(timeStr).minute(),
        second: moment.utc(timeStr).second(),
        millisecond: moment.utc(timeStr).millisecond(),
      })
      .toISOString();
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

  const shouldShowFollowUpField =
    leadType === "interested" ||
    FOLLOWUP_REQUIRED_STATUSES_ONLY_POSITIVE.includes(formik.values.status);

  useEffect(() => {
    console.log("CLIENT MOBILE CHANGED =>", formik.values.clientMobile);
  }, [formik.values.clientMobile]);

  // myConsole("callLogsssss", callLogs);

  if (isError) {
    return (
      <Container>
        <Header
          title={userId ? `${userName} Calls` : "Calls"}
          onBack={() => {
            if (from === "reports") {
              navigate("ReportsListing");
            } else {
              navigate(routeLead.allLead);
            }
          }}
        />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <CustomText
            style={{
              marginBottom: 15,
              textAlign: "center",
            }}
          >
            Failed to load call logs
          </CustomText>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => refetch()}
            style={{
              backgroundColor: color.mainTxtColor,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <CustomText color="#fff">Retry</CustomText>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title={userId ? `${userName} Calls` : "Calls"}
        onBack={() => {
          if (from === "reports") {
            navigate("ReportsListing");
          } else {
            navigate(routeLead.allLead);
          }
        }}
      />

      {canReviewLongCalls && !userId && (
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "all" && styles.activeTab]}
            onPress={() => {
              setActiveTab("all");
              setSelectedReviewIds([]);
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              All Calls
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "long" && styles.activeTab]}
            onPress={() => setActiveTab("long")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "long" && styles.activeTabText,
              ]}
            >
              Calls 5+ Minutes
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "long" && (
        <View style={styles.reviewFilters}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {(["pending", "approved", "rejected"] as ReviewStatus[]).map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusChip,
                    reviewStatus === status && styles.activeStatusChip,
                  ]}
                  onPress={() => {
                    setReviewStatus(status);
                    setSelectedReviewIds([]);
                  }}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      reviewStatus === status && styles.activeStatusChipText,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>
          {user?.role === "sup_admin" && (
            <TouchableOpacity
              style={styles.pnlFilter}
              onPress={() => setShowPnlPicker(true)}
            >
              <Text numberOfLines={1} style={styles.pnlFilterText}>
                {selectedPnlId
                  ? (pnlQuery.data || []).find(
                      (pnl: any) => pnl._id === selectedPnlId,
                    )?.name || "PNL"
                  : "All PNLs"}
              </Text>
              <Feather name="chevron-down" size={16} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {activeTab === "long" && selectedReviewIds.length > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkCount}>
            {selectedReviewIds.length} selected
          </Text>
          <TouchableOpacity
            style={[styles.bulkButton, { backgroundColor: "#D97706" }]}
            onPress={() => changeFlagState(selectedReviewIds, true)}
          >
            <Text style={styles.bulkButtonText}>Flag</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkButton, { backgroundColor: "#64748B" }]}
            onPress={() => changeFlagState(selectedReviewIds, false)}
          >
            <Text style={styles.bulkButtonText}>Unflag</Text>
          </TouchableOpacity>
          {reviewStatus !== "approved" && (
            <TouchableOpacity
              style={[styles.bulkButton, { backgroundColor: "#16A34A" }]}
              onPress={() => changeReviewStatus(selectedReviewIds, "approved")}
            >
              <Text style={styles.bulkButtonText}>Approve</Text>
            </TouchableOpacity>
          )}
          {reviewStatus !== "rejected" && (
            <TouchableOpacity
              style={[styles.bulkButton, { backgroundColor: "#DC2626" }]}
              onPress={() => changeReviewStatus(selectedReviewIds, "rejected")}
            >
              <Text style={styles.bulkButtonText}>Reject</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={callLogs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CallLogCard
            item={item}
            reviewMode={activeTab === "long"}
            showFlag={canReviewLongCalls}
            selected={selectedReviewIds.includes(item._id)}
            onLongPress={
              activeTab === "long"
                ? () => toggleReviewSelection(item._id)
                : undefined
            }
            onApprove={() => changeReviewStatus([item._id], "approved")}
            onReject={() => changeReviewStatus([item._id], "rejected")}
            onFlagToggle={(isFlagged) => changeFlagState([item._id], isFlagged)}
            onPress={() => {
              if (activeTab === "long" && selectedReviewIds.length) {
                toggleReviewSelection(item._id);
                return;
              }
              if (!item?.leadId?._id) return;
              navigate("LeadsDetails", {
                item: {
                  _id: item.leadId._id,
                },
                from: "callLogs",
              });
            }}
            onCallPress={(mobile) => {
              handleCall(mobile);
            }}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 16,
          paddingBottom: 180,
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 100,
              }}
            >
              <ActivityIndicator size="large" color={color.mainTxtColor} />
            </View>
          ) : (
            <View
              style={{
                alignItems: "center",
                marginTop: 100,
              }}
            >
              <NoDataFound width={120} height={120} />

              <CustomText
                style={{
                  marginTop: 10,
                }}
              >
                No call logs found
              </CustomText>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={color.mainTxtColor} />
            </View>
          ) : null
        }
      />

      <Modal
        visible={showPnlPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPnlPicker(false)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setShowPnlPicker(false)}
        >
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Filter by PNL</Text>
            <FlatList
              style={styles.pickerList}
              data={[{ _id: "", name: "All PNLs" }, ...(pnlQuery.data || [])]}
              keyExtractor={(pnl: any) => pnl._id || "all"}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: pnl }: { item: any }) => (
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedPnlId(pnl._id);
                    setSelectedReviewIds([]);
                    setShowPnlPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>
                    {[pnl.name, pnl.lastName].filter(Boolean).join(" ")}
                  </Text>
                  {selectedPnlId === pnl._id && (
                    <Feather name="check" size={18} color="#2563EB" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Floating DialPad Button */}
      {!userId && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.floatingDialPadBtn,
            {
              bottom: insets.bottom + 80,
            },
          ]}
          onPress={() => setShowDialPad(true)}
        >
          <MaterialIcons name="dialpad" size={22} color="#fff" />
        </TouchableOpacity>
      )}
      {/* <TouchableOpacity
        activeOpacity={0.8}
        style={styles.floatingAddBtn}
        onPress={() => setShowLeadModal(true)}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity> */}

      {/* Dial Pad Modal */}
      <Modal
        visible={showDialPad}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDialPad(false)}
      >
        <View style={styles.overlay}>
          {/* ✅ backdrop as a separate absolutely-positioned sibling — avoids fragile nested TouchableWithoutFeedback propagation issues on Android with rapid taps */}
          <TouchableWithoutFeedback
            onPress={() => {
              setShowDialPad(false);
              setPhoneNumber("");
            }}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* ✅ content sits on top as a sibling, not wrapped in any dismiss-handler touchable */}
          <View style={styles.bottomSheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Dial Pad</Text>

              <TouchableOpacity onPress={() => setShowDialPad(false)}>
                <Feather name="x" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Number */}
            <View style={styles.numberContainer}>
              <TextInput
                value={phoneNumber}
                onChangeText={(v) => {
                  console.log("PHONE NUMBER TYPED =>", v);
                  setPhoneNumber(v);
                }}
                selection={selection}
                onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                placeholder="Enter Number"
                placeholderTextColor={color.placeholderGrey}
                style={styles.numberInput}
                showSoftInputOnFocus={false}
                maxLength={15}
              />

              {!!phoneNumber && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setPhoneNumber("");
                  }}
                  style={styles.clearButton}
                >
                  <Feather name="x" size={16} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Dial Pad */}
            <FlatList
              data={DIAL_PAD}
              keyExtractor={(_, index) => String(index)}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.row}
              contentContainerStyle={{ paddingTop: 10 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.keyButton}
                  onPress={() => {
                    handlePress(item[0]);
                  }}
                  onLongPress={() => {
                    if (item[0] === "0") {
                      setPhoneNumber((prev) => {
                        if (prev.startsWith("+")) return prev;
                        const updated = "+" + prev;
                        setSelection({ start: 1, end: 1 }); // ✅ cursor + ke turant baad
                        return updated;
                      });
                    }
                  }}
                  delayLongPress={300}
                >
                  <Text style={styles.keyText}>{item[0]}</Text>

                  {!!item[1] && (
                    <Text style={styles.keySubText}>{item[1]}</Text>
                  )}
                </Pressable>
              )}
            />

            {/* Call Button */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.callButton,
                  {
                    opacity: phoneNumber ? 1 : 0.5,
                  },
                ]}
                disabled={!phoneNumber}
                onPress={handleCall}
              >
                <Feather name="phone-call" size={22} color="#fff" />
              </TouchableOpacity>

              {phoneNumber.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.backButton}
                  onPress={handleDelete}
                >
                  <Feather name="delete" size={20} color="#0F172A" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      {!userId && (
        <Modal visible={showLeadModal} transparent animationType="slide">
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                flex: 1,
                marginTop: 80,
              }}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                style={{
                  flex: 1,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                  }}
                >
                  <View
                    style={{
                      marginTop: 22,
                      marginBottom: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexShrink: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: color.mainTxtColor,
                      }}
                    >
                      Lead Details
                    </Text>
                    {canShowCancelBtn && (
                      <TouchableOpacity
                        onPress={async () => {
                          await hitCreateCallLog();
                          setShowLeadModal(false);
                          formik.resetForm();
                          setTdForFUT({
                            date: null,
                            time: null,
                          });
                          setLeadType("not_interested");
                          // goBack();
                        }}
                      >
                        <Feather
                          name="x"
                          size={24}
                          color={color.mainTxtColor}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                      paddingBottom: 40,
                    }}
                    nestedScrollEnabled
                  >
                    {!canShowCancelBtn && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: 10,
                          backgroundColor: "#FEF3C7",
                          borderWidth: 1,
                          borderColor: "#FCD34D",
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 20,
                        }}
                      >
                        <Feather
                          name="alert-triangle"
                          size={18}
                          color="#B45309"
                          style={{ marginTop: 1 }}
                        />
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 13,
                            lineHeight: 18,
                            color: "#92400E",
                            fontWeight: "500",
                          }}
                        >
                          Please update the lead status and submit before
                          leaving this screen. Otherwise, this call will not be
                          counted or logged.
                        </Text>
                      </View>
                    )}
                    <CustomText
                      style={{
                        marginBottom: 8,
                        fontWeight: "600",
                        color: color.mainTxtColor,
                      }}
                    >
                      Call Outcome{" "}
                      <CustomText style={{ color: "red" }}>*</CustomText>
                    </CustomText>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      {QUICK_NEGATIVE_STATUSES.map((option) => {
                        const isSelected =
                          leadType === "not_interested" &&
                          formik.values.status === option.value;

                        return (
                          <TouchableOpacity
                            key={option.value}
                            activeOpacity={0.8}
                            onPress={() => {
                              setLeadType("not_interested");
                              setFollowUpError("");
                              formik.setFieldValue(
                                "leadType",
                                "not_interested",
                                false,
                              );
                              formik.setFieldValue(
                                "status",
                                option.value,
                                false,
                              );
                              formik.setFieldTouched("status", false, false);
                            }}
                            style={{
                              flex: 1,
                              minHeight: 48,
                              paddingHorizontal: 6,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: isSelected
                                ? color.mainTxtColor
                                : "#CBD5E1",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: isSelected
                                ? color.mainTxtColor
                                : "#F8FAFC",
                            }}
                          >
                            <CustomText
                              color={isSelected ? "#fff" : color.mainTxtColor}
                              style={{
                                textAlign: "center",
                                fontSize: 13,
                                fontWeight: "600",
                              }}
                            >
                              {option.label}
                            </CustomText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {leadType === "not_interested" &&
                      formik.touched.status &&
                      !!formik.errors.status && (
                        <CustomText
                          style={{
                            color: "red",
                            fontSize: 12,
                            marginBottom: 8,
                          }}
                        >
                          {formik.errors.status}
                        </CustomText>
                      )}

                    <CustomInput
                      label="Comment"
                      placeholder="Add comment"
                      value={formik.values.comment}
                      onChangeText={formik.handleChange("comment")}
                      marginBottom={18}
                      multiline
                      numberOfLines={4}
                      inputStyle={{
                        minHeight: 90,
                        textAlignVertical: "top",
                        paddingTop: 10,
                      }}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 18,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          height: 1,
                          backgroundColor: "#CBD5E1",
                        }}
                      />
                      <CustomText
                        style={{
                          color: "#64748B",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        OR
                      </CustomText>
                      <View
                        style={{
                          flex: 1,
                          height: 1,
                          backgroundColor: "#CBD5E1",
                        }}
                      />
                    </View>

                    <TouchableOpacity
                      disabled={isShortCall}
                      activeOpacity={0.8}
                      onPress={() => {
                        setLeadType("interested");
                        setFollowUpError("");
                        formik.setFieldValue("status", "", false);
                        formik.setFieldValue("leadType", "interested", false);
                        formik.setFieldTouched("status", false, false);
                      }}
                      style={{
                        minHeight: 48,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          !isShortCall && leadType === "interested"
                            ? color.mainTxtColor
                            : "#CBD5E1",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: isShortCall
                          ? "#E5E7EB"
                          : leadType === "interested"
                            ? color.mainTxtColor
                            : "#F8FAFC",
                        opacity: isShortCall ? 0.55 : 1,
                        marginBottom: 14,
                      }}
                    >
                      <CustomText
                        color={
                          !isShortCall && leadType === "interested"
                            ? "#fff"
                            : isShortCall
                              ? "#94A3B8"
                              : color.mainTxtColor
                        }
                        style={{ fontWeight: "700" }}
                      >
                        Interested
                      </CustomText>
                    </TouchableOpacity>

                    {leadType === "interested" && (
                      <DropdownRNE
                        label="Lead Status *"
                        placeholder="Select Status"
                        arrOfObj={filteredLeadStatus}
                        keyValueGetOnSelect="_id"
                        keyValueShowInBox="name"
                        initialValue={formik.values.status}
                        onChange={(v) => {
                          console.log("STATUS SELECTED =>", v);
                          setFollowUpError("");
                          formik.setFieldValue("status", v, false);

                          setTimeout(() => {
                            formik.setFieldTouched("status", false);
                          }, 100);
                        }}
                        mode="auto"
                        error={
                          formik.touched.status ? formik.errors.status : ""
                        }
                        dropdownStyle={{ height: 42 }}
                        containerStyle={{
                          marginBottom: 10,
                        }}
                      />
                    )}

                    {shouldShowFollowUpField && (
                      <>
                        <CustomText
                          style={{
                            marginBottom: 6,
                            fontWeight: "600",
                            color: color.mainTxtColor,
                          }}
                        >
                          Follow Up Time
                          {FOLLOWUP_REQUIRED_STATUSES_ONLY_POSITIVE.includes(
                            formik.values.status,
                          ) && (
                            <CustomText style={{ color: "red" }}> *</CustomText>
                          )}
                        </CustomText>

                        <DatePickerExpo
                          title="Date"
                          minimumDate={new Date()}
                          boxContainerStyle={{ marginBottom: 12 }}
                          initialValue={tdForFUT.date}
                          onSelect={(v) => {
                            setTdForFUT((prev) => ({
                              ...prev,
                              date: v || null,
                            }));

                            setFollowUpError("");
                          }}
                        />

                        <DatePickerExpo
                          key={timePickerKey}
                          title="Time"
                          mode="time"
                          minuteInterval={5}
                          minimumDate={
                            moment(tdForFUT.date).isSame(new Date(), "day")
                              ? new Date()
                              : undefined
                          }
                          boxContainerStyle={{ marginBottom: 15 }}
                          initialValue={tdForFUT.time}
                          onSelect={(v) => {
                            setTdForFUT((prev) => ({
                              ...prev,
                              time: v ? roundToNext5Min(new Date(v)) : null,
                            }));

                            setFollowUpError("");
                          }}
                        />
                        {!!followUpError && (
                          <CustomText
                            style={{
                              color: "red",
                              fontSize: 12,
                              marginTop: -8,
                              marginBottom: 10,
                            }}
                          >
                            {followUpError}
                          </CustomText>
                        )}
                      </>
                    )}
                    {leadType === "interested" && (
                      <>
                        <CustomInput
                          label="Client Name"
                          value={formik.values.clientName}
                          onChangeText={formik.handleChange("clientName")}
                          errors={
                            formik.touched.clientName
                              ? formik.errors.clientName
                              : undefined
                          }
                          onBlur={() => formik.setFieldTouched("clientName")}
                          marginBottom={15}
                        />
                        {/* <Text>Mobile Value : {formik.values.clientMobile}</Text> */}
                        <MobileInput
                          hideCountryPicker={true}
                          key={formik.values.clientMobile}
                          countryCodeDisabled={true}
                          mobileNumberDisabled={true}
                          value={formik.values.clientMobile}
                          onChange={(v) =>
                            formik.setFieldValue("clientMobile", v)
                          }
                          onBlur={() => formik.setFieldTouched("clientMobile")}
                          error={
                            formik.touched.clientMobile
                              ? formik.errors.clientMobile
                              : undefined
                          }
                        />

                        <CustomInput
                          label="Client Email"
                          placeholder="Enter client email"
                          value={formik.values.clientEmail}
                          onChangeText={formik.handleChange("clientEmail")}
                          errors={
                            formik.touched.clientEmail
                              ? formik.errors.clientEmail
                              : undefined
                          }
                          props={{
                            autoCapitalize: "none",
                            autoCorrect: false,
                          }}
                          onBlur={() => formik.setFieldTouched("clientEmail")}
                          marginBottom={15}
                        />

                        <CustomInput
                          label="Client Address"
                          value={formik.values.clientAddress}
                          onChangeText={formik.handleChange("clientAddress")}
                          marginBottom={15}
                        />

                        <DropdownRNE
                          label="Client Looking For"
                          placeholder="Select Requirement"
                          arrOfObj={clientLookingForOptions}
                          keyValueGetOnSelect="_id"
                          keyValueShowInBox="name"
                          initialValue={formik.values.clientLookingFor}
                          onChange={(v) =>
                            formik.setFieldValue("clientLookingFor", v)
                          }
                          mode="auto"
                          dropdownStyle={{
                            height: 42,
                            marginBottom: 10,
                          }}
                        />
                        <CustomInput
                          label="Project Looking For"
                          value={formik.values.projectLookingFor}
                          onChangeText={formik.handleChange(
                            "projectLookingFor",
                          )}
                          marginBottom={15}
                        />
                        <CustomInput
                          label="How Many Bedrooms Looking For"
                          value={formik.values.howManyBedroomsLookingFor}
                          onChangeText={formik.handleChange(
                            "howManyBedroomsLookingFor",
                          )}
                          marginBottom={15}
                        />
                        <CustomInput
                          label="Budget"
                          value={formik.values.budget}
                          onChangeText={formik.handleChange("budget")}
                          marginBottom={20}
                        />
                      </>
                    )}
                  </ScrollView>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      paddingTop: 10,
                      paddingBottom: Platform.OS === "ios" ? 0 : 5,
                      paddingHorizontal: 20,
                      borderTopWidth: 1,
                      borderTopColor: "#E5E7EB",
                      backgroundColor: "#fff",
                    }}
                  >
                    {canShowCancelBtn && (
                      <CustomBtn
                        title="Cancel"
                        containerStyle={{
                          flex: 1,
                        }}
                        onPress={async () => {
                          await hitCreateCallLog();
                          setShowLeadModal(false);
                          formik.resetForm();
                          setTdForFUT({
                            date: null,
                            time: null,
                          });
                          setLeadType("not_interested");
                          // goBack();
                        }}
                      />
                    )}

                    <CustomBtn
                      title="Submit"
                      containerStyle={{
                        flex: 1,
                      }}
                      onPress={async () => {
                        formik.setTouched({
                          clientName: true,
                          clientMobile: true,
                          clientEmail: true,
                          status: true,
                        });

                        formik.handleSubmit();
                        // myConsole(
                        //   "FORMIK validatiaonnn =>",
                        //   await formik.validateForm(),
                        // );
                        // myConsole("FORMIK ERRORS =>", formik.errors);
                        // myConsole("FORMIK Valuesss =>", formik.values);
                      }}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </View>
        </Modal>
      )}

      <Modal visible={showDurationEditor} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#0F172A",
                marginBottom: 6,
              }}
            >
              Confirm Call Duration
            </Text>

            {!!(pendingResumeRef.current?.number || calledNumber) && (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: color.mainTxtColor,
                  marginBottom: 4,
                }}
              >
                📞 {pendingResumeRef.current?.number || calledNumber}
              </Text>
            )}

            {!!pendingResumeRef.current?.initiatedAt && (
              <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>
                {`Call initiated: ${formatCallInitiatedAt(
                  pendingResumeRef.current.initiatedAt,
                )}`}
              </Text>
            )}

            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
              We couldn't accurately track this call's duration. Please enter it
              manually.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              {maxAllowedMinutes > 60 && (
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}
                  >
                    Hours
                  </Text>
                  <TextInput
                    value={editHours}
                    onChangeText={(v) => {
                      const num = parseInt(v || "0", 10);
                      if (num <= Math.floor(maxAllowedMinutes / 60)) {
                        setEditHours(v);
                      }
                    }}
                    keyboardType="number-pad"
                    placeholder="0"
                    style={{
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      borderRadius: 10,
                      padding: 10,
                      fontSize: 16,
                    }}
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}
                >
                  Minutes
                </Text>
                <TextInput
                  value={editMinutes}
                  onChangeText={(v) => {
                    const num = parseInt(v || "0", 10);
                    const hours =
                      maxAllowedMinutes > 60
                        ? parseInt(editHours || "0", 10)
                        : 0;
                    const maxMinutes =
                      maxAllowedMinutes > 60 &&
                      hours >= Math.floor(maxAllowedMinutes / 60)
                        ? maxAllowedMinutes % 60
                        : maxAllowedMinutes > 60
                          ? 59
                          : maxAllowedMinutes;
                    if (num <= maxMinutes) setEditMinutes(v);
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  style={{
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}
                >
                  Seconds
                </Text>
                <TextInput
                  value={editSeconds}
                  onChangeText={(v) => {
                    const num = parseInt(v || "0", 10);
                    const hours =
                      maxAllowedMinutes > 60
                        ? parseInt(editHours || "0", 10)
                        : 0;
                    const mins = parseInt(editMinutes || "0", 10);
                    const totalMinutes = hours * 60 + mins;
                    const secMax =
                      totalMinutes >= maxAllowedMinutes
                        ? maxAllowedSeconds
                        : 59;
                    if (num <= secMax) setEditSeconds(v);
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  style={{
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 16,
                  }}
                />
              </View>
            </View>

            <CustomBtn title="Confirm" onPress={confirmEditedDuration} />
          </View>
        </View>
      </Modal>
    </Container>
  );
};

export default CallListing;

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: "#E2E8F0",
    padding: 4,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  activeTab: { backgroundColor: "#2563EB" },
  tabText: { color: "#475569", fontWeight: "700", fontSize: 13 },
  activeTabText: { color: "#FFFFFF" },
  reviewFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
  },
  activeStatusChip: { backgroundColor: "#DBEAFE" },
  statusChipText: {
    textTransform: "capitalize",
    color: "#475569",
    fontWeight: "600",
  },
  activeStatusChipText: { color: "#1D4ED8" },
  pnlFilter: {
    maxWidth: 130,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
  },
  pnlFilterText: {
    maxWidth: 95,
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },
  bulkBar: {
    marginHorizontal: 12,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#dfe9ff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  bulkCount: { color: "black", fontWeight: "700", width: "100%" },
  bulkButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  bulkButtonText: { color: "white", fontWeight: "700" },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  pickerCard: {
    height: 420,
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  pickerList: {
    flex: 1,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  pickerOptionText: { color: "#334155", fontSize: 15 },
  floatingDialPadBtn: {
    position: "absolute",
    right: 22,
    // bottom: 100,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: color.mainTxtColor,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },
  floatingAddBtn: {
    position: "absolute",
    right: 22,
    bottom: 180,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: color.mainTxtColor,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  numberContainer: {
    minHeight: 46,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  numberText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 1,
  },

  numberInput: {
    flex: 1,
    width: "100%",
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 1,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },

  keyButton: {
    // aspectRatio: 1,
    height: 60,
    width: "30%",
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  keyText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  keySubText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 1,
  },

  callButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomActions: {
    height: 72,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  backButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    bottom: 4,
  },
});
