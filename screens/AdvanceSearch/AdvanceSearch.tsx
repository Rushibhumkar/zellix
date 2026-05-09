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
  TouchableOpacity,
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
  roleEnum,
  tokenInBooking,
} from "../../utils/data";
import { routeBooking, routeLead, routeMeeting } from "../../utils/routes";
import { color } from "../../const/color";

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
  callingData: inLeadStatus,
};

const AdvanceSearch = () => {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();
  const isFocus = useIsFocused();
  const [resetKey, setResetKey] = useState(0);
  const { user, developer, leadQueryKey, bookingQueryKey, meetingQueryKey } =
    useSelector(selectUser);
  const developerSort = [...developer]?.sort((a, b) =>
    a?.name === b?.name ? 0 : a?.name < b?.name ? -1 : 1,
  );
  const { params } = useRoute();
  const sourceTab = params?.sourceTab || params?.type || "lead";

  const [category, setCategory] = useState<
    "booking" | "meeting" | "lead" | "callingData"
  >(
    sourceTab === "calling_data"
      ? "callingData"
      : sourceTab === "meeting"
        ? "meeting"
        : sourceTab === "booking"
          ? "booking"
          : "lead",
  );

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
  const isAgent = user?.role === "agent" || user?.role === roleEnum.seo;
  // console.log('user', isAdmin, 'ROLE', user?.role)
  let dd = new Date();
  const [tempDate, setTempDate] = useState({
    startDate: null,
    endDate: null,
  });

  const [teamOption, setTeamOption] = useState<"myLead" | "teamLead">(
    "teamLead",
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
      startDate: null,
      endDate: null,
      assignedAt: null,
      status: [],
    },
    onSubmit: async (value) => {
      setIsLoading(true);
      try {
        const sendData = {
          ...values,
          startDate: values.startDate
            ? new Date(values.startDate).toISOString()
            : null,
          endDate: values.endDate
            ? new Date(values.endDate).toISOString()
            : null,
          assignedAt: values.assignedAt
            ? new Date(values.assignedAt).toISOString()
            : null,
        };

        if (category === "booking") {
          dispatch(setBookingQueryKey(sendData));
          navigate("BookingNavigator");
        } else if (category === "meeting") {
          dispatch(setMeetingQueryKey(sendData));
          navigate("MeetingsNavigator");
        } else if (category === "lead" || category === "callingData") {
          dispatch(
            setLeadQueryKey({
              ...sendData,
              type: category === "callingData" ? "calling_data" : "lead",
            }),
          );

          navigate("Dashboard", {
            screen: category === "callingData" ? "allLead" : "allLead2",
          });
        }
      } catch (error) {
        console.log("error in bookingRes", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const onDateSelect = (key, value) => {
    setTempDate((prev) => ({
      ...prev,
      [key]: value || null,
    }));
    setFieldValue(key, value || null);
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
                { name: "Calling Data", _id: "callingData" },
              ]}
              containerStyle={{ marginBottom: 15, marginTop: 12 }}
              initialValue={category}
              onChange={(v) => {
                setCategory(v);
                resetForm();
              }}
              isAdvanceSearch
            />
            {(category === "lead" || category === "callingData") &&
              !isAgent && (
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
              key={`startDate-${resetKey}`}
              title="Start Date"
              boxContainerStyle={{ marginBottom: 15 }}
              onSelect={(v) => onDateSelect("startDate", v)}
              initialValue={values?.startDate}
            />
            <DatePickerExpo
              key={`endDate-${resetKey}`}
              title="End Date"
              boxContainerStyle={{ marginBottom: 15 }}
              onSelect={(v) => onDateSelect("endDate", v)}
              initialValue={values?.endDate}
            />
            <DatePickerExpo
              key={`assignedAt-${resetKey}`}
              title="Assigned At"
              boxContainerStyle={{ marginBottom: 15 }}
              onSelect={(v) => onDateSelect("assignedAt", v)}
              initialValue={values?.assignedAt}
            />
            <DropdownRNE
              key={`status-${resetKey}`}
              label="Status"
              placeholder="Status"
              // arrOfObj={inMeetingStatus}
              isMultiSelect
              arrOfObj={advanceStatus[category] || inLeadStatus}
              containerStyle={{ marginBottom: 15 }}
              onChange={(v) =>
                setFieldValue("status", Array.isArray(v) ? v : [v])
              }
              isAdvanceSearch
              initialValue={values?.status}
            />
            {/* {onlyLead && (
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
            )} */}
            {onlyBooking && (
              <>
                <DropdownRNE
                  key={`dropdown-${resetKey}`}
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

                <CustomText
                  fontSize={16}
                  fontWeight="500"
                  marginBottom={8}
                  color={color.mainTxtColor}
                >
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
                      key={`dropdown-${resetKey}`}
                      arrOfObj={mobileCodeWithIdKey || []}
                      containerStyle={{ width: 150, marginEnd: 10 }}
                      dropdownStyle={{
                        height: Platform.OS === "ios" ? 40 : 46,
                      }}
                      placeholder="+91"
                      onChange={(v) => setFieldValue("code", v)}
                      initialValue={values?.code}
                      isAdvanceSearch
                      mode="modal"
                      isCountryPicker
                    />
                  )}
                  {!onlyBooking && (
                    <DropdownRNE
                      key={`dropdown-${resetKey}`}
                      arrOfObj={mobileCodeWithIdKey || []}
                      containerStyle={{
                        width: 80,
                        marginEnd: 10,
                      }}
                      dropdownStyle={{
                        height: Platform.OS === "ios" ? 40 : 46,
                      }}
                      placeholder="+91"
                      onChange={(v) => setFieldValue("code", v)}
                      initialValue={values?.code}
                      isAdvanceSearch
                      mode="modal"
                      isCountryPicker
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
                key={`dropdown-${resetKey}`}
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
                key={`dropdown-${resetKey}`}
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
                key={`dropdown-${resetKey}`}
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
                key={`dropdown-${resetKey}`}
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
                key={`dropdown-${resetKey}`}
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
                key={`dropdown-${resetKey}`}
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
                      key={`dropdown-${resetKey}`}
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
                      key={`dropdown-${resetKey}`}
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
                      key={`dropdown-${resetKey}`}
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
                      key={`dropdown-${resetKey}`}
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
                    key={`dropdown-${resetKey}`}
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
                          key={`dropdown-${resetKey}`}
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
                          key={`dropdown-${resetKey}`}
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
                          key={`dropdown-${resetKey}`}
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
                          key={`dropdown-${resetKey}`}
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
                        key={`dropdown-${resetKey}`}
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
        {/* <CustomBtn
          title="Apply"
          onPress={handleSubmit}
          isLoading={isLoading}
          containerStyle={{
            position: "absolute",
            top: Platform.OS === "ios" ? HEIGHT * 0.75 : HEIGHT * 0.8,
            alignSelf: "center",
            width: 200,
          }}
        /> */}
        <View
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? HEIGHT * 0.75 : HEIGHT * 0.8,
            alignSelf: "center",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              resetForm({
                values: {
                  startDate: null,
                  endDate: null,
                  assignedAt: null,
                  status: [],
                },
              });

              setTempDate({ startDate: null, endDate: null });

              dispatch(setBookingQueryKey(null));
              dispatch(setLeadQueryKey(null));
              dispatch(setMeetingQueryKey(null));

              setCategory(category);
              setResetKey((prev) => prev + 1);
            }}
            style={{
              width: 120,
              borderWidth: 1,
              borderColor: color.mainTxtColor,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 10,
              height: 45,
            }}
          >
            <CustomText style={{ color: color.mainTxtColor }}>
              Clear All
            </CustomText>
          </TouchableOpacity>

          <CustomBtn
            title="Apply"
            onPress={handleSubmit}
            isLoading={isLoading}
            containerStyle={{
              width: 120,
            }}
          />
        </View>
      </Container>
    </>
  );
};

export default AdvanceSearch;

const styles = StyleSheet.create({});
