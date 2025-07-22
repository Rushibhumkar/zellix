import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import * as Linking from "expo-linking";
import { useFormik } from "formik";
import moment from "moment";
import React, { useRef, useState, useEffect } from "react";
import * as MailComposer from "expo-mail-composer";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import { Formik } from "formik";
import { AntDesign, Feather } from "@expo/vector-icons";
import RowItem from "../../myComponents/RowItem/RowItem";
import Container from "../../myComponents/Container/Container";
import { useDispatch, useSelector } from "react-redux";
import { getAllMeetingFunc } from "../../redux/action";
import { selectUser, setCallDetect } from "../../redux/userSlice";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import EditIcon from "../../assets/svg/EditIcon";
import { routeBooking, routeMeeting } from "../../utils/routes";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomModal from "../../myComponents/CustomModal/CustomModal";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import { myConsole } from "../../hooks/useConsole";
import { meetingRescheduled } from "../../services/rootApi/meetingApi";
import ConfirmationCodeInput from "react-native-confirmation-code-input";
import { meetingOtpGenerate } from "../../services/rootApi/meetingApi";
import { meetingConduct } from "../../services/rootApi/meetingApi";
import { meetingOtpVerify } from "../../services/rootApi/meetingApi";
import CustomText from "../../myComponents/CustomText/CustomText";
import MapView, {
  Marker,
  AnimatedRegion,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { HEIGHT, WIDTH } from "../../const/deviceInfo";
import CustomMapView from "../../myComponents/CustomMapView/CustomMapView";
import CustomGooglePlacesSearch from "../../myComponents/CustomGooglePlacesSearch/CustomGooglePlacesSearch";
import { userTypes, meetingStatus, roleEnum } from "../../utils/data";
import * as Location from "expo-location";
import { color } from "../../const/color";
import { navigateToMapApp } from "../../utils/navigateToMapApp";
import { useGetMeetingById } from "../../hooks/useCRMgetQuerry";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyCRM } from "../../utils/queryKeys";
import { popUpConfToast } from "../../utils/toastModalByFunction";

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

