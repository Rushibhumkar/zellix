import { useAppToast } from "../../components/AppToast";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { axiosInstance } from "../../services/authApi/axiosInstance";
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
  VISIT_IN: "Field visit started.",
  VISIT_OUT: "Field visit ended.",
};
type Action = keyof typeof labels;
const actions = Object.keys(labels) as Action[];
const endpoint = "/api/hrms/att/remotePunch";

export default function CheckInOut({ showInitialLoader = true, onLoadError, retryVersion }: {
  showInitialLoader?: boolean;
  onLoadError: (failed: boolean) => void;
  retryVersion: number;
}) {
  const [availability, setAvailability] =
    useState<Record<Action, string | null>>();
  const [canEndWithVisit, setCanEndWithVisit] = useState(false);
  const [selected, setSelected] = useState<Action>();
  const [remarks, setRemarks] = useState("");
  const [loadingButton, setLoadingButton] = useState<
    Action | "confirmVisit" | "endWorkday"
  >();
  const busy = loadingButton !== undefined;
  const [loadFailed, setLoadFailed] = useState(false);
  const toast = useAppToast();
  const request = useRef<{ action: Action; id: string } | undefined>(undefined);
  const submitting = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(endpoint);
      setAvailability(data.actions);
      setCanEndWithVisit(data.canEndWorkdayWithVisit === true);
      setLoadFailed(false);
      onLoadError(false);
    } catch {
      setLoadFailed(true);
      onLoadError(true);
    }
  }, [onLoadError]);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh, retryVersion]),
  );

  async function submit(action: Action, endWorkday = false) {
    if (submitting.current) return;
    submitting.current = true;
    setLoadingButton(
      endWorkday
        ? "endWorkday"
        : action.startsWith("VISIT_")
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
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (request.current?.action !== action)
        request.current = {
          action,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        };
      const { data } = await axiosInstance.post(endpoint, {
        action,
        endWorkday,
        remarks: action.startsWith("VISIT_") ? remarks : undefined,
        requestId: request.current.id,
        coor: {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        },
      });
      request.current = undefined;
      setAvailability(data.actions);
      setCanEndWithVisit(data.canEndWorkdayWithVisit === true);
      setSelected(undefined);
      setRemarks("");
      toast.success(
        endWorkday
          ? "Field visit ended and workday closed."
          : successMessages[action],
      );
    } catch (error: any) {
      const body = error?.response?.data;
      const message = typeof body === "string" ? body : body?.message;
      setSelected(undefined);
      toast.error(
        typeof message === "string" && message.trim()
          ? message
          : `Could not complete ${labels[action]}. Check your connection and location, then retry.`,
      );
      void refresh();
    } finally {
      submitting.current = false;
      setLoadingButton(undefined);
    }
  }

  return (
    <View style={styles.wrapper}>
      {!availability && !loadFailed && showInitialLoader && (
        <ActivityIndicator color="#2E67BE" accessibilityLabel="Loading attendance actions" />
      )}
      <View style={styles.actionRow}>
        {actions.map((action) => {
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
                else if (action.startsWith("VISIT_")) setSelected(action);
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
        })}
      </View>
      <ModalWithBlur
        visible={!!selected}
        onClose={() => {
          if (!busy) setSelected(undefined);
        }}
      >
        <Text style={styles.title}>{selected ? labels[selected] : ""}</Text>
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
              disabled: busy,
            }}
            disabled={busy}
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
              onPress={() => void submit("VISIT_OUT", true)}
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
