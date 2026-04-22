import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import * as Linking from "expo-linking";
import moment from "moment";
import React, { useState, useEffect } from "react";
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
import { meetingOtpGenerate } from "../../services/rootApi/meetingApi";
import { meetingConduct } from "../../services/rootApi/meetingApi";
import { meetingOtpVerify } from "../../services/rootApi/meetingApi";
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
  const [isModalVisibleConduct, setModalVisibleConduct] = useState(false);
  const [isModalVisibleRemark, setModalVisibleRemark] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapLatLng, setMapLatLng] = useState({});
  const { allUsers, user } = useSelector(selectUser);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isLoadingRemark, setIsLoadingRemark] = useState(false);
  const [isLoadingConduct, setIsLoadingConduct] = useState(false);
  const [followUpId, setFollowUpId] = useState("");
  const [token, setToken] = useState("");
  const [location, setLocation] = useState(null);

  //react query
  const {
    data: detail,
    isLoading: isLoadingQuery,
    refetch,
    isFetching,
  } = useGetMeetingById(id);

  // myConsole("meededetailll", detail);
  //location
  useEffect(() => {
    const el = detail?.meetings[detail?.meetings?.length - 1];
    const isCurrentDate = moment(el?.scheduleDate).isSame(moment(), "day");
    const isNeedLocation =
      isCurrentDate &&
      el?.status !== "conducted" &&
      user?._id === detail?.createdBy?._id;
    if (isFocused) {
      (async () => {
        let tempLocation = await getLocationLatLng();
        setLocation(tempLocation);
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
  }, [isFocused]);

  //map
  // let detail = params?.item;
  const [isMailAvail, setIsMailAvail] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [tempFollowUpId, setTempFollowUpId] = useState("");
  const isMeetingEdit =
    user?.role === roleEnum?.sup_admin || user?.role === roleEnum?.sub_admin;

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

  const toggleModalOtpVerify = () => {
    setModalVisibleConduct(!isModalVisibleConduct);
  };

  const toggleModalOpenRemark = () => {
    setModalVisibleRemark(!isModalVisibleRemark);
  };
  const toggleMapViewModal = (v) => {
    setIsMapModalVisible(!isMapModalVisible);
    setMapLatLng(v);
  };

  const handleOtpGenerate = async (_id) => {
    try {
      setIsLoadingConduct(true);
      const { data } = await meetingOtpGenerate(id);
      setFollowUpId(_id);
      toggleModalOtpVerify();
    } catch (error) {
      console.log(error);
    }
    setIsLoadingConduct(false);
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
    const meetingDetails = params?.item;
    navigate("meetingReschedule", { id, meetingDetails });
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

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    toast.success(`${label} copied to clipboard`);
  };

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
                        detail?.meetings?.[detail?.meetings?.length - 1]
                          ?.status === "conducted"
                          ? "#DFF5E7"
                          : "#E3ECFB",
                    },
                  ]}
                >
                  <CustomText style={styles.statusText}>
                    {detail?.meetings?.[detail?.meetings?.length - 1]
                      ?.status === "conducted"
                      ? "Conducted"
                      : "Scheduled"}
                  </CustomText>
                </View>
              </View>

              {/* Product */}
              <CustomText style={styles.productText}>
                {detail?.productPitch}
              </CustomText>

              {/* Date */}
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="calendar-outline" size={16} color="#2D67C6" />
                </View>

                <CustomText style={styles.infoText}>
                  {moment(
                    detail?.meetings?.[detail?.meetings?.length - 1]
                      ?.scheduleDate,
                  ).format("DD MMMM YYYY • hh:mm A")}
                </CustomText>
              </View>

              {/* Location */}
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="location-outline" size={16} color="#2D67C6" />
                </View>

                <CustomText style={styles.infoText}>
                  {detail?.meetings?.[detail?.meetings?.length - 1]?.location}
                </CustomText>
              </View>

              {/* Meeting Type */}
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="videocam-outline" size={16} color="#2D67C6" />
                </View>

                <CustomText style={styles.infoText}>
                  {detail?.meetings?.[detail?.meetings?.length - 1]?.isMobile
                    ? "Video Call"
                    : "In-Person Meeting"}
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
                  {detail?.productPitch}
                </CustomText>
              </View>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>Created By</CustomText>
                <CustomText style={styles.meetingValue}>
                  {detail?.createdBy?.name} ({detail?.createdBy?.role})
                </CustomText>
              </View>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>Agent</CustomText>
                <CustomText style={styles.meetingValue}>
                  {detail?.agents
                    ?.map((agentId: any) => {
                      const agent = allUsers?.find((u) => u._id === agentId);
                      return agent?.name || "Unknown";
                    })
                    .join(", ")}
                </CustomText>
              </View>

              <View style={styles.meetingInfoRow}>
                <CustomText style={styles.meetingLabel}>Created At</CustomText>
                <CustomText style={styles.meetingValue}>
                  {moment(detail?.createdAt).format("DD MMM YYYY, hh:mm A")}
                </CustomText>
              </View>
            </View>

            {(detail?.meetings || []).map((el, index) => {
              const isCurrentDate = moment(el?.scheduleDate).isSame(
                moment(),
                "day",
              );
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
                <>
                  <View style={styles.meetingCard} key={index}>
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
                        name="location-outline"
                        size={18}
                        color="#2D67C6"
                      />

                      <CustomText style={styles.meetingLocationText}>
                        {el?.location}
                      </CustomText>

                      {el?.coordinates?.lat && (
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

                    {el?.remarks && (
                      <CustomText style={styles.meetingRemarks}>
                        Remark : {el?.remarks}
                      </CustomText>
                    )}
                  </View>
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
                    user?._id === detail?.createdBy?._id && (
                      <View
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          alignSelf: "flex-end",
                        }}
                      >
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
                        {isCurrentDate && el?.status !== "conducted" && (
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
                            }}
                          />
                        )}
                      </View>
                    )}
                </>
              );
            })}
          </View>
          {/* <TouchableOpacity style={styles.viewLeadProfBtn}>
            <CustomText style={styles.viewLeadProfTxt}>
              View Lead Profile
            </CustomText>
          </TouchableOpacity> */}

          <CustomModal
            visible={isModalVisibleConduct}
            onClose={toggleModalOtpVerify}
            hasBackdrop={false}
          >
            <Formik
              initialValues={{
                otp: "",
              }}
              onSubmit={async (values) => {
                //console.log("values", values);
                try {
                  setIsLoadingOtp(true);
                  const { data } = await meetingOtpVerify(id, values);
                  setToken(data?.token);
                  toggleModalOtpVerify(false);
                  toggleModalOpenRemark(true);
                } catch (error) {
                  myConsole("error", error);
                }
                setIsLoadingOtp(false);
              }}
            >
              {({ handleChange, handleSubmit, values, errors }) => (
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 10,
                    borderRadius: 10,
                    width: 340,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: 10,
                    }}
                  >
                    <CustomText
                      style={{
                        textAlign: "center",
                        fontSize: 20,
                        fontWeight: 600,
                      }}
                    >
                      OTP Verification
                    </CustomText>
                    <TouchableOpacity onPress={toggleModalOtpVerify}>
                      <AntDesign name="close" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                  <CustomText style={{ textAlign: "center" }}>
                    Kindly ask Your/client to provide the otp sent to there
                    mobile Number
                  </CustomText>
                  <CustomText style={{ textAlign: "center", marginTop: 10 }}>
                    The session will expire 5 min
                  </CustomText>
                  <View style={{ marginBottom: 40 }}></View>

                  <CustomBtn
                    title={"Submit"}
                    onPress={handleSubmit}
                    containerStyle={{ margin: 20, textAlign: "center" }}
                    isLoading={isLoadingOtp}
                  />
                </View>
              )}
            </Formik>
          </CustomModal>
          <CustomModal
            visible={isModalVisibleRemark}
            onClose={toggleModalOpenRemark}
            hasBackdrop={false}
          >
            <Formik
              initialValues={{
                remarks: "",
                followUpId: followUpId,
                token: token,
              }}
              onSubmit={async (values) => {
                let conductMeetingAddress = !!location?.coords?.latitude
                  ? await getAddressFromCoordinates(location?.coords)
                  : null;
                let tempSendData = {
                  remarks: values?.remarks,
                  followUpId: tempFollowUpId,
                  isMobile: true,
                  isLocationGranted: !!location?.coords?.latitude
                    ? true
                    : false,
                  ...(!!conductMeetingAddress && {
                    conductMeetingAddress: conductMeetingAddress,
                  }),
                  ...(!!location?.coords?.latitude && {
                    conductCoordinates: {
                      lat: location?.coords?.latitude,
                      lng: location?.coords?.longitude,
                    },
                  }),
                };
                try {
                  setIsLoadingRemark(true);
                  // await meetingConduct(id, values); //{followUpId, token,remarks,coordinates:{lat,lng}}
                  let res = await meetingConduct(id, tempSendData);

                  queryClient.invalidateQueries({
                    queryKey: [queryKeyCRM.getMeetingById, id],
                  });
                  queryClient.invalidateQueries({
                    queryKey: [queryKeyCRM.getMeeting],
                  });
                  popUpConfToast.successMessage(res?.data);
                  // goBack();
                  // await dispatch(getAllMeetingFunc());
                  // navigate(routeMeeting?.AllMeetings);
                } catch (error) {
                  console.log(error);
                }
                setIsLoadingRemark(false);
                toggleModalOpenRemark(false);
              }}
            >
              {({ handleChange, handleSubmit, values, touched, errors }) => (
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 10,
                    borderRadius: 10,
                    width: 340,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: 10,
                    }}
                  >
                    <Pressable
                      onLongPress={() => {
                        Alert.alert("location", location);
                      }}
                    >
                      <CustomText style={styles.conductMeetingTxt}>
                        Conduct Meeting
                      </CustomText>
                    </Pressable>
                    <TouchableOpacity onPress={toggleModalOpenRemark}>
                      <AntDesign name="close" size={24} color="black" />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="Remarks"
                    // placeholder="remarks"
                    onChangeText={handleChange("remarks")}
                    value={values.remarks}
                    containerStyle={{ marginBottom: 15 }}
                  />
                  {errors.remarks && touched.remarks && (
                    <CustomText style={{ color: "red" }}>
                      {errors.remarks}
                    </CustomText>
                  )}
                  <CustomText fontSize={13} color={color.textGray}>
                    {location?.coords?.latitude
                      ? `Note: Your live location is detected.`
                      : `Note: Your live location is not detected. Please give the location permission. If you have given the location access then please wait for the app to fetch your location or reopen the app`}
                  </CustomText>
                  <CustomBtn
                    title={"Save"}
                    onPress={handleSubmit}
                    containerStyle={{ margin: 20, textAlign: "center" }}
                    isLoading={isLoadingRemark}
                  />
                </View>
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
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
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

  conductMeetingTxt: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: 600,
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
    marginBottom: 10,
  },

  meetingLabel: {
    fontSize: 14,
    color: "#6B7280",
  },

  meetingValue: {
    fontSize: 14,
    color: "#374151",
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
