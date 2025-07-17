import React, { useEffect, useState } from "react";
import {
  Button,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Card from "../../components/Dashboard/Card";
import CommissionCount from "../../components/Dashboard/CommissionCount";
import DashbordHeader from "../../components/Dashboard/DashbordHeader";
import LeadCount from "../../components/Dashboard/LeadCount";
import { getDataJson, removeItemValue } from "../../hooks/useAsyncStorage";
import Container from "../../myComponents/Container/Container";
import {
  getAllBookingFunc,
  getAllDeveloperFunc,
  getAllLeadFunc,
  getAllMeetingFunc,
  getTeamFunc,
  getUserFunc,
  onLogOutEmpty,
} from "../../redux/action";
import {
  selectUser,
  setIsCalling,
  setUserInfo,
  setCallDetect,
} from "../../redux/userSlice";
import BookingCard from "../../components/Dashboard/BookingCard";
import MeetingCard from "../../components/Dashboard/MeetingCard";
import { schedulePushNotification } from "../../App";
//
import io from "socket.io-client";
import { myConsole } from "../../hooks/useConsole";
import CommissionGraph from "../../components/Dashboard/CommissionGraph";
import SkeletonLoadingDashboard from "../../components/Dashboard/SkeletonLoadingDashboard";
import BookingMeetingLoader from "../../myComponents/Loader/BookingMeetingLoader";
import useInternetConnectivity from "../../hooks/useInternetConnectivity";
import { baseURL } from "../../services/authApi/axiosInstance";
import CallDetectorManager from "react-native-call-detection";
import * as Device from "expo-device";
import moment from "moment";
import { leadCallTrack } from "../../services/rootApi/leadApi";
import { routeLead } from "../../utils/routes";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { userDetailHRM } from "../../services/hrmApi/userHrmApi";
import { logOut } from "../../services/authApi/auth";
import {
  useGetBookingCount,
  useGetCommissionCount,
  useGetDashboardCount,
  useGetMeetingCount,
useGetLeadQuality,
useGetClosingLeadProjectWise,
useGetLeadProjectWise
} from "../../hooks/useCRMgetQuerry";
import GraphData from "../../components/Dashboard/GraphData/GraphData";
import DashboardCard from "../../components/Dashboard/DashboardCard/DashboardCard";
import CustomText from "../../myComponents/CustomText/CustomText";
import LeadQualityCard from "../../components/Dashboard/LeadQualityCard";
import LeadProjectCard from "../../components/Dashboard/LeadProjectCard";
import ClosingLeadProjCard from "../../components/Dashboard/ClosingLeadProjCard";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
//

// export const socket = io("https://axproperty-backend.onrender.com");
export let socket = io(`${baseURL}`);
// const socket = io('https://api.crmaxproperty.com')
const Dashboard = () => {
  const {
    meeting,
    team,
    bookings,
    lead,
    loading,
    developer,
    isCalling,
    callDetect,
  } = useSelector(selectUser);
  const dispatch = useDispatch();
  const { navigate, dispatch: dispatchNav } = useNavigation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  //
  // const { isOffline, checkInternetConnectivity } = useInternetConnectivity();
  const [user, setUser] = useState({});

  const isShowGraphs = ["sup_admin", "sub_admin", "manager"].includes(user?.role);


  //rect query
  const {
    data: dashboardCount,
    isFetching: loadingDashboardCount,
    refetch: refetchDashboardCount,
  } = useGetDashboardCount();

  const {
    data: bookingCount,
    isFetching: loadingBookingCount,
    refetch: refetchBookingCount,
  } = useGetBookingCount();

  const {
    data: meetingCount,
    isFetching: loadingMeetingCount,
    refetch: refetchMeetingCount,
  } = useGetMeetingCount();

  const {
    data: commissionCount,
    isFetching: loadingCommissionCount,
    refetch: refetchCommissionCount,
  } = useGetCommissionCount();
  useEffect(() => {
    setUser();
  }, []);
  //
  const fetchUserData = async () => {
    let data = await getDataJson("userDetail");
    let userInfoFromApi = await userDetailHRM({ id: data?._id });
    let userData = { ...data, ...userInfoFromApi };
    dispatch(setUserInfo(userData));
    setUser(userData);
  };

  const ifUserNotOnBoard = async () => {
    if (["resign", "terminated"].includes(user?.activeStatus)) {
      await logOut(user?._id);
      await removeItemValue("token");
      await removeItemValue("userDetail");
      await dispatch(onLogOutEmpty());
      dispatchNav(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    }

    // dispatch(setUserInfo(res?.data))
    // setUser(res?.data)
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    ifUserNotOnBoard();
  }, [user]);

  useEffect(() => {
    // dispatch(getAllMeetingFunc());
    dispatch(getTeamFunc());
    // dispatch(getAllBookingFunc());
    dispatch(getUserFunc());
    // dispatch(getAllLeadFunc());
    dispatch(getAllDeveloperFunc());
  }, []);
  //
  const onRefresh = () => {
    setRefreshing(true);
    try {
      // fetchUserData();
      // dispatch(getAllMeetingFunc());
      dispatch(getTeamFunc());
      // dispatch(getAllBookingFunc());
      dispatch(getUserFunc());
      // dispatch(getAllLeadFunc());
      //
      refetchBookingCount();
      refetchMeetingCount();
      refetchCommissionCount();
      refetchDashboardCount();
    } catch (err) {
      console.log(err);
    } finally {
      setRefreshing(false);
    }
  };
  //
  useEffect(() => {
    // Connect to the socket
    socket.connect();
    let isGetData = async (data) => {
      let a = (await user?.role) === "sup_admin" || user?.role === "sub_admin";
      let b = (await data?.notifyUsers?.indexOf(user?._id ?? user?._id)) !== -1;
      return a || b;
      // return user?.role === "sup_admin" ||
      //   user?.role === "sub_admin" ||
      //   (data?.notifyUsers || [])?.includes(user && user._id) ||
      //   (data?.participents || [])?.includes(user && user._id)
    };

    let isNotify = async (data) => {
      let isTrue =
        (await data?.notifyUsers?.indexOf(!!user?._id ? user?._id : "")) !== -1;
      return isTrue;
    };
    /////lead/////////
    socket.on("Add Lead", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = await isGetData(data);
      if (isGet) {
        await dispatch(getAllLeadFunc());
      }
      // if (isNotify(data)) {
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });

    socket.on("Update Lead", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = await isGetData(data);
      if (isGet) {
        await dispatch(getAllLeadFunc());
      }
      // if (isNotify(data)) {
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });

    socket.on("Assign Lead", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = await isGetData(data);
      if (isGet) {
        await dispatch(getAllLeadFunc());
      }
      // if (isNotify(data)) {
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });
    socket.on("Delete Lead", async (data) => {
      if (data?.actionBy === user?._id) return;
      await dispatch(getAllLeadFunc());
      return;
    });

    /////Meeting/////////
    socket.on("Add Meeting", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = isGetData(data);
      if (isGet) {
        await dispatch(getAllMeetingFunc());
      }
      // if (isNotify(data)) {
      //   myConsole('Add Meeting3', data)
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });

    socket.on("Update Meeting", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = await isGetData(data);
      if (isGet) {
        await dispatch(getAllMeetingFunc());
      }
      // if (isNotify(data)) {
      //   console.log('Update Meeting soket3', data)
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });

    socket.on("Delete Meeting", async (data) => {
      if (data?.actionBy === user?._id) return;
      await dispatch(getAllMeetingFunc());
      return;
    });

    ////Booking/////
    socket.on("Add Booking", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = await isGetData(data);
      if (isGet) {
        await dispatch(getAllBookingFunc());
      }
      // if (isNotify(data)) {
      //   console.log('Add Booking soket3', data)
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });

    socket.on("Update Booking", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = await isGetData(data);
      if (isGet) {
        await dispatch(getAllBookingFunc());
      }
      // if (isNotify(data)) {
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });
    socket.on("Approve Booking", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = await isGetData(data);
      if (isGet) {
        await dispatch(getAllBookingFunc());
      }
      // if (isNotify(data)) {
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });

    socket.on("Reject Booking", async (data) => {
      if (data?.actionBy === user?._id) return;
      let isGet = await isGetData(data);
      if (isGet) {
        await dispatch(getAllBookingFunc());
      }
      // if (isNotify(data)) {
      //   console.log('Reject Booking soket3', data);
      //   await schedulePushNotification({
      //     title: data?.type ?? "--",
      //     body: data?.message ?? "--",
      //   });
      // }
      return;
    });

    socket.on("Delete Booking", async (data) => {
      if (data?.actionBy === user?._id) return;
      await dispatch(getAllBookingFunc());
      return;
    });
    ///////
    return () => {
      socket.disconnect();
    };
  }, []);



    // const { user } = useSelector(selectUser);
    const { data: permission = {} } = useGetUserPermission(user?._id);
    myConsole('permissions',permission)


  useEffect(() => {
    console.log("callDetect", callDetect);
    // if (isCalling && Device?.isDevice) {
    const requestPhoneStatePermission = async () => {
      try {
        let status;
        if (Platform.OS === "android") {
          status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            {
              title: "Phone State Permission",
              message:
                "This app needs access to your phone state in order to detect calls.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
        }

        if (status !== "granted" && Platform.OS === "android") {
          Alert.alert(
            "Permission Denied",
            "Phone state permission is required for call detection. Please grant the permission in the app settings."
          );
          return;
        }
        // console.log('status', status)
        ////
        let startTime;
        let endTime;

        const callDetector = new CallDetectorManager(
          async (event, phoneNumber) => {
            const lead_id = callDetect?.leadId;
            // Handle call events here
            console.log(`Event@@@@@: ${event} - Phone number: ${phoneNumber}`);
            if (!!callDetect?.isCall) {
              console.log(
                `Event@@@@@: ${event} - Phone number: ${phoneNumber}`
              );
              if (event === "Offhook") {
                //for android
                startTime = moment();

                console.log("call connected", startTime);
              } else if (event === "Dialing") {
                //for ios
                startTime = moment();
              } else if (event === "Connected") {
                //for ios
                // startTime = moment();
              } else if (event === "Disconnected") {
                try {
                  await dispatch(
                    setCallDetect({
                      isCall: false,
                      leadId: null,
                    })
                  );
                  endTime = moment();
                  let diffInSec = moment(endTime).diff(
                    moment(startTime),
                    "seconds"
                  );
                  const sendData = {
                    callTime: startTime,
                    duration: diffInSec,
                    // leadId: callDetect?.leadId
                  };
                  console.log("sendData", sendData);
                  console.log("callDetect?.leadId", callDetect?.leadId);
                  let leadCallTrackRes = await leadCallTrack({
                    data: sendData,
                    // id: callDetect?.leadId
                    id: lead_id,
                  });
                  myConsole("leadCallTrackRes", leadCallTrackRes?.data);
                  queryClient.invalidateQueries(["getLeadDetailById", lead_id]);
                  // await dispatch(getAllLeadFunc());
                  // await navigate(routeLead.allLead);
                } catch (err) {
                  console.log("error in call disconnect", err);
                }
              }
            }
          },
          true,
          (p) => {
            console.log("permision", p);
          },
          {
            title: "Phone State Permission",
            message:
              "This app needs access to your phone state in order to track call duration.",
          }
        );

        return () => {
          // Cleanup or unsubscribe when the component is unmounted
          callDetector && callDetector.dispose();
        };
      } catch (err) {
        console.log("@Error requesting permission:", err);
      }
    };

    requestPhoneStatePermission();
    // }
  }, [callDetect?.isCall]); // Empty dependency array ensures the effect runs only once on mount

  return (
    <Container>
      <DashbordHeader />

      {/* <Button title="asas" onPress={() => {
        return schedulePushNotification({
          title: 'sdas',
          body: 'fasdgfa'
        })
      }} /> */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingBottom: 100 }}>
          {1 ? (
            <>
              <View
                style={{
                  padding: 20,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 20,
                  justifyContent: "space-between",
                }}
              >
                <Card item={dashboardCount} loading={loadingDashboardCount} />
              </View>
              {isShowGraphs && (
              <>
                <LeadQualityCard onRefresh={refreshing} />
                <LeadProjectCard onRefresh={refreshing} />
                <ClosingLeadProjCard onRefresh={refreshing} />
              </>
              )}

              <GraphData header={"Confirmed Business"} />
              <GraphData header={"Expression of Interest"} />
              <DashboardCard title="Summary" />
              {!loadingBookingCount ? (
                <BookingCard item={bookingCount} />
              ) : (
                <BookingMeetingLoader />
              )}
              {!loadingMeetingCount ? (
                <MeetingCard
                  item={meetingCount}
                // isLoading={loadingMeetingCount}
                />
              ) : (
                <BookingMeetingLoader />
              )}
              <CommissionGraph
                isLoading={loadingCommissionCount}
                item={commissionCount}
              />
            </>
          ) : (
            <SkeletonLoadingDashboard />
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

export default Dashboard;
