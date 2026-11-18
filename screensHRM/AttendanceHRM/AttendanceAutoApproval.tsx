import React, { useRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendanceSettings, setAttendanceAutoApproval, setMobileOfficePunch, setWeekendSitePunch } from "../../services/hrmApi/attendanceSettingsApi";
import { canManageAttendanceAutoApproval, isAutoApprovalEnabled } from "../../utils/attendanceAutoApproval";
import { useAppToast } from "../../components/AppToast";

export const attendanceSettingsKey = ["attendanceAdminSettings"];

const settingActions = {
  approval: setAttendanceAutoApproval,
  mobileOffice: setMobileOfficePunch,
  weekendSite: setWeekendSitePunch,
};
type Setting = keyof typeof settingActions;

const AttendanceAutoApproval = ({ role, userId }: { role?: string; userId?: string }) => {
  const allowed = Boolean(userId) && canManageAttendanceAutoApproval(role);
  const canManagePunchSettings = role === "sup_admin";
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
    mutationFn: ({ setting, enabled }: { setting: Setting; enabled: boolean }) =>
      settingActions[setting](enabled),
    onSuccess: (data, { setting }) => {
      queryClient.setQueryData(key, data);
      if (setting === "approval") {
        void queryClient.invalidateQueries({ queryKey: ["getAllAttendance"] });
        void queryClient.invalidateQueries({ queryKey: ["getIssueAttendance"] });
        void queryClient.invalidateQueries({ queryKey: ["getAttendanceChart"] });
      }
      toast.success("Attendance setting updated.");
    },
    onError: (error: any) => {
      const message = error?.response?.data;
      toast.error(typeof message === "string" ? message : message?.message || error?.message || "Unable to update attendance settings");
    },
  });
  if (!allowed) return null;
  const busy = settings.isFetching || mutation.isPending;
  const ready = typeof settings.data?.approveBasedAttendance === "boolean" && !settings.isError;
  const mobileOfficeReady = ready && typeof settings.data?.mobileOfficePunchEnabled === "boolean";
  const weekendSiteReady = ready && typeof settings.data?.weekendSitePunchEnabled === "boolean";
  const toggle = async (setting: Setting, enabled: boolean) => {
    if (setting === "mobileOffice" && (!canManagePunchSettings || !mobileOfficeReady)) return;
    if (setting === "weekendSite" && (!canManagePunchSettings || !weekendSiteReady)) return;
    if (!allowed || !ready || busy || lock.current) return;
    lock.current = true;
    try { await mutation.mutateAsync({ setting, enabled }); }
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
        <Switch
          accessibilityLabel="Auto Approve Attendance"
          value={ready && isAutoApprovalEnabled(settings.data!.approveBasedAttendance)}
          disabled={!ready || busy}
          onValueChange={enabled => void toggle("approval", enabled)}
          trackColor={{ false: "#CBD5E1", true: "#2E67BE" }}
          thumbColor="#FFFFFF"
        />
      </View>
      {canManagePunchSettings && <View style={[styles.row, styles.officeRow]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.title}>Allow Office Punches from Mobile</Text>
          <Text style={styles.subtitle}>{mobileOfficeReady
            ? (settings.data?.mobileOfficePunchEnabled ? "Employees can use the app for office punches" : "Employees use the office attendance machine")
            : "Setting unavailable"}</Text>
        </View>
        <Switch
          accessibilityLabel="Allow Office Punches from Mobile"
          value={settings.data?.mobileOfficePunchEnabled === true}
          disabled={!mobileOfficeReady || busy}
          onValueChange={enabled => void toggle("mobileOffice", enabled)}
          trackColor={{ false: "#CBD5E1", true: "#2E67BE" }}
          thumbColor="#FFFFFF"
        />
      </View>}
      {canManagePunchSettings && <View style={[styles.row, styles.officeRow]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.title}>Restrict Site Punches to Weekends</Text>
          <Text style={styles.subtitle}>{weekendSiteReady ? (settings.data?.weekendSitePunchEnabled ? "Saturday and Sunday (Dubai time)" : "Available every day") : "Setting unavailable"}</Text>
        </View>
        <Switch
          accessibilityLabel="Restrict Site Punches to Weekends"
          value={settings.data?.weekendSitePunchEnabled === true}
          disabled={!weekendSiteReady || busy}
          onValueChange={enabled => void toggle("weekendSite", enabled)}
          trackColor={{ false: "#CBD5E1", true: "#2E67BE" }}
          thumbColor="#FFFFFF"
        />
      </View>}
      {busy && <ActivityIndicator size="small" color="#2E67BE" style={styles.saving} />}
      {settings.isError && <Pressable accessibilityRole="button" onPress={() => settings.refetch()} disabled={busy}>
        <Text style={styles.error}>Unable to load setting. Tap to retry.</Text>
      </Pressable>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#DCE6F3", backgroundColor: "#F8FAFC", borderRadius: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  saving: { alignSelf: "flex-end", marginTop: 8 },
  officeRow: { borderTopWidth: 1, borderTopColor: "#DCE6F3", marginTop: 10, paddingTop: 10 },
  title: { color: "#1D2939", fontSize: 14, fontWeight: "600" },
  subtitle: { color: "#667085", fontSize: 12, marginTop: 3 },
  error: { color: "#B42318", fontSize: 12, marginTop: 6 },
});
export default AttendanceAutoApproval;
