import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useExistingMeetingForLead, useMeetingEligibility, useMeetingMemberOptions } from "../../hooks/useMeetingLifecycle";
import { openExistingMeeting } from "../../utils/meetingNavigation";
import { meetingLeadOptions } from "../../utils/meetingLeadOptions";
import { combineMeetingDate, isMeetingConflict, latestMeetingEntry, meetingActions, meetingId, meetingMembers, meetingSupportingMembers, meetingMessage, meetingRequestId, meetingSuccess, meetingVersion } from "../../utils/meetingLifecycle";
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
import {
  addMeeting,
  addMeetingEntry,
  updateMeeting,
} from "../../services/rootApi/meetingApi";
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
import IllusionBox from "../../myComponents/IllusionBoxForUpdate/IllusionBox";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import { color } from "../../const/color";
import moment from "moment";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { useAppToast } from "../../components/AppToast";
import { routeMeeting } from "../../utils/routes";

const AddMeeting = () => {
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const requestRef = useRef<any>(null);
  // const { lead, user, allUsers } = useSelector(selectUser);
  // const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { navigate, goBack } = navigation;
  const { params } = useRoute<any>();
  const { user, allUsers } = useSelector(selectUser);

  let data = params?.detail;
  const followUpSource = params?.followUpSource;
  const isFollowUp = Boolean(data?._id && followUpSource?._id);
  const returnedMeetingDraft = params?.meetingDraft;
  const returnedLead = params?.createdLead;

  const incomingStatus = params?.detail?.status;

  const isUpdate = Boolean(
    !isFollowUp && data?._id && Array.isArray(data?.meetings),
  );
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const [isLoading, setLoading] = useState(false);
  // let filteredLead = lead?.filter((el) => user?._id === el?.assign?._id)?.map((x) => {
  //   return { ...x, name: x?.clientName }
  // }).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1);
  // let leadNameToClientName = lead?.map((el) => { return { ...el, name: el?.clientName } }).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1)
  // const textInput2 = useRef(null);
  const [tempDate, setTempDate] = useState(() => ({
    date: returnedMeetingDraft?.date
      ? new Date(returnedMeetingDraft.date)
      : isFollowUp
        ? new Date(Date.now() + 5 * 60 * 1000)
        : new Date(),
    time: returnedMeetingDraft?.time
      ? new Date(returnedMeetingDraft.time)
      : isFollowUp
        ? new Date(Date.now() + 5 * 60 * 1000)
        : new Date(),
  }));
  const [dateTimeError, setDateTimeError] = useState("");

  const isTodaySelected = moment(tempDate.date).isSame(moment(), "day");

  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedLeadOption, setSelectedLeadOption] = useState<any>(null);
  const [isUpdateFrom, setIsUpdateFrom] = useState(data?.lead?._id);
  const searchOnlyAssignedLeads = ![
    "sup_admin",
    "sub_admin",
    "developer",
    "sr_manager", "pnl", "manager", "assistant_manager", "team_lead",
  ].includes(user?.role);
  //react query lead
  const {
    data: leadList,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetLeadInAddMeeting({
    search: debouncedSearch,
    individual: searchOnlyAssignedLeads,
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

  const sourceMeeting = latestMeetingEntry(data) || followUpSource;
  const selfMemberId = isUpdate
    ? meetingId(data?.responsibleUserId)
    : String(user?._id);
  const defaultAgents = (sourceMeeting?.members?.length
    ? sourceMeeting.members.map((member) => member?._id || member)
    : isFollowUp || isUpdate ? [data?.createdBy?._id || data?.createdBy].filter(Boolean) : [])
    .filter((memberId) => String(memberId) !== selfMemberId);

  useEffect(() => {
    if (
      isFollowUp ||
      returnedMeetingDraft?.date ||
      returnedMeetingDraft?.time
    ) return;
    setTempDate({
      date: sourceMeeting?.scheduleDate
        ? new Date(sourceMeeting.scheduleDate)
        : new Date(Date.now() + 5 * 60 * 1000),
      time: sourceMeeting?.scheduleDate
        ? new Date(sourceMeeting.scheduleDate)
        : new Date(Date.now() + 5 * 60 * 1000),
    });
  }, [sourceMeeting?.scheduleDate, returnedMeetingDraft, isFollowUp]);

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
      lead: returnedLead?._id ?? returnedMeetingDraft?.lead ?? data?.lead?._id ?? "",
      productPitch:
        returnedMeetingDraft?.productPitch ??
        sourceMeeting?.productPitch ??
        data?.productPitch ??
        "",
      clientAddress:
        returnedMeetingDraft?.clientAddress ?? data?.clientAddress ?? "",
      clientCity: returnedMeetingDraft?.clientCity ?? data?.clientCity ?? "",
      clientCountry:
        returnedMeetingDraft?.clientCountry ?? data?.clientCountry ?? "",
      meetingMode:
        returnedMeetingDraft?.meetingMode ||
        sourceMeeting?.meetingMode ||
        (sourceMeeting?.virtualMeetingLink ? "virtual" : "physical"),
      location:
        returnedMeetingDraft?.location ?? (sourceMeeting?.location || ""),
      virtualMeetingLink:
        returnedMeetingDraft?.virtualMeetingLink ??
        (sourceMeeting?.virtualMeetingLink || ""),
      remarks:
        returnedMeetingDraft?.remarks ?? (sourceMeeting?.remarks || ""),
      status: isUpdate ? sourceMeeting?.status : isFollowUp
        ? "schedule"
        : returnedMeetingDraft?.status ?? mappedMeetingStatus,
      self:
        returnedMeetingDraft?.self ?? sourceMeeting?.self ?? data?.self ?? true,
      agents: returnedMeetingDraft?.agents ?? defaultAgents,
      scheduleDate: sourceMeeting?.scheduleDate ?? new Date(),
      coordinates:
        returnedMeetingDraft?.coordinates ??
        (sourceMeeting?.coordinates || { lat: null, lng: null }),
    },
    onSubmit: async (value) => {
      if (!tempDate?.date || !tempDate?.time) {
        setDateTimeError("Meeting date and time is required");
        return;
      }

      setDateTimeError("");
      if (isUpdate && !meetingActions(data).edit) {
        toast.error("This meeting is read-only. Refresh or ask an admin to review its history.");
        return;
      }
      setLoading(true);
      try {
        if (memberQuery.isPending || memberQuery.error || !Array.isArray(memberQuery.data)) throw new Error(meetingMessage(memberQuery.error, "Supporting members are still loading. Please try again."));
        const eligible = isUpdate ? null : await eligibility.refetch();
        if (!isUpdate && (eligible?.error || (!eligible?.data?.allowed && !requestRef.current))) throw new Error(eligible?.data?.reason || meetingMessage(eligible?.error, "Unable to verify lead eligibility. Please try again."));
        const self = isUpdate ? Boolean(sourceMeeting?.self) : eligible?.data?.self === true;
        const responsible = isUpdate ? data?.responsibleUserId : eligible?.data?.responsible;
        const tempDa = isUpdate ? sourceMeeting.scheduleDate : combineMeetingDate(tempDate.date, tempDate.time);
        let sendData = {
          ...values,
          self,
          members: meetingMembers(responsible, meetingSupportingMembers(responsible, values.agents, memberQuery.data)),
          scheduleDate: tempDa,
        };
        const context = isUpdate || isFollowUp ? meetingVersion(data) : {};
        if (!isUpdate && !eligible?.data?.allowed && requestRef.current?.signature !== JSON.stringify({ ...sendData, ...context })) throw new Error(eligible?.data?.reason || "Refresh lead eligibility before creating this meeting.");
        const requestId = meetingRequestId(requestRef, { ...sendData, ...context });
        if (isFollowUp) {
          const res = await addMeetingEntry(data._id, {
            ...meetingVersion(data),
            requestId,
            sourceEntryId: followUpSource._id,
            scheduleDate: tempDa,
            meetingMode: values.meetingMode,
            location: values.location,
            virtualMeetingLink: values.virtualMeetingLink,
            remarks: values.remarks,
            productPitch: values.productPitch,
            coordinates: values.coordinates,
            self,
            members: sendData.members,
          });
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [queryKeyCRM.getMeetingById, data._id],
            }),
            queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getMeeting] }),
          ]);
          toast.success(res?.data?.message || "Meeting added successfully");
          if (res?.data?.meetingId && String(res.data.meetingId) !== String(data._id)) navigate(routeMeeting.MeetingDetails, { item: { _id: res.data.meetingId } });
          else goBack();
        } else if (isUpdate) {
          let res = await updateMeeting({
            id: data?._id,
            data: { ...sendData, status: sourceMeeting.status, ...meetingVersion(data) },
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
          toast.success(meetingSuccess(res, "Meeting updated"));
        } else {
          let res = await addMeeting({ ...sendData, requestId });
          // myConsole("resAddMeeting", res)
          // await setIsVisible(true);
          // await setMessage(res?.data);
          // await dispatch(getAllMeetingFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeeting],
          });
          toast.success(meetingSuccess(res, "Meeting saved"));
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getDashboardCount],
          });
          goBack();
          // await navigate(routeMeeting.AllMeetings);
        }
      } catch (error: any) {
        toast.error(meetingMessage(error));
        if (isMeetingConflict(error)) {
          // A definitive conflict is not an uncertain network response; it must
          // not leave the retry exception enabling creation for a blocked lead.
          if (!isUpdate) requestRef.current = null;
          // A concurrent creation may win after eligibility was checked. Keep
          // its existing-meeting link even if the subsequent refresh is offline.
          if (!isUpdate && error?.response?.data?.meetingId) {
            queryClient.setQueryData(["meetingEligibility", user?._id, values.lead], (previous: any) => ({
              ...previous,
              allowed: false,
              reason: meetingMessage(error),
              meetingId: error.response.data.meetingId,
            }));
          }
          await queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getMeetingById, data?._id] });
          await eligibility.refetch();
          if (isUpdate || isFollowUp) goBack();
        }
        console.log("errorrrrr", error);
        // setMessage(error?.response?.data);
        // setIsVisible(false);
      } finally {
        setLoading(false);
      }
    },
  });
  const eligibility = useMeetingEligibility(values.lead, user?._id, !isUpdate);
  const existingMeeting = useExistingMeetingForLead(values.lead, user?._id, eligibility.data, !isUpdate);
  const existingMeetingId = meetingId(eligibility.data?.meetingId || existingMeeting.data);
  const memberQuery = useMeetingMemberOptions(user?._id);
  useFocusEffect(useCallback(() => {
    if (!isUpdate && values.lead) void eligibility.refetch({ cancelRefetch: false });
  }, [isUpdate, values.lead, eligibility.refetch]));
  const blockedEligibility = !isUpdate && eligibility.data?.allowed === false;
  const submitDisabled = isLoading || memberQuery.isPending || !!memberQuery.error || !Array.isArray(memberQuery.data)
    || (!isUpdate && (eligibility.isFetching || !!eligibility.error || (!eligibility.data?.allowed && !requestRef.current)));
  const responsible = isUpdate ? data?.responsibleUserId : eligibility.data?.responsible;
  const memberOptions = (memberQuery.data || []).filter((member: any) => meetingId(member) !== meetingId(responsible)).map((member: any) => ({ ...member, name: [member.name, member.lastName].filter(Boolean).join(" ") }));
  useEffect(() => {
    if (!isUpdate && typeof eligibility.data?.self === "boolean") void setFieldValue("self", eligibility.data.self);
  }, [isUpdate, eligibility.data?.self, values.lead]);

  useEffect(() => {
    if (!returnedLead?._id) return;
    setFieldValue("lead", returnedLead._id);
    setIsUpdateFrom(false);
  }, [returnedLead?._id, setFieldValue]);

  const toggleMapViewModal = (v) => {
    setIsMapModalVisible(!isMapModalVisible);
    // setMapLatLng(v)
  };

  const onEndReach = () => {
    if (
      hasNextPage &&
      !loading &&
      !isFetchingNextPage &&
      leadList?.length > 0
    ) {
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  const handleSearchChange = (v) => {
    setSearchValue(v);
  };

  const leadOptions = meetingLeadOptions(leadList || [], values.lead, [
    selectedLeadOption, returnedLead, leadDetail, data?.lead,
  ]);

  const handleAddLeadFromMeeting = () => {
    navigate("allLead2", {
      screen: "AddLeads",
      params: {
        tabType: "lead",
        returnToMeeting: true,
        meetingDraft: {
          ...values,
          date: tempDate.date?.toISOString?.() || new Date().toISOString(),
          time: tempDate.time?.toISOString?.() || new Date().toISOString(),
        },
      },
    });
  };

  return (
    <>
      <Header
        title={
          isFollowUp
            ? "Add New Meeting"
            : isUpdate
              ? "Update Meetings"
              : "Add Meetings"
        }
      />
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
              <>
                <DropdownRNE
                arrOfObj={leadOptions}
                keyValueGetOnSelect="_id"
                keyValueShowInBox="name"
                label="Choose Lead *"
                placeholder="Lead..."
                onChange={(a) => {
                  setFieldValue("lead", a);
                  setFieldValue("self", true);
                  setFieldValue("agents", []);
                }}
                onSelect={(lead) => setSelectedLeadOption(lead)}
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
                serverSearch
                />
                <Pressable
                  onPress={handleAddLeadFromMeeting}
                  style={({ pressed }) => [
                    styles.addLeadLink,
                    pressed && { opacity: 0.65 },
                  ]}
                >
                  <Feather name="plus-circle" size={16} color="#2E67BE" />
                  <CustomText style={styles.addLeadLinkText}>
                    Lead not found? Add a new lead
                  </CustomText>
                </Pressable>
              </>
            ) : (
              <IllusionBox
                title="Lead"
                value={leadDetail?.clientName || leadDetail?.name || ""}
                onPress={isFollowUp || isUpdate ? undefined : () => setIsUpdateFrom(false)}
              />
            )}

            {errors?.lead && touched?.lead && (
              <CustomText style={styles.errorText}>{errors?.lead}</CustomText>
            )}

            {!isUpdate && Boolean(values.lead) && (blockedEligibility || eligibility.error || eligibility.isFetching) && (
              <View accessibilityRole="alert" style={styles.eligibilityNotice}>
                <View style={styles.eligibilityNoticeRow}>
                  <Feather name="alert-triangle" size={18} color="#B45309" />
                  <CustomText style={styles.eligibilityNoticeText}>
                    {blockedEligibility
                      ? eligibility.data?.reason || "This lead cannot have another meeting yet. Conduct or cancel its open meeting first."
                      : eligibility.error
                        ? meetingMessage(eligibility.error, "Unable to check meeting eligibility. Please retry.")
                        : "Checking whether this lead can have a new meeting…"}
                  </CustomText>
                </View>
                {blockedEligibility && !!existingMeetingId && (
                  <Pressable accessibilityRole="button" accessibilityLabel="Open existing meeting" onPress={() => { if (!openExistingMeeting(navigation, existingMeetingId)) toast.error("Meeting details are not available in your current navigation. Please check Meeting access."); }} style={styles.existingMeetingButton}>
                    <Feather name="external-link" size={15} color="#92400E" />
                    <CustomText style={styles.existingMeetingText}>Open existing meeting</CustomText>
                  </Pressable>
                )}
                {blockedEligibility && !eligibility.data?.meetingId && existingMeeting.isFetching && <CustomText style={styles.eligibilityNoticeText}>Finding the existing meeting…</CustomText>}
                {blockedEligibility && !!existingMeeting.error && <Pressable accessibilityRole="button" accessibilityLabel="Retry finding existing meeting" onPress={() => existingMeeting.refetch()} style={styles.existingMeetingButton}><CustomText style={styles.existingMeetingText}>Unable to load the existing meeting. Tap to retry.</CustomText></Pressable>}
                {!!eligibility.error && <Pressable accessibilityRole="button" accessibilityLabel="Retry eligibility check" onPress={() => eligibility.refetch()} style={styles.existingMeetingButton}><CustomText style={styles.existingMeetingText}>Retry eligibility check</CustomText></Pressable>}
              </View>
            )}

            {isFollowUp || isUpdate ? (
              <IllusionBox title="Status" value={isFollowUp ? "Meeting Scheduled" : sourceMeeting?.status} onPress={undefined} />
            ) : (
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
            )}
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
              <CustomText style={styles.requiredLabel}>
                Meeting Type *
              </CustomText>
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
                        values.meetingMode === meetingMode &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {values.meetingMode === meetingMode && (
                        <View style={styles.radioInner} />
                      )}
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
            {isUpdate ? <IllusionBox title="Meeting Date & Time" value={moment(sourceMeeting?.scheduleDate).format("DD MMM YYYY, hh:mm A")} onPress={undefined} /> : <View
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
                minimumDate={values.status === "conducted" ? undefined : new Date()}
                maximumDate={values.status === "conducted" ? new Date() : undefined}
              />

              <DatePickerExpo
                title={"Time *"}
                boxContainerStyle={{ marginBottom: 20, width: "47%" }}
                onSelect={(time) => setTempDate((prev) => ({ ...prev, time }))}
                initialValue={tempDate?.time}
                mode="time"
                minimumDate={values.status !== "conducted" && isTodaySelected ? new Date() : undefined}
              />
            </View>}
            {dateTimeError ? (
              <CustomText style={styles.dateTimeError}>
                {dateTimeError}
              </CustomText>
            ) : null}
            <CustomText style={{ color: "#64748B", marginBottom: 12 }}>{responsible ? `Responsible: ${[responsible.name, responsible.lastName].filter(Boolean).join(" ") || meetingId(responsible)} (always included)` : "Select a lead to verify responsibility."}</CustomText>
            {!!memberQuery.error && <CustomText color="#B91C1C">{meetingMessage(memberQuery.error, "Unable to load supporting members")}</CustomText>}
            {!!memberQuery.error && <Pressable accessibilityRole="button" onPress={() => memberQuery.refetch()} style={{ paddingVertical: 12 }}><CustomText color="#2E67BE">Retry loading members</CustomText></Pressable>}
            <DropdownRNE
              arrOfObj={memberOptions}
              isMultiSelect={true}
              keyValueShowInBox="name"
              keyValueGetOnSelect="_id"
              label="Supporting members (Optional)"
              placeholder={"Select members"}
              containerStyle={{ marginBottom: 15 }}
              onChange={(a) => setFieldValue("agents", meetingSupportingMembers(responsible, a as any[], memberQuery.data || []))}
              initialValue={meetingSupportingMembers(responsible, values.agents, memberQuery.data || [])}
              disabled={memberQuery.isPending || !!memberQuery.error}
              isSearch
              mode="modal"
              excludedItems={[meetingId(responsible)]}
            />
            {errors.agents && touched.agents && (
              <CustomText style={styles.errorText}>{errors.agents}</CustomText>
            )}
            <CustomBtn
              title="Submit"
              disabled={submitDisabled}
              onPress={() => { if (!isLoading && (isUpdate || eligibility.data?.allowed || requestRef.current)) handleSubmit(); else if (!isLoading) toast.error(eligibility.data?.reason || "Wait for lead eligibility to load."); }}
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
  eligibilityNotice: { padding: 12, marginBottom: 16, borderRadius: 10, borderWidth: 1, borderColor: "#FDE3B8", backgroundColor: "#FFF7EB", gap: 8 },
  eligibilityNoticeRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  eligibilityNoticeText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#92400E" },
  existingMeetingButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 8, minHeight: 44 },
  existingMeetingText: { fontSize: 12, fontWeight: "600", color: "#92400E" },
  addLeadLink: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -7,
    marginBottom: 15,
  },
  addLeadLinkText: {
    color: "#2E67BE",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
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
  selfRow: {
    minHeight: 62,
    marginBottom: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#D7E0EC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selfHint: { color: "#64748B", fontSize: 12, marginTop: 3 },
});

export default AddMeeting;
