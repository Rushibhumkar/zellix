import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import * as Linking from "expo-linking";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { useMeetingEligibility } from "../../hooks/useMeetingLifecycle";
import {
  isMeetingConflict,
  latestMeetingEntry,
  meetingActions,
  meetingMessage,
  meetingSuccess,
  meetingVersion,
} from "../../utils/meetingLifecycle";
import * as MailComposer from "expo-mail-composer";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Header from "../../components/Header";
import { Formik } from "formik";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import Container from "../../myComponents/Container/Container";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setCallDetect } from "../../redux/userSlice";
import { routeBooking, routeMeeting } from "../../utils/routes";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomModal from "../../myComponents/CustomModal/CustomModal";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { myConsole } from "../../hooks/useConsole";
// import ConfirmationCodeInput from "react-native-confirmation-code-input";
import { meetingConduct } from "../../services/rootApi/meetingApi";
import { cancelMeetingEntry } from "../../services/rootApi/meetingApi";
import CustomText from "../../myComponents/CustomText/CustomText";
import { HEIGHT, WIDTH } from "../../const/deviceInfo";
import CustomMapView from "../../myComponents/CustomMapView/CustomMapView";
import { meetingStatus, roleEnum } from "../../utils/data";
import * as Location from "expo-location";
import { color } from "../../const/color";
import { navigateToMapApp } from "../../utils/navigateToMapApp";
import { useGetMeetingById } from "../../hooks/useCRMgetQuerry";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyCRM } from "../../utils/queryKeys";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { headerIconWrapperStyle } from "../../const/globalStyle";
import * as Clipboard from "expo-clipboard";
import { useAppToast } from "../../components/AppToast";
import MeetingActionButtons from "../../components/MeetingActionButtons";

const ASPECT_RATIO = WIDTH / HEIGHT;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// const navigateToMapApp = (coordinates) => {
//   const { lat, lng } = coordinates;
//   console.log('lat', lat, 'lng', lng)
//   const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
//   const latLng = `${lat},${lng}`;
//   const label = 'Custom Label';
//   const url = Platform.select({
//     ios: `${scheme}${label}@${latLng}`,
//     android: `${scheme}${latLng}(${label})`
//   });

//   return Linking.openURL(url);
// }