export const getAddressFromCoordinates = async (coordinates) => {
  const { latitude, longitude } = coordinates;
  try {
    console.log("latitude", latitude, 'longitude', longitude);
    if (!!latitude) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDUjsrrYwsQnZZX6ocF7jQcXevrhoK9ruU`
      );
      const json = await response.json();
      myConsole("json@@", json.results[0]?.formatted_address);
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
      "Permission to access location was denied. Give Permission to access location for conduct meeting "
    );
    return;
  }
let currentLocation = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Highest, // Change from Highest to BestForNavigation
  maximumAge: 0, // Force fresh fetch
  timeout: 20000, // Give 20 seconds to improve GPS lock
});

myConsole('sjlfkjdsklfjldf',currentLocation)
  let a = await Location.hasServicesEnabledAsync();
  console.log("hasServicesEnabledAsync", a);
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
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisibleConduct, setModalVisibleConduct] = useState(false);
  const [isModalVisibleRemark, setModalVisibleRemark] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapLatLng, setMapLatLng] = useState({});
  const { allUsers, user } = useSelector(selectUser);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isLoadingRemark, setIsLoadingRemark] = useState(false);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isLoadingConduct, setIsLoadingConduct] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpId, setFollowUpId] = useState("");
  const [token, setToken] = useState("");
  const [location, setLocation] = useState(null);

  //react query
  const { data: detail, isLoading: isLoadingQuery } = useGetMeetingById(id);

  //location
  useEffect(() => {
    console.log("detail?.createdBy?._id", detail?.createdBy?._id);
    const el = detail?.meetings[detail?.meetings?.length - 1];
    const isCurrentDate = moment(el?.scheduleDate).isSame(moment(), "day");
    const isNeedLocation =
      isCurrentDate &&
      el?.status !== "conducted" &&
      user?._id === detail?.createdBy?._id;
    myConsole("isNeedLocation", isNeedLocation);
    if (isFocused) {
      (async () => {
        let tempLocation = await getLocationLatLng();
        console.log("temp@@", tempLocation);
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
  const mapRef = useRef();
  const markerRef = useRef();
  // let detail = params?.item;
  const [isMailAvail, setIsMailAvail] = useState(false);
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
      myConsole(error);
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
      })
    );
    await Linking.openURL(`tel:+${detail?.lead?.clientMobile}`);
  };
  return (
    <>
      <Header title={"Meeting Details"} />
      <Container>
        <ScrollView style={{ padding: 20 }}>
          <View style={{ paddingBottom: 70 }}>
            {isLoadingQuery && <ActivityIndicator />}
            <MainTitle
              title="Client Details"
              containerStyle={{ marginBottom: 20 }}
              icon={
                <View style={{ flexDirection: "row", gap: 20 }}>
                  <TouchableOpacity style={{ padding: 5 }}>
                    {isMeetingEdit && (
                      <EditIcon
                        onPress={() =>
                          navigate(routeMeeting.AddMeeting, { detail })
                        }
                      />
                    )}
                  </TouchableOpacity>

                  {user?._id === detail?.createdBy?._id && (
                    <CustomBtn
                      title="Coverted to Booking"
                      // isLoading={isLoadingBooking}
                      textStyle={{ fontSize: 12, color: "black" }}
                      onPress={handleConvertToBooking}
                      containerStyle={{
                        backgroundColor: "rgb(191, 191, 191)",
                      }}
                    />
                  )}
                </View>
              }
            />
            <RowItem
              title="Client Name"
              value={detail?.lead?.clientName}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Mobile Number"
              //value={detail?.lead?.clientMobile}
              component={
                <TouchableOpacity
                  onPress={() =>
                    // Linking.openURL(`tel:${detail?.lead?.clientMobile}`)
                    navToCall()
                  }
                >
                  <CustomText>{detail?.lead?.clientMobile}</CustomText>
                </TouchableOpacity>
              }
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Email Address"
              //value={detail?.lead?.clientEmail}
              component={
                <TouchableOpacity
                  onPress={() =>
                    isMailAvail ? openMail(detail?.lead?.clientEmail) : null
                  }
                >
                  <Text numberOfLines={1}>{detail?.lead?.clientEmail}</Text>
                </TouchableOpacity>
              }
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Whatsapp Link"
              icon="whatsapp"
              containerStyle={{ marginBottom: 10 }}
              onPressIcon={() => Linking.openURL(`${detail?.lead?.whatsapp}`)}
            />
            <RowItem
              title="Address"
              value={detail?.clientAddress}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="City"
              value={detail?.clientCity}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Country"
              value={detail?.clientCountry}
              containerStyle={{ marginBottom: 30 }}
            />
            <MainTitle
              title="Meeting Information"
              containerStyle={{ marginBottom: 20 }}
            />
            <RowItem
              title="Product Pitch"
              value={detail?.productPitch}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Created By"
              value={`${detail?.createdBy?.name} ${"("} ${userTypes[detail?.createdBy?.role]
                } ${")"}`}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Agent"
              // value={detail?.agents
              //   ?.map((agentId) => {
              //     const agent = allUsers?.find((user) => user._id === agentId);
              //     return agent?.name || "Unknown";
              //   })
              //   .join(", ")}
              containerStyle={{ marginBottom: 30 }}
              component={
                <CustomText
                // fontWeight="300"
                >
                  {detail?.agents
                    ?.map((agentId) => {
                      const agent = allUsers?.find(
                        (user) => user._id === agentId
                      );
                      return agent?.name || "Unknown";
                    })
                    .join(", ")}
                </CustomText>
              }
            />

            {detail?.meetings?.map((el, index) => {
              const isLastMeeting = index === detail?.meetings?.length - 1;
              const isCurrentDate = moment(el?.scheduleDate).isSame(
                moment(),
                "day"
              );
              return (
                <View key={index}>
                  <View>
                    <MainTitle
                      title={` Meeting ${index + 1}`}
                      containerStyle={{ marginBottom: 20 }}
                    />
                    <RowItem
                      title="Date"
                      value={moment(el?.scheduleDate).format(
                        "DD/MM/YYYY, hh:mm A"
                      )}
                      containerStyle={{ marginBottom: 10 }}
                    />
                    <RowItem
                      title="status"
                      value={meetingStatus[el?.status]}
                      containerStyle={{ marginBottom: 10 }}
                    />
                    <RowItem
                      title="Scheduled Location"
                      value={el?.location}
                      containerStyle={{ marginBottom: 15 }}
                      component={
                        <CustomText
                        // fontWeight="300"
                        >
                          {el?.location}
                        </CustomText>
                      }
                    />

                    <RowItem
                      title="Scheduled Location View"
                      containerStyle={{ marginBottom: 10 }}
                      component={
                        el?.coordinates?.lat ? (
                          <Feather
                            name="map-pin"
                            size={25}
                            color="#2D67C6"
                            // onPress={() => toggleMapViewModal(el?.coordinates)}
                            onPress={() => {
                              // getAddressFromCoordinates(el?.coordinates)
                              navigateToMapApp(el?.coordinates);
                            }}
                          />
                        ) : (
                          <CustomText>N/A</CustomText>
                        )
                      }
                    />
                    <RowItem
                      title="Remarks"
                      value={el?.remarks}
                      containerStyle={{ marginBottom: 10 }}
                    />
                    {el?.status === "conducted" && (
                      <RowItem
                        title="Conducted Through"
                        value={
                          !!el?.isMobile
                            ? "Mobile Application"
                            : "Web Application"
                        }
                        containerStyle={{ marginBottom: 10 }}
                      />
                    )}
                    {el?.status === "conducted" && (
                      <RowItem
                        title="Location Permission"
                        containerStyle={{ marginBottom: 10 }}
                        component={
                          <CustomText
                            style={{
                              fontWeight: !!el?.isLocationGranted
                                ? "400"
                                : "800",
                            }}
                          >
                            {!!el?.isLocationGranted ? "Granted" : "Denied"}
                          </CustomText>
                        }
                      />
                    )}
                    {el?.conductCoordinates?.lat && (
                      <View>
                        <RowItem
                          title="Conducted Location"
                          component={
                            <CustomText>{el?.conductMeetingAddress}</CustomText>
                          }
                        />
                        <RowItem
                          title="Conduct Location View"
                          containerStyle={{ marginBottom: 10, marginTop: 10 }}
                          component={
                            el?.conductCoordinates?.lat && (
                              <Feather
                                name="map-pin"
                                size={25}
                                color="#2D67C6"
                                // onPress={() => toggleMapViewModal(el?.conductCoordinates)}
                                onPress={() =>
                                  navigateToMapApp(el?.conductCoordinates)
                                }
                              />
                            )
                          }
                        />
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 15,
                      margin: 15,
                      marginBottom: 20,
                    }}
                  >
                    {isLastMeeting && user?._id === detail?.createdBy?._id && (
                      <>
                        <CustomBtn
                          title="Reschedule"
                          textStyle={{ fontSize: 12, color: "black" }}
                          isLoading={isLoading}
                          //  onPress={toggleModal}
                          onPress={rescheduleMeeting}
                          containerStyle={{
                            marginBottom: 50,
                            height: 40,
                            width: "40%",
                            backgroundColor: "rgb(191, 191, 191)",
                          }}
                        />
                        {isCurrentDate && el?.status !== "conducted" && (
                          <CustomBtn
                            title="Conduct"
                            textStyle={{ fontSize: 12, color: "black" }}
                            isLoading={isLoadingConduct}
                            // onPress={() => handleOtpGenerate(el?._id)}
                            onPress={() => {
                              setTempFollowUpId(el?._id);
                              toggleModalOpenRemark();
                            }}
                            containerStyle={{
                              marginBottom: 50,
                              height: 40,
                              width: "40%",
                              backgroundColor: "rgb(253, 219, 50)",
                            }}
                          />
                        )}
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

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
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 20,
                        fontWeight: 600,
                      }}
                    >
                      OTP Verification
                    </Text>
                    <TouchableOpacity onPress={toggleModalOtpVerify}>
                      <AntDesign name="close" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ textAlign: "center" }}>
                    Kindly ask Your/client to provide the otp sent to there
                    mobile Number
                  </Text>
                  <Text style={{ textAlign: "center", marginTop: 10 }}>
                    The session will expire 5 min
                  </Text>
                  <View style={{ marginBottom: 40 }}>
                    <ConfirmationCodeInput
                      codeInputStyle={{
                        fontSize: 20,
                        fontWeight: "600",
                        color: "#333333",
                        borderWidth: 1,
                        borderBottomWidth: 2,
                        borderColor: "#000000",
                        borderRadius: 5,
                        margin: 5,
                        padding: 10,
                      }}
                      codeLength={4}
                      autoFocus
                      value={values.otp}
                      keyboardType="numeric"
                      variant="border-b"
                      activeColor="#000000"
                      inactiveColor="#CCCCCC"
                      onFulfill={(code) => handleChange("otp")(code)}
                    />
                  </View>

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
                console.log("first");
                let conductMeetingAddress = !!location?.coords?.latitude
                  ? await getAddressFromCoordinates(location?.coords)
                  : null;
                console.log("conductMeetingAddress", conductMeetingAddress);
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
                myConsole("tempSendDataConduct!@", tempSendData);
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
                  myConsole(error);
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
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 20,
                          fontWeight: 600,
                        }}
                      >
                        Conduct Meeting
                      </Text>
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
                    <Text style={{ color: "red" }}>{errors.remarks}</Text>
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

const styles = StyleSheet.create({});

export default MeetingDetails;
