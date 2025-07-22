import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Formik } from "formik";

import Header from "../../components/Header";
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

const ASPECT_RATIO = WIDTH / HEIGHT;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const resheduleSchema = Yup.object().shape({
  date: Yup.string().required("date is required"),
  time: Yup.string().required("time is required"),
  location: Yup.string().required("location is required"),
  remarks: Yup.string().required("remarks is required"),
});

const MeetingReschedule = () => {
  const queryClient = useQueryClient();
  const { params } = useRoute();
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapLatLng, setMapLatLng] = useState({});
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false);
  const id = params?.id;
  const meetings = params?.meetingDetails?.meetings;
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);

  const {
    handleChange,
    handleSubmit,
    values,
    setFieldValue,
    resetForm,
    isValid,
  } = useFormik({
    initialValues: {
      // date: meetings?.[meetings?.length - 1]?.scheduleDate ?? "",
      // time: meetings?.[meetings?.length - 1]?.scheduleDate ?? "",
      // location: meetings?.[meetings?.length - 1]?.location ?? "",
      // remarks: meetings?.[meetings?.length - 1]?.remarks ?? "",
      // coordinates: meetings?.[meetings?.length - 1]?.coordinates ?? ""
      date: new Date(),
      time: new Date(),
      location: meetings?.[meetings?.length - 1]?.location || "",
      remarks: "",
      coordinates: {},
    },

    validationSchema: resheduleSchema,
    onSubmit: async (value) => {
      try {
        setIsLoadingMeeting(true);
        let sendData = {
          scheduleDate: `${value.date.toString().slice(0, 13)}${value.time
            .toString()
            .slice(13)}`,
          location: value.location,
          remarks: value.remarks,
          coordinates: values?.coordinates,
        };
        let res = await meetingRescheduled(id, sendData);
        // setIsVisible(true);
        // setMessage(res?.data);
        // await dispatch(getAllMeetingFunc());
        // setIsLoadingMeeting(false);
        // navigate(routeMeeting?.AllMeetings);
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getMeetingById, id],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getMeeting],
        });
        popUpConfToast.successMessage(res?.data);
        goBack();
      } catch (error) {
        myConsole("error", error);
      } finally {
        // dispatch(getAllMeetingFunc())
        setIsLoadingMeeting(false);
      }
    },
  });

  const toggleMapViewModal = (v) => {
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
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <CustomText marginBottom={10} fontSize={16} fontWeight="500">
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
