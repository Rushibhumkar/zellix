import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import CustomText from "../../myComponents/CustomText/CustomText";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomRadioButton from "../../components/CustomRadioButton";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import MobileInput from "../../myComponents/MobileInput/MobileInput";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { color } from "../../const/color";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { myConsole } from "../../hooks/useConsole";
import { sendInvitationRsvp } from "./rsvpApi";
import { useAppToast } from "../../components/AppToast";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

interface IEventItem {
  _id: string;
  title?: string;
  label?: string;
}

interface ILeadItem {
  _id: string;
  clientName?: string;
  clientMobile?: string;
  clientEmail?: string;
  whatsapp?: string;
  source?: string;
}

const validationSchema = Yup.object().shape({
  mode: Yup.string().oneOf(["auto", "manual"]).required(),

  eventId: Yup.string().required("Event is required"),

  leadId: Yup.mixed().when("mode", {
    is: "auto",
    then: (schema) => schema.required("Lead is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  clientName: Yup.string().required("Client name is required"),

  clientEmail: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

  whatsapp: Yup.string()
    .required("WhatsApp number is required")
    .matches(/^\+?\d+$/, "WhatsApp must contain only digits and optional +"),

  scheduleDate: Yup.mixed().required("Date & time is required"),
});

const SendInvitation = () => {
  const toast = useAppToast();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<IEventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [mode, setMode] = useState<"auto" | "manual">("manual");

  const [leads, setLeads] = useState<ILeadItem[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // -----------------------------
  // FETCH EVENTS
  // -----------------------------
  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const res = await axiosInstance.get("/api/event/upcoming");
      setEvents(res?.data?.data ?? []);
    } catch (e) {
      console.log("fetchEventsErr", e);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // -----------------------------
  // FETCH LEADS (AUTO MODE)
  // -----------------------------
  const fetchLeads = useCallback(async (search = "") => {
    try {
      setLeadsLoading(true);
      const res = await axiosInstance.get("/api/lead/myLeads", {
        params: { search },
      });
      setLeads(res?.data?.data ?? []);
    } catch (e) {
      console.log("fetchLeadsErr", e);
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (mode === "auto") fetchLeads();
  }, [mode, fetchLeads]);

  // -----------------------------
  // INITIAL VALUES
  // -----------------------------
  const initialValues = {
    eventId: "",
    leadId: "",
    mode: "manual",
    clientName: "",
    clientEmail: "",
    mobile: "",
    whatsapp: "",
    scheduleDate: null,
    company: "",
    leadSource: "",
    comment: "",
  };

  // -----------------------------
  // SUBMIT HANDLER
  // -----------------------------
  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitting(true);

    try {
      let code = "";
      let mobile = "";
      let clientMobile = "";

      if (values.mobile.includes("-")) {
        const [pin, phone] = values.mobile.split("-");
        code = pin;
        mobile = phone;
        clientMobile = `${pin}-${phone}`;
      }

      const payload = {
        eventId: values.eventId,
        leadId: values.mode === "manual" ? undefined : values.leadId,

        clientName: values.clientName,
        clientEmail: values.clientEmail,

        code,
        mobile,
        clientMobile,

        whatsappNum: values.whatsapp,

        dateTime:
          values.scheduleDate instanceof Date
            ? values.scheduleDate.toISOString()
            : values.scheduleDate,

        company: values.company,
        source: values.mode === "auto" ? undefined : values.leadSource, // auto = lead.source
        comment: values.comment,
      };

      myConsole("FINAL_PAYLOAD", payload);

      const res = await sendInvitationRsvp(payload);
      myConsole("ressss", res);

      toast.success("Invitation created successfully");
      navigation.navigate("RSVPInvitationList");
      await queryClient.invalidateQueries(["rsvpInvitations"]);
      await queryClient.invalidateQueries(["rsvpEventsList"]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Failed to create invitation";

      toast.error(msg?.toString?.());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Send Invitation" />
      <Container>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, backgroundColor: "#f7fbff" }}
        >
          <ScrollView contentContainerStyle={styles.container}>
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

                  {/* EVENT DROPDOWN */}
                  <DropdownRNE
                    arrOfObj={events}
                    keyValueShowInBox="label"
                    keyValueGetOnSelect="_id"
                    placeholder="Select Event"
                    containerStyle={{ marginHorizontal: 20 }}
                    onChange={(val: string) => setFieldValue("eventId", val)}
                    initialValue={values.eventId}
                    mode="modal"
                    isLoading={eventsLoading}
                  />

                  {errors.eventId && touched.eventId && (
                    <CustomText style={styles.errorText}>
                      {errors.eventId}
                    </CustomText>
                  )}

                  {/* AUTO MODE LEAD DROPDOWN */}
                  {values.mode === "auto" && (
                    <>
                      <DropdownRNE
                        arrOfObj={leads}
                        keyValueShowInBox="clientName"
                        keyValueGetOnSelect="_id"
                        placeholder="Select Lead"
                        containerStyle={{
                          marginHorizontal: 20,
                          marginTop: 12,
                        }}
                        onSelect={(item: ILeadItem) => {
                          setFieldValue("leadId", item._id);
                          setFieldValue("clientName", item.clientName ?? "");
                          setFieldValue("clientEmail", item.clientEmail ?? "");

                          const digits =
                            item.clientMobile?.replace(/\D/g, "") || "";
                          const pin = digits.slice(0, digits.length - 10);
                          const phone = digits.slice(-10);

                          setFieldValue("mobile", `${pin}-${phone}`);

                          const wa =
                            item.whatsapp?.replace(/\D/g, "").slice(-10) || "";
                          setFieldValue("whatsapp", wa);

                          setFieldValue("leadSource", item.source ?? "");
                        }}
                        initialValue={values.leadId}
                        isSearch
                        isLoading={leadsLoading}
                      />

                      {errors.leadId && touched.leadId && (
                        <CustomText style={styles.errorText}>
                          {errors.leadId}
                        </CustomText>
                      )}
                    </>
                  )}

                  {/* OPTIONS */}
                  <View
                    style={{
                      marginHorizontal: 20,
                      marginTop: 8,
                      marginBottom: 16,
                    }}
                  >
                    <CustomText style={styles.labelWithMargin}>
                      Options
                    </CustomText>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 18,
                      }}
                    >
                      <CustomRadioButton
                        value="auto"
                        selected={values.mode}
                        onChange={(v) => {
                          setFieldValue("mode", v);
                          setMode(v as any);

                          if (v === "auto") {
                            setFieldValue("clientName", "");
                            setFieldValue("clientEmail", "");
                            setFieldValue("mobile", "-");
                            setFieldValue("whatsapp", "");
                          }
                        }}
                        label="Auto-fetch"
                      />

                      <CustomRadioButton
                        value="manual"
                        selected={values.mode}
                        onChange={(v) => {
                          setFieldValue("mode", v);
                          setMode(v as any);
                          if (v === "manual") setFieldValue("leadId", "");
                        }}
                        label="Manual"
                      />
                    </View>
                  </View>

                  {/* CLIENT INFO */}
                  <CustomText style={styles.sectionTitle}>
                    Client Information
                  </CustomText>

                  <CustomInput
                    label="Client Name"
                    value={values.clientName}
                    onChangeText={(v) => setFieldValue("clientName", v)}
                    onBlur={() => handleBlur("clientName")}
                    errors={touched.clientName ? errors.clientName : ""}
                    containerStyle={{ marginHorizontal: 20, marginTop: 8 }}
                    editable={values.mode === "manual"}
                  />

                  <CustomInput
                    label="Client Email"
                    value={values.clientEmail}
                    onChangeText={(v) => setFieldValue("clientEmail", v)}
                    onBlur={() => handleBlur("clientEmail")}
                    errors={touched.clientEmail ? errors.clientEmail : ""}
                    containerStyle={{ marginHorizontal: 20, marginTop: 8 }}
                  />

                  {/* MOBILE */}
                  <MobileInput
                    onChange={(val: string) => setFieldValue("mobile", val)}
                    value={values.mobile}
                    error={touched.mobile ? errors.mobile : ""}
                    isCountryPicker={false}
                    onBlur={() => handleBlur("mobile")}
                    customStyle={{ marginHorizontal: 22, marginTop: 16 }}
                  />

                  {/* WHATSAPP */}
                  <CustomInput
                    label="WhatsApp Number"
                    value={values.whatsapp}
                    onChangeText={(v) => setFieldValue("whatsapp", v)}
                    onBlur={() => handleBlur("whatsapp")}
                    errors={touched.whatsapp ? errors.whatsapp : ""}
                    containerStyle={{ marginHorizontal: 20 }}
                    keyboardType="number-pad"
                  />

                  {/* DATE & TIME */}
                  <DatePickerExpo
                    boxContainerStyle={{ marginHorizontal: 20, marginTop: 8 }}
                    onSelect={(d: any) =>
                      setFieldValue(
                        "scheduleDate",
                        d instanceof Date ? d : new Date(d)
                      )
                    }
                    initialValue={values.scheduleDate}
                    title="Date & Time"
                    mode="datetime"
                  />

                  {touched.scheduleDate && errors.scheduleDate && (
                    <CustomText style={styles.errorText}>
                      {errors.scheduleDate as any}
                    </CustomText>
                  )}

                  {/* COMPANY */}
                  <CustomInput
                    label="Company"
                    value={values.company}
                    onChangeText={(v) => setFieldValue("company", v)}
                    onBlur={() => handleBlur("company")}
                    errors={touched.company ? errors.company : ""}
                    containerStyle={{ marginHorizontal: 20, marginTop: 12 }}
                  />

                  {/* SOURCE */}
                  <CustomInput
                    label="Lead Source"
                    value={values.leadSource}
                    onChangeText={(v) => setFieldValue("leadSource", v)}
                    onBlur={() => handleBlur("leadSource")}
                    errors={touched.leadSource ? errors.leadSource : ""}
                    containerStyle={{ marginHorizontal: 20, marginTop: 12 }}
                    editable={values.mode === "manual"}
                  />

                  {/* COMMENT */}
                  <CustomInput
                    label="Comment"
                    value={values.comment}
                    onChangeText={(v) => setFieldValue("comment", v)}
                    onBlur={() => handleBlur("comment")}
                    errors={touched.comment ? errors.comment : ""}
                    containerStyle={{
                      marginHorizontal: 20,
                      marginTop: 12,
                      marginBottom: 20,
                    }}
                    multiline
                    numberOfLines={4}
                    inputStyle={{ height: 100 }}
                  />

                  {/* SUBMIT */}
                  <View
                    style={{
                      marginHorizontal: 20,
                      marginTop: 8,
                      marginBottom: 32,
                    }}
                  >
                    <CustomBtn
                      title="Create Event"
                      onPress={handleSubmit}
                      isLoading={submitting}
                      disabled={submitting}
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
    paddingBottom: 40,
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
  labelWithMargin: {
    color: color.mainTxtColor,
    marginBottom: 8,
    fontSize: 14,
  },
});

export default SendInvitation;