export const getAddressFromCoordinates = async (coordinates: any) => {
  const { latitude, longitude } = coordinates;
  try {
    if (!!latitude) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDUjsrrYwsQnZZX6ocF7jQcXevrhoK9ruU`,
      );
      const json = await response.json();
      // setRealAddress(json.results[0]?.formatted_address);
      return json?.results[0]?.formatted_address;
    }
  } catch (error) {
    console.error("errLocation", error);
  }
};

export const getLocationLatLng = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Location Permission",
      "Permission to access location was denied. Give Permission to access location for conduct meeting ",
    );
    return;
  }
  let currentLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest, // Change from Highest to BestForNavigation
    maximumAge: 0, // Force fresh fetch
    timeout: 20000, // Give 20 seconds to improve GPS lock
  });

  let a = await Location.hasServicesEnabledAsync();
  return currentLocation;
  // setLocation(currentLocation);
};

const MeetingDetails = () => {
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const { params } = useRoute();
  let id = params?.item?._id;
  const { navigate, goBack } = useNavigation();
  const dispatch = useDispatch();
  const toast = useAppToast();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisibleRemark, setModalVisibleRemark] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapLatLng, setMapLatLng] = useState({});
  const { allUsers, user } = useSelector(selectUser);
  const [isLoadingRemark, setIsLoadingRemark] = useState(false);
  const [isLoadingConduct, setIsLoadingConduct] = useState(false);
  const [location, setLocation] = useState(null);
  const [cancelEntryId, setCancelEntryId] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionSnapshot, setActionSnapshot] = useState<any>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const handleCancelMeeting = async () => {
    if (!cancellationReason.trim() || isCancelling) return;
    setIsCancelling(true);
    try {
      const response = await cancelMeetingEntry(
        id,
        cancelEntryId,
        cancellationReason.trim(),
        meetingVersion(actionSnapshot),
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getMeetingById, id],
        }),
        queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getMeeting] }),
      ]);
      toast.success(meetingSuccess(response, "Meeting cancelled"));
      setCancelEntryId("");
      setCancellationReason("");
    } catch (error: any) {
      toast.error(meetingMessage(error, "Unable to cancel the meeting."));
      if (isMeetingConflict(error)) {
        setCancelEntryId("");
        await refetch();
      }
    } finally {
      setIsCancelling(false);
    }
  };

  //react query
  const {
    data: detail,
    isLoading: isLoadingQuery,
    refetch,
    isFetching,
    error: detailError,
  } = useGetMeetingById(id);
  const actions = meetingActions(detailError ? null : detail, now);
  const eligibility = useMeetingEligibility(
    detail?.lead?._id,
    user?._id,
    actions.closed,
  );
  useEffect(() => {
    if (isFocused) void refetch();
  }, [isFocused, id]);

  // myConsole("meededetailll", detail);
  //location
  useEffect(() => {
    const el = detail?.meetings[detail?.meetings?.length - 1];
    const isCurrentDate = moment(el?.scheduleDate).isSame(moment(), "day");
    const isNeedLocation = meetingActions(detail).conduct;
    if (isFocused && isNeedLocation) {
      (async () => {
        try {
          let tempLocation = await getLocationLatLng();
          setLocation(tempLocation);
        } catch {
          setLocation(null);
        }
      })();
      // (async () => {
      //   console.log('checkingLOCTION')
      //   // Check and request location permissions
      //   let { status } = await Location.requestForegroundPermissionsAsync();

      //   if (status !== 'granted') {
      //     Alert.alert('Location Permission', 'Permission to access location was denied. Give Permission to access location for conduct meeting ');
      //     return;
      //   }
      //   console.log('statusLocation', status)
      //   // Get the current location
      //   // Location.setGoogleApiKey(apiKey);
      //   let currentLocation = await Location.getCurrentPositionAsync({});
      //   setLocation(currentLocation);
      // })();
    }
  }, [isFocused, actions.conduct]);

  //map
  // let detail = params?.item;
  const [isMailAvail, setIsMailAvail] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [tempFollowUpId, setTempFollowUpId] = useState("");
  const isMeetingEdit = actions.edit;

  const handleConvertToBooking = () => {
    // navigate(routeMeeting.DeveloperInformation2, {
    //   data: { meeting: { _id: detail?._id }, isFromMeeting: true }
    // });
    navigate(routeBooking.bookingNavigator, {
      params: { data: { meeting: { _id: detail?._id } } },
      screen: routeBooking.DeveloperInformation,
      initial: false,
    });
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    resetForm();
  };

  const toggleModalOpenRemark = () => {
    setModalVisibleRemark(!isModalVisibleRemark);
  };
  const toggleMapViewModal = (v) => {
    setIsMapModalVisible(!isMapModalVisible);
    setMapLatLng(v);
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

  const rescheduleMeeting = () => {
    navigate("meetingReschedule", { id, meetingDetails: detail });
  };

  const navToCall = async () => {
    console.log("sdfgafd");
    await dispatch(
      setCallDetect({
        isCall: true,
        leadId: detail?.lead?._id,
      }),
    );
    await Linking.openURL(`tel:+${detail?.lead?.clientMobile}`);
  };

  const showThreeDotsWithNoKeysInPopup = user?._id === detail?.createdBy?._id;

  const latestMeeting = latestMeetingEntry(detail);
  const originalCreator = detail?.meetings?.find(
    (entry) =>
      String(entry._id) ===
      String(latestMeeting?.appointmentId || latestMeeting?._id),
  )?.createdBy;
  const canManageLatest = actions.manage;

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    toast.success(`${label} copied to clipboard`);
  };
  const memberNames = (latestMeeting?.members || [])
    .map((memberId: any) => {
      const member = memberId?._id
        ? memberId
        : allUsers?.find((item) => item._id === memberId);
      return member
        ? `${member.name || ""} ${member.lastName || ""}`.trim()
        : null;
    })
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Header
        title={"Meeting Details"}
        rightSide={
          <>
            {isMeetingEdit && (
              <TouchableOpacity
                onPress={() => navigate(routeMeeting.AddMeeting, { detail })}
                style={{ ...headerIconWrapperStyle }}
              >
                <Feather name="edit-2" size={18} color="#fff" />
              </TouchableOpacity>
            )}
            {showThreeDotsWithNoKeysInPopup && (
              <TouchableOpacity
                onPress={() => setShowActionsMenu(!showActionsMenu)}
                style={{ ...headerIconWrapperStyle }}
              >
                <Feather name="more-vertical" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        }
      />

      {/* 🔥 Three Dot Action Modal */}
      {showActionsMenu && (
        <TouchableWithoutFeedback onPress={() => setShowActionsMenu(false)}>
          <View style={styles.actionsOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.actionsModal}>
                {/* Change Status */}
                {user?._id === detail?.createdBy?._id && (
                  <>
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => {
                        setShowActionsMenu(false);
                        handleConvertToBooking();
                      }}
                    >
                      <CustomText style={styles.actionTextItem}>
                        Convert to Booking
                      </CustomText>
                    </TouchableOpacity>
                    {/* Reschedule Meeting */}
                    <TouchableOpacity
                      style={[styles.actionItem, { borderBottomWidth: 0 }]}
                      onPress={() => {
                        setShowActionsMenu(false);
                        rescheduleMeeting();
                      }}
                    >
                      <CustomText style={styles.actionTextItem}>
                        Reschedule Meeting
                      </CustomText>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      <Container>
        <ScrollView
          style={{ padding: 12 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
        >
          <View>
            {isFetching && (
              <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
            )}
            {detail &&
              (!detail.responsibleUserId ||
                detail.lifecycleVersion !== 2 ||
                detail.migrationBlocked) && (
                <View
                  style={{
                    padding: 14,
                    margin: 12,
                    borderRadius: 12,
                    backgroundColor: "#FFF7E6",
                  }}
                >
                  <CustomText color="#9A6517">
                    This meeting needs migration/admin review. History is
                    read-only until reviewed.
                  </CustomText>
                </View>
              )}
            {!!detailError && (
              <View
                style={{
                  padding: 14,
                  margin: 12,
                  backgroundColor: "#FFF1F1",
                  borderRadius: 12,
                }}
              >
                <CustomText color="#B91C1C">
                  {meetingMessage(
                    detailError,
                    "Unable to load meeting details",
                  )}
                </CustomText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => refetch()}
                  style={{ paddingVertical: 12 }}
                >
                  <CustomText color="#2E67BE">Retry</CustomText>
                </Pressable>
              </View>
            )}
            {detail?.responsibleUserId && (
              <View
                style={{
                  padding: 14,
                  // marginHorizontal: 12,
                  marginBottom: 12,
                  borderRadius: 12,
                  backgroundColor: "#EFF5FF",
                }}
              >
                <CustomText color="#64748B">Responsible person</CustomText>
                <CustomText fontWeight="600" color="#2E67BE">
                  {[
                    detail.responsibleUserId.name,
                    detail.responsibleUserId.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </CustomText>
              </View>
            )}

            <View style={styles.clientCard}>
              {/* Top Row */}
              <View style={styles.clientHeader}>
                <CustomText style={styles.clientName} numberOfLines={2}>
                  {detail?.lead?.clientName}
                </CustomText>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        latestMeeting?.status === "cancelled"
                          ? "#FEE2E2"
                          : latestMeeting?.status === "conducted"
                            ? "#DFF5E7"
                            : "#E3ECFB",
                    },
                  ]}
                >
                  <CustomText style={styles.statusText}>
                    {meetingStatus[latestMeeting?.status] ||
                      latestMeeting?.status ||
                      "Meeting"}
                  </CustomText>
                </View>
              </View>

              {/* Product */}
              <CustomText style={styles.productText}>
                {latestMeeting?.productPitch || detail?.productPitch || "-"}
              </CustomText>

              {/* Date */}
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="calendar-outline" size={16} color="#2D67C6" />
                </View>

                <CustomText style={styles.infoText}>
                  {moment(latestMeeting?.scheduleDate).format(
                    "DD MMMM YYYY • hh:mm A",
                  )}
                </CustomText>
              </View>

              {/* Location */}
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="location-outline" size={16} color="#2D67C6" />
                </View>

                <CustomText style={styles.infoText}>
                  {latestMeeting?.meetingMode === "virtual"
                    ? latestMeeting?.virtualMeetingLink || "Not specified"
                    : latestMeeting?.location || "Not specified"}
                </CustomText>
              </View>

              {/* Meeting Type */}
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="videocam-outline" size={16} color="#2D67C6" />
                </View>

                <CustomText style={styles.infoText}>
                  {latestMeeting?.meetingMode === "virtual"
                    ? "Virtual Meeting"
                    : "Physical Meeting"}
                </CustomText>
              </View>

              {/* Action Buttons */}
              <View style={styles.clientActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={navToCall}
                  onLongPress={() =>
                    handleCopy(detail?.lead?.clientMobile, "Mobile number")
                  }
                  delayLongPress={600}
                >
                  <View style={styles.actionIconCircle}>
                    <Feather name="phone" size={18} color="#fff" />
                  </View>
                  <CustomText style={styles.actionText}>Call</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openMail(detail?.lead?.clientEmail)}
                  onLongPress={() =>
                    handleCopy(detail?.lead?.clientEmail, "Email")
                  }
                  delayLongPress={600}
                >
                  <View
                    style={[
                      styles.actionIconCircle,
                      { backgroundColor: "#4F86E8" },
                    ]}
                  >
                    <Feather name="mail" size={18} color="#fff" />
                  </View>
                  <CustomText style={styles.actionText}>Email</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => Linking.openURL(detail?.lead?.whatsapp)}
                  onLongPress={() =>
                    handleCopy(detail?.lead?.whatsapp, "WhatsApp link")
                  }
                  delayLongPress={600}
                >
                  <View
                    style={[
                      styles.actionIconCircle,
                      { backgroundColor: "#22C55E" },
                    ]}
                  >
                    <Feather name="message-circle" size={18} color="#fff" />
                  </View>
                  <CustomText style={styles.actionText}>WhatsApp</CustomText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.meetingInfoCard}>
              <CustomText style={styles.meetingInfoTitle}>
                Meeting Information
              </CustomText>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>
                  Product Pitch
                </CustomText>
                <CustomText style={styles.meetingValue}>
                  {latestMeeting?.productPitch || detail?.productPitch || "-"}
                </CustomText>
              </View>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>
                  Client Address
                </CustomText>
                <CustomText style={styles.meetingValue}>
                  {detail?.clientAddress || "-"}
                </CustomText>
              </View>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>Client City</CustomText>
                <CustomText style={styles.meetingValue}>
                  {detail?.clientCity || "-"}
                </CustomText>
              </View>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>
                  Client Country
                </CustomText>
                <CustomText style={styles.meetingValue}>
                  {detail?.clientCountry || "-"}
                </CustomText>
              </View>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>
                  Appointment Creator
                </CustomText>
                <CustomText style={styles.meetingValue}>
                  {`${originalCreator?.name || ""} ${originalCreator?.lastName || ""}`.trim() ||
                    "-"}
                  {originalCreator?.role ? ` (${originalCreator.role})` : ""}
                </CustomText>
              </View>

              <View style={[styles.meetingInfoRow, styles.membersInfoRow]}>
                <CustomText style={styles.meetingLabel}>Members</CustomText>
                <View style={styles.membersValueContainer}>
                  <CustomText style={styles.membersValue}>
                    {memberNames || "-"}
                  </CustomText>
                </View>
              </View>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>Created At</CustomText>
                <CustomText style={styles.meetingValue}>
                  {moment(detail?.createdAt).format("DD MMM YYYY, hh:mm A")}
                </CustomText>
              </View>
            </View>

            {(detail?.meetings || []).map((el, index) => {
              const isLatestEntry = index === detail.meetings.length - 1;
              const isCurrentDate = moment(el?.scheduleDate).isSame(
                moment(),
                "day",
              );
              const addMeetingDisabledReason = !actions.closed
                ? "Conduct or cancel the latest meeting before adding another meeting."
                : eligibility.isFetching
                  ? "Checking lead ownership…"
                  : !eligibility.data?.allowed
                    ? eligibility.data?.reason ||
                      meetingMessage(
                        eligibility.error,
                        "Unable to verify lead eligibility. Reopen this screen to retry.",
                      )
                    : "";
              return (
                // <View key={index}>
                //   <View>
                //     {el?.status === "conducted" && (
                //       <RowItem
                //         title="Conducted Through"
                //         value={
                //           !!el?.isMobile
                //             ? "Mobile Application"
                //             : "Web Application"
                //         }
                //         containerStyle={{ marginBottom: 10 }}
                //       />
                //     )}
                //     {el?.status === "conducted" && (
                //       <RowItem
                //         title="Location Permission"
                //         containerStyle={{ marginBottom: 10 }}
                //         component={
                //           <CustomText
                //             style={{
                //               fontWeight: !!el?.isLocationGranted
                //                 ? "400"
                //                 : "800",
                //               color: color.mainTxtColor,
                //             }}
                //           >
                //             {!!el?.isLocationGranted ? "Granted" : "Denied"}
                //           </CustomText>
                //         }
                //       />
                //     )}
                //   </View>
                //   <View
                //     style={{
                //       flexDirection: "row",
                //       gap: 15,
                //       margin: 15,
                //       marginBottom: 20,
                //     }}
                //   >
                //     {isLastMeeting && user?._id === detail?.createdBy?._id && (
                //       <>
                //         <CustomBtn
                //           title="Reschedule"
                //           textStyle={{ fontSize: 12, color: "#fff" }}
                //           //  onPress={toggleModal}
                //           onPress={rescheduleMeeting}
                //           containerStyle={{
                //             marginBottom: 50,
                //             height: 40,
                //             width: "40%",
                //             backgroundColor: "rgb(191, 191, 191)",
                //             zIndex: 20,
                //           }}
                //         />
                //         {isCurrentDate && el?.status !== "conducted" && (
                //           <CustomBtn
                //             title="Conduct"
                //             textStyle={{ fontSize: 12, color: "black" }}
                //             isLoading={isLoadingConduct}
                //             // onPress={() => handleOtpGenerate(el?._id)}
                //             onPress={() => {
                //               setTempFollowUpId(el?._id);
                //               toggleModalOpenRemark();
                //             }}
                //             containerStyle={{
                //               marginBottom: 50,
                //               height: 40,
                //               width: "40%",
                //               backgroundColor: "rgb(253, 219, 50)",
                //             }}
                //           />
                //         )}
                //       </>
                //     )}
                //   </View>
                // </View>
                <React.Fragment key={el?._id || index}>
                  <View style={styles.meetingCard}>
                    <View style={styles.meetingCardHeader}>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <CustomText style={styles.meetingCardTitle}>
                          Meeting {index + 1}
                        </CustomText>
                        <CustomText style={styles.conductedThrough}>
                          {!!el?.isMobile ? "App" : "Web"}
                        </CustomText>
                      </View>
                      <CustomText style={styles.meetingCardStatus}>
                        {meetingStatus[el?.status]}
                      </CustomText>
                    </View>

                    <CustomText style={styles.meetingCardDate}>
                      {moment(el?.scheduleDate).format("DD MMM YYYY • hh:mm A")}
                    </CustomText>

                    <View style={styles.meetingLocationRow}>
                      <Ionicons
                        name={
                          el?.meetingMode === "virtual"
                            ? "videocam-outline"
                            : "location-outline"
                        }
                        size={18}
                        color="#2D67C6"
                      />

                      <CustomText style={styles.meetingLocationText}>
                        {el?.meetingMode === "virtual"
                          ? el?.virtualMeetingLink || "Not specified"
                          : el?.location || "Not specified"}
                      </CustomText>

                      {el?.meetingMode !== "virtual" &&
                        el?.coordinates?.lat && (
                          <TouchableOpacity
                            onPress={() => navigateToMapApp(el?.coordinates)}
                          >
                            <Ionicons
                              name="navigate-circle"
                              size={22}
                              color="#2D67C6"
                            />
                          </TouchableOpacity>
                        )}
                    </View>

                    <CustomText style={styles.meetingRemarks}>
                      Meeting Type:{" "}
                      {el?.meetingMode === "virtual" ? "Virtual" : "Physical"}
                    </CustomText>

                    <CustomText style={styles.meetingRemarks}>
                      Product Pitch: {el?.productPitch || "-"}
                    </CustomText>

                    {el?.remarks && (
                      <CustomText style={styles.meetingRemarks}>
                        Remark : {el?.remarks}
                      </CustomText>
                    )}
                    {el?.cancellationReason && (
                      <CustomText style={styles.meetingRemarks}>
                        Cancellation reason: {el.cancellationReason}
                      </CustomText>
                    )}
                  </View>
                  {isLatestEntry && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityHint={addMeetingDisabledReason || undefined}
                      accessibilityState={{
                        disabled: Boolean(addMeetingDisabledReason),
                      }}
                      disabled={Boolean(addMeetingDisabledReason)}
                      onPress={() => {
                        if (addMeetingDisabledReason) {
                          toast.info(addMeetingDisabledReason);
                          return;
                        }
                        navigate("AddMeeting", {
                          detail,
                          followUpSource: el,
                        });
                      }}
                      style={[
                        styles.addMeetingButton,
                        Boolean(addMeetingDisabledReason) &&
                          styles.addMeetingButtonDisabled,
                      ]}
                    >
                      <Feather
                        name="calendar"
                        size={16}
                        color={addMeetingDisabledReason ? "#94A3B8" : "#2E67BE"}
                      />
                      <CustomText
                        style={[
                          styles.addMeetingButtonText,
                          Boolean(addMeetingDisabledReason) && {
                            color: "#94A3B8",
                          },
                        ]}
                      >
                        Add New Meeting
                      </CustomText>
                    </Pressable>
                  )}
                  {/* {
                    <CustomBtn
                      title="Reschedule"
                      textStyle={{ fontSize: 12, color: "#fff" }}
                      //  onPress={toggleModal}
                      onPress={rescheduleMeeting}
                      containerStyle={{
                        marginBottom: 50,
                        height: 40,
                        width: "40%",
                        backgroundColor: "rgb(191, 191, 191)",
                        zIndex: 20,
                      }}
                    />
                  }
                  {isCurrentDate &&
                    el?.status !== "conducted" &&
                    index === detail?.meetings?.length - 1 &&
                    user?._id === detail?.createdBy?._id && (
                      <CustomBtn
                        title="Conduct"
                        textStyle={{ fontSize: 12, color: "#fff" }}
                        isLoading={isLoadingConduct}
                        onPress={() => {
                          setTempFollowUpId(el?._id);
                          toggleModalOpenRemark();
                        }}
                        containerStyle={{
                          marginBottom: 50,
                          height: 40,
                          width: "40%",
                          backgroundColor: "rgb(253, 219, 50)",
                          alignSelf: "flex-end",
                        }}
                      />
                    )} */}

                  {index === detail?.meetings?.length - 1 &&
                    canManageLatest &&
                    ["schedule", "reschedule"].includes(el?.status) && (
                      <MeetingActionButtons
                        onReschedule={rescheduleMeeting}
                        onCancel={() => {
                          setActionSnapshot(detail);
                          setCancelEntryId(el._id);
                          setCancellationReason("");
                        }}
                        canConduct={actions.conduct}
                        conducting={isLoadingConduct}
                        onConduct={() => {
                          setTempFollowUpId(el?._id);
                          setActionSnapshot(detail);
                          toggleModalOpenRemark();
                        }}
                      />
                    )}
                </React.Fragment>
              );
            })}
          </View>
          {/* <TouchableOpacity style={styles.viewLeadProfBtn}>
            <CustomText style={styles.viewLeadProfTxt}>
              View Lead Profile
            </CustomText>
          </TouchableOpacity> */}

          <CustomModal
            avoidKeyboard
            visible={isModalVisibleRemark}
            onClose={() => { if (!isLoadingRemark) toggleModalOpenRemark(); }}
            hasBackdrop={false}
          >
            <Formik
              key={`${actionSnapshot?._id}-${actionSnapshot?.__v}`}
              initialValues={{
                remarks: "",
              }}
              onSubmit={async (values) => {
                if (isLoadingRemark) return;
                if (!values.remarks.trim()) {
                  toast.error("Completion remarks are required");
                  return;
                }
                setIsLoadingRemark(true);
                try {
                  let conductMeetingAddress = !!location?.coords?.latitude
                    ? await getAddressFromCoordinates(location?.coords)
                    : null;
                  let tempSendData = {
                    ...meetingVersion(actionSnapshot),
                    remarks: values?.remarks,
                    isMobile: true,
                    isLocationGranted: !!location?.coords?.latitude
                      ? true
                      : false,
                    ...(!!conductMeetingAddress && {
                      conductMeetingAddress: conductMeetingAddress,
                    }),
                  };
                  // await meetingConduct(id, values); //{followUpId, token,remarks,coordinates:{lat,lng}}
                  let res = await meetingConduct(id, tempSendData);

                  await queryClient.invalidateQueries({
                    queryKey: [queryKeyCRM.getMeetingById, id],
                  });
                  queryClient.invalidateQueries({
                    queryKey: [queryKeyCRM.getMeeting],
                  });
                  popUpConfToast.successMessage(
                    meetingSuccess(res, "Meeting conducted"),
                  );
                  setModalVisibleRemark(false);
                  // goBack();
                  // await dispatch(getAllMeetingFunc());
                  // navigate(routeMeeting?.AllMeetings);
                } catch (error) {
                  toast.error(meetingMessage(error));
                  if (isMeetingConflict(error)) {
                    setModalVisibleRemark(false);
                    await refetch();
                  }
                }
                setIsLoadingRemark(false);
              }}
            >
              {({ handleChange, handleSubmit, values, touched, errors }) => (
                <ScrollView
                  style={{ flexGrow: 0, flexShrink: 1 }}
                  contentContainerStyle={styles.conductSheetBody}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.conductSheetHeader}>
                    <View style={styles.conductSheetIcon}>
                      <Feather name="check-circle" size={21} color="#2E67BE" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <CustomText style={styles.conductSheetTitle}>Conduct Meeting</CustomText>
                      <CustomText style={styles.conductSheetSubtitle}>Add completion remarks to finish this meeting.</CustomText>
                    </View>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close conduct meeting" disabled={isLoadingRemark} onPress={toggleModalOpenRemark} style={styles.conductSheetClose}>
                      <Feather name="x" size={21} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <CustomText style={styles.conductRemarksLabel}>Completion remarks <CustomText color="#B91C1C">*</CustomText></CustomText>
                  <CustomInput
                    placeholder="Describe the meeting outcome…"
                    onChangeText={handleChange("remarks")}
                    value={values.remarks}
                    multiline
                    editable={!isLoadingRemark}
                    props={{ accessibilityLabel: "Completion remarks", placeholderTextColor: "#64748B", textAlignVertical: "top" }}
                    inputContainerStyle={styles.conductRemarksContainer}
                    inputStyle={styles.conductRemarksInput}
                  />
                  {errors.remarks && touched.remarks && (
                    <CustomText style={{ color: "#B91C1C", fontSize: 12 }}>
                      {errors.remarks}
                    </CustomText>
                  )}
                  <View style={styles.conductLocationNote}>
                    <Feather name="map-pin" size={16} color="#527098" />
                    <CustomText style={styles.conductLocationText}>
                      {location?.coords?.latitude
                        ? "Your current location is available and will be recorded when possible."
                        : "Location is unavailable. You can still mark the meeting as conducted."}
                    </CustomText>
                  </View>
                  <CustomBtn
                    title="Mark as Conducted"
                    onPress={handleSubmit}
                    disabled={!values.remarks.trim() || isLoadingRemark}
                    containerStyle={styles.conductSaveButton}
                    gradientContStyle={{ borderRadius: 10, minHeight: 46 }}
                    textStyle={{ fontSize: 14, fontWeight: "600" }}
                    isLoading={isLoadingRemark}
                  />
                </ScrollView>
              )}
            </Formik>
          </CustomModal>
          <CustomMapView
            hasBackdrop={false}
            isMapModalVisible={isMapModalVisible}
            toggleMapViewModal={toggleMapViewModal}
            mapLatLng={mapLatLng}
          />
        </ScrollView>
        <CustomModal
          avoidKeyboard
          visible={Boolean(cancelEntryId)}
          onClose={() => {
            if (!isCancelling) setCancelEntryId("");
          }}
        >
          <ScrollView
            style={{ flexGrow: 0, flexShrink: 1 }}
            contentContainerStyle={{ padding: 20, gap: 14 }}
            keyboardShouldPersistTaps="handled"
          >
            <CustomText fontSize={20} fontWeight="700">
              Cancel Meeting?
            </CustomText>
            <CustomText>
              This will cancel the latest meeting and stop its pending
              reminders.
            </CustomText>
            <CustomInput
              label="Cancellation reason"
              value={cancellationReason}
              onChangeText={setCancellationReason}
              props={{ maxLength: 1000, textAlignVertical: "top" }}
              inputStyle={{ minHeight: 80, maxHeight: 140 }}
              multiline
              editable={!isCancelling}
            />
            <CustomBtn
              title="Cancel Meeting"
              onPress={handleCancelMeeting}
              isLoading={isCancelling}
              disabled={!cancellationReason.trim() || isCancelling}
              containerStyle={{ backgroundColor: "#B91C1C" }}
            />
            <CustomBtn
              title="Keep Meeting"
              onPress={() => setCancelEntryId("")}
              disabled={isCancelling}
            />
          </ScrollView>
        </CustomModal>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  conductSheetBody: { paddingHorizontal: 20, paddingBottom: 8, gap: 14 },
  conductSheetHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  conductSheetIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#EDF4FF", alignItems: "center", justifyContent: "center" },
  conductSheetTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  conductSheetSubtitle: { fontSize: 12, lineHeight: 17, color: "#64748B", marginTop: 4 },
  conductSheetClose: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#F3F6FA" },
  conductRemarksLabel: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: -6 },
  conductRemarksContainer: { borderRadius: 12, borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#F8FAFC", alignItems: "flex-start", paddingVertical: 10, paddingHorizontal: 12 },
  conductRemarksInput: { minHeight: 84, maxHeight: 140, fontSize: 14, lineHeight: 20, color: "#1E293B", paddingVertical: 0 },
  conductLocationNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, backgroundColor: "#F1F6FD" },
  conductLocationText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#526784" },
  conductSaveButton: { width: "100%", borderRadius: 10, marginTop: 2, shadowOpacity: 0, elevation: 0 },
  actionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  conductedThrough: {
    backgroundColor: "#2e68be17",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 13,
    color: color.mainTxtColor,
  },
  actionTextItem: {
    fontSize: 15,
    color: color.mainTxtColor,
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
  clientCard: {
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginBottom: 20,
  },

  clientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  clientName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D67C6",
    maxWidth: "70%",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D67C6",
  },

  productText: {
    marginTop: 6,
    fontSize: 16,
    color: "#6B7280",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#E8EEF9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoText: {
    flex: 1,
    color: "#374151",
  },

  clientActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  actionBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#E6ECF5",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 6,
  },

  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2D67C6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D67C6",
  },

  meetingInfoCard: {
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginBottom: 20,
  },

  meetingInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: color.mainTxtColor,
  },

  meetingInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  meetingLabel: {
    fontSize: 14,
    color: "#6B7280",
    width: "36%",
    flexShrink: 0,
  },

  meetingValue: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    flexShrink: 1,
    textAlign: "right",
  },

  membersInfoRow: {
    marginBottom: 10,
  },

  membersValueContainer: {
    width: "64%",
    alignItems: "flex-end",
  },

  membersValue: {
    width: "100%",
    fontSize: 14,
    lineHeight: 21,
    color: "#374151",
    textAlign: "right",
    flexShrink: 1,
  },

  meetingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginBottom: 16,
  },

  meetingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  meetingCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: color.mainTxtColor,
  },

  meetingCardStatus: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D67C6",
  },

  meetingCardDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },

  meetingLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  meetingLocationText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },

  meetingRemarks: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
  },
  addMeetingButton: {
    marginTop: -8,
    marginBottom: 16,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BBD3F5",
    backgroundColor: "#EEF5FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  addMeetingButtonDisabled: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
  },
  addMeetingButtonText: {
    color: "#2E67BE",
    fontSize: 14,
    fontWeight: "600",
  },
  viewLeadProfBtn: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1.2,
    borderColor: color.primaryFade,
    borderRadius: 12,
  },
  viewLeadProfTxt: {
    fontSize: 18,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
});

export default MeetingDetails;
