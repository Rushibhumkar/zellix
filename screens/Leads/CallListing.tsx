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

  const [tdForFUT, setTdForFUT] = useState({
    date: null,
    time: null,
  });
  const [followUpError, setFollowUpError] = useState("");
  const [timePickerKey, setTimePickerKey] = useState(0);
  const [showDialPad, setShowDialPad] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const appState = useRef(AppState.currentState);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [calledNumber, setCalledNumber] = useState("");
  const isCallingRef = useRef(false);
  const [leadType, setLeadType] = useState<"interested" | "not_interested">(
    "interested",
  );

  const myLogsQuery = useGetMyCallLogs(10);

  const userLogsQuery = useCallLogsByUserId(userId);

  const activeQuery = userId ? userLogsQuery : myLogsQuery;

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

  const filteredLeadStatus = inLeadStatus.filter((item) =>
    leadType === "interested"
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

  const formattedNumber = useMemo(() => {
    return phoneNumber;
  }, [phoneNumber]);

  // const handlePress = (digit: string) => {
  //   setPhoneNumber((prev) => prev + digit);
  // };

  const handlePress = (digit: string) => {
    setPhoneNumber((prev) => {
      if (prev.length >= 15) return prev; // max 15 digits
      return prev + digit;
    });
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };
  const handleCall = async (mobile?: string) => {
    const numberToCall = typeof mobile === "string" ? mobile : phoneNumber;

    console.log("CALLING NUMBER =>", numberToCall);

    if (!numberToCall || typeof numberToCall !== "string") {
      return;
    }
    try {
      isCallingRef.current = true;
      isCallLogSentRef.current = false;
      console.log("TYPE OF NUMBER =>", typeof numberToCall, numberToCall);
      dialedNumberRef.current = String(numberToCall);

      await Linking.openURL(`tel:${numberToCall}`);
    } catch (err) {
      console.log("Call Error", err);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // Call started
      if (isCallingRef.current && nextAppState === "background") {
        const startTime = Date.now();

        setCallStartTime(startTime);

        callStartTimeRef.current = startTime;

        setCallMeta({
          initiatedAt: startTime,
          finishedAt: null,
        });

        isCallTrackingRef.current = true;
      }

      // Returned from call
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

        setCalledNumber(mobile);

        formik.setFieldValue("clientMobile", mobile);

        console.log("FORMIK MOBILE AFTER SET =>", formik.values.clientMobile);

        setPhoneNumber("");

        setCallStartTime(null);

        isCallingRef.current = false;

        isCallTrackingRef.current = false;
        setShowDialPad(false);
        setTimeout(() => {
          setShowLeadModal(true);
        }, 500);
      }

      appState.current = nextAppState;
    });

    return () => subscription.remove();
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
      const durationInSec = Math.floor(
        (callMeta.finishedAt - callMeta.initiatedAt) / 1000,
      );
      console.log("CALL DURATION (SEC) =>", durationInSec);

      let callType: "not_connected" | "positive" | "negative" | "connected" =
        "connected";

      // ❌ very short call
      if (durationInSec < 12) {
        callType = "not_connected";
      }

      // ✅ status based
      if (statusAfterCall) {
        if (addManualLeadPositiveStatuses.includes(statusAfterCall)) {
          callType = "positive";
        } else if (addManualLeadNegativeStatuses.includes(statusAfterCall)) {
          callType = "negative";
        } else if (leadNeutralStatuses.includes(statusAfterCall)) {
          callType = "connected";
        }
      }

      // ❌ cancel case
      if (!statusAfterCall && durationInSec >= 12) {
        callType = "connected";
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
      leadType: "interested",
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
          clientEmail: values.clientEmail?.trim(),
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
          setLeadType("interested");

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
      setLeadType("interested");
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

      <FlatList
        data={callLogs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CallLogCard
            item={item}
            onPress={() => {
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
        <TouchableWithoutFeedback
          onPress={() => {
            setShowDialPad(false);
            setPhoneNumber("");
          }}
        >
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
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
                  {/* <TextInput
                    value={countryCode}
                    onChangeText={setCountryCode}
                    placeholder="+971"
                    placeholderTextColor={color.placeholderGrey}
                    style={styles.countryCodeInput}
                    keyboardType="phone-pad"
                  /> */}

                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter Number"
                    placeholderTextColor={color.placeholderGrey}
                    style={styles.numberInput}
                    showSoftInputOnFocus={false}
                    caretHidden
                    contextMenuHidden
                    maxLength={15}
                  />

                  {!!phoneNumber && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        // setCountryCode("");
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
                          setPhoneNumber((prev) => prev + "+");
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    contentContainerStyle={{
                      marginTop: 22,
                      paddingBottom: 40,
                    }}
                    nestedScrollEnabled
                  >
                    <View
                      style={{
                        marginBottom: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
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
                      <TouchableOpacity
                        onPress={async () => {
                          await hitCreateCallLog();
                          setShowLeadModal(false);
                          formik.resetForm();
                          setTdForFUT({
                            date: null,
                            time: null,
                          });
                          setLeadType("interested");
                          // goBack();
                        }}
                      >
                        <Feather
                          name="x"
                          size={24}
                          color={color.mainTxtColor}
                        />
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        marginBottom: 20,
                        gap: 10,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setLeadType("interested");
                          formik.setFieldValue("status", "");
                          formik.setFieldValue("leadType", "interested");
                        }}
                        style={{
                          flex: 1,
                          height: 45,
                          borderRadius: 12,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor:
                            leadType === "interested"
                              ? color.mainTxtColor
                              : "#F1F5F9",
                        }}
                      >
                        <CustomText
                          color={
                            leadType === "interested"
                              ? "#fff"
                              : color.mainTxtColor
                          }
                        >
                          Interested
                        </CustomText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setLeadType("not_interested");
                          formik.setFieldValue("status", "");
                          formik.setFieldValue("leadType", "not_interested");
                        }}
                        style={{
                          flex: 1,
                          height: 45,
                          borderRadius: 12,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor:
                            leadType === "not_interested"
                              ? color.mainTxtColor
                              : "#F1F5F9",
                        }}
                      >
                        <CustomText
                          color={
                            leadType === "not_interested"
                              ? "#fff"
                              : color.mainTxtColor
                          }
                        >
                          Not Looking Right Now
                        </CustomText>
                      </TouchableOpacity>
                    </View>

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
                      error={formik.touched.status ? formik.errors.status : ""}
                      dropdownStyle={{ height: 42 }}
                      containerStyle={{
                        marginBottom: 10,
                      }}
                    />

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
                    <CustomInput
                      label="Comment"
                      placeholder="Add comment"
                      value={formik.values.comment}
                      onChangeText={formik.handleChange("comment")}
                      marginBottom={20}
                      multiline
                      numberOfLines={4}
                      inputStyle={{
                        minHeight: 100,
                        textAlignVertical: "top",
                        paddingTop: 10,
                      }}
                    />
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
                        setLeadType("interested");
                        // goBack();
                      }}
                    />

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
    </Container>
  );
};

export default CallListing;

const styles = StyleSheet.create({
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
