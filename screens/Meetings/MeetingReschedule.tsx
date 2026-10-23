import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useRef, useState } from "react";
import { useMeetingMemberOptions } from "../../hooks/useMeetingLifecycle";
import {
  combineMeetingDate,
  isMeetingConflict,
  meetingActions,
  meetingId,
  meetingMembers,
  meetingSupportingMembers,
  meetingMessage,
  meetingRequestId,
  meetingSuccess,
  meetingVersion,
} from "../../utils/meetingLifecycle";
import { Formik } from "formik";

import Header from "../../components/Header";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { useAppToast } from "../../components/AppToast";
import { useNavigation, useRoute } from "@react-navigation/native";
import Container from "../../myComponents/Container/Container";
import { Feather } from "@expo/vector-icons";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomText from "../../myComponents/CustomText/CustomText";
import CustomGooglePlacesSearch from "../../myComponents/CustomGooglePlacesSearch/CustomGooglePlacesSearch";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { HEIGHT, WIDTH } from "../../const/deviceInfo";
import { useFormik } from "formik";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { meetingRescheduled } from "../../services/rootApi/meetingApi";
import CustomMapView from "../../myComponents/CustomMapView/CustomMapView";
import { getAllMeetingFunc } from "../../redux/action";
import { myConsole } from "../../hooks/useConsole";
import { routeMeeting } from "../../utils/routes";
import { useDispatch } from "react-redux";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import * as Yup from "yup";
import { navigateToMapApp } from "../../utils/navigateToMapApp";
import { queryKeyCRM } from "../../utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { color } from "../../const/color";

