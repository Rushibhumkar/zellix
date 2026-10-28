import React, { useRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendanceSettings, setAttendanceAutoApproval } from "../../services/hrmApi/attendanceSettingsApi";
import { canManageAttendanceAutoApproval, isAutoApprovalEnabled } from "../../utils/attendanceAutoApproval";
import { useAppToast } from "../../components/AppToast";

export const attendanceSettingsKey = ["attendanceAdminSettings"];

const AttendanceAutoApproval = ({ role, userId }: { role?: string; userId?: string }) => {
  const allowed = Boolean(userId) && canManageAttendanceAutoApproval(role);
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const lock = useRef(false);
  const key = [...attendanceSettingsKey, userId];
  const settings = useQuery({
    queryKey: key,
    queryFn: getAttendanceSettings,
    enabled: allowed,
    retry: false,
    staleTime: 0,
  });
  const mutation = useMutation({
    mutationFn: setAttendanceAutoApproval,
    onSuccess: data => {
      queryClient.setQueryData(key, data);
      // Refresh related views without pretending existing records were bulk-approved.
      void queryClient.invalidateQueries({ queryKey: ["getAllAttendance"] });
      void queryClient.invalidateQueries({ queryKey: ["getIssueAttendance"] });
      void queryClient.invalidateQueries({ queryKey: ["getAttendanceChart"] });
      toast.success("Attendance auto approval updated");
    },
    onError: (error: any) => {
      const message = error?.response?.data;
      toast.error(typeof message === "string" ? message : message?.message || error?.message || "Unable to update attendance settings");
    },
  });
  if (!allowed) return null;
  const busy = settings.isFetching || mutation.isPending;
  const ready = typeof settings.data?.approveBasedAttendance === "boolean" && !settings.isError;
  const toggle = async (enabled: boolean) => {
    if (!allowed || !ready || busy || lock.current) return;
    lock.current = true;
    try { await mutation.mutateAsync(enabled); }
    catch { /* Error toast is handled by onError; keep the saved switch value. */ }
    finally { lock.current = false; }
  };
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.title}>Auto Approve Attendance</Text>
          <Text style={styles.subtitle}>{ready ? (isAutoApprovalEnabled(settings.data!.approveBasedAttendance) ? "Automatic approval is on" : "Manual approval required") : settings.isError ? "Setting unavailable" : "Loading saved setting…"}</Text>
        </View>
        {busy && <ActivityIndicator size="small" color="#2E67BE" style={{ marginRight: 8 }} />}
        {ready && <Switch
          accessibilityLabel="Auto Approve Attendance"
          value={isAutoApprovalEnabled(settings.data!.approveBasedAttendance)}
          disabled={busy}
          onValueChange={toggle}
          trackColor={{ false: "#CBD5E1", true: "#2E67BE" }}
          thumbColor="#FFFFFF"
        />}
      </View>
      {settings.isError && <Pressable accessibilityRole="button" onPress={() => settings.refetch()} disabled={busy}>
        <Text style={styles.error}>Unable to load setting. Tap to retry.</Text>
      </Pressable>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#DCE6F3", backgroundColor: "#F8FAFC", borderRadius: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  title: { color: "#1D2939", fontSize: 14, fontWeight: "600" },
  subtitle: { color: "#667085", fontSize: 12, marginTop: 3 },
  error: { color: "#B42318", fontSize: 12, marginTop: 6 },
});
export default AttendanceAutoApproval;
