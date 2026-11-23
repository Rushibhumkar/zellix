import { attendanceUserName, attendanceSummary, attendanceProgressLabel, formatAttendanceDuration, attendanceSourceIcon, attendanceSourceLabel } from "../../utils/attendanceDisplay";
import { Feather } from "@expo/vector-icons";
import { Linking, Pressable } from "react-native";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import { useRoute } from "@react-navigation/native";
import { myConsole } from "../../hooks/useConsole";
import { useGetAttendanceDetail } from "../../hooks/useGetQuerryHRM";
import OutlineBtn from "../../myComponents/OutlineBtn/OutlineBtn";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import LeaveAppRemark from "../LeaveHRM/components/LeaveAppRemark";
import { attendanceStatus, roleHRM, statusAttend, statusColorAttend } from "../../utils/hrmKeysMatchToBE";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import {
  issueResolveAdmin,
  issueRiseAgent,
} from "../../services/hrmApi/attendanceApi";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import PleaseWait from "../../myComponentsHRM/PleaseWait/PleaseWait";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import moment from "moment";
import CustomText from "../../myComponents/CustomText/CustomText";

const attendanceEventLabels: Record<string, string> = {
  CHECK_IN: "Check In",
  CHECK_OUT: "Check Out",
  VISIT_IN: "Visit In",
  VISIT_OUT: "Visit Out",
  SITE_IN: "Visit In",
  SITE_OUT: "Visit Out",
  CORRECTION: "Attendance corrected",
};

const timelineDateTime = (value?: string) =>
  value && moment(value).isValid() ? moment(value).locale("en").format("D MMM YYYY · hh:mm A") : "—";

