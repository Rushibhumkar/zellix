import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/userSlice";
import { axiosInstance } from "../services/authApi/axiosInstance";
import { meetingMessage } from "../utils/meetingLifecycle";
import {
  canManageMeetingReminders,
  MeetingReminderSettings,
  meetingReminderTimeLabel,
  parseMeetingReminderOffsets,
  reminderSettingsPayload,
} from "../utils/meetingReminderSettings";

// A single compact list row; the editor is mounted/fetched only when opened.
export default function MeetingReminderSettingsControl() {
  const { user } = useSelector(selectUser);
  const [open, setOpen] = useState(false);
  if (!canManageMeetingReminders(user?.role)) return null;
  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Meeting update reminders"
        onPress={() => setOpen(true)}
        style={styles.launcher}
      >
        <View style={styles.launcherIcon}>
          <Feather name="bell" size={16} color="#2E67BE" />
        </View>
        <Text style={styles.launcherText}>Meeting reminders</Text>
        <Text style={styles.launcherHint}>Settings</Text>
        <Feather name="chevron-right" size={16} color="#7D8CA3" />
      </TouchableOpacity>
      {open && (
        <ReminderSettingsSheet
          key={user._id}
          userId={user._id}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function ReminderSettingsSheet({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const client = useQueryClient();
  const key = ["meetingReminderSettings", userId];
  const query = useQuery({
    queryKey: key,
    queryFn: async ({ signal }): Promise<MeetingReminderSettings> =>
      (await axiosInstance.get("/api/meeting/settings", { signal })).data,
    staleTime: 0,
    refetchOnMount: "always",
    retry: (count, error: any) =>
      ![401, 403].includes(error?.response?.status) && count < 2,
  });
  const [draft, setDraft] = useState<MeetingReminderSettings | null>(null);
  const [offsets, setOffsets] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const mounted = useRef(true);
  const saving = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!draft && query.data && !query.isFetching && !query.error) {
      setDraft(query.data);
      setOffsets(query.data.offsets.join(", "));
    }
  }, [draft, query.data, query.isFetching, query.error]);
  const close = () => {
    if (!saving.current) onClose();
  };
  const clearMessage = () => {
    setMessage("");
    setSuccess(false);
  };
  let preview: number[] = [];
  try {
    preview = parseMeetingReminderOffsets(offsets);
  } catch {
    /* Keep incomplete typing editable. */
  }
  const save = async () => {
    if (!draft || saving.current) return;
    clearMessage();
    let payload: MeetingReminderSettings;
    try {
      payload = reminderSettingsPayload(offsets, draft.email, draft.push);
    } catch (error) {
      setMessage(meetingMessage(error));
      return;
    }
    saving.current = true;
    setBusy(true);
    try {
      const { data } = await axiosInstance.put(
        "/api/meeting/settings",
        payload,
      );
      client.setQueryData(key, data);
      if (mounted.current) {
        setDraft(data);
        setOffsets(data.offsets.join(", "));
        setSuccess(true);
        setMessage("Saved. Pending reminders use the new schedule.");
      }
    } catch (error) {
      if (mounted.current)
        setMessage(meetingMessage(error, "Unable to save reminder settings"));
    } finally {
      saving.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <Modal transparent visible animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close reminder settings"
          onPress={close}
        />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Meeting update reminders</Text>
              <Text style={styles.caption}>
                Office-wide settings · all meetings
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close"
              disabled={busy}
              onPress={close}
              style={styles.close}
            >
              <Feather name="x" size={21} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{ flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
          >
            <Text style={styles.description}>
              Notify the responsible person and original creator while a meeting
              remains open. Reminders stop once it is conducted or cancelled.
            </Text>
            {!draft && (query.isPending || query.isFetching) && (
              <View style={styles.loading}>
                <ActivityIndicator color="#2E67BE" />
                <Text style={styles.description}>Loading settings…</Text>
              </View>
            )}
            {!draft && !!query.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {meetingMessage(
                    query.error,
                    "Unable to load reminder settings",
                  )}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => query.refetch()}
                  style={styles.retry}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {draft && (
              <>
                <Text style={styles.label}>Reminder times (minutes)</Text>
                <TextInput
                  accessibilityLabel="Reminder times (minutes)"
                  value={offsets}
                  onChangeText={(text) => {
                    setOffsets(text);
                    clearMessage();
                  }}
                  editable={!busy}
                  autoCorrect={false}
                  autoCapitalize="none"
                  maxLength={100}
                  placeholder="0, 30, 120"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
                <Text style={styles.helper}>
                  Separate with commas. 0 means at meeting time.
                </Text>
                {preview.length > 0 && (
                  <View style={styles.preview}>
                    {preview.map((value) => (
                      <Text key={value} style={styles.chip}>
                        {meetingReminderTimeLabel(value)}
                      </Text>
                    ))}
                  </View>
                )}
                <Text style={[styles.label, { marginTop: 20 }]}>
                  Delivery channels
                </Text>
                <View style={styles.channels}>
                  {(["email", "push"] as const).map((channel) => (
                    <View key={channel} style={styles.channel}>
                      <Feather
                        name={channel === "email" ? "mail" : "smartphone"}
                        size={18}
                        color="#7395C5"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.channelTitle}>
                          {channel === "email" ? "Email" : "Push notification"}
                        </Text>
                        <Text style={styles.helper}>
                          {channel === "email"
                            ? "Send an email reminder"
                            : "Send to registered devices"}
                        </Text>
                      </View>
                      <Switch
                        accessibilityLabel={
                          channel === "email" ? "Email" : "Push"
                        }
                        value={draft[channel]}
                        disabled={busy}
                        onValueChange={(value) => {
                          setDraft(
                            (previous) =>
                              previous && { ...previous, [channel]: value },
                          );
                          clearMessage();
                        }}
                        trackColor={{ false: "#DCE5F2", true: "#93B9F8" }}
                        thumbColor={draft[channel] ? "#2E67BE" : "#fff"}
                      />
                    </View>
                  ))}
                </View>
                <Text style={[styles.description, { marginTop: 14 }]}>
                  Client reminders are managed separately.
                </Text>
              </>
            )}
            {!!message && (
              <View
                accessibilityRole="alert"
                style={[
                  styles.errorBox,
                  success && { backgroundColor: "#ECF9F0" },
                ]}
              >
                <Text
                  style={[styles.errorText, success && { color: "#268552" }]}
                >
                  {message}
                </Text>
              </View>
            )}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Save reminder settings"
              disabled={!draft || busy}
              onPress={save}
              style={[styles.save, (!draft || busy) && { opacity: 0.5 }]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Feather name="save" size={17} color="#fff" />
              )}
              <Text style={styles.saveText}>
                {busy ? "Saving…" : "Save reminder settings"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  launcher: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 42,
    marginHorizontal: 14,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#DFE9F7",
    backgroundColor: "#F7FAFF",
  },
  launcherIcon: { padding: 6, borderRadius: 8, backgroundColor: "#EAF2FF" },
  launcherText: { flex: 1, fontSize: 12, fontWeight: "600", color: "#365B8C" },
  launcherHint: { fontSize: 11, color: "#7D8CA3" },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.4)",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#DCE5F2",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFF3F8",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  caption: { fontSize: 11, color: "#8290A4", marginTop: 4 },
  close: { padding: 10 },
  body: { padding: 18 },
  description: { fontSize: 12, lineHeight: 18, color: "#7D8CA3" },
  loading: { padding: 26, alignItems: "center", gap: 12 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#CBD9ED",
    borderRadius: 10,
    fontSize: 15,
    color: "#334155",
  },
  helper: { fontSize: 11, lineHeight: 16, color: "#94A3B8", marginTop: 3 },
  preview: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: {
    backgroundColor: "#EDF4FF",
    color: "#2E67BE",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  channels: {
    borderWidth: 1,
    borderColor: "#E2EAF5",
    borderRadius: 12,
    overflow: "hidden",
  },
  channel: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  channelTitle: { color: "#334155", fontSize: 13, fontWeight: "500" },
  errorBox: {
    borderRadius: 10,
    backgroundColor: "#FFF1F1",
    padding: 12,
    marginTop: 12,
  },
  errorText: { fontSize: 12, lineHeight: 18, color: "#B91C1C" },
  retry: { alignSelf: "flex-start", paddingVertical: 10 },
  retryText: { color: "#2E67BE", fontSize: 12, fontWeight: "600" },
  save: {
    marginTop: 18,
    minHeight: 46,
    borderRadius: 11,
    backgroundColor: "#2E67BE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: { fontSize: 13, color: "#fff", fontWeight: "600" },
});
