import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useFormik } from "formik";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import { HEIGHT } from "../../const/deviceInfo";
import { myConsole } from "../../hooks/useConsole";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomText from "../../myComponents/CustomText/CustomText";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import {
  selectUser,
  setAdvanceBooking,
  setAdvanceLead,
  setAdvanceMeeting,
  setBookingQueryKey,
  setLeadQueryKey,
  setMeetingQueryKey,
} from "../../redux/userSlice";
import {
  getASBooking,
  getASLead,
  getASMeeting,
} from "../../services/rootApi/advanceSearch";
import {
  ModeOfPayment,
  PaymentStatus,
  developerOptions,
  inBookingStatus,
  inLeadStatus,
  inMeetingStatus,
  inputStatusOptions,
  leadTypeInAS,
  mobileCode,
  mobileCodeWithIdKey,
  tokenInBooking,
} from "../../utils/data";
import { routeBooking, routeLead, routeMeeting } from "../../utils/routes";

//
function filterObjectKeys(obj: any, keys: [string]) {
  const filteredObject = {};
  keys.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      filteredObject[key] = obj[key];
    }
  });

  return filteredObject;
}
//common=agent,endDate,manager,srManager,startDate,status,teamLead,type
//bm=clientEmail,clientName,code,mobile,
// b=developer,inputStatus,paymentMode,paymentStatus,projectName,relationshipManager,token,
let arrOfKeys = {
  booking: [
    "agent",
    "clientEmail",
    "clientName",
    "code",
    "developer",
    "endDate",
    "inputStatus",
    "manager",
    "mobile",
    "paymentMode",
    "paymentStatus",
    "projectName",
    "relationshipManager",
    "srManager",
    "startDate",
    "status",
    "teamLead",
    "token",
    "type",
    "unit",
  ],
  meeting: [
    "type",
    "status",
    "clientName",
    "code",
    "mobile",
    "clientEmail",
    "startDate",
    "endDate",
    "srManager",
    "manager",
    "teamLead",
    "agent",
  ],
  lead: [
    "type",
    "status",
    "startDate",
    "endDate",
    "srManager",
    "manager",
    "teamLead",
    "agent",
  ],
};

let advanceStatus = {
  meeting: inMeetingStatus,
  booking: inBookingStatus,
  lead: inLeadStatus,
};

