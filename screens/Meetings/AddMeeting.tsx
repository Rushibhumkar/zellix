import { useNavigation, useRoute } from "@react-navigation/native";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { addMeeting, updateMeeting } from "../../services/rootApi/meetingApi";
import { addMeetingSchema } from "../../utils/validation";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import CustomText from "../../myComponents/CustomText/CustomText";
import CustomMapView from "../../myComponents/CustomMapView/CustomMapView";
import CustomGooglePlacesSearch from "../../myComponents/CustomGooglePlacesSearch/CustomGooglePlacesSearch";
import { navigateToMapApp } from "../../utils/navigateToMapApp";
import { queryKeyCRM } from "../../utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import {
  useGetLeadById,
  useGetLeadInAddMeeting,
} from "../../hooks/useCRMgetQuerry";
import { debounce } from "../../utils/debounce";
import IllusionBox from "../../myComponents/IllusionBoxForUpdate/IllusionBox";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import { color } from "../../const/color";
import moment from "moment";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { useAppToast } from "../../components/AppToast";

const AddMeeting = () => {
  const queryClient = useQueryClient();
  const toast = useAppToast();
  // const { lead, user, allUsers } = useSelector(selectUser);
  // const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const { params } = useRoute();
  const { user, allUsers } = useSelector(selectUser);

  let data = params?.detail;

  const incomingStatus = params?.detail?.status;

  const isUpdate = Boolean(data?._id && Array.isArray(data?.meetings));
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const [isLoading, setLoading] = useState(false);
  // let filteredLead = lead?.filter((el) => user?._id === el?.assign?._id)?.map((x) => {
  //   return { ...x, name: x?.clientName }
  // }).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1);
  // let leadNameToClientName = lead?.map((el) => { return { ...el, name: el?.clientName } }).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1)
  // const textInput2 = useRef(null);
  const [tempDate, setTempDate] = useState({
    date: new Date(),
    time: new Date(),
  });
  const [dateTimeError, setDateTimeError] = useState("");

  const isTodaySelected = moment(tempDate.date).isSame(moment(), "day");

  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isUpdateFrom, setIsUpdateFrom] = useState(data?.lead?._id);
  //react query lead
  const {
    data: leadList,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetLeadInAddMeeting({
    search: debouncedSearch,
  });

  const { data: leadDetail, isLoading: loadingLead } = useGetLeadById(
    data?.lead?._id,
  );

  const mappedMeetingStatus =
    incomingStatus === "meeting_scheduled"
      ? "schedule"
      : incomingStatus === "meeting_done"
        ? "conducted"
        : data?.meetings?.length > 0
          ? data?.meetings[0]?.status
          : "";

  const defaultAgents = Array.isArray(data?.agents)
    ? data.agents.filter((memberId) => String(memberId) !== String(user?._id))
    : [];
  const memberOptions = (allUsers || [])
    .filter((member) => String(member?._id) !== String(user?._id))
    .map((member) => ({
      ...member,
      name: `${member?.name || ""} ${member?.lastName || ""}`.trim(),
    }));

  useEffect(() => {
    setTempDate({
      date: data?.scheduleDate?.date ?? new Date(),
      time: data?.scheduleDate?.time ?? new Date(),
    });
  }, []);

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    validationSchema: addMeetingSchema,
    initialValues: {
      lead: data?.lead?._id ?? "",
      productPitch: data?.productPitch ?? "",
      clientAddress: data?.clientAddress ?? "",
      clientCity: data?.clientCity ?? "",
      clientCountry: data?.clientCountry ?? "",
      meetingMode:
        data?.meetings?.[0]?.meetingMode ||
        (data?.meetings?.[0]?.virtualMeetingLink ? "virtual" : "physical"),
      location: data?.meetings?.length > 0 ? data?.meetings[0]?.location : "",
      virtualMeetingLink:
        data?.meetings?.length > 0
          ? data?.meetings[0]?.virtualMeetingLink ?? ""
          : "",
      remarks: data?.meetings?.length > 0 ? data?.meetings[0]?.remarks : "",
      status: mappedMeetingStatus,
      agents: defaultAgents,
      scheduleDate: data?.scheduleDate ?? new Date(),
      coordinates:
        data?.meetings?.length > 0
          ? data?.meetings[0]?.coordinates
          : { lat: null, lng: null },
    },
    onSubmit: async (value) => {
      if (!tempDate?.date || !tempDate?.time) {
        setDateTimeError("Meeting date and time is required");
        return;
      }

      setDateTimeError("");
      setLoading(true);
      let tempDa = `${tempDate?.date.toString().slice(0, 13)}${tempDate?.time
        .toString()
        .slice(13)}`;
      try {
        let sendData = {
          ...values,
          scheduleDate: tempDa,
          self: false,
        };
        if (isUpdate) {
          let res = await updateMeeting({
            id: data?._id,
            data: { ...sendData },
          });
          // myConsole("update", resUpdate?.data)
          // setIsVisible(true);
          // setMessage(resUpdate?.data);
          // await dispatch(getAllMeetingFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeetingById, data?._id],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeeting],
          });
          goBack();
          // navigate(routeMeeting.AllMeetings);
          toast.success(res?.data);
        } else {
          let res = await addMeeting(sendData);
          // myConsole("resAddMeeting", res)
          // await setIsVisible(true);
          // await setMessage(res?.data);
          // await dispatch(getAllMeetingFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeeting],
          });
          toast.success(res?.data);
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getDashboardCount],
          });
          goBack();
          // await navigate(routeMeeting.AllMeetings);
        }
      } catch (error) {
        toast.error("Server error");
        console.log("errorrrrr", error);
        // setMessage(error?.response?.data);
        // setIsVisible(false);
      } finally {
        setLoading(false);
      }
    },
  });

  const toggleMapViewModal = (v) => {
    setIsMapModalVisible(!isMapModalVisible);
    // setMapLatLng(v)
  };

  const onEndReach = () => {
    if (hasNextPage && !loading && leadList?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLeadInAddMeeting],
      });
    } catch (e) {
      console.log("refreshGetAllLeave", e);
    } finally {
      setRefreshing(false);
    }
  };

  const debounceSearch = React.useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    [],
  );

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };

  return (
    <>
      <Header title={isUpdate ? "Update Meetings" : "Add Meetings"} />
      <Container>
        <ScrollViewWithKeyboardAvoid>
          <View style={{ padding: 20, paddingBottom: 120 }}>
            <CustomModelMessage
              isVisible={isVisible}
              setIsVisible={setIsVisible}
              message={message ?? "Meeting is added successfully"}
              onClose={() => {
                setIsVisible(false);
                setMessage(null);
              }}
              onPressBtn={() => navigate("AllMeetings")}
            />

            <CustomText
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 20,
                color: color.mainTxtColor,
              }}
            >
              Client{" "}
            </CustomText>

            {!isUpdateFrom ? (
              <DropdownRNE
                arrOfObj={
                  leadList?.map((el) => {
                    return {
                      name: el?.clientName || el?.name,
                      _id: el?._id,
                    };
                  }) || []
                }
                keyValueGetOnSelect="_id"
                keyValueShowInBox="name"
                label="Choose Lead *"
                placeholder="Lead..."
                onChange={(a) => setFieldValue("lead", a)}
                containerStyle={{ marginBottom: 15 }}
                onBlur={handleBlur("lead")}
                initialValue={values?.lead}
                isSearch
                maxHeight={300}
                mode="modal"
                //
                onEndReached={onEndReach}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isFetchingNextPage && (
                    <ActivityIndicator size={"small"} color={"#002E6B"} />
                  )
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                onChangeText={(v) => handleSearchChange(v)}
                isLoading={loading}
              />
            ) : (
              <IllusionBox
                title="Lead"
                value={leadDetail?.clientName || leadDetail?.name || ""}
                onPress={() => setIsUpdateFrom(false)}
              />
            )}

            {errors?.lead && touched?.lead && (
              <CustomText style={styles.errorText}>{errors?.lead}</CustomText>
            )}

            <DropdownRNE
              label="Status *"
              placeholder="Status"
              containerStyle={{ marginBottom: 15 }}
              arrOfObj={[
                {
                  name: "Meeting Schedule",
                  _id: "schedule",
                  value: "l",
                },
                {
                  name: "Meeting Conducted",
                  _id: "conducted",
                  value: "o",
                },
              ]}
              keyValueShowInBox="name"
              keyValueGetOnSelect="_id"
              onChange={(a) => setFieldValue("status", a)}
              initialValue={values?.status}
            />
            {errors.status && touched.status && (
              <CustomText style={styles.errorText}>{errors.status}</CustomText>
            )}
            <CustomInput
              label="Product Pitch"
              placeholder="Product Pitch"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("productPitch")}
              onBlur={handleBlur("productPitch")}
              value={values?.productPitch}
            />
            {errors.productPitch && touched.productPitch && (
              <CustomText style={styles.errorText}>
                {errors.productPitch}
              </CustomText>
            )}

            <CustomInput
              label="Client Address"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("clientAddress")}
              onBlur={handleBlur("clientAddress")}
              value={values?.clientAddress}
            />
            {errors.clientAddress && touched.clientAddress && (
              <CustomText style={styles.errorText}>
                {errors.clientAddress}
              </CustomText>
            )}
            <CustomInput
              label="Client City"
              placeholder="Client City"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("clientCity")}
              value={values?.clientCity}
              onBlur={handleBlur("clientCity")}
            />
            {errors.clientCity && touched.clientCity && (
              <CustomText style={styles.errorText}>
                {errors.clientCity}
              </CustomText>
            )}

            <CustomInput
              label="Client Country"
              placeholder="Client Country"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("clientCountry")}
              onBlur={handleBlur("clientCountry")}
              value={values?.clientCountry}
            />
            {errors.clientCountry && touched.clientCountry && (
              <CustomText style={styles.errorText}>
                {errors.clientCountry}
              </CustomText>
            )}
            <View style={styles.meetingTypeContainer}>
              <CustomText style={styles.requiredLabel}>Meeting Type *</CustomText>
              <View style={styles.radioRow}>
                {["physical", "virtual"].map((meetingMode) => (
                  <Pressable
                    key={meetingMode}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: values.meetingMode === meetingMode,
                    }}
                    style={styles.radioOption}
                    onPress={() => {
                      setFieldValue("meetingMode", meetingMode);
                      if (meetingMode === "physical") {
                        setFieldValue("virtualMeetingLink", "");
                      } else {
                        setFieldValue("location", "");
                        setFieldValue("coordinates", { lat: null, lng: null });
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        values.meetingMode === meetingMode && styles.radioOuterSelected,
                      ]}
                    >
                      {values.meetingMode === meetingMode && <View style={styles.radioInner} />}
                    </View>
                    <CustomText style={styles.radioLabel}>
                      {meetingMode === "physical" ? "Physical" : "Virtual"}
                    </CustomText>
                  </Pressable>
                ))}
              </View>
            </View>
            {values.meetingMode === "physical" ? (
            <View>
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
                  style={{ color: color.mainTxtColor }}
                >
                  Meeting Location *
                </CustomText>
                {values?.coordinates?.lng && (
                  <Feather
                    name="map-pin"
                    size={20}
                    color="#2D67C6"
                    style={{ padding: 5 }}
                    onPress={() => navigateToMapApp(values?.coordinates)}
                    // onPress={toggleMapViewModal}
                  />
                )}
              </View>
              <CustomGooglePlacesSearch
                handleBlur={() => handleBlur("location")}
                onPress={(data, details) => {
                  setFieldValue("location", data.description);
                  setFieldValue("coordinates", {
                    lat: details?.geometry?.location?.lat,
                    lng: details?.geometry?.location?.lng,
                  });
                }}
                defaultValue={values?.location}
              />
              {errors.location && touched.location && (
                <CustomText style={styles.errorText}>
                  {errors.location}
                </CustomText>
              )}
            </View>
            ) : (
              <>
                <CustomInput
                  label="Virtual Meeting Platform / Link *"
                  placeholder="Meet, Teams, etc."
                  containerStyle={{ marginBottom: 15 }}
                  onChangeText={handleChange("virtualMeetingLink")}
                  onBlur={handleBlur("virtualMeetingLink")}
                  value={values?.virtualMeetingLink}
                />
                {errors.virtualMeetingLink && touched.virtualMeetingLink && (
                  <CustomText style={styles.errorText}>
                    {errors.virtualMeetingLink}
                  </CustomText>
                )}
              </>
            )}

            <CustomInput
              label="Remarks"
              placeholder="Remarks"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("remarks")}
              onBlur={handleBlur("remarks")}
              value={values?.remarks}
            />
            {errors.remarks && touched.remarks && (
              <CustomText style={styles.errorText}>{errors.remarks}</CustomText>
            )}

            <CustomText style={styles.requiredLabel}>
              Meeting Date & Time *
            </CustomText>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 5,
              }}
            >
              <DatePickerExpo
                title={"Date *"}
                boxContainerStyle={{ marginBottom: 20, width: "47%" }}
                onSelect={(date) =>
                  setTempDate((prev) => ({
                    ...prev,
                    date,
                    time: isTodaySelected ? new Date() : prev.time, // reset time if today
                  }))
                }
                initialValue={tempDate?.date}
                minimumDate={new Date()} // ⛔ past dates blocked
              />

              <DatePickerExpo
                title={"Time *"}
                boxContainerStyle={{ marginBottom: 20, width: "47%" }}
                onSelect={(time) => setTempDate((prev) => ({ ...prev, time }))}
                initialValue={tempDate?.time}
                mode="time"
                minimumDate={isTodaySelected ? new Date() : undefined} // ⛔ past time blocked
              />
            </View>
            {dateTimeError ? (
              <CustomText style={styles.dateTimeError}>
                {dateTimeError}
              </CustomText>
            ) : null}
            <DropdownRNE
              arrOfObj={memberOptions}
              isMultiSelect={true}
              keyValueShowInBox="name"
              keyValueGetOnSelect="_id"
              label={"Members"}
              keyName="agent"
              placeholder={"Select members"}
              containerStyle={{ marginBottom: 15 }}
              onChange={(a) => setFieldValue("agents", a)}
              initialValue={values?.agents}
              isSearch
              mode="modal"
              excludedItems={user?._id ? [user._id] : []}
            />
            <CustomBtn
              title="Submit"
              onPress={handleSubmit}
              containerStyle={{ margin: 20 }}
              isLoading={isLoading}
            />
          </View>
        </ScrollViewWithKeyboardAvoid>
        <CustomMapView
          isMapModalVisible={isMapModalVisible}
          toggleMapViewModal={toggleMapViewModal}
          mapLatLng={values?.coordinates}
          hasBackdrop={false}
        />
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  inputlable: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  meetingTypeContainer: {
    marginBottom: 15,
  },
  requiredLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: color.mainTxtColor,
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: "row",
    gap: 24,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8994A6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: color.primaryColor,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.primaryColor,
  },
  radioLabel: {
    fontSize: 15,
    color: color.mainTxtColor,
  },
  input: {
    marginTop: 10,
    height: 37.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
  errorText: {
    color: "red",
    marginTop: -15,
    marginBottom: 10,
    marginLeft: 4,
  },
  dateTimeError: {
    color: "red",
    marginTop: -15,
    marginBottom: 10,
    marginLeft: 4,
  },
});

export default AddMeeting;
