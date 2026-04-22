import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";

import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomText from "../../myComponents/CustomText/CustomText";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";

import { color } from "../../const/color";
import { addEventRsvp, updateEventRsvp } from "./rsvpApi";
import { useAppToast } from "../../components/AppToast";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import CustomGooglePlacesSearch from "../../myComponents/CustomGooglePlacesSearch/CustomGooglePlacesSearch";
import { myConsole } from "../../hooks/useConsole";

const validationSchema = Yup.object().shape({
  eventName: Yup.string().required("Event name is required"),
  eventType: Yup.string().required("Event type is required"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .required("End date is required")
    .min(Yup.ref("startDate"), "End date must be after start date"),
  description: Yup.string().optional(),
});

const AddEvent = ({ route }: any) => {
  const eventData = route?.params?.detail;
  // myConsole("eventDataaa", eventData);
  const toast = useAppToast();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [locationText, setLocationText] = useState(eventData?.location || "");
  const [coords, setCoords] = useState({
    lat: eventData?.coordinates?.lat || null,
    lng: eventData?.coordinates?.lng || null,
  });

  const initialValues = {
    eventName: eventData?.title || "",
    eventType: eventData?.eventType || "",
    startDate: eventData?.startDateTime
      ? new Date(eventData.startDateTime)
      : null,
    endDate: eventData?.endDateTime ? new Date(eventData.endDateTime) : null,
    description: eventData?.description || "",
  };

  // -------------------------
  // SUBMIT HANDLER
  // -------------------------
  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const payload = {
        title: values.eventName,
        eventType: values.eventType,
        description: values.description,
        startDateTime: values.startDate.toISOString(),
        endDateTime: values.endDate.toISOString(),
        location: locationText || "",
        coordinates: {
          lat: coords.lat,
          lng: coords.lng,
        },
      };

      if (eventData) {
        const updateRes = await updateEventRsvp(eventData._id, payload);
        toast.success("Event updated successfully");
      } else {
        const addEventRes = await addEventRsvp(payload);
        toast.success("Event added successfully");
      }

      navigation.goBack();
      queryClient.invalidateQueries(["rsvpEventsList"]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to add event";
      toast.error(msg?.toString?.());
    }
  };

  return (
    <>
      <Header title={eventData ? "Update Event" : "Add Event"} />
      <Container>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={80}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleBlur,
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
              }) => (
                <View>
                  <CustomText style={styles.sectionTitle}>
                    Event Information
                  </CustomText>

                  {/* EVENT NAME */}
                  <CustomInput
                    label="Event Name"
                    value={values.eventName}
                    onChangeText={(v) => setFieldValue("eventName", v)}
                    onBlur={() => handleBlur("eventName")}
                    errors={touched.eventName ? errors.eventName : ""}
                    containerStyle={{ marginHorizontal: 20, marginTop: 8 }}
                  />

                  {/* EVENT TYPE */}
                  <CustomInput
                    label="Event Type"
                    value={values.eventType}
                    onChangeText={(v) => setFieldValue("eventType", v)}
                    onBlur={() => handleBlur("eventType")}
                    errors={touched.eventType ? errors.eventType : ""}
                    containerStyle={{ marginHorizontal: 20, marginTop: 12 }}
                  />

                  {/* START DATE */}
                  <DatePickerExpo
                    boxContainerStyle={{ marginHorizontal: 20, marginTop: 12 }}
                    onSelect={(d: any) =>
                      setFieldValue(
                        "startDate",
                        d instanceof Date ? d : new Date(d),
                      )
                    }
                    initialValue={values.startDate}
                    title="Start Date & Time"
                    mode="datetime"
                  />
                  {touched.startDate && errors.startDate && (
                    <CustomText style={styles.errorText}>
                      {errors.startDate}
                    </CustomText>
                  )}

                  {/* END DATE */}
                  <DatePickerExpo
                    boxContainerStyle={{ marginHorizontal: 20, marginTop: 12 }}
                    onSelect={(d: any) =>
                      setFieldValue(
                        "endDate",
                        d instanceof Date ? d : new Date(d),
                      )
                    }
                    initialValue={values.endDate}
                    title="End Date & Time"
                    mode="datetime"
                  />
                  {touched.endDate && errors.endDate && (
                    <CustomText style={styles.errorText}>
                      {errors.endDate}
                    </CustomText>
                  )}

                  {/* DESCRIPTION */}
                  <CustomInput
                    label="Description"
                    value={values.description}
                    onChangeText={(v) => setFieldValue("description", v)}
                    onBlur={() => handleBlur("description")}
                    containerStyle={{
                      marginHorizontal: 20,
                      marginTop: 12,
                    }}
                    multiline
                    numberOfLines={4}
                    inputStyle={{ height: 100 }}
                  />

                  {/* LOCATION */}
                  <View style={{ marginHorizontal: 20, marginTop: 16 }}>
                    <CustomGooglePlacesSearch
                      defaultValue={locationText}
                      handleBlur={() => {}}
                      onPress={(data, details) => {
                        setLocationText(data.description);

                        setCoords({
                          lat: details?.geometry?.location?.lat || null,
                          lng: details?.geometry?.location?.lng || null,
                        });
                      }}
                    />
                  </View>

                  {/* SUBMIT BUTTON */}
                  <View style={{ marginHorizontal: 20, marginTop: 20 }}>
                    <CustomBtn
                      title={eventData ? "Update Event" : "Add Event"}
                      onPress={handleSubmit}
                    />
                  </View>
                </View>
              )}
            </Formik>
          </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    paddingBottom: 180,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: color.mainTxtColor,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    marginLeft: 20,
    marginTop: 2,
    fontSize: 12,
  },
});

export default AddEvent;
