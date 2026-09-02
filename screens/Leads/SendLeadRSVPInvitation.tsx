import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomText from "../../myComponents/CustomText/CustomText";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import { useAppToast } from "../../components/AppToast";

const AnyDropdownRNE = DropdownRNE as any;

const SendLeadRSVPInvitation = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const toast = useAppToast();
  const leadIds = route.params?.leadIds || [];
  const skippedLeadCount = route.params?.skippedLeadCount || 0;
  const [events, setEvents] = useState<any[]>([]);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/event/upcoming");
      setEvents(response?.data?.data || []);
    } catch { toast.error("Unable to load upcoming events"); }
  }, [toast]);
  useEffect(() => { loadEvents(); }, [loadEvents]);

  const send = async () => {
    if (!eventId) return toast.error("Select an upcoming event");
    try {
      setLoading(true);
      const response = await axiosInstance.post("/api/invitation/from-leads", { eventId, leadIds });
      const failures = response?.data?.failures || [];
      const blocked = failures.filter((item: any) => item.message?.includes("directly assigned"));
      const returnToLeadList = () =>
        navigation.navigate("allLead", {
          clearRSVPSelection: Date.now(),
        });

      if (failures.length) {
        const reasons = [...new Set(failures.map((item: any) => item.message).filter(Boolean))];
        Alert.alert(
          "Some invitations were not sent",
          `${response?.data?.createdCount || 0} invitation(s) sent.\n${blocked.length || failures.length} selected lead(s) could not be sent an invitation.\n\n${reasons.join("\n")}`,
          [{ text: "OK", onPress: returnToLeadList }],
        );
      } else {
        toast.success(response?.data?.message || "RSVP invitations sent successfully");
        returnToLeadList();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to send RSVP invitations");
    } finally { setLoading(false); }
  };

  return <Container><Header title="Send RSVP Invitations" /><View style={styles.content}>
    {skippedLeadCount > 0 && <View style={styles.warning}><CustomText style={styles.warningText}>You cannot send RSVP invitations for {skippedLeadCount} selected lead(s) assigned to another user. Invitations will be sent only for your assigned leads.</CustomText></View>}
    <CustomText style={styles.count}>{leadIds.length} eligible lead(s) selected</CustomText>
    <AnyDropdownRNE arrOfObj={events} keyValueShowInBox="label" keyValueGetOnSelect="_id" placeholder="Select upcoming event" containerStyle={styles.field} onChange={(value: any) => setEventId(String(value))} initialValue={eventId} mode="modal" />
    <CustomBtn title="Send RSVP" onPress={send} isLoading={loading} disabled={!leadIds.length} containerStyle={styles.button} />
  </View></Container>;
};

const styles = StyleSheet.create({ content: { padding: 20 }, warning: { padding: 12, borderRadius: 10, backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA", marginBottom: 16 }, warningText: { color: "#9A3412", lineHeight: 19 }, count: { color: "#475569", marginBottom: 10, fontWeight: "600" }, field: { marginBottom: 16 }, button: { marginTop: 14 } });
export default SendLeadRSVPInvitation;
