import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { color } from "../const/color";
import { Platform, StyleSheet } from "react-native";
import DashboardIconFocus from "../assets/svg/Dashboard";
import DashboardIcon from "../assets/svg/DashboardIcon";

import { View, Text } from 'react-native'
import React from 'react'
import { shadow1 } from "../const/globalStyle";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AllAttendance from "../screensHRM/AttendanceHRM/AllAttendance";
import AttendanceDetail from "../screensHRM/AttendanceHRM/AttendanceDetail";
import DashboardHRM from "../screensHRM/DashboardHRM/DashboardHRM";
import AllLeave from "../screensHRM/LeaveHRM/AllLeave";
import AllUSersHRM from "../screensHRM/UsersHRM/AllUSersHRM";
import DashboardActiveIcon from "../assets/svgHRM/DashboardActiveIcon";
import DashboardUnActiveIcon from "../assets/svgHRM/DashboardUnActiveIcon";
import UserActiveIcon from "../assets/svgHRM/UserActiveIcon";
import UserUnActiveIcon from "../assets/svgHRM/UserUnActiveIcon";
import LeaveUnActiveIcon from "../assets/svgHRM/LeaveUnActiveIcon";
import LeaveActiveIcon from "../assets/svgHRM/LeaveActiveIcon";
import AttendanceUnActiveIcon from "../assets/svgHRM/AttendanceUnActiveIcon";
import AttendanceActiveIcon from "../assets/svgHRM/AttendanceActiveIcon";
import UserDetailHRM from "../screensHRM/UsersHRM/UserDetailHRM";
import SendToUpdate from "../screensHRM/UsersHRM/SendToUpdate";
import AddUserHRM from "../screensHRM/UsersHRM/AddUserHRM";
import LeaveDetail from "../screensHRM/LeaveHRM/LeaveDetail";
import LeaveApplication from "../screensHRM/LeaveHRM/LeaveApplication";
import PostIntProcess from "../screensHRM/Interview/PostIntProcess";
import CandidateDetails from "../screensHRM/Interview/CandidateDetails";
import InterviewMain from "../screensHRM/Interview/InterviewMain";
import ScheduleInterview from "../screensHRM/Interview/ScheduleInterview";
import { selectUser } from "../redux/userSlice";
import { useSelector } from "react-redux";
import { roleEnum } from "../utils/data";
import UserAttendanceList from "../screensHRM/AttendanceHRM/UserAttendanceList";
import InterviewActiveIcon from "../assets/svgHRM/InterviewActiveIcon";
import InterviewUnActiveIcon from "../assets/svgHRM/InterviewUnActiveIcon";

////
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//Main stack (HRManagementStack)
export const HRManagementStack = () => {
    const { user } = useSelector(selectUser);
    const isAgent = user?.role === roleEnum.agent
      const isAdmin = user?.role === "sup_admin" || user?.role === "sub_admin";
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarHideOnKeyboard: true,
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 85 : 70,
                    // backgroundColor: 'green',
                    // marginBottom: 30,
                    paddingTop: Platform.OS === 'ios' ? 20 : 0,
                }

            }}
        >
            <Tab.Screen
                name="DashboardHRMStack"
                component={DashboardHRMStack}
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <DashboardActiveIcon />
                        ) : (
                            <DashboardUnActiveIcon />
                        ),
                }}
            />
            {!isAgent && <Tab.Screen
                name="AllUsersHRMStack"
                component={AllUsersHRMStack}
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <UserActiveIcon />
                        ) : (
                            <UserUnActiveIcon />
                        ),
                }}
            />}
            <Tab.Screen
                name="AttendanceStack"
                component={AttendanceStack}
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <AttendanceActiveIcon />
                        ) : (
                            <AttendanceUnActiveIcon />
                        ),
                }}
            />
            <Tab.Screen
                name="AllLeaveStack"
                component={AllLeaveStack}
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <LeaveActiveIcon />
                        ) : (
                            <LeaveUnActiveIcon />
                        ),
                }}
            />
          { isAdmin &&  <Tab.Screen
                name="InterviewStack"
                component={InterviewStack}
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <InterviewActiveIcon />
                        ) : (
                            <InterviewUnActiveIcon />
                        ),
                }}
            />
}
        </Tab.Navigator>
    );
};

//DashboardHRMStack
const DashboardHRMStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="DashboardHRM"
                component={DashboardHRM}
                options={{
                    headerShown: false,
                }}

            />
        </Stack.Navigator>
    )
}
//AllUsersHRMStack
const AllUsersHRMStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AllUSersHRM"
                component={AllUSersHRM}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="AddUserHRM"
                component={AddUserHRM}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="SendToUpdate"
                component={SendToUpdate}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="UserDetailHRM"
                component={UserDetailHRM}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}

//AttendanceNavigator
const AttendanceStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AllAttendance"
                component={AllAttendance}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="AttendanceDetail"
                component={AttendanceDetail}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="UserAttendanceList"
                component={UserAttendanceList}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}

//AllLeave
const AllLeaveStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AllLeave"
                component={AllLeave}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="LeaveDetail"
                component={LeaveDetail}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="LeaveApplication"
                component={LeaveApplication}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}

//InterviewStack
const InterviewStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="InterviewMain"
                component={InterviewMain}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="ScheduleInterview"
                component={ScheduleInterview}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="CandidateDetails"
                component={CandidateDetails}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="PostIntProcess"
                component={PostIntProcess}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}

