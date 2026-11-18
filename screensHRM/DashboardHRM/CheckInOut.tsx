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
import * as Location from "expo-location";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import { Dropdown } from "react-native-element-dropdown";
import { useQuery } from "@tanstack/react-query";
import { getVisitPunchLocations } from "../../services/hrmApi/siteVisitLocationsApi";
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

export default function CheckInOut({ showInitialLoader = true, onLoadError, retryVersion }: {
  showInitialLoader?: boolean;
  onLoadError: (failed: boolean) => void;
  retryVersion: number;
}) {
  const [availability, setAvailability] =
    useState<Partial<Record<Action, string | null>>>();
  const [officePunchEnabled, setOfficePunchEnabled] = useState(false);
  const [canEndWithVisit, setCanEndWithVisit] = useState(false);
  const [selected, setSelected] = useState<Action>();
  const [siteVisitAvailable, setSiteVisitAvailable] = useState(false);
  const [activeSiteVisitName, setActiveSiteVisitName] = useState<string>();
  const [siteId, setSiteId] = useState<string>();
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const sites = useQuery({
    queryKey: ["visitPunchLocations"],
    queryFn: getVisitPunchLocations,
    staleTime: 60_000,
    enabled: selected === "VISIT_IN" && siteVisitAvailable,
  });
  const [remarks, setRemarks] = useState("");
  const [loadingButton, setLoadingButton] = useState<
    Action | "confirmVisit" | "endWorkday"
  >();
  const busy = loadingButton !== undefined;
  const [loadFailed, setLoadFailed] = useState(false);
  const toast = useAppToast();
  const visitToastHost = useRef<AppToastHostHandle>(null);
  const request = useRef<{ action: Action; id: string; siteId?: string } | undefined>(undefined);
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
      setOfficePunchEnabled(data.mobileOfficePunchEnabled === true);
      setSiteVisitAvailable(data.siteVisitAvailable === true);
      setActiveSiteVisitName(data.activeSiteVisitName);
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
    if (submitting.current || (officeActions.includes(action) ? !officePunchEnabled : !siteVisitAvailable) ||
        (action === "VISIT_IN" && !sites.data?.some(site => site._id === siteId))) return;
    submitting.current = true;
    setLoadingButton(
      endWorkday
        ? "endWorkday"
        : !officeActions.includes(action)
          ? "confirmVisit"
          : action,
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
      if (!await Location.hasServicesEnabledAsync()) {
        Alert.alert("Turn on location", "Enable location services on your phone and try again.");
        return;
      }
      let coords: Location.LocationObjectCoords;
      try {
        ({ coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }));
      } catch {
        toast.error("Could not get your location. Move to an open area and try again.", {},
          officeActions.includes(action) ? null : visitToastHost.current);
        return;
      }
      if (request.current?.action !== action || request.current.siteId !== siteId)
        request.current = {
          action,
          siteId,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        };
      const { data } = await axiosInstance.post(endpoint, {
        action,
        ...(action === "VISIT_IN" && { siteId }),
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
      setOfficePunchEnabled(data.mobileOfficePunchEnabled === true);
      setSiteVisitAvailable(data.siteVisitAvailable === true);
      setActiveSiteVisitName(data.activeSiteVisitName);
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
        setSelected(undefined);
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
        officeActions.includes(action) || body?.code === "SITE_VISIT_WEEKEND_ONLY" ? null : visitToastHost.current,
      );
      void refresh();
    } finally {
      submitting.current = false;
      setLoadingButton(undefined);
    }
  }

  const needsVisitLocation = selected === "VISIT_IN" && !sites.data?.some(site => site._id === siteId);

  const renderAction = (action: Action) => {
    const reason = availability?.[action];
    return (
      <Pressable
        key={action}
        accessibilityRole="button"
        accessibilityLabel={labels[action]}
        accessibilityState={{
          busy: loadingButton === action,
          disabled: busy || !availability,
        }}
        accessibilityHint={reason || undefined}
        disabled={busy || !availability}
        style={[
          styles.button,
          styles.actionButton,
          !!reason && styles.blocked,
        ]}
        onPress={() => {
          if (reason) toast.error(reason);
          else if (!officeActions.includes(action)) {
            setLocationPickerOpen(false);
            setSiteId(undefined);
            setRemarks("");
            setSelected(action);
          }
          else void submit(action);
        }}
      >
        {loadingButton === action ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            style={[
              styles.buttonText,
              styles.actionText,
              !!reason && styles.blockedText,
            ]}
          >
            {labels[action]}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.wrapper}>
      {!availability && !loadFailed && showInitialLoader && (
        <ActivityIndicator color="#2E67BE" accessibilityLabel="Loading attendance actions" />
      )}
      {(officePunchEnabled || siteVisitAvailable) && (
        <View style={styles.actionRow}>
          {officePunchEnabled && officeActions.map(renderAction)}
          {siteVisitAvailable && visitActions.map(renderAction)}
        </View>
      )}
      <ModalWithBlur
        visible={!!selected && siteVisitAvailable}
        overlay={<AppToastHost ref={visitToastHost} />}
        contentHeight={selected === "VISIT_IN" && locationPickerOpen ? "75%" : undefined}
        onClose={() => {
          if (!busy) {
            setLocationPickerOpen(false);
            setSelected(undefined);
          }
        }}
      >
        <Text style={styles.title}>{selected ? labels[selected] : ""}</Text>
        {selected === "VISIT_IN" && (
          sites.isError ? (
            <Pressable accessibilityRole="button" onPress={() => void sites.refetch()}>
              <Text style={styles.siteHelp}>Could not load visit locations. Tap to retry.</Text>
            </Pressable>
          ) : sites.isPending ? <ActivityIndicator accessibilityLabel="Loading visit locations" /> :
          !sites.data?.length ? <Text style={styles.siteHelp}>No developer locations or sales centers with coordinates are available.</Text> :
          <Dropdown
            style={[styles.input, styles.locationPicker]}
            containerStyle={styles.locationMenu}
            placeholderStyle={styles.sitePlaceholder}
            selectedTextStyle={styles.siteSelection}
            data={sites.data}
            labelField="name"
            valueField="_id"
            value={siteId}
            mode="modal"
            onFocus={() => setLocationPickerOpen(true)}
            onBlur={() => setLocationPickerOpen(false)}
            onChange={site => setSiteId(site._id)}
            placeholder="Select a visit location"
            accessibilityLabel="Select a developer location or sales center"
            disable={busy}
            search
            searchPlaceholder="Search developers or sales centers"
            maxHeight={Math.min(280, Math.round(windowHeight * 0.4))}
          />
        )}
        {selected === "VISIT_OUT" && activeSiteVisitName && <Text style={styles.siteHelp}>{activeSiteVisitName}</Text>}
        <TextInput
          editable={!busy}
          style={styles.input}
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Remark (optional)"
          placeholderTextColor="#94A3B8"
          maxLength={1000}
        />
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
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirm</Text>
            )}
          </Pressable>
          {selected === "VISIT_OUT" && canEndWithVisit && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="End workday too"
              accessibilityState={{
                busy: loadingButton === "endWorkday",
                disabled: busy,
              }}
              disabled={busy}
              style={styles.button}
              onPress={() => void submit(selected, true)}
            >
              {loadingButton === "endWorkday" ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>End workday too</Text>
              )}
            </Pressable>
          )}
        </View>
      </ModalWithBlur>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8, marginHorizontal: 12, marginTop: 12, marginBottom: 4 },
  actionRow: { flexDirection: "row", alignItems: "stretch", gap: 6 },
  actionButton: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2E67BE",
  },
  siteHelp: { color: "#475569", marginBottom: 8 },
  locationPicker: { minHeight: 48, borderRadius: 12, backgroundColor: "#F8FAFC" },
  locationMenu: { borderRadius: 12, borderColor: "#CBD5E1" },
  sitePlaceholder: { color: "#475569", fontSize: 14 },
  siteSelection: { color: "#0F172A", fontSize: 14, fontWeight: "600" },
  actionText: { fontSize: 13, textAlign: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 10,
    backgroundColor: "#2E67BE",
  },
  blocked: { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" },
  blockedText: { color: "#475569" },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
  },
});