const AttendanceDetail = () => {
  const { params } = useRoute();
  const { user } = useSelector(selectUser);
  const attendanceId = params?.item?.from === "nav" ? params?.item?.dataId : params?.item?._id;
  const queryClient = useQueryClient();
  //
  const { data, isLoading, refetch } = useGetAttendanceDetail({
    id: attendanceId,
  });
  const [openModal, setOpenModal] = useState(false);
  const [formValue, setFormValue] = useState({
    remarks: "",
  });
  const [issueRiseUpdate, setIssueRiseUpdate] = useState<"raise" | "update">(
    "raise",
  );
  const [refreshing, setRefreshing] = useState(false);



  const toggleModal = () => {
    setOpenModal((prev) => !prev);
  };

  const handleFormValues = (key: "remarks" | "status", value) => {
    setFormValue((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const handleIssue = async () => {
    toggleModal();
    try {
      popUpConfToast.plzWait({
        bodyComponent: () => <PleaseWait />,
      });
      if (issueRiseUpdate === "raise") {
        let res = await issueRiseAgent({
          id: attendanceId,
          data: {
            remarks: formValue.remarks,
          },
        });
        refetch();
        queryClient.invalidateQueries({
          queryKey: [queryKeyHRM.getAllAttendance],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeyHRM.getIssueAttendance],
        });
        popUpConfToast.successMessage(res?.message);
      } else {
        let res = await issueResolveAdmin({
          id: attendanceId,
          data: {
            remarks: formValue.remarks,
            status: formValue.status,
          },
        });
        refetch();
        queryClient.invalidateQueries({
          queryKey: ["getAllAttendance"],
        });
        queryClient.invalidateQueries({
          queryKey: ["getSingleUserAttList", params?.item?.user],
        });
        popUpConfToast.successMessage(res?.message);
      }
    } catch (error: any) {
      const body = error?.response?.data;
      popUpConfToast.errorMessage(typeof body === "string" ? body : body?.message);
    } finally {
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    try {
      refetch();
    } catch (e) {
      console.log("refreshInLeaveDetail", e);
    } finally {
      setRefreshing(false);
    }
  };
  const dateValue = data?.workDate || data?.createdAt;
  const workDate = dateValue ? moment(dateValue).locale("en") : null;
  const formatPunchTime = (value?: string) => {
    const punch = value ? moment(value).locale("en") : null;
    if (!punch?.isValid()) return "—";
    if (!workDate?.isValid()) return punch.format("D MMM YYYY · hh:mm A");
    if (punch.isSame(workDate, "day")) return punch.format("hh:mm A");
    return punch.format(punch.isSame(workDate, "year") ? "D MMM · hh:mm A" : "D MMM YYYY · hh:mm A");
  };
  const summary = attendanceSummary(data);
  const progressLabel = attendanceProgressLabel(summary);
  const sessions = data?.sessions || [];
  const timelineEvents = (data?.events || []).filter(event => !sessions.length ||
    !["CHECK_IN", "CHECK_OUT", "VISIT_IN", "VISIT_OUT", "SITE_IN", "SITE_OUT"].includes(event.action));
  const status = data?.status;
  const statusTint = status === "present" ? "#15803D" : statusColorAttend[status] || "#475569";
  const punches = [
    { label: "Check In", icon: "log-in" as const, time: summary.checkInAt, type: summary.checkInSource },
    { label: "Check Out", icon: "log-out" as const, time: summary.checkOutAt, type: summary.checkOutSource },
  ];
  const employeeName = attendanceUserName(data);
  const nameParts = employeeName.split(/\s+/).slice(0, 2);
  const initials = nameParts.map((part) => part.trim().charAt(0)).join("").toUpperCase();
  const employeeRole = roleHRM[data?.role] || data?.role;
  const sections = [
    {
      kind: "personal",
      title: "Personal Details",
      fields: [
        { label: "Mobile Number", icon: "phone" as const, value: data?.mobile },
        { label: "Email Address", icon: "mail" as const, value: data?.email },
      ],
    },
    {
      kind: "attendance",
      title: "Attendance Details",
      fields: [
        { label: "Date", icon: "calendar" as const, value: workDate?.isValid() ? workDate.format("D MMM YYYY") : undefined },
      ],
    },
  ];

  return (
    <ContainerHRM
      isBAck={{
        title: "Attendance Details",
        onRaiseIssue: data?.user && String(data.user) === String(user?._id) ? () => {
          setIssueRiseUpdate("raise");
          toggleModal();
        } : undefined,
        isEdit:
          data?.canEdit &&
          (() => {
            setIssueRiseUpdate("update");
            toggleModal();
          }),
      }}
      isLoading={isLoading}
    >
      <FlatList
        data={data ? sections : []}
        keyExtractor={(section) => section.title}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.detailCard}>
            <View style={styles.timelineHeader}>
              <CustomText style={styles.detailTitle}>{item.title}</CustomText>
              {item.kind === "attendance" && status && (
                <View style={[styles.detailBadge, { backgroundColor: statusTint + "18" }]}>
                  <CustomText style={[styles.detailBadgeText, { color: statusTint }]}>{statusAttend[status] || status}</CustomText>
                </View>
              )}
              {item.kind === "attendance" && status === "present" && data?.lateMinutes > 0 && (
                <View style={[styles.detailBadge, { backgroundColor: "#FEF3C7" }]}>
                  <CustomText style={[styles.detailBadgeText, { color: "#92400E" }]}>Late · {formatAttendanceDuration(data.lateMinutes)}</CustomText>
                </View>
              )}
            </View>
            {item.kind === "personal" && (
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatar} accessible={false}>
                  {initials ? <CustomText style={styles.profileInitials}>{initials}</CustomText> :
                    <Feather name="user" size={20} color="#2E67BE" />}
                </View>
                <View style={styles.profileIdentity}>
                  <CustomText style={styles.profileName}>{employeeName || "—"}</CustomText>
                  {!!employeeRole && (
                    <View style={[styles.detailBadge, styles.profileRole]}>
                      <CustomText style={[styles.detailBadgeText, styles.punchTypeText]}>{employeeRole}</CustomText>
                    </View>
                  )}
                </View>
              </View>
            )}
            <View style={styles.detailDivider} />
            {item.fields.map(({ label, icon, value }) => (
              item.kind === "personal" ? (
                <View key={label} style={styles.contactRow}>
                  <View style={styles.contactIcon} accessible={false}>
                    <Feather name={icon} size={16} color="#2E67BE" />
                  </View>
                  <CustomText accessibilityLabel={`${label}, ${value || "unavailable"}`} style={styles.contactValue}>{value || "—"}</CustomText>
                </View>
              ) : <View key={label} style={styles.detailRow}>
                <View style={styles.detailLabelGroup}>
                  <Feather name={icon} size={17} color="#7A869A" />
                  <CustomText style={styles.detailLabel}>{label}</CustomText>
                </View>
                <CustomText style={styles.detailValue}>{value || "—"}</CustomText>
              </View>
            ))}
            {item.kind === "attendance" && (
              <View style={styles.punchGrid}>
                {punches.map(({ label, icon, time, type }) => (
                  <View key={label} style={styles.punchTile}>
                    {!!type && <View accessible accessibilityLabel={type} style={styles.sourceBadge}>
                      <Feather name={attendanceSourceIcon(type)} size={12} color="#245AA9" />
                      <CustomText numberOfLines={1} style={styles.sourceBadgeText}>{attendanceSourceLabel(type)}</CustomText>
                    </View>}
                    <View style={styles.punchLabelGroup}>
                      <Feather name={icon} size={15} color="#2E67BE" />
                      <CustomText style={styles.detailLabel}>{label}</CustomText>
                    </View>
                    <CustomText style={styles.punchTime}>{formatPunchTime(time)}</CustomText>

                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        ListFooterComponent={
          <>
            {!!data?.remarks && (
              <View style={styles.infoCard}>
                <CustomText style={styles.label}>Remarks</CustomText>
                <CustomText style={styles.value}>{data.remarks}</CustomText>
              </View>
            )}
            {!!data?.reviewFlags?.length && (
              <CustomText style={{ color: "#92400E" }}>{data.reviewFlags.join(" · ")}</CustomText>
            )}
            {!!data && <View style={styles.infoCard}>
              <CustomText>Work time {formatAttendanceDuration(summary.workMinutes)}{summary.checkOutDerived ? " (estimated)" : ""}</CustomText>
              {progressLabel && <CustomText style={{ color: "#245AA9" }}>{progressLabel}{progressLabel === "Day in progress" ? " · duration is provisional" : ""}</CustomText>}
              {summary.state === "needs_review" && <CustomText style={{ color: "#92400E" }}>Attendance needs review</CustomText>}
              {summary.checkOutDerived && <CustomText style={{ color: "#92400E" }}>{summary.checkOutExplanation || "Last Visit Out used as checkout"}</CustomText>}
            </View>}
            {!!sessions.length && <View style={styles.timeline}>
              <CustomText style={styles.headingText}>Attendance sessions</CustomText>
              {sessions.map((session, index) => <View key={session.id} style={[styles.timelineCard, { marginBottom: 12 }]}>
                <CustomText style={styles.timelineAction}>{session.kind === "visit" ? (session.in?.siteVisit?.kind === "office" ? "Office visit" : "Field visit") : "Check-in session"} · {index + 1}</CustomText>
                {!!(session.in?.siteVisit?.name || session.out?.siteVisit?.name) && <CustomText>{session.in?.siteVisit?.name || session.out?.siteVisit?.name}</CustomText>}
                {([['In', session.in], ['Out', session.out]] as const).map(([side, event]) => <View key={side} style={{ paddingTop: 12 }}>
                  <View style={styles.timelineHeader}>
                    <CustomText style={styles.timelineAction}>{session.kind === "visit" ? "Visit" : "Check"} {side}</CustomText>
                    {!!event && <View accessible accessibilityLabel={event.displaySource || event.source} style={styles.sourceBadge}>
                      <Feather name={attendanceSourceIcon(event.source || event.displaySource)} size={12} color="#245AA9" />
                      <CustomText numberOfLines={1} style={styles.sourceBadgeText}>{attendanceSourceLabel(event.source || event.displaySource)}</CustomText>
                    </View>}
                  </View>
                  <CustomText>{event ? timelineDateTime(event.effectiveAt || event.recordedAt) : side === "In" ? (session.kind === "visit" ? "Visit In missing" : "Check In missing") : session.kind === "visit" ? "Visit Out pending" : "Check Out missing"}</CustomText>
                  {!!event?.recordedAt && timelineDateTime(event.recordedAt) !== timelineDateTime(event.effectiveAt) && <CustomText style={styles.timelineDate}>Recorded {timelineDateTime(event.recordedAt)}</CustomText>}
                  {!!event?.remarks && <CustomText>{event.remarks}</CustomText>}
                  {!!event?.location && <Pressable accessibilityRole="link" onPress={() => {
                    void Linking.openURL(`https://www.google.com/maps?q=${encodeURIComponent(`${event.location.lat},${event.location.lng}`)}`).catch(() => popUpConfToast.errorMessage("Could not open Google Maps."));
                  }}><CustomText style={styles.timelineLink}>View location</CustomText></Pressable>}
                </View>)}
              </View>)}
            </View>}
            {!!timelineEvents.length && (
              <View style={styles.timeline}>
                <CustomText style={styles.headingText}>Attendance timeline</CustomText>
                {timelineEvents.map((event, index) => {
                  const effective = event.effectiveAt ? timelineDateTime(event.effectiveAt) : null;
                  const recorded = event.recordedAt ? timelineDateTime(event.recordedAt) : null;
                  return (
                    <View key={event.requestId || event.machineEventId || index} style={styles.timelineItem}>
                      {index < timelineEvents.length - 1 && <View style={styles.timelineLine} />}
                      <View style={styles.timelineDot} />
                      <View style={styles.timelineCard}>
                        <View style={styles.timelineHeader}>
                          <CustomText style={styles.timelineAction}>
                            {attendanceEventLabels[event.action] || event.action?.replace(/_/g, " ")}
                          </CustomText>
                          {!!event.source && (
                            <View accessible accessibilityLabel={event.source.replace(/_/g, " ")} style={styles.sourceBadge}><Feather name={attendanceSourceIcon(event.source)} size={12} color="#245AA9" /><CustomText numberOfLines={1} style={styles.sourceBadgeText}>{attendanceSourceLabel(event.source)}</CustomText></View>
                          )}
                        </View>
                        {!!effective && <CustomText style={styles.timelineDate}>{effective}</CustomText>}
                        {!!recorded && recorded !== effective && <CustomText style={styles.timelineDate}>Recorded {recorded}</CustomText>}
                        {!!event.siteVisit?.name && <CustomText>{event.siteVisit.name}</CustomText>}
                        {!!event.remarks && <CustomText>{event.remarks}</CustomText>}
                        {!!event.location && (
                          <Pressable accessibilityRole="link" onPress={() => {
                            const query = encodeURIComponent(`${event.location.lat},${event.location.lng}`);
                            void Linking.openURL(`https://www.google.com/maps?q=${query}`).catch(() => {
                              popUpConfToast.errorMessage("Could not open Google Maps.");
                            });
                          }}>
                            <CustomText style={styles.timelineLink}>View location</CustomText>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            {!!data?.issue && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: data?.resolve ? "#DCFCE7" : "#FEE2E2",
                      },
                    ]}
                  >
                    <CustomText
                      style={[
                        styles.iconText,
                        {
                          color: data?.resolve ? "#15803D" : "#DC2626",
                        },
                      ]}
                    >
                      !
                    </CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>Issue Status</CustomText>

                    <CustomText
                      style={[
                        styles.value,
                        {
                          color: data?.resolve ? "#15803D" : "#DC2626",
                        },
                      ]}
                    >
                      {data?.resolve ? "Resolved" : "Unresolved"}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            {(!!data?.punchInMeetingLocation ||
              !!data?.punchOutMeetingLocation) && (
              <View style={styles.headingContainer}>
                <CustomText style={styles.headingText}>
                  Remote Punch Detail
                </CustomText>
              </View>
            )}

            {!!data?.punchInMeetingLocation && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>P</CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>
                      Punch In Location
                    </CustomText>

                    <CustomText style={styles.value}>
                      {data?.punchInMeetingLocation}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            {!!data?.punchInMeetingTime && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>T</CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>Punch In Time</CustomText>

                    <CustomText style={styles.value}>
                      {timelineDateTime(data.punchInMeetingTime)}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            {!!data?.punchOutMeetingLocation && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>P</CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>
                      Punch Out Location
                    </CustomText>

                    <CustomText style={styles.value}>
                      {data?.punchOutMeetingLocation}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            {!!data?.punchOutMeetingTime && (
              <View style={styles.infoCard}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBox}>
                    <CustomText style={styles.iconText}>T</CustomText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>Punch Out Time</CustomText>

                    <CustomText style={styles.value}>
                      {timelineDateTime(data.punchOutMeetingTime)}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </>
        }
      />

      <ModalWithBlur visible={openModal}>
        <LeaveAppRemark
          heading={
            issueRiseUpdate === "raise" ? "Raise Issue" : "Update Status"
          }
          onPressCancel={toggleModal}
          onChangeText={(v) => handleFormValues("remarks", v)}
          isDropDown={
            issueRiseUpdate === "update" && {
              arrOfObj: attendanceStatus,
              onChange: (v) => handleFormValues("status", v),
            }
          }
          onPressSubmit={handleIssue}
        />
      </ModalWithBlur>
    </ContainerHRM>
  );
};

export default AttendanceDetail;

const styles = StyleSheet.create({
  timeline: { marginBottom: 16, gap: 8 },
  timelineItem: { position: "relative", paddingLeft: 20 },
  timelineLine: { position: "absolute", left: 5, top: 16, bottom: -24, width: 2, backgroundColor: "#DCE6F5" },
  timelineDot: { position: "absolute", left: 0, top: 14, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#DBEAFE", backgroundColor: "#2E67BE" },
  timelineCard: { gap: 5, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" },
  timelineHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 6 },
  timelineAction: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  sourceBadge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end", marginLeft: "auto", maxWidth: "100%", flexShrink: 0, backgroundColor: "#E0EDFF", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  sourceBadgeText: { fontSize: 10, fontWeight: "600", color: "#245AA9", flexShrink: 1 },
  timelineSource: { fontSize: 10, color: "#1E40AF", backgroundColor: "#EAF2FF", borderRadius: 8, overflow: "hidden", paddingHorizontal: 7, paddingVertical: 3 },
  timelineDate: { fontSize: 12, color: "#475569" },
  timelineLink: { color: "#2E67BE", textDecorationLine: "underline", fontSize: 12 },

  contentContainer: {
    padding: 16,
    paddingBottom: 160,
  },

  detailBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: "#F1F5F9" },
  profileAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center" },
  profileInitials: { fontSize: 16, fontWeight: "700", color: "#2E67BE" },
  profileIdentity: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 },
  profileName: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: "700", color: "#1E293B" },
  profileRole: { maxWidth: "45%", backgroundColor: "#E0EDFF" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  contactIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: "#EEF4FF", alignItems: "center", justifyContent: "center" },
  contactValue: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: "600", color: "#2F3A4A" },
  detailBadgeText: { fontSize: 11, fontWeight: "700" },
  punchGrid: { flexDirection: "row", gap: 8, marginTop: 4 },
  punchTile: { flex: 1, minWidth: 0, gap: 6, padding: 10, borderRadius: 12, backgroundColor: "#F1F5F9" },
  punchLabelGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  punchTime: { fontSize: 13, fontWeight: "600", color: "#2F3A4A" },
  punchTypeBadge: { maxWidth: "100%", flexShrink: 1, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E0EDFF" },
  punchTypeText: { flexShrink: 1, color: "#245AA9" },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E6EAF0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  detailTitle: { fontSize: 20, fontWeight: "700", color: "#2E67BE" },
  detailDivider: { height: 1, backgroundColor: "#E6EAF0", marginTop: 12, marginBottom: 4 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9 },
  detailLabelGroup: { flex: 2, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 },
  detailLabel: { flex: 1, fontSize: 13, color: "#6B778C" },
  detailValue: { flex: 3, minWidth: 0, textAlign: "right", fontSize: 14, fontWeight: "600", color: "#2F3A4A" },

  headingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D67C6",
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },


  issueBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
