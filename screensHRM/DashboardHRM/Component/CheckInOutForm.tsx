import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomBtn from "../../../myComponents/CustomBtn/CustomBtn";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import DropdownRNE from "../../../myComponents/DropdownRNE/DropdownRNE";
import {
  useGetDeveloperForCheckInOut,
  useGetMeetingForCheckInOut,
} from "../../../hooks/useGetQuerryHRM";
import { myConsole } from "../../../hooks/useConsole";
import {
  getAddressFromCoordinates,
  getLocationLatLng,
} from "../../../screens/Meetings/MeetingDetails";
import { err } from "react-native-svg/lib/typescript/xml";
import { checkInOutApiFn } from "../../../services/hrmApi/checkinOutApi";
import { popUpConfToast } from "../../../utils/toastModalByFunction";
import PleaseWait from "../../../myComponentsHRM/PleaseWait/PleaseWait";
import CustomCheckBox from "../../../myComponentsHRM/CutomCheckBox/CustomCheckBox";
import ReloadIcon from "../../../assets/svg/ReloadIcon";
import * as Location from "expo-location";

interface TCheckInOutForm {
  onPressSubmit: () => void;
  onPressCancel: () => void;
  onChangeText: (v: string) => void;
  heading: string;
  onSelectOption: (v: string) => void;
  toggleModal: () => void;
  punchType: string;
}
const CheckInOutForm = ({
  heading,
  onPressCancel,
  onChangeText,
  onPressSubmit,
  onSelectOption,
  toggleModal,
  punchType,
}: TCheckInOutForm) => {
  const {
    data: developer,
    refetch: refetchDeveloper,
    isRefetching: isRefetchingDev,
  } = useGetDeveloperForCheckInOut();
  const {
    data: todayMeeting,
    refetch: refetchMeeting,
    isRefetching: isRefetchingMeeting,
  } = useGetMeetingForCheckInOut();
  const [selectedId, setSelectedId] = useState(null);
  const [location, setLocation] = useState({});
  const [whichDropDwn, setWhichDropDwn] = useState<"meeting" | "developer">(
    "meeting"
  );
  const [address, setAddress] = useState();
  const [isFetchLLocation, setIsFetchLLocation] = useState(false);
  // myConsole('location', location)
  // myConsole('todayMeeting', todayMeeting)
  // myConsole('todayMeeting', todayMeeting)

  const fetchLocation = async () => {
    setIsFetchLLocation(true);
    let subscription;
    let bestLocation = null;

    try {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          enableHighAccuracy: true,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          console.log("Updated Location:", loc);

          // ✅ Ignore very poor accuracy samples
          //   if (loc?.coords?.accuracy > 100) return;

          // ✅ Keep the most accurate location seen so far
          if (
            !bestLocation ||
            loc?.coords?.accuracy < bestLocation?.coords?.accuracy
          ) {
            bestLocation = loc;
          }
        }
      );

      // ✅ Wait full 15 seconds to give GPS proper lock time
      setTimeout(() => {
        subscription.remove();
        if (bestLocation) {
          setLocation(bestLocation);
          console.log("Best location used after timeout:", bestLocation);
        } else {
          console.warn("Could not get good accuracy within timeout.");
        }
        setIsFetchLLocation(false);
      }, 30000);
    } catch (err) {
      console.log("errFetchLocation", err);
      setIsFetchLLocation(false);
    }
  };

  const getAddress = async () => {
    const res = await getAddressFromCoordinates(location?.coords);
    setAddress(res);
  };

  useEffect(() => {
    //
    // (async () => {
    //     let tempLocation = await getLocationLatLng()
    //     // console.log('temp@@', tempLocation)
    //     setLocation(tempLocation)
    // })()
    fetchLocation();
  }, []);

  useEffect(() => {
    getAddress();
  }, [location]);

  const remoteCheckIn = async () => {
    toggleModal();
    popUpConfToast.plzWait({
      bodyComponent: () => <PleaseWait />,
    });
    let data = {
      type: "punchOut",
      ...(whichDropDwn === "meeting" && { meetingId: selectedId }),
      ...(whichDropDwn === "developer" && { developerId: selectedId }),
      selected: whichDropDwn,
      coor: {
        lat: location?.coords?.latitude,
        lng: location?.coords?.longitude,
      },
    };
    myConsole("sendData", data);
    checkInOutApiFn({ data }).then((res) => {
      console.log("result&^%", res);
      !!res && popUpConfToast.successMessage(res?.message ?? "---");
    });
    // .catch((err) => {
    //     console.log('error&^%', err)
    //     popUpConfToast.errorMessage(err);
    // })
    // try {
    //     toggleModal();
    //     popUpConfToast.plzWait({
    //         bodyComponent: () => <PleaseWait />
    //     })
    //     let data = {
    //         type: 'punchOut',
    //         ... (whichDropDwn === 'meeting' && { meetingId: selectedId }),
    //         ... (whichDropDwn === 'developer' && { developerId: selectedId }),
    //         selected: whichDropDwn,
    //         coor: {
    //             lat: location?.coords?.latitude,
    //             lng: location?.coords?.longitude
    //         }
    //     }
    //     myConsole('EndData', data)
    //     let a = await checkInOutApiFn({ data })
    //     myConsole('remoteCheckIn', a)
    //     await popUpConfToast.successMessage(a?.message ?? '---');
    // }
    // catch (err) {
    //     console.log('errorRemoteCheckIn', err);
    //     popUpConfToast.errorMessage(err ?? '---')
    // }
  };

  const toggleCheckbox = (v: "meeting" | "developer") => {
    setWhichDropDwn(v);
    setSelectedId("");
    if (v === "developer") {
      !isRefetchingDev && refetchDeveloper();
    } else if (v === "meeting") {
      !isRefetchingMeeting && refetchMeeting();
    }
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 15,
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <CustomText
          fontSize={18}
          fontWeight="600"
          style={{ textTransform: "capitalize" }}
        >
          {heading ?? "---------"}
        </CustomText>
        <CustomBtn
          title="Cancel"
          containerStyle={{ backgroundColor: color.dullRed }}
          textStyle={{
            fontSize: 12,
            fontWeight: 700,
          }}
          onPress={toggleModal}
        />
      </View>
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: "row", gap: 15, marginBottom: 10 }}>
          <CustomCheckBox
            title={"Meeting"}
            isCheck={whichDropDwn === "meeting"}
            onPress={(v) => toggleCheckbox("meeting")}
            // marginBottom={20}
          />
          <CustomCheckBox
            title={"Developer"}
            isCheck={whichDropDwn === "developer"}
            onPress={(v) => toggleCheckbox("developer")}
            // onPress={(v) => onSelectFields(v, item?.value)}
            // marginBottom={20}
          />
        </View>
        {whichDropDwn === "developer" && (
          <DropdownRNE
            label="Developer"
            mode="modal"
            isSearch
            arrOfObj={developer ?? []}
            onChange={(v) => setSelectedId(v)}
            initialValue={selectedId}
          />
        )}
        {whichDropDwn === "meeting" && (
          <DropdownRNE
            label="Meetings"
            mode="modal"
            isSearch
            arrOfObj={todayMeeting ?? []}
            onChange={(v) => setSelectedId(v)}
            initialValue={selectedId}
          />
        )}
        <View
          style={{
            marginTop: 5,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ width: "85%" }}>
            <CustomText color={color.textGray} numberOfLines={3}>
              {address || "N/A"}
            </CustomText>
          </View>
          {isFetchLLocation ? (
            <ActivityIndicator />
          ) : (
            <TouchableOpacity onPress={fetchLocation}>
              <ReloadIcon />
            </TouchableOpacity>
          )}
        </View>
        <CustomText
          fontSize={13}
          color={!!location?.coords?.latitude ? color.approve : color.reject}
          style={{ marginTop: 10 }}
        >
          {location?.coords?.latitude
            ? `Note: Your live location is detected.`
            : `Note: Your live location is not detected. Please give the location permission. If you have given the location access then please wait for the app to fetch your location or reopen the app`}
        </CustomText>
      </View>

      {/* <View
                style={{ marginBottom: 25 }}
            >
                <CustomText
                    fontSize={16}
                    fontWeight='400'
                    marginBottom={7}
                >Remark
                </CustomText>
                <TextInput
                    style={{
                        borderWidth: 0.5,
                        borderColor: '#DCDCDC',
                        borderRadius: 4,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        width: '100%',
                        height: 100,
                    }}
                    multiline={true}
                    textAlignVertical='top'
                    placeholder='Type here'
                    onChangeText={onChangeText}
                />
            </View> */}
      <CustomBtn
        title="Submit"
        containerStyle={{ alignSelf: "flex-start", paddingHorizontal: 25 }}
        onPress={remoteCheckIn}
        disabled={!selectedId || !location?.coords?.latitude}
      />
    </View>
  );
};

export default CheckInOutForm;

const styles = StyleSheet.create({});
