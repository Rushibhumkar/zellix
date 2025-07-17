import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";

/***** Auth ********/
import ChangePassword from "../screens/Auth/ChangePassword";
import ForgetPassword from "../screens/Auth/ForgetPassword";
import LoginScreen from "../screens/Auth/LoginScreen";
import Notification from "../screens/Auth/Notification";
import Setting from "../screens/Auth/Setting";

/*****Dashboard*************************/
import Dashboard from "../screens/Dashboard/Dashboard";

/*****Users ******************************/
import AddTeam from "../screens/Teams/AddTeam";
import TeamList from "../screens/Teams/TeamList";
import AddUsers from "../screens/Users/AddUsers";
import UserList from "../screens/Users/UserList";
import UsersManagement from "../screens/Users/UsersManagement";

/*****Bookings *****************************/
import AllBookings from "../screens/Bookings/AllBookings";
import ClientInformation from "../screens/Bookings/ClientInformation";
import DeveloperInformation from "../screens/Bookings/DeveloperInformation";

/*****Leads ********************************/
import AddLeads from "../screens/Leads/AddLeads";
import AllLeads from "../screens/Leads/AllLeads";
import LeadsDetails from "../screens/Leads/LeadsDetails";
import LeadsEdit from "../screens/Leads/LeadsEdit";

/*****Meatings ******************************/
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BookingIcon from "../assets/svg/Booking";
import BookingFocus from "../assets/svg/BookingFocus";
import DashboardIconFocus from "../assets/svg/Dashboard";
import DashboardIcon from "../assets/svg/DashboardIcon";
import LeadIcons from "../assets/svg/Lead";
import LeadFocus from "../assets/svg/LeadFocus";
import MeetingFocus from "../assets/svg/Meeting";
import MeetingIcon from "../assets/svg/MeetingIcon";
import UserFocus from "../assets/svg/UserFocus";
import UserIcon from "../assets/svg/UserIcon";
import { color } from "../const/color";
import { shadow1 } from "../const/globalStyle";
import Agents from "../screens/Bookings/Agents";
import BookingDetail from "../screens/Bookings/BookingDetail";
import AddMeeting from "../screens/Meetings/AddMeeting";
import AllMeetings from "../screens/Meetings/AllMeetings";
import MeetingDetails from "../screens/Meetings/MeetingDetails";
import NoInternet from "../screens/NoInternet/NoInternet";
import SplashScreen from "../screens/SplashScreen/SplashScreen";
import AdvanceSearch from "../screens/AdvanceSearch/AdvanceSearch";
import MeetingReschedule from "../screens/Meetings/MeetingReschedule";
import { getDataJson } from "../hooks/useAsyncStorage";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/userSlice";
import { HRManagementStack } from "./HRManagementStack";
import SettingHRM from "../screensHRM/NotificationAndSetting/SettingHRM";
import NotificationHRM from "../screensHRM/NotificationAndSetting/NotificationHRM";
import UserDetailHRM from "../screensHRM/UsersHRM/UserDetailHRM";
import LeadPool from "../screens/Leads/LeadPool";
import ProjectList from "../screens/Project/ProjectList";
import ProjectDetail from "../screens/Project/ProjectDetail";
import ProjectForm from "../screens/Project/ProjectForm";
import IncentiveList from "../screens/Incentive/IncentiveList";
import ExpenseList from "../screens/Expense/ExpenseList";
import InvoiceList from "../screens/Invoice/InvoiceList";
import TeamIncentive from "../screens/Incentive/TeamIncentive";
import IncentiveDetail from "../screens/Incentive/IncentiveDetail";
import TeamIncentiveDetail from "../screens/Incentive/TeamIncentiveDetail";
import InvoiceDetail from "../screens/Invoice/InvoiceDetail";
import ExpenseDetail from "../screens/Expense/ExpenseDetail";
import ExpenseCategoryList from "../screens/Expense/ExpenseCategoryList";
import ExpenseCategoryDetail from "../screens/Expense/ExpenseCategoryDetail";
import ExpenseForm from "../screens/Expense/ExpenseForm";
import ReferralList from "../screens/Referrals/ReferralList";
import AddReferrals from "../screens/Referrals/AddReferrals";
import ReferralDetails from "../screens/Referrals/ReferralDetails";

////
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

export const navigate = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