const AdvanceSearch = () => {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();
  const isFocus = useIsFocused();
  // const {  setAdvanceBooking,  setAdvanceLead, setAdvanceMeeting } = useSelector(selectUser);
  const { user, developer, leadQueryKey, bookingQueryKey, meetingQueryKey } =
    useSelector(selectUser);
  // useEffect(() => {
  //     console.log('leadQueryKey', leadQueryKey)
  //     console.log('bookingQueryKey', bookingQueryKey)
  //     console.log('meetingQueryKey', meetingQueryKey)
  // }, [leadQueryKey, meetingQueryKey, bookingQueryKey])
  const developerSort = [...developer]?.sort((a, b) =>
    a?.name === b?.name ? 0 : a?.name < b?.name ? -1 : 1
  );
  const { params } = useRoute();
  const [category, setCategory] = useState<"booking" | "meeting" | "lead">(
    params?.type ?? ""
  ); //booking,meeting,lead
  const [isLoading, setIsLoading] = useState(false);
  const onlyBooking = category === "booking";
  const onlyLead = category === "lead";
  const inBookingMeeting = category === "booking" || category === "meeting";
  const isAdmin = user?.role === "sup_admin" || user?.role === "sub_admin";
  const isAdminSrManager =
    user?.role === "sup_admin" ||
    user?.role === "sub_admin" ||
    user?.role === "sr_manager";
  const isAdminSrManagerManager =
    user?.role === "sup_admin" ||
    user?.role === "sub_admin" ||
    user?.role === "sr_manager" ||
    user?.role === "manager";
  const isAdminSrMngMngAssistantMng =
    user?.role === "sup_admin" ||
    user?.role === "sub_admin" ||
    user?.role === "sr_manager" ||
    user?.role === "manager" ||
    user?.role === "assistant_manager";
  const isAgent = user?.role === "agent";
  // console.log('user', isAdmin, 'ROLE', user?.role)
  let dd = new Date();
  const [tempDate, setTempDate] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [teamOption, setTeamOption] = useState<"myLead" | "teamLead">(
    "teamLead"
  );
  const {
    values,
    handleChange,
    setFieldValue,
    handleSubmit,
    resetForm,
    setValues,
  } = useFormik({
    initialValues: {
      // startDate: dd.setDate(dd.getDate() - 5),
      startDate: tempDate.startDate,
      endDate: tempDate.endDate,
      // ...(onlyLead && { type: 'lead' })
    },
    onSubmit: async (value) => {
      setIsLoading(true);
      try {
        if (category === "booking") {
          let sendData = {
            ...values,
            ...(values?.code &&
              values?.code && {
                clientMobile: `${values?.code}-${values?.mobile}`,
              }),
          };
          // let bookingRes = await getASBooking(sendData)
          dispatch(setBookingQueryKey(sendData));
          navigate(routeBooking.bookingNavigator);
        }
        if (category === "meeting") {
          let sendData = {
            ...values,
            ...(values?.code &&
              values?.code && {
                clientMobile: `${values?.code}-${values?.mobile}`,
              }),
          };
          dispatch(setMeetingQueryKey(sendData));
          // let meetingRes = await getASMeeting(sendData)
          // await dispatch(setAdvanceMeeting(meetingRes?.data));
          navigate(routeMeeting.MeetingsNavigator);
        }
        if (category === "lead") {
          let sendData = {
            ...values,
            individual: teamOption === "myLead" ? true : false,
          };

          await dispatch(setLeadQueryKey(sendData));
          // let meetingRes = await getASLead(sendData)
          // await dispatch(setAdvanceLead(meetingRes?.data));
          navigate(routeLead.leadNavigator);
        }
      } catch (error) {
        myConsole("error in bookingRes", error);
      } finally {
        setIsLoading(false);
      }
    },
  });
  const onDateSelect = (key, value) => {
    setTempDate({
      ...tempDate,
      [key]: value,
    });
    setFieldValue(key, value);
  };

  useEffect(() => {
    if (category === "booking") {
      setValues(bookingQueryKey ?? {});
    } else if (category === "lead") {
      setValues(leadQueryKey ?? {});
    } else if (category === "meeting") {
      setValues(meetingQueryKey ?? {});
    }
  }, [category, isFocus]);

  return (
    <>
      <Header title={"Advance Search"} />
      <Container
        style={{
          paddingHorizontal: 20,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingBottom: 120 }}>
            <DropdownRNE
              label="Category"
              arrOfObj={[
                { name: "Meeting", _id: "meeting" },
                { name: "Lead", _id: "lead" },
                { name: "Booking", _id: "booking" },
              ]}
              containerStyle={{ marginBottom: 15 }}
              initialValue={category}
              onChange={(v) => {
                setCategory(v);
                resetForm();
              }}
              isAdvanceSearch
            />
            {category === "lead" && !isAdmin && !isAgent && (
              <DropdownRNE
                label="Team Option"
                arrOfObj={[
                  { name: "Team Lead", _id: "teamLead" },
                  { name: "My Lead", _id: "myLead" },
                ]}
                containerStyle={{ marginBottom: 15 }}
                initialValue={teamOption}
                onChange={(v) => {
                  setTeamOption(v);
                }}
                isAdvanceSearch
              />
            )}
            <DatePickerExpo
              title="Start Date"
              boxContainerStyle={{ marginBottom: 15 }}
              onSelect={(v) => onDateSelect("startDate", v)}
              initialValue={values?.startDate}
            />
            <DatePickerExpo
              title="End Date"
              boxContainerStyle={{ marginBottom: 15 }}
              onSelect={(v) => onDateSelect("endDate", v)}
              initialValue={values?.endDate}
            />
            <DropdownRNE
              label="Status"
              placeholder="Status"
              // arrOfObj={inMeetingStatus}
              arrOfObj={advanceStatus[category]}
              containerStyle={{ marginBottom: 15 }}
              onChange={(v) => setFieldValue("status", v)}
              isAdvanceSearch
              initialValue={values?.status}
            />
            {onlyLead && (
              <DropdownRNE
                label="Type"
                placeholder="Type"
                // arrOfObj={inMeetingStatus}
                arrOfObj={leadTypeInAS}
                containerStyle={{ marginBottom: 15 }}
                onChange={(v) => setFieldValue("type", v)}
                initialValue={values?.type}
                isAdvanceSearch
              />
            )}
            {onlyBooking && (
              <>
                <DropdownRNE
                  label="Type"
                  containerStyle={{ marginBottom: 15 }}
                  arrOfObj={leadTypeInAS}
                  onChange={(v) => setFieldValue("type", v)}
                  isAdvanceSearch
                  initialValue={values?.type}
                />
                <CustomInput
                  label="Source"
                  containerStyle={{ marginBottom: 15 }}
                  onChangeText={handleChange("name")}
                  value={values?.name}
                />
              </>
            )}
            {inBookingMeeting && (
              <>
                <CustomInput
                  label="Client Name"
                  containerStyle={{ marginBottom: 15 }}
                  onChangeText={handleChange("clientName")}
                  value={values?.clientName}
                />
                <CustomInput
                  label="Client Email"
                  containerStyle={{ marginBottom: 15 }}
                  onChangeText={handleChange("clientEmail")}
                  value={values?.clientEmail}
                />

                <CustomText fontSize={16} fontWeight="500" marginBottom={8}>
                  Client Mobile
                </CustomText>
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 10,
                  }}
                >
                  {onlyBooking && (
                    <DropdownRNE
                      arrOfObj={mobileCodeWithIdKey || []}
                      containerStyle={{ width: 150, marginEnd: 10 }}
                      placeholder="+91"
                      onChange={(v) => setFieldValue("code", v)}
                      initialValue={values?.code}
                      isAdvanceSearch
                      mode="modal"
                    />
                  )}
                  {!onlyBooking && (
                    <DropdownRNE
                      arrOfObj={mobileCodeWithIdKey || []}
                      containerStyle={{ width: 150, marginEnd: 10 }}
                      placeholder="+91"
                      onChange={(v) => setFieldValue("code", v)}
                      initialValue={values?.code}
                      isAdvanceSearch
                      mode="modal"
                    />
                  )}

                  <CustomInput
                    containerStyle={{
                      flex: 1,
                    }}
                    placeholder="Mobile Number"
                    onChangeText={handleChange("mobile")}
                    value={values?.mobile}
                  />
                </View>
              </>
            )}
            {onlyBooking && (
              <DropdownRNE
                label="Developer"
                arrOfObj={developerSort?.length > 0 ? developerSort : []}
                // dropdownPosition='top'
                containerStyle={{ marginBottom: 15 }}
                isMultiSelect={true}
                onChange={(v) => setFieldValue("developer", v)}
                isAdvanceSearch
                isSearch
                mode="modal"
                initialValue={values?.developer}
              />
            )}
            {onlyBooking && (
              <CustomInput
                label="Relationship Manager"
                containerStyle={{ marginBottom: 15 }}
                onChangeText={handleChange("relationshipManager")}
                value={values?.relationshipManager}
              />
            )}
            {onlyBooking && (
              <CustomInput
                label="Project Name"
                containerStyle={{ marginBottom: 15 }}
                onChangeText={handleChange("projectName")}
                value={values?.projectName}
              />
            )}
            {onlyBooking && (
              <CustomInput
                label="Unit"
                containerStyle={{ marginBottom: 15 }}
                onChangeText={handleChange("unit")}
                value={values?.unit}
              />
            )}
            {onlyBooking && (
              <DropdownRNE
                label="Booking Status"
                containerStyle={{ marginBottom: 15 }}
                arrOfObj={inputStatusOptions}
                isMultiSelect
                onChange={(v) => setFieldValue("inputStatus", v)}
                isAdvanceSearch
                mode="modal"
                isSearch
                initialValue={values?.inputStatus}
              />
            )}
            {onlyBooking && (
              <DropdownRNE
                label="Business Status"
                containerStyle={{ marginBottom: 15 }}
                arrOfObj={[
                  { _id: "confirm_business", name: "Confirm Business" },
                  { _id: "eoi", name: "EOI" },
                  { _id: "canceled", name: "Canceled" },
                  { _id: "eoi_canceled", name: "EOI Canceled" },
                ]}
                // dropdownPosition='top'
                onChange={(v) => setFieldValue("businessStatus", v)}
                mode="modal"
                initialValue={values?.businessStatus}
              />
            )}

            {onlyBooking && (
              <DropdownRNE
                label="Payment Status"
                containerStyle={{ marginBottom: 15 }}
                isMultiSelect={true}
                arrOfObj={PaymentStatus}
                onChange={(v) => setFieldValue("paymentStatus", v)}
                isAdvanceSearch
                mode="modal"
                isSearch
                initialValue={values?.paymentStatus}
              />
            )}
            {onlyBooking && (
              <DropdownRNE
                label="Mode of Payment"
                containerStyle={{ marginBottom: 15 }}
                arrOfObj={ModeOfPayment}
                isMultiSelect
                onChange={(v) => setFieldValue("paymentMode", v)}
                isAdvanceSearch
                mode="modal"
                isSearch
                initialValue={values?.paymentMode}
              />
            )}
            {onlyBooking && (
              <DropdownRNE
                label="Token"
                containerStyle={{ marginBottom: 15 }}
                arrOfObj={tokenInBooking}
                onChange={(v) => setFieldValue("token", v)}
                isAdvanceSearch
                mode="modal"
                initialValue={values?.token}
              />
            )}
            {/* jugar for dropdown value clear */}
            {onlyBooking && (
              <>
                <>
                  {isAdmin && (
                    <DropdownRNE
                      label="Sr Manager"
                      containerStyle={{ marginBottom: 15 }}
                      keyName="sr_manager"
                      onChange={(v) => setFieldValue("srManager", v)}
                      isMultiSelect={!onlyLead}
                      // dropdownPosition='top'
                      isAdvanceSearch
                      mode="modal"
                      isSearch
                      initialValue={values?.srManager}
                    />
                  )}
                </>
                <>
                  {isAdminSrManager && (
                    <DropdownRNE
                      label="Team Manager"
                      containerStyle={{ marginBottom: 15 }}
                      keyName="manager"
                      onChange={(v) => setFieldValue("manager", v)}
                      isMultiSelect={!onlyLead}
                      // dropdownPosition='top'
                      isAdvanceSearch
                      mode="modal"
                      isSearch
                      initialValue={values?.manager}
                    />
                  )}

                  {isAdminSrManagerManager && (
                    <DropdownRNE
                      label="Assistant Manager"
                      containerStyle={{ marginBottom: 15 }}
                      keyName="assistant_manager"
                      onChange={(v) => setFieldValue("assistantManager", v)}
                      isMultiSelect={!onlyLead}
                      // dropdownPosition='top'
                      isAdvanceSearch
                      mode="modal"
                      isSearch
                      initialValue={values?.assistantManager}
                    />
                  )}
                </>
                <>
                  {isAdminSrMngMngAssistantMng && (
                    <DropdownRNE
                      label="Team Lead"
                      containerStyle={{ marginBottom: 15 }}
                      keyName="team_lead"
                      onChange={(v) => setFieldValue("teamLead", v)}
                      isMultiSelect={!onlyLead}
                      isAdvanceSearch
                      mode="modal"
                      isSearch
                      initialValue={values?.teamLead}
                    />
                  )}
                </>
                {!isAgent && (
                  <DropdownRNE
                    label="Agents"
                    containerStyle={{ marginBottom: 15 }}
                    keyName="agent"
                    isMultiSelect={!onlyLead}
                    // dropdownPosition='top'
                    onChange={(v) => setFieldValue("agent", v)}
                    isAdvanceSearch
                    isSearch
                    mode="modal"
                    initialValue={values?.agent}
                  />
                )}
              </>
            )}
            {teamOption === "teamLead" && (
              <>
                {!onlyBooking && (
                  <>
                    <>
                      {isAdmin && (
                        <DropdownRNE
                          label="Sr Manager"
                          containerStyle={{ marginBottom: 15 }}
                          keyName="sr_manager"
                          onChange={(v) => setFieldValue("srManager", v)}
                          isMultiSelect={!onlyLead}
                          // dropdownPosition='top'
                          isAdvanceSearch
                          mode="modal"
                          isSearch
                          initialValue={values?.srManager}
                        />
                      )}
                    </>
                    <>
                      {isAdminSrManager && (
                        <DropdownRNE
                          label="Team Manager"
                          containerStyle={{ marginBottom: 15 }}
                          keyName="manager"
                          onChange={(v) => setFieldValue("manager", v)}
                          isMultiSelect={!onlyLead}
                          // dropdownPosition='top'
                          isAdvanceSearch
                          mode="modal"
                          isSearch
                          initialValue={values?.manager}
                        />
                      )}
                      {isAdminSrManagerManager && (
                        <DropdownRNE
                          label="Assistant Manager"
                          containerStyle={{ marginBottom: 15 }}
                          keyName="assistant_manager"
                          onChange={(v) => setFieldValue("assistantManager", v)}
                          isMultiSelect={!onlyLead}
                          // dropdownPosition='top'
                          isAdvanceSearch
                          mode="modal"
                          isSearch
                          initialValue={values?.assistantManager}
                        />
                      )}
                    </>
                    <>
                      {isAdminSrMngMngAssistantMng && (
                        <DropdownRNE
                          label="Team Lead"
                          containerStyle={{ marginBottom: 15 }}
                          keyName="team_lead"
                          onChange={(v) => setFieldValue("teamLead", v)}
                          isMultiSelect={!onlyLead}
                          isAdvanceSearch
                          mode="modal"
                          isSearch
                          initialValue={values?.teamLead}
                        />
                      )}
                    </>
                    {!isAgent && (
                      <DropdownRNE
                        label="Agents"
                        containerStyle={{ marginBottom: 15 }}
                        keyName="agent"
                        isMultiSelect={!onlyLead}
                        // dropdownPosition='top'
                        onChange={(v) => setFieldValue("agent", v)}
                        isAdvanceSearch
                        isSearch
                        mode="modal"
                        initialValue={values?.agent}
                      />
                    )}
                  </>
                )}
              </>
            )}

            {/* <DropdownRNE
              label="Category"
              arrOfObj={[
                { name: "Meeting", _id: "meeting" },
                { name: "Lead", _id: "lead" },
                { name: "Booking", _id: "booking" },
              ]}
              containerStyle={{ marginBottom: 15 }}
              initialValue={category}
              onChange={(v) => {
                setCategory(v);
                resetForm();
              }}
              isAdvanceSearch
            /> */}
          </View>
        </ScrollView>
        <CustomBtn
          title="Apply"
          onPress={handleSubmit}
          isLoading={isLoading}
          containerStyle={{
            position: "absolute",
            top: Platform.OS === "ios" ? HEIGHT * 0.75 : HEIGHT * 0.8,
            alignSelf: "center",
            width: 200,
          }}
        />
      </Container>
    </>
  );
};

export default AdvanceSearch;

const styles = StyleSheet.create({});
