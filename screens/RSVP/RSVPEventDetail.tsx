import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import React from "react";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";
import moment from "moment";
import { useRSVPEventDetails } from "./rsvpApi";
import EditIcon from "../../assets/svg/EditIcon";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

const RSVPEventDetail = ({ route }: any) => {
  const { id } = route.params || {};
  const { user } = useSelector(selectUser);
  const navigation = useNavigation();
  const { data: permission = {} } = useGetUserPermission(user?._id);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useRSVPEventDetails(id);

  if (isLoading) {
    return (
      <>
        <Header title="Event Details" />
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
      typeof error?.response?.data === "string"
        ? error?.response?.data
        : error?.response?.data?.message ||
          error?.message ||
          "Failed to load event details";

    return (
      <>
        <Header title="Event Details" />
        <Container>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <CustomText style={{ color: color.mainTxtColor }}>
              {errMsg}
            </CustomText>
          </View>
        </Container>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header title="Event Details" />
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

  const canEditEvent = checkPermission(permission, "Event", "edit", user?.role);

  const openMaps = () => {
    if (detail?.location) {
      const address = encodeURIComponent(detail.location);
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  };

  // Helper to render a row
  const renderRow = (
    label: string,
    value: string | number | null | undefined,
  ) => {
    const displayValue = value ?? "—";
    return (
      <View style={styles.infoRow}>
        <View>
          <CustomText style={styles.label}>{label}</CustomText>
          <CustomText style={styles.value}>{displayValue}</CustomText>
        </View>
      </View>
    );
  };

  return (
    <>
      <Header
        title="Event Details"
        rightSide={
          canEditEvent && (
            <TouchableOpacity
              onPress={() => navigation.navigate("AddEvent", { detail })}
              style={styles.headerIcon}
            >
              <Feather name="edit-2" size={18} color="#fff" />
            </TouchableOpacity>
          )
        }
      />
      <Container>
        <ScrollView
          style={{ paddingHorizontal: 12, paddingVertical: 20 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
        >
          {/* Event Information Card */}
          <View style={styles.card}>
            <CustomText style={styles.sectionTitle}>
              Event Information
            </CustomText>
            <View style={styles.divider} />

            {renderRow("Name", detail.title)}
            {renderRow("Event Type", detail.eventType)}
            {renderRow("Description", detail.description)}
          </View>

          {/* Date & Location Card */}
          <View style={styles.card}>
            <CustomText style={styles.sectionTitle}>Date & Location</CustomText>
            <View style={styles.divider} />

            {renderRow(
              "Start Date",
              detail.startDateTime
                ? moment(detail.startDateTime).format("DD/MM/YYYY • hh:mm A")
                : null,
            )}
            {renderRow(
              "End Date",
              detail.endDateTime
                ? moment(detail.endDateTime).format("DD/MM/YYYY • hh:mm A")
                : null,
            )}
            <View style={styles.infoRow}>
              <View style={{ flex: 1 }}>
                <CustomText style={styles.label}>Location</CustomText>
                <CustomText style={styles.value}>
                  {detail.location || "—"}
                </CustomText>
              </View>
              {detail.location && (
                <TouchableOpacity onPress={openMaps} style={styles.iconButton}>
                  <Feather name="map-pin" size={20} color="#2E67BE" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

export default RSVPEventDetail;

const styles = StyleSheet.create({
  headerIcon: {
    backgroundColor: "#ffffff30",
    padding: 8,
    borderRadius: 8,
  },
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  iconButton: {
    backgroundColor: "#F0F4FA",
    padding: 10,
    borderRadius: 30,
    marginLeft: 8,
  },
});