const BottomTabs = () => {
  const { user } = useSelector(selectUser);
  const isAgent = user?.role === "agent";

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tableBarShowLable: false,
        tabBarStyle: {
          backgroundColor: color.white,
          position: "absolute",
          bottom: Platform.OS === "ios" ? 20 : 10,
          left: 15,
          right: 15,
          borderRadius: 50,
          height: 60,
          borderWidth: 0.8,
          borderColor: color.saffronMango,
          ...shadow1,
        },
      }}
    >
      <Tab.Screen
        name="dashboard"
        component={Dashboard}
        options={{
          tabBarLabel: "",
          tableBarShowLable: false,
          tabBarLabelStyle: false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <DashboardIconFocus style={styles.iconPosition} />
            ) : (
              <DashboardIcon style={styles.iconPosition} />
            ),
        }}
      />
      <Tab.Screen
        name="MeetingsNavigator"
        component={MeetingsNavigator}
        options={{
          tabBarLabel: "",
          tableBarShowLable: false,
          tabBarLabelStyle: false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MeetingFocus style={styles.iconPosition} />
            ) : (
              <MeetingIcon style={styles.iconPosition} />
            ),
        }}
      />
      <Tab.Screen
        name="allLeads"
        component={LeadsNavigator}
        options={{
          tabBarLabel: "",
          tableBarShowLable: false,
          tabBarLabelStyle: false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <LeadFocus style={styles.iconPosition} />
            ) : (
              <LeadIcons style={styles.iconPosition} />
            ),
        }}
      />
      <Tab.Screen
        name="BookingNavigator"
        component={BookingNavigator}
        options={{
          tabBarLabel: "",
          tableBarShowLable: false,
          tabBarLabelStyle: false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <BookingFocus style={styles.iconPosition} />
            ) : (
              <BookingIcon style={styles.iconPosition} />
            ),
        }}
      />
      {!isAgent ? (
        <Tab.Screen
          name="usermanagement"
          component={UsersNavigator}
          options={{
            tabBarLabel: "",
            tableBarShowLable: false,
            tabBarLabelStyle: false,
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <UserFocus style={styles.iconPosition} />
              ) : (
                <UserIcon style={styles.iconPosition} />
              ),
          }}
        />
      ) : null}
    </Tab.Navigator>
  );
};

const MeetingsNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AllMeetings"
        component={AllMeetings}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddMeeting"
        component={AddMeeting}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MeetingDetails"
        component={MeetingDetails}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DeveloperInformation2"
        component={DeveloperInformation}
        options={{
          headerShown: false,
        }}
      />
      {/* clientInformation */}
      <Stack.Screen
        name="clientInformationByMeet"
        component={ClientInformation}
        options={{
          headerShown: false,
        }}
      />
      {/* agentByMeet */}
      <Stack.Screen
        name="agentByMeet"
        component={Agents}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="meetingReschedule"
        component={MeetingReschedule}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const LeadsNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="allLead"
        component={AllLeads}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddLeads"
        component={AddLeads}
        options={{
          headerShown: false,
        }}
      />
      {/* Leads child  */}

      <Stack.Screen
        name="LeadsDetails"
        component={LeadsDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LeadsEdit"
        component={LeadsEdit}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMeetingFromLead"
        component={AddMeeting}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LeadPool"
        component={LeadPool}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const BookingNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="allBookings"
        component={AllBookings}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeveloperInformation"
        component={DeveloperInformation}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="clientInformation"
        component={ClientInformation}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Agents"
        component={Agents}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetail}
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="AddBooking"
        component={AddBooking}
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack.Navigator>
  );
};

const UsersNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="usersManagement"
        component={UsersManagement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="users"
        component={UserList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="addUsers"
        component={AddUsers}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="teamList"
        component={TeamList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="addTeam"
        component={AddTeam}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

//ProjectNavigator
const ProjectNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProjectList"
        component={ProjectList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProjectForm"
        component={ProjectForm}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

//IncentiveNavigator
const IncentiveNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="IncentiveList"
        component={IncentiveList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IncentiveDetail"
        component={IncentiveDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeamIncentive"
        component={TeamIncentive}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeamIncentiveDetail"
        component={TeamIncentiveDetail}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  )
}

//IncentiveNavigator
const ReferralNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ReferralList"
        component={ReferralList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddReferrals"
        component={AddReferrals}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReferralDetails"
        component={ReferralDetails}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}
//IncentiveNavigator
const ExpenseNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExpenseList"
        component={ExpenseList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExpenseForm"
        component={ExpenseForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExpenseCategoryList"
        component={ExpenseCategoryList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExpenseCategoryDetail"
        component={ExpenseCategoryDetail}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}
//IncentiveNavigator
const InvoiceNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InvoiceList"
        component={InvoiceList}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="InvoiceDetail"
        component={InvoiceDetail}
        options={{ headerShown: false }}
      />


      {/* <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProjectForm"
        component={ProjectForm}
        options={{ headerShown: false }}
      /> */}
    </Stack.Navigator>
  )
}

//
const StackNavigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: "white" },
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ForgetPassword"
          component={ForgetPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Dashboard"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NoInternet"
          component={NoInternet}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdvanceSearch"
          component={AdvanceSearch}
          options={{ headerShown: false }}
        />
        {/* hr mng */}
        <Stack.Screen
          name="HRManagementStack"
          component={HRManagementStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="SettingHRM"
          component={SettingHRM}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="NotificationHRM"
          component={NotificationHRM}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserDetailHRMAgent"
          component={UserDetailHRM}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="ProjectNavigator"
          component={ProjectNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="IncentiveNavigator"
          component={IncentiveNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="ExpenseNavigator"
          component={ExpenseNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="InvoiceNavigator"
          component={InvoiceNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="ReferralNavigator"
          component={ReferralNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  bottomicons: {
    backgroundColor: "red",
  },
  tabBarStyle: {
    height: 60,
    position: "absolute",
    marginRight: 15,
    marginLeft: 15,
    borderWidth: 0.8,
    borderRadius: 50,
    borderTopWidth: 1,
    bottom: 0,
    backgroundColor: color.white,
    borderColor: color.saffronMango,
    ...shadow1,
  },
  BlurViewStyles: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 5,
    right: 5,
  },
  iconPosition: {
    position: "absolute",
    top: 10,
    width: 40,
    height: 40,
  },
});

export default StackNavigation;
