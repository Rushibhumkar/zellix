import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import { selectUser } from "../../redux/userSlice";
import { useAppToast } from "../../components/AppToast";
import { getAttendancePermissions, saveAttendancePermissions } from "../../services/hrmApi/attendanceSettingsApi";
import { AttendancePermissions, canManageAttendancePermissions, attendancePermissionActions, attendancePermissionDays, attendancePermissionExtras, attendanceRadiusDefaults, attendanceRadiusLabels, attendanceRadiusError } from "../../utils/attendancePermissions";

export default function AttendancePermissionsScreen() {
  const { user } = useSelector(selectUser);
  const allowed = canManageAttendancePermissions(user?.role);
  const navigation = useNavigation<any>(), queryClient = useQueryClient(), toast = useAppToast();
  const [draft, setDraft] = useState<AttendancePermissions | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [conflict, setConflict] = useState(false), [error, setError] = useState("");
  const [radii, setRadii] = useState({ officeRadiusMeters: "", visitRadiusMeters: "" });
  const invalidOfficeName = !draft?.permissions?.officeName?.trim() || draft.permissions.officeName.trim().length > 100;
  const invalidRadius = Object.values(radii).some(value => Boolean(attendanceRadiusError(value)));
  const lock = useRef(false), generation = useRef(0);
  const load = async () => {
    const current = ++generation.current;
    setLoading(true); setError("");
    try {
      const saved = await getAttendancePermissions();
      if (current === generation.current) {
        setDraft({ ...saved, permissions: { ...saved.permissions, officeName: saved.permissions.officeName ?? "Main Office",
          checkIn: { allowOffice: true, allowSalesCenters: false, ...saved.permissions.checkIn },
          visitIn: { allowOffice: false, allowSalesCenters: true, ...saved.permissions.visitIn } } }); setConflict(false);
        setRadii({ officeRadiusMeters: String(saved.permissions.officeRadiusMeters ?? attendanceRadiusDefaults.officeRadiusMeters),
          visitRadiusMeters: String(saved.permissions.visitRadiusMeters ?? attendanceRadiusDefaults.visitRadiusMeters) });
      }
    } catch (failure: any) {
      if (current === generation.current) { setDraft(null); setError(failure?.response?.data?.message || "Could not load attendance permissions. Please retry."); }
    } finally { if (current === generation.current) setLoading(false); }
  };
  useEffect(() => { if (allowed) void load(); return () => { generation.current++; }; }, [allowed, user?._id]);
  useEffect(() => navigation.addListener("beforeRemove", event => { if (lock.current) event.preventDefault(); }), [navigation]);
  const changeAction = (key: "checkIn" | "checkOut" | "visitIn" | "visitOut", field: "days" | "phone" | "biometric" | "allowOffice" | "allowSalesCenters", value: string | boolean) => {
    if (lock.current || conflict) return;
    setDraft(previous => previous && ({ ...previous, permissions: { ...previous.permissions, [key]: { ...previous.permissions[key], [field]: value } } }));
  };
  const change = (key: keyof AttendancePermissions["permissions"], value: any) => setDraft(previous => previous && ({ ...previous, permissions: { ...previous.permissions, [key]: value } }));
  const save = async () => {
    if (!allowed || !draft || lock.current || conflict || invalidRadius || invalidOfficeName) return;
    const current = generation.current;
    lock.current = true; setSaving(true); setError("");
    try {
      await saveAttendancePermissions({ ...draft, permissions: { ...draft.permissions,
        officeName: draft.permissions.officeName.trim(), officeRadiusMeters: Number(radii.officeRadiusMeters), visitRadiusMeters: Number(radii.visitRadiusMeters) } });
      if (current !== generation.current) return;
      await Promise.allSettled(["attendanceAdminSettings", "getAllAttendance", "getIssueAttendance", "getAttendanceChart"].map(key => queryClient.invalidateQueries({ queryKey: [key] })));
      if (current !== generation.current) return;
      toast.success("Attendance permissions saved."); lock.current = false; navigation.goBack();
    } catch (failure: any) {
      if (current !== generation.current) return;
      setError(failure?.response?.data?.message || "Could not save permissions. Your changes have not been saved.");
      setConflict(failure?.response?.status === 409);
    } finally { lock.current = false; if (current === generation.current) setSaving(false); }
  };
  const toggle = (label: string, value: boolean, onChange: (next: boolean) => void) => <View style={styles.toggleRow}>
    <Text style={styles.label}>{label}</Text><Switch accessibilityLabel={label} value={value} onValueChange={onChange} disabled={saving || conflict} trackColor={{ false: "#CBD5E1", true: "#2E67BE" }} thumbColor="#fff" />
  </View>;
  return <ContainerHRM isBAck={{ title: "Attendance Permissions" }} childStyle={{ flex: 1, height: undefined }}>
    {!allowed ? <Text style={styles.error}>Only Super Admins and Sub Admins can manage attendance permissions.</Text> : <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.info}><Feather name="shield" size={20} color="#2E67BE" /><Text style={styles.help}>Company-wide settings · Dubai time. Existing sessions retain previously allowed closing methods when days or permissions change. Phone location access is still required.</Text></View>
        {loading && <ActivityIndicator accessibilityLabel="Loading saved permissions" size="large" color="#2E67BE" />}
        {!!error && <View accessibilityRole="alert"><Text style={styles.error}>{error}</Text>{(!draft || conflict) && <Pressable disabled={saving} onPress={load}><Text style={styles.link}>{conflict ? "Reload saved settings" : "Retry"}</Text></Pressable>}</View>}
        {draft && !loading && <>
          {attendancePermissionActions.map(([key, label]) => <View key={key} style={styles.section}>
            <Text style={styles.heading}>{label}</Text><Text style={styles.help}>Allowed days</Text>
            <View accessibilityRole="radiogroup" style={styles.choices}>{attendancePermissionDays.map(([value, text]) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: draft.permissions[key].days === value, disabled: saving || conflict }} accessibilityLabel={`${label}: ${text}`} disabled={saving || conflict} key={value} onPress={() => changeAction(key, "days", value)} style={[styles.choice, draft.permissions[key].days === value && styles.selected]}><Text style={draft.permissions[key].days === value ? styles.selectedText : styles.help}>{text}</Text></Pressable>)}</View>
            {toggle(`${label}: allow phone`, draft.permissions[key].phone, value => changeAction(key, "phone", value))}
            {["checkIn", "visitIn"].includes(key) && <View style={styles.extra}>
              <Text style={styles.help}>Allowed phone locations · action stays {label}.</Text>
              {toggle(`${label}: allow office`, draft.permissions[key].allowOffice === true, value => changeAction(key, "allowOffice", value))}
              {toggle(`${label}: allow sales centers`, draft.permissions[key].allowSalesCenters === true, value => changeAction(key, "allowSalesCenters", value))}
            </View>}
            {key.startsWith("check") ? toggle(`${label}: allow biometric`, draft.permissions[key].biometric, value => changeAction(key, "biometric", value)) : <Text style={styles.help}>Visits use a phone and a selected sales center. Biometric visits are not supported.</Text>}
          </View>)}
          <View style={styles.section}><Text style={styles.heading}>General controls</Text>
            <Text style={styles.label}>Office location name</Text>
            <TextInput accessibilityLabel="Office location name" value={draft.permissions.officeName} editable={!saving && !conflict} maxLength={100}
              onChangeText={officeName => change("officeName", officeName)} style={{ borderWidth: 1, borderColor: invalidOfficeName ? "#B42318" : "#CBD5E1", padding: 12, borderRadius: 8, color: "#1D2939" }} />
            {invalidOfficeName && <Text style={styles.error}>Enter an office name (1–100 characters).</Text>}
            {toggle("Auto approve attendance", draft.autoApprove, autoApprove => setDraft(previous => previous && ({ ...previous, autoApprove })))}
            {attendancePermissionExtras.map(([key, label, help]) => {
              const radiusKey = key === "requireOfficeGeofence" ? "officeRadiusMeters" : key === "requireVisitGeofence" ? "visitRadiusMeters" : null;
              return <View key={key} style={styles.extra}>{toggle(label, draft.permissions[key], value => change(key, value))}<Text style={styles.help}>{help}</Text>
                {radiusKey && <View style={{ marginTop: 10, gap: 4 }}>
                  <Text style={styles.label}>{attendanceRadiusLabels[radiusKey]}</Text>
                  <TextInput accessibilityLabel={attendanceRadiusLabels[radiusKey]} keyboardType="number-pad" value={radii[radiusKey]}
                    editable={!saving && !conflict}
                    onChangeText={value => { if (!lock.current && !conflict && /^[0-9]*$/.test(value)) setRadii(previous => ({ ...previous, [radiusKey]: value })); }}
                    style={{ borderWidth: 1, borderColor: attendanceRadiusError(radii[radiusKey]) ? "#B42318" : "#CBD5E1", borderRadius: 8, padding: 12, color: "#1D2939", backgroundColor: "white" }} />
                  {attendanceRadiusError(radii[radiusKey]) ? <Text accessibilityRole="alert" style={styles.error}>{attendanceRadiusError(radii[radiusKey])}</Text>
                    : <Text style={styles.help}>Digits only · 1–10,000 m. Saved radius is used when this geofence is enabled.</Text>}
                </View>}
              </View>;
            })}
            <Text style={[styles.help, { marginTop: 12 }]}>Existing attendance history and the nine-hour rule are unchanged. Duplicate punches and unauthorized actions remain blocked.</Text>
          </View>
        </>}
      </ScrollView>
      <View style={styles.footer}><Pressable accessibilityRole="button" disabled={saving} onPress={() => navigation.goBack()} style={styles.cancel}><Text style={styles.link}>Cancel</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !draft || loading || saving || conflict || invalidRadius || invalidOfficeName, busy: saving }} disabled={!draft || loading || saving || conflict || invalidRadius || invalidOfficeName} onPress={save} style={[styles.save, (!draft || loading || saving || conflict || invalidRadius || invalidOfficeName) && { opacity: 0.5 }]}><Text style={styles.saveText}>{saving ? "Saving…" : "Save permissions"}</Text></Pressable></View>
    </>}
  </ContainerHRM>;
}
const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 24, gap: 14 }, info: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  section: { padding: 14, borderWidth: 1, borderColor: "#DCE6F3", borderRadius: 14, backgroundColor: "#F8FAFC", gap: 8 },
  heading: { fontSize: 17, fontWeight: "700", color: "#2E67BE" }, label: { flex: 1, fontSize: 14, color: "#1D2939" },
  help: { flexShrink: 1, fontSize: 12, color: "#667085", lineHeight: 18 }, toggleRow: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 6 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, choice: { padding: 10, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10 }, selected: { borderColor: "#2E67BE", backgroundColor: "#EAF1FF" },
  selectedText: { fontSize: 12, color: "#245AA9", fontWeight: "600" }, extra: { borderTopWidth: 1, borderColor: "#DCE6F3", paddingTop: 8 },
  error: { color: "#B42318", fontSize: 13, paddingVertical: 8 }, link: { color: "#2E67BE", fontWeight: "600" },
  footer: { padding: 12, flexDirection: "row", gap: 12, borderTopWidth: 1, borderColor: "#DCE6F3", backgroundColor: "white" }, cancel: { padding: 12, justifyContent: "center" },
  save: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#2E67BE", alignItems: "center" }, saveText: { color: "white", fontWeight: "700" },
});
