import { AppToastHost, useAppToast } from "../../components/AppToast";
import type { AppToastHostHandle } from "../../components/AppToast";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import { Dropdown } from "react-native-element-dropdown";
import { useQuery } from "@tanstack/react-query";
import { getAttendancePunchLocations } from "../../services/hrmApi/siteVisitLocationsApi";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";

const labels = {
  CHECK_IN: "Check In",
  CHECK_OUT: "Check Out",
  VISIT_IN: "Visit In",
  VISIT_OUT: "Visit Out",
};
const successMessages = {
  CHECK_IN: "Checked in successfully.",
  CHECK_OUT: "Checked out successfully.",
  VISIT_IN: "Visit started.",
  VISIT_OUT: "Visit ended.",
};
type Action = keyof typeof labels;
const visitActions: Action[] = ["VISIT_IN", "VISIT_OUT"];
const officeActions: Action[] = ["CHECK_IN", "CHECK_OUT"];
const endpoint = "/api/hrms/att/remotePunch";

export default function CheckInOut({
  showInitialLoader = true,
  onLoadError,
  retryVersion,
}: {
  showInitialLoader?: boolean;
  onLoadError: (failed: boolean) => void;
  retryVersion: number;
}) {
  const [availability, setAvailability] =
    useState<Partial<Record<Action, string | null>>>();
  const [officePunchEnabled, setOfficePunchEnabled] = useState(false);
  const [canEndWithVisit, setCanEndWithVisit] = useState(false);
  const [selected, setSelected] = useState<Action>();
  const [policyRevision, setPolicyRevision] = useState(0);
  const [siteVisitAvailable, setSiteVisitAvailable] = useState(false);
  const [activeSiteVisitName, setActiveSiteVisitName] = useState<string>();
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [activeVisitAt, setActiveVisitAt] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string>();
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const sites = useQuery({
    queryKey: ["attendancePunchLocations", selected, policyRevision],
    queryFn: ({ signal }) => getAttendancePunchLocations(selected as "CHECK_IN" | "VISIT_IN", signal),
    staleTime: 0,
    enabled: (selected === "CHECK_IN" || selected === "VISIT_IN") && availability?.[selected] === null,
  });
  const [remarks, setRemarks] = useState("");
  const [remarksRequired, setRemarksRequired] = useState(false);
  const [loadingButton, setLoadingButton] = useState<
    Action | "confirmVisit" | "endWorkday"
  >();
  const busy = loadingButton !== undefined;
  const [loadFailed, setLoadFailed] = useState(false);
  const toast = useAppToast();
  const visitToastHost = useRef<AppToastHostHandle>(null);
  const request = useRef<
    | { action: Action; id: string; siteId?: string; endWorkday: boolean }
    | undefined
  >(undefined);
  const submitting = useRef(false);
  const refreshVersion = useRef(0);
  const refreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    const version = ++refreshVersion.current;
    try {
      const { data } = await axiosInstance.get(endpoint);
      if (version !== refreshVersion.current) return;
      setAvailability(data.actions);
      setPolicyRevision(data.attendancePolicyRevision || 0);
      setRemarksRequired(data.visitOutRemarksRequired === true);
      setOfficePunchEnabled(data.mobileOfficePunchEnabled === true);
      setSiteVisitAvailable(data.siteVisitAvailable === true);
      setActiveSiteVisitName(data.activeSiteVisitName);
      setActiveVisitAt(data.activeVisitAt || null);
      setCheckedInAt(data.punchedIn || null);
      setCheckInTime(data.checkInAt || null);
      setCanEndWithVisit(data.canEndWorkdayWithVisit === true);
      setLoadFailed(false);
      onLoadError(false);
    } catch {
      if (version !== refreshVersion.current) return;
      setOfficePunchEnabled(false);
      setSiteVisitAvailable(false);
      setLoadFailed(true);
      onLoadError(true);
    } finally {
      refreshing.current = false;
    }
  }, [onLoadError]);
  useFocusEffect(
    useCallback(() => {
      void refresh();
      const timer = setInterval(() => {
        if (!submitting.current) void refresh();
      }, 30_000);
      return () => clearInterval(timer);
    }, [refresh, retryVersion]),
  );

  async function submit(action: Action, endWorkday = false) {
    if (submitting.current) return;
    if (action === "VISIT_OUT" && remarksRequired && !remarks.trim()) {
      toast.error("Enter remarks before ending this visit.", {}, visitToastHost.current);
      return;
    }
    if (endWorkday && (action !== "VISIT_OUT" || !canEndWithVisit)) return;
    if (availability?.[action] || (officeActions.includes(action) ? !officePunchEnabled : !siteVisitAvailable)) {
      toast.error(availability?.[action] || "This attendance action is no longer available. Close this dialog and try again.", {}, selected ? visitToastHost.current : null);
      return;
    }
    if (
      (["CHECK_IN", "VISIT_IN"].includes(action) &&
        (sites.isFetching || sites.isError || !sites.data?.some((site) => site._id === siteId)))
    )
      return;
    submitting.current = true;
    setLoadingButton(
      endWorkday
        ? "endWorkday"
        : action === "CHECK_OUT" ? action : "confirmVisit",
    );
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Allow location",
          "Location is required to record attendance.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                void Linking.openSettings().catch(() =>
                  Alert.alert("Open your phone settings to enable location."),
                );
              },
            },
          ],
        );
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        Alert.alert(
          "Turn on location",
          "Enable location services on your phone and try again.",
        );
        return;
      }
      let coords: Location.LocationObjectCoords;
      try {
        ({ coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }));
      } catch {
        toast.error(
          "Could not get your location. Move to an open area and try again.",
          {},
          selected ? visitToastHost.current : null,
        );
        return;
      }
      if (
        request.current?.action !== action ||
        request.current.siteId !== siteId ||
        request.current.endWorkday !== endWorkday
      )
        request.current = {
          action,
          siteId,
          endWorkday,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        };
      const { data } = await axiosInstance.post(endpoint, {
        action,
        ...(["CHECK_IN", "VISIT_IN"].includes(action) && { siteId }),
        endWorkday,
        remarks: !officeActions.includes(action) ? remarks : undefined,
        requestId: request.current.id,
        coor: {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        },
      });
      request.current = undefined;
      refreshVersion.current++;
      setAvailability(data.actions);
      setPolicyRevision(data.attendancePolicyRevision || 0);
      setRemarksRequired(data.visitOutRemarksRequired === true);
      setOfficePunchEnabled(data.mobileOfficePunchEnabled === true);
      setSiteVisitAvailable(data.siteVisitAvailable === true);
      setActiveSiteVisitName(data.activeSiteVisitName);
      setActiveVisitAt(data.activeVisitAt || null);
      setCheckedInAt(data.punchedIn || null);
      setCheckInTime(data.checkInAt || null);
      setCanEndWithVisit(data.canEndWorkdayWithVisit === true);
      setSelected(undefined);
      setRemarks("");
      setSiteId(undefined);
      toast.success(
        endWorkday
          ? "Visit ended and workday closed."
          : successMessages[action],
      );
    } catch (error: any) {
      const body = error?.response?.data;
      const message = typeof body === "string" ? body : body?.message;
      if (body?.code === "MOBILE_OFFICE_PUNCH_DISABLED") {
        refreshVersion.current++;
        setOfficePunchEnabled(false);
      }
      if (body?.code === "SITE_VISIT_WEEKEND_ONLY") {
        refreshVersion.current++;
        setSiteVisitAvailable(false);
      }
      if (body?.code === "SITE_NOT_FOUND") {
        setSiteId(undefined);
        void sites.refetch();
      }
      toast.error(
        typeof message === "string" && message.trim()
          ? message
          : `Could not complete ${labels[action]}. Check your connection and location, then retry.`,
        {},
        selected ? visitToastHost.current : null,
      );
      void refresh();
    } finally {
      submitting.current = false;
      setLoadingButton(undefined);
    }
  }

  const needsVisitLocation =
    (selected === "CHECK_IN" || selected === "VISIT_IN") && (sites.isFetching || sites.isError || !sites.data?.some((site) => site._id === siteId));

  const renderAction = (action: Action) => {
    const reason = availability?.[action];
    const alreadyCheckedIn = action === "CHECK_IN" && Boolean(checkedInAt);
    const visitStarted = action === "VISIT_IN" && Boolean(activeVisitAt);
    const startTime = visitStarted ? activeVisitAt : alreadyCheckedIn ? checkInTime : null;
    const startDate = startTime ? new Date(startTime) : null;
    const startedAt =
      startDate && Number.isFinite(startDate.getTime())
        ? new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(startDate)
        : null;
    const label = visitStarted
      ? startedAt
        ? `Started at\n${startedAt}`
        : "Visit started"
      : alreadyCheckedIn
        ? startedAt ? `Checked in at\n${startedAt}` : "Day started"
        : labels[action];
    return (
      <Pressable
        key={action}
        accessibilityRole="button"
        accessibilityLabel={
          visitStarted
            ? startedAt
              ? `Visit started at ${startedAt}`
              : "Visit started"
            : labels[action]
        }
        accessibilityState={{
          busy: loadingButton === action,
          disabled: busy || !availability || visitStarted || alreadyCheckedIn,
        }}
        accessibilityHint={reason || undefined}
        accessibilityValue={alreadyCheckedIn ? { text: label.replace("\n", " ") } : undefined}
        disabled={busy || !availability || visitStarted || alreadyCheckedIn}
        style={[styles.button, styles.actionButton, (!!reason || alreadyCheckedIn) && styles.blocked]}
        onPress={() => {
          if (reason) toast.error(reason);
          else if (action !== "CHECK_OUT") {
            setLocationPickerOpen(false);
            setSiteId(undefined);
            setRemarks("");
            setSelected(action);
          } else void submit(action);
        }}
      >
        {loadingButton === action ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={[styles.buttonText, styles.actionText]}>Checking out…</Text>
          </>
        ) : (
          <Text
            style={[
              styles.buttonText,
              styles.actionText,
              (!!reason || alreadyCheckedIn) && styles.blockedText,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.wrapper}>
      {!availability && !loadFailed && showInitialLoader && (
        <ActivityIndicator
          color="#2E67BE"
          accessibilityLabel="Loading attendance actions"
        />
      )}
      {(officePunchEnabled || siteVisitAvailable) && (
        <View style={styles.actionGroups}>
          {officePunchEnabled && (
            <View style={styles.actionCard}>
              <View style={styles.actionCardHeading}>
                <Feather name="clock" size={18} color="#2E67BE" />
                <Text style={styles.actionCardTitle}>Daily attendance</Text>
              </View>
              <Text style={styles.actionCardHelp}>
                Record your workday with Check In and Check Out.
              </Text>
              <View style={styles.actionRow}>
                {officeActions.map(renderAction)}
              </View>
            </View>
          )}
          {siteVisitAvailable && (
            <View style={styles.actionCard}>
              <View style={styles.actionCardHeading}>
                <Feather name="map-pin" size={18} color="#2E67BE" />
                <Text style={styles.actionCardTitle}>Visits</Text>
              </View>
              <Text style={styles.actionCardHelp}>
                Start a visit with Visit In. Use Visit Out when it ends.
              </Text>
              <View style={styles.actionRow}>
                {visitActions.map(renderAction)}
              </View>
            </View>
          )}
        </View>
      )}
      <ModalWithBlur
        visible={!!selected}
        overlay={<AppToastHost ref={visitToastHost} />}
        contentHeight={
          (selected === "CHECK_IN" || selected === "VISIT_IN") && locationPickerOpen ? "75%" : undefined
        }
        onClose={() => {
          if (!busy) {
            setLocationPickerOpen(false);
            setSelected(undefined);
          }
        }}
      >
        <Text style={styles.title}>{selected ? labels[selected] : ""}</Text>
        {(selected === "CHECK_IN" || selected === "VISIT_IN") &&
          (sites.isError ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void sites.refetch()}
            >
              <Text style={styles.siteHelp}>
                {(sites.error as any)?.response?.data?.message || "Could not load attendance locations."} Tap to retry.
              </Text>
            </Pressable>
          ) : sites.isPending ? (
            <ActivityIndicator accessibilityLabel="Loading attendance locations" />
          ) : !sites.data?.length ? (
            <Text style={styles.siteHelp}>
              No allowed attendance locations are configured. Contact your administrator.
            </Text>
          ) : (
            <Dropdown
              style={[styles.input, styles.locationPicker]}
              containerStyle={styles.locationMenu}
              placeholderStyle={styles.sitePlaceholder}
              selectedTextStyle={styles.siteSelection}
              data={sites.data}
              labelField="displayName"
              valueField="_id"
              value={siteId}
              mode="modal"
              onFocus={() => setLocationPickerOpen(true)}
              onBlur={() => setLocationPickerOpen(false)}
              onChange={(site) => setSiteId(site._id)}
              placeholder="Select attendance location"
              accessibilityLabel="Select attendance location"
              disable={busy}
              search
              searchPlaceholder="Search sales centers or office"
              maxHeight={Math.min(280, Math.round(windowHeight * 0.4))}
            />
          ))}
        {selected === "VISIT_OUT" && activeSiteVisitName && (
          <Text style={styles.siteHelp}>{activeSiteVisitName}</Text>
        )}
        {!officeActions.includes(selected as Action) && <TextInput
          editable={!busy}
          style={styles.input}
          placeholder={selected === "VISIT_OUT" && remarksRequired ? "Visit Out remarks (required)" : "Remarks (optional)"}
          value={remarks}
          onChangeText={setRemarks}
          placeholderTextColor="#94A3B8"
          maxLength={1000}
        />}
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirm"
            accessibilityState={{
              busy: loadingButton === "confirmVisit",
              disabled: busy || needsVisitLocation,
            }}
            disabled={busy || needsVisitLocation}
            style={styles.button}
            onPress={() => selected && void submit(selected)}
          >
            {loadingButton === "confirmVisit" ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Submitting…</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Confirm</Text>
            )}
          </Pressable>
          {selected === "VISIT_OUT" && canEndWithVisit && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="End workday too"
              accessibilityHint="Ends this visit and checks you out for the day."
              accessibilityState={{
                busy: loadingButton === "endWorkday",
                disabled: busy,
              }}
              disabled={busy}
              style={styles.button}
              onPress={() => void submit("VISIT_OUT", true)}
            >
              {loadingButton === "endWorkday" ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>Ending workday…</Text>
                </>
              ) : (
                <Text style={styles.buttonText}>End workday too</Text>
              )}
            </Pressable>
          )}
        </View>
        {selected === "VISIT_OUT" && canEndWithVisit && (
          <View style={styles.workdayHelp}>
            <Feather name="info" size={18} color="#2E67BE" style={styles.workdayHelpIcon} />
            <View style={styles.workdayHelpCopy}>
              <View style={styles.workdayHelpPoint}>
                <Text style={styles.workdayHelpBullet}>•</Text>
                <Text style={styles.workdayHelpText}>
                  <Text style={styles.workdayHelpLabel}>Confirm:</Text> Ends only this visit and keeps your workday open.
                </Text>
              </View>
              <View style={styles.workdayHelpPoint}>
                <Text style={styles.workdayHelpBullet}>•</Text>
                <Text style={styles.workdayHelpText}>
                  <Text style={styles.workdayHelpLabel}>End workday too:</Text> Ends this visit and checks you out for the day.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ModalWithBlur>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8, marginHorizontal: 12, marginTop: 12, marginBottom: 4 },
  actionGroups: { gap: 12 },
  actionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DBE5F2",
    backgroundColor: "#FFFFFF",
  },
  actionCardHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionCardTitle: { flex: 1, color: "#1E3A5F", fontSize: 15, fontWeight: "700" },
  actionCardHelp: { color: "#64748B", fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 12 },
  actionRow: { flexDirection: "row", alignItems: "stretch", gap: 10 },
  actionButton: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2E67BE",
  },
  siteHelp: { color: "#475569", marginBottom: 8 },
  locationPicker: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  locationMenu: { borderRadius: 12, borderColor: "#CBD5E1" },
  sitePlaceholder: { color: "#475569", fontSize: 14 },
  siteSelection: { color: "#0F172A", fontSize: 14, fontWeight: "600" },
  actionText: { fontSize: 13, textAlign: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  workdayHelp: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  workdayHelpIcon: { marginTop: 2 },
  workdayHelpCopy: { flex: 1, minWidth: 0, gap: 8 },
  workdayHelpPoint: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  workdayHelpBullet: { color: "#2E67BE", fontSize: 12, lineHeight: 18 },
  workdayHelpLabel: { color: "#1E3A5F", fontWeight: "600" },
  workdayHelpText: { flex: 1, color: "#475569", fontSize: 12, lineHeight: 18 },
  button: {
    flexGrow: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 10,
    backgroundColor: "#2E67BE",
  },
  blocked: { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" },
  blockedText: { color: "#475569" },
  buttonText: { color: "#FFFFFF", fontWeight: "600", flexShrink: 1, textAlign: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
  },
});
