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
import { useRSVPEventDetails } from "./rsvpApi";
import EditIcon from "../../assets/svg/EditIcon";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import { useNavigation } from "@react-navigation/native";

const RSVPEventDetail = ({ route }: any) => {
  const { id } = route.params || {};
  const { user } = useSelector(selectUser);
  const navigation = useNavigation();
  const { data: permission = {} } = useGetUserPermission(user?._id);

  const { data, isLoading, isError, error } = useRSVPEventDetails(id);
  // myConsole("datasss", data);

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

    myConsole("errMsgggg", errMsg);

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

  // If data not found
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

  return (
    <>
      <Header title={"Event Details"} />
      <Container>
        <ScrollView
          style={{ padding: 20 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View style={{ paddingBottom: 70 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                // backgroundColor: "red",
                marginBottom: 12,
              }}
            >
              <CustomText
                style={{
                  fontSize: 18,
                  fontWeight: "500",
                  color: color.mainTxtColor,
                  borderBottomWidth: 1,
                  borderBottomColor: color.saffronMango,
                  paddingBottom: 5,
                }}
              >
                Overview
              </CustomText>
              {canEditEvent && (
                <TouchableOpacity style={{ padding: 5 }} activeOpacity={0.6}>
                  <EditIcon
                    style={{ height: 12, width: 12 }}
                    onPress={() => navigation.navigate("AddEvent", { detail })}
                  />
                </TouchableOpacity>
              )}
            </View>

            <RowItem
              title="Name"
              value={detail.title}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Event Type"
              value={detail.eventType}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Description"
              value={detail.description}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Start Date"
              value={`${moment(detail.startDat).format(
                "DD/MM/YYYY • hh:mm A"
              )}`}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="End Date"
              value={`${moment(detail.endDate).format("DD/MM/YYYY • hh:mm A")}`}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Location"
              value={detail.location}
              containerStyle={{ marginBottom: 10 }}
            />
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

export default RSVPEventDetail;

const styles = StyleSheet.create({});
