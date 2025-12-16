import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import RowItem from "../../myComponents/RowItem/RowItem";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";
import { myConsole } from "../../hooks/useConsole";
import moment from "moment";
import { useRSVPInvitationDetails } from "./rsvpApi";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import { Feather, Fontisto } from "@expo/vector-icons";
import IconWrapper from "../../components/IconWrapper";

const RSVPInvitationDetail = ({ route }: any) => {
  const { id } = route.params || {};

  const { data, isLoading, isError, error } = useRSVPInvitationDetails(id);

  if (isLoading) {
    return (
      <>
        <Header title="Invitation Details" />
        <Container>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={color.mainTxtColor} />
          </View>
        </Container>
      </>
    );
  }

  if (isError) {
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to load details";

    return (
      <>
        <Header title="Invitation Details" />
        <Container>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <CustomText style={{ color: "red" }}>{errMsg}</CustomText>
          </View>
        </Container>
      </>
    );
  }

  // If data not found
  if (!data) {
    return (
      <>
        <Header title="Invitation Details" />
        <Container>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <CustomText>No details available</CustomText>
          </View>
        </Container>
      </>
    );
  }

  const detail = data;

  const openCall = () => {
    if (detail?.clientMobile) Linking.openURL(`tel:${detail.clientMobile}`);
  };

  const openEmail = () => {
    if (detail?.clientEmail)
      MailComposer.composeAsync({ recipients: [detail.clientEmail] });
  };

  const openWhatsapp = () => {
    if (detail?.whatsappNum)
      Linking.openURL(`https://wa.me/${detail.whatsappNum}`);
  };

  return (
    <>
      <Header title={"Invitation Details"} />
      <Container>
        <ScrollView
          style={{ padding: 20 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View style={{ paddingBottom: 70 }}>
            <CustomText
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: color.mainTxtColor,
                borderBottomWidth: 1,
                borderBottomColor: color.saffronMango,
                paddingRight: 20,
                paddingBottom: 5,
                alignSelf: "flex-start",
                marginBottom: 20,
              }}
            >
              Overview
            </CustomText>

            <RowItem
              title="Name"
              value={detail.clientName}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Mobile"
              component={
                <TouchableOpacity
                  onPress={openCall}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "space-between",
                    marginBottom: 4,
                    paddingRight: 2,
                  }}
                >
                  <CustomText style={{ color: color.mainTxtColor }}>
                    {detail.clientMobile}
                  </CustomText>
                  <IconWrapper>
                    <Feather name="phone-call" size={14} color="#fff" />
                  </IconWrapper>
                </TouchableOpacity>
              }
            />

            <RowItem
              title="Email"
              component={
                <TouchableOpacity
                  onPress={openEmail}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "space-between",
                    marginBottom: 4,
                    paddingRight: 2,
                  }}
                >
                  <CustomText
                    style={{ color: color.mainTxtColor, maxWidth: "80%" }}
                  >
                    {detail.clientEmail}
                  </CustomText>
                  <IconWrapper>
                    <Fontisto name="email" size={14} color="#fff" />
                  </IconWrapper>
                </TouchableOpacity>
              }
            />

            <RowItem
              title="Whatsapp Number"
              component={
                <TouchableOpacity
                  onPress={openWhatsapp}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "space-between",
                    paddingRight: 2,
                  }}
                >
                  <CustomText style={{ color: color.mainTxtColor }}>
                    {detail.whatsappNum}
                  </CustomText>
                  <IconWrapper gradientColors={["#00C950", "#00A63E"]}>
                    <Feather name="message-circle" size={14} color="#fff" />
                  </IconWrapper>
                </TouchableOpacity>
              }
            />

            <RowItem
              title="Date & Time"
              value={`${moment(detail.dateTime).format(
                "DD/MM/YYYY • hh:mm A"
              )}`}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Response Status"
              value={detail.responseStatus}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Response Time"
              value={
                detail.responseTime
                  ? moment(detail.responseTime).format("DD/MM/YYYY • hh:mm A")
                  : "—"
              }
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Attend Status"
              value={detail.attendStatus}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Comment"
              value={detail.comment || "—"}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Client Notes"
              value={detail.notes?.length ? detail.notes.join(", ") : "—"}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Event Location"
              value={detail.eventLocation || "—"}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Guests"
              value={detail.guests?.toString() || "—"}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Source"
              value={detail.source || "—"}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Company"
              value={detail.company || "—"}
              containerStyle={{ marginBottom: 10 }}
            />
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

export default RSVPInvitationDetail;

const styles = StyleSheet.create({});
