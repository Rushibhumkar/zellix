import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import moment from "moment";
import ModalWithBlur from "../ModalWithBlur/ModalWithBlur";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";

export type HRMFilterValues = Record<string, string>;
export type HRMFilterKind = "users" | "attendance" | "leaves" | "interview";
type Field = { key: string; label: string; options: [string, string][] };
const fields: Record<HRMFilterKind, Field[]> = {
  users: [
    { key: "userStatus", label: "Account status", options: [["", "All"], ["active", "Active"], ["inactive", "Inactive"], ["resigned", "Resigned"], ["terminated", "Terminated"]] },
    { key: "status", label: "Approval status", options: [["", "All"], ["new", "New"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]] },
  ],
  attendance: [{ key: "status", label: "Attendance status", options: [["", "All"], ["present", "Present"], ["absent", "Absent"], ["leave", "Leave"], ["halfDay", "Half Day"]] }],
  leaves: [
    { key: "payType", label: "Pay type", options: [["", "All"], ["paid", "Paid"], ["unpaid", "Unpaid"]] },
    { key: "status", label: "Leave status", options: [["", "All"], ["pending", "Pending"], ["approved", "Approved"], ["forwarded", "Forwarded"], ["rejected", "Rejected"], ["cancel", "Cancelled"]] },
    { key: "today", label: "Leave dates", options: [["", "All dates"], ["true", "On leave today"]] },
  ],
  interview: [{ key: "status", label: "Interview status", options: [["", "All"], ["scheduled", "Scheduled"], ["reschedule", "Rescheduled"], ["selected", "Selected"], ["rejected", "Rejected"], ["notComing", "Not Coming"], ["postInterview", "Post Interview"]] }],
};
export const hrmFilterCount = (values: HRMFilterValues) => Object.values(values).filter(Boolean).length;

export default function HRMFilters({ visible, onClose, kind, values, onApply }: {
  visible: boolean; onClose: () => void; kind: HRMFilterKind;
  values: HRMFilterValues; onApply: (values: HRMFilterValues) => void;
}) {
  const [draft, setDraft] = useState<HRMFilterValues>({});
  useEffect(() => { if (visible) setDraft({ ...values }); }, [visible, values]);
  const todayOnly = kind === "leaves" && draft.today === "true";
  const dates = kind === "attendance" || kind === "interview";
  const invalidDates = !!(draft.startDate && draft.endDate && draft.startDate > draft.endDate);
  const change = (key: string, value: string) => setDraft((previous) => ({
    ...previous, [key]: value,
    ...(key === "today" ? { status: value === "true" ? "approved" : "", startDate: "", endDate: "" } : {}),
  }));
  return <ModalWithBlur visible={visible} onClose={onClose} contentHeight="82%" scrollableContent>
    <Text style={{ fontSize: 21, fontWeight: "700", color: "#1E293B", marginBottom: 6 }}>Filters</Text>
    <Text style={{ color: "#64748B", fontSize: 13, marginBottom: 18 }}>Choose filters, then tap Apply to update the list.</Text>
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}>
      {fields[kind].map((field) => <View key={field.key} style={{ marginBottom: 22 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 10 }}>{field.label}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {field.options.map(([value, label]) => {
            const selected = (draft[field.key] || "") === value;
            const disabled = todayOnly && field.key === "status";
            return <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => change(field.key, value)} style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: selected ? "#2E67BE" : "#E2E8F0", backgroundColor: selected ? "#EFF6FF" : "#FFFFFF", opacity: disabled && !selected ? 0.45 : 1 }}>
              <Text style={{ fontSize: 13, color: selected ? "#2E67BE" : "#475569", fontWeight: selected ? "700" : "400" }}>{label}</Text>
            </Pressable>;
          })}
        </View>
      </View>)}
      {todayOnly && <Text style={{ color: "#64748B", marginBottom: 16 }}>Shows approved leaves covering today.</Text>}
      {dates && !todayOnly && <View>
        <View style={{ marginBottom: 16 }}><DatePickerExpo title="Start Date" initialValue={draft.startDate || undefined} onSelect={(value) => change("startDate", value ? moment(value).format("YYYY-MM-DD") : "")} /></View>
        <View><DatePickerExpo title="End Date" initialValue={draft.endDate || undefined} onSelect={(value) => change("endDate", value ? moment(value).format("YYYY-MM-DD") : "")} /></View>
        {invalidDates && <Text accessibilityRole="alert" style={{ color: "#B45309", marginTop: 10 }}>End date must be on or after start date.</Text>}
      </View>}
    </ScrollView>
    <View style={{ flexDirection: "row", gap: 12, paddingTop: 16, borderTopWidth: 1, borderColor: "#E2E8F0" }}>
      <Pressable accessibilityRole="button" onPress={() => setDraft({})} style={{ flex: 1, alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#CBD5E1" }}><Text style={{ color: "#475569", fontWeight: "600" }}>Clear all</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={invalidDates} onPress={() => { onApply(Object.fromEntries(Object.entries(draft).filter(([, value]) => value))); onClose(); }} style={{ flex: 1, alignItems: "center", padding: 14, borderRadius: 12, backgroundColor: "#2E67BE", opacity: invalidDates ? 0.5 : 1 }}><Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Apply filters</Text></Pressable>
    </View>
  </ModalWithBlur>;
}