const ASPECT_RATIO = WIDTH / HEIGHT;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const resheduleSchema = Yup.object().shape({
  date: Yup.string().required("date is required"),
  time: Yup.string().required("time is required"),
  location: Yup.string().when("meetingMode", {
    is: "virtual",
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required("Location is required"),
  }),
  remarks: Yup.string().required("remarks is required"),
  productPitch: Yup.string().optional(),
  self: Yup.boolean().required(),
  members: Yup.array().of(Yup.string()),
  virtualMeetingLink: Yup.string().when("meetingMode", {
    is: "virtual",
    then: (schema) =>
      schema.trim().required("Virtual meeting platform or link is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const MeetingReschedule = () => {
  const queryClient = useQueryClient();
  const { user, allUsers = [] } = useSelector(selectUser);
  const toast = useAppToast();
  const requestRef = useRef<any>(null);
  const { params } = useRoute<any>();
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation<any>();
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapLatLng, setMapLatLng] = useState({});
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false);
  const id = params?.id;
  const meetings = params?.meetingDetails?.meetings;
  const lastMeeting = meetings?.[meetings.length - 1];
  const meeting = params?.meetingDetails;
  const responsible = meeting?.responsibleUserId;
  const memberQuery = useMeetingMemberOptions(user?._id);
  const inheritedMembers = lastMeeting?.members?.length
    ? lastMeeting.members
    : [params?.meetingDetails?.createdBy].filter(Boolean);
  const memberOptions = Array.from(
    new Map(
      (memberQuery.data || []).map((member) => [String(member._id), member]),
    ).values(),
  )
    .filter((member) => meetingId(member) !== meetingId(responsible))
    .map((member) => ({
      ...member,
      name:
        `${member.name || ""} ${member.lastName || ""}`.trim() ||
        member.email ||
        String(member._id),
    }));
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);

  myConsole("meetingsssss", meetings);

  const {
    handleChange,
    handleSubmit,
    values,
    setFieldValue,
    resetForm,
    isValid,
    errors,
    touched,
  } = useFormik({
    initialValues: {
      // date: meetings?.[meetings?.length - 1]?.scheduleDate ?? "",
      // time: meetings?.[meetings?.length - 1]?.scheduleDate ?? "",
      // location: meetings?.[meetings?.length - 1]?.location ?? "",
      // remarks: meetings?.[meetings?.length - 1]?.remarks ?? "",
      // coordinates: meetings?.[meetings?.length - 1]?.coordinates ?? ""
      date: new Date(Date.now() + 5 * 60 * 1000),
      time: new Date(Date.now() + 5 * 60 * 1000),

      location: lastMeeting?.location || "",
      remarks: lastMeeting?.remarks || "",
      productPitch: lastMeeting?.productPitch || "",
      coordinates: lastMeeting?.coordinates || {},
      self: lastMeeting?.self ?? params?.meetingDetails?.self ?? true,
      members: inheritedMembers
        .map(meetingId)
        .filter((id) => id !== meetingId(responsible)),
      meetingMode: lastMeeting?.meetingMode || "physical",
      virtualMeetingLink: lastMeeting?.virtualMeetingLink || "",
    },
    validationSchema: resheduleSchema,
    onSubmit: async (value) => {
      try {
        setIsLoadingMeeting(true);
        if (memberQuery.isPending || memberQuery.error || !Array.isArray(memberQuery.data))
          throw new Error(meetingMessage(memberQuery.error, "Supporting members are still loading. Please try again."));
        if (!meetingActions(meeting).reschedule)
          throw new Error(
            "This meeting is read-only. Refresh or request admin review.",
          );
        let sendData = {
          ...meetingVersion(meeting),
          scheduleDate: combineMeetingDate(value.date, value.time),
          meetingMode: value.meetingMode,
          location: value.location,
          remarks: value.remarks,
          productPitch: value.productPitch,
          coordinates: values?.coordinates,
          members: meetingMembers(responsible, meetingSupportingMembers(responsible, value.members, memberQuery.data)),
          virtualMeetingLink: value.virtualMeetingLink,
        };
        if (new Date(sendData.scheduleDate).getTime() < Date.now()) {
          toast.error("Choose a current or future meeting date and time.");
          return;
        }
        let res = await meetingRescheduled(id, {
          ...sendData,
          requestId: meetingRequestId(requestRef, sendData),
        });
        // setIsVisible(true);
        // setMessage(res?.data);
        // await dispatch(getAllMeetingFunc());
        // setIsLoadingMeeting(false);
        // navigate(routeMeeting?.AllMeetings);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeetingById, id],
          }),
          queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getMeeting] }),
        ]);
        popUpConfToast.successMessage(
          meetingSuccess(res, "Meeting rescheduled"),
        );
        goBack();
      } catch (error: any) {
        myConsole("error", error);
        toast.error(meetingMessage(error, "Unable to reschedule meeting"));
        if (isMeetingConflict(error)) {
          await queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeetingById, id],
          });
          goBack();
        }
      } finally {
        // dispatch(getAllMeetingFunc())
        setIsLoadingMeeting(false);
      }
    },
  });

  const formattedTime = new Date("2026-01-28T13:30:48.623Z").toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  );

  myConsole("Formatted Time", formattedTime);

  const toggleMapViewModal = (v: any) => {
    setIsMapModalVisible(!isMapModalVisible);
    setMapLatLng(v);
  };

  return (
    <>
      <Header title={"Reschedule Meetings"} />
      <CustomModelMessage
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        message={message}
        onClose={() => {
          setIsVisible(false);
          setMessage(null);
        }}
      />
      <Container>
        <ScrollView
          style={{
            padding: 20,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <DatePickerExpo
              title={"Date"}
              boxContainerStyle={{ marginBottom: 20, width: "47%" }}
              onSelect={(a) => setFieldValue("date", a)}
              initialValue={values?.date}
              mode="date"
              minimumDate={new Date()}
            />
            <DatePickerExpo
              title={"Time"}
              boxContainerStyle={{ marginBottom: 20, width: "47%" }}
              onSelect={(a) => setFieldValue("time", a)}
              initialValue={values?.time}
              mode="time"
              minuteInterval={1} // ✅ FIX: prevents 5-min rounding
            />
          </View>

          <CustomText style={{ color: "#64748B", marginBottom: 12 }}>
            Responsible:{" "}
            {[responsible?.name, responsible?.lastName]
              .filter(Boolean)
              .join(" ") || meetingId(responsible)}{" "}
            (always included)
          </CustomText>
          {!!memberQuery.error && (
            <CustomText color="#B91C1C">
              {meetingMessage(memberQuery.error)}
            </CustomText>
          )}
          {!!memberQuery.error && (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => memberQuery.refetch()}
              style={{ paddingVertical: 12 }}
            >
              <CustomText color="#2E67BE">Retry loading members</CustomText>
            </TouchableOpacity>
          )}
          <DropdownRNE
            arrOfObj={memberOptions}
            isMultiSelect
            keyValueShowInBox="name"
            keyValueGetOnSelect="_id"
            label="Supporting members (Optional)"
            placeholder="Select members"
            initialValue={meetingSupportingMembers(responsible, values.members, memberQuery.data || [])}
            onChange={(value) => setFieldValue("members", meetingSupportingMembers(responsible, value as any[], memberQuery.data || []))}
            disabled={memberQuery.isPending || !!memberQuery.error}
            excludedItems={[meetingId(responsible)]}
            isSearch
            mode="modal"
            containerStyle={{ marginBottom: 15 }}
          />
          <DropdownRNE
            label="Meeting type"
            arrOfObj={[
              { _id: "physical", name: "Physical" },
              { _id: "virtual", name: "Virtual" },
            ]}
            keyValueShowInBox="name"
            keyValueGetOnSelect="_id"
            initialValue={values.meetingMode}
            onChange={(value) => setFieldValue("meetingMode", value)}
            containerStyle={{ marginBottom: 15 }}
          />
          {errors.members && (touched.members || !values.self) && (
            <CustomText color="red">{String(errors.members)}</CustomText>
          )}
          {values.meetingMode === "virtual" ? (
            <CustomInput
              label="Virtual meeting platform / link"
              value={values.virtualMeetingLink}
              onChangeText={handleChange("virtualMeetingLink")}
              containerStyle={{ marginBottom: 15 }}
            />
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <CustomText
                  marginBottom={10}
                  fontSize={16}
                  fontWeight="500"
                  color={color.mainTxtColor}
                >
                  Meeting Location
                </CustomText>
                {values?.coordinates?.lng && (
                  <Feather
                    name="map-pin"
                    size={20}
                    color="#2D67C6"
                    style={{ padding: 5 }}
                    // onPress={() => toggleMapViewModal(values?.coordinates)}
                    onPress={() => navigateToMapApp(values?.coordinates)}
                  />
                )}
              </View>
              <CustomGooglePlacesSearch
                defaultValue={values?.location}
                onPress={(data, details) => {
                  setFieldValue("location", data.description);
                  setFieldValue("coordinates", {
                    lat: details?.geometry?.location?.lat,
                    lng: details?.geometry?.location?.lng,
                  });
                }}
              />
            </>
          )}
          <CustomInput
            label="Product Pitch (Optional)"
            placeholder="Product Pitch"
            onChangeText={handleChange("productPitch")}
            value={values.productPitch}
            containerStyle={{ marginBottom: 15 }}
          />
          <CustomInput
            label="Remarks"
            placeholder="Remarks"
            onChangeText={handleChange("remarks")}
            value={values.remarks}
            containerStyle={{ marginBottom: 15 }}
          />
          <CustomBtn
            title={"Save"}
            onPress={handleSubmit}
            containerStyle={{ margin: 20 }}
            isLoading={isLoadingMeeting}
            disabled={!isValid}
          />
          {values?.coordinates && (
            <CustomMapView
              isMapModalVisible={isMapModalVisible}
              toggleMapViewModal={toggleMapViewModal}
              mapLatLng={mapLatLng}
            />
          )}
        </ScrollView>
        <CustomMapView
          isMapModalVisible={isMapModalVisible}
          toggleMapViewModal={toggleMapViewModal}
          mapLatLng={mapLatLng}
        />
      </Container>
    </>
  );
};

export default MeetingReschedule;
