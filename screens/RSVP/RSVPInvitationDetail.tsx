import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React from "react";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";
import moment from "moment";
import { useRSVPInvitationDetails } from "./rsvpApi";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import { Feather, Fontisto } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useAppToast } from "../../components/AppToast";

const RSVPInvitationDetail = ({ route }: any) => {
  const { id } = route.params || {};
  const toast = useAppToast();

  const { data, isLoading, isFetching, refetch, isError, error } =
    useRSVPInvitationDetails(id);

  const handleCopy = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    toast?.success?.("Copied to clipboard");
  };

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

  const openMaps = () => {
    if (detail?.eventLocation) {
      const address = encodeURIComponent(detail.eventLocation);
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  };

  // Helper to render a row with label and value, optional copy button
  const renderRow = (
    label: string,
    value: string | number | null | undefined,
    options?: {
      onCopy?: () => void;
      isPhone?: boolean;
      isEmail?: boolean;
      icon?: React.ReactNode;
    },
  ) => {
    const displayValue = value ?? "—";
    return (
      <View style={styles.infoRow}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {options?.icon && (
            <View style={{ marginRight: 8 }}>{options.icon}</View>
          )}
          <View>
            <CustomText style={styles.label}>{label}</CustomText>
            <CustomText style={styles.value} numberOfLines={1}>
              {displayValue}
            </CustomText>
          </View>
        </View>
        {options?.onCopy && (
          <TouchableOpacity onPress={options.onCopy} style={styles.copyButton}>
            <Feather name="copy" size={16} color="#9b9b9b" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <Header title="Invitation Details" />
      <Container>
        <ScrollView
          style={{ padding: 20 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
        >
          {/* ---------- Contact Information Card ---------- */}
          <View style={styles.card}>
            <CustomText style={styles.sectionTitle}>
              Contact Information
            </CustomText>
            <View style={styles.divider} />

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {detail?.clientMobile && (
                <ActionButton
                  label="Call"
                  icon="phone-call"
                  onPress={openCall}
                />
              )}
              {detail?.whatsappNum && (
                <ActionButton
                  label="WhatsApp"
                  icon="message-circle"
                  onPress={openWhatsapp}
                />
              )}
              {detail?.clientEmail && (
                <ActionButton label="Email" icon="mail" onPress={openEmail} />
              )}
              {detail?.eventLocation && (
                <ActionButton
                  label="Location"
                  icon="map-pin"
                  onPress={openMaps}
                />
              )}
            </View>

            {detail?.clientMobile && <View style={styles.divider} />}

            {renderRow("Name", detail.clientName)}
            {detail?.clientMobile &&
              renderRow("Mobile", detail.clientMobile, {
                onCopy: () => handleCopy(detail.clientMobile),
              })}
            {detail?.clientEmail &&
              renderRow("Email", detail.clientEmail, {
                onCopy: () => handleCopy(detail.clientEmail),
              })}
            {detail?.whatsappNum &&
              renderRow("WhatsApp", detail.whatsappNum, {
                onCopy: () => handleCopy(detail.whatsappNum),
              })}
            {detail?.company && renderRow("Company", detail.company)}
          </View>

          {/* ---------- Invitation Details Card ---------- */}
          <View style={styles.card}>
            <CustomText style={styles.sectionTitle}>
              Invitation Details
            </CustomText>
            <View style={styles.divider} />

            {renderRow(
              "Date & Time",
              moment(detail.dateTime).format("DD/MM/YYYY • hh:mm A"),
            )}
            {renderRow("Response Status", detail.responseStatus)}
            {renderRow(
              "Response Time",
              detail.responseTime
                ? moment(detail.responseTime).format("DD/MM/YYYY • hh:mm A")
                : null,
            )}
            {renderRow("Attend Status", detail.attendStatus)}
            {renderRow("Comment", detail.comment)}
            {renderRow(
              "Client Notes",
              detail.notes?.length ? detail.notes.join(", ") : null,
            )}
            {renderRow("Event Location", detail.eventLocation)}
            {renderRow("Guests", detail.guests)}
            {renderRow("Source", detail.source)}
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

// Local ActionButton component to match LeadsDetails style
const ActionButton = ({ label, icon, onPress }: any) => (
  <TouchableOpacity style={styles.actionBox} onPress={onPress}>
    <View style={styles.actionIcon}>
      <Feather name={icon} size={22} color="#2E67BE" />
    </View>
    <CustomText style={styles.actionText}>{label}</CustomText>
  </TouchableOpacity>
);

export default RSVPInvitationDetail;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E67BE",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6EAF0",
    marginVertical: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 6,
  },
  actionBox: {
    alignItems: "center",
    width: "23%",
  },
  actionIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "#F0F4FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E67BE",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    color: "#8C97A8",
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F3A4A",
  },
  copyButton: {
    backgroundColor: "#9b9b9b18",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
