import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../services/authApi/axiosInstance";
import { ROLE_OPTIONS } from "../../../utils/roles";
import { selectUser } from "../../../redux/userSlice";
import { bookingCommand, bookingError } from "../../../utils/bookingWorkflow";
import CustomBtn from "../../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../../myComponents/CustomInput/CustomInput";
import ModalWithBlur from "../../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
export default function RevenueShareSettings({ canManage }: { canManage: boolean }) {
  const {
    user
  } = useSelector(selectUser);
  const client = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const commands = useRef({});
  const admin = ["sup_admin", "sub_admin", "developer"].includes(user?.role);
  const settings = useQuery({
    queryKey: ["bookingShareSettings", user?._id],
    enabled: admin && canManage && visible,
    queryFn: () => axiosInstance.get("/api/booking/share-settings").then(response => response.data)
  });
  useEffect(() => {
    if (settings.data && visible) {
      setRules(settings.data.rules || []);
      setVersion(settings.data.__v || 0);
    }
  }, [settings.data, visible]);
  if (!admin || !canManage) return null;
  const update = (index: number, key: string, value: any) => setRules(current => current.map((row, i) => i === index ? {
    ...row,
    [key]: value
  } : row));
  async function save() {
    if (busy) return;
    setError("");
    const normalized = rules.map(rule => ({
      ...rule,
      minDeal: Number(rule.minDeal),
      maxDeal: Number(rule.maxDeal),
      percentage: Number(rule.percentage),
      minExperience: rule.minExperience === "" || rule.minExperience == null ? null : Number(rule.minExperience),
      maxExperience: rule.maxExperience === "" || rule.maxExperience == null ? null : Number(rule.maxExperience)
    }));
    if (normalized.some(rule => !rule.role || !Number.isFinite(rule.minDeal) || !Number.isFinite(rule.maxDeal) || rule.minDeal < 0 || rule.maxDeal <= rule.minDeal || !Number.isFinite(rule.percentage) || rule.percentage < 0 || rule.percentage > 100 || !(new Date(rule.effectiveFrom) < new Date(rule.effectiveUntil)))) {
      setError("Complete each rule with valid ranges, dates and a percentage from 0 to 100.");
      return;
    }
    setBusy(true);
    try {
      await axiosInstance.put("/api/booking/share-settings", bookingCommand(commands.current, "share-settings", {
        rules: normalized,
        expectedVersion: version
      }));
      void client.invalidateQueries({
        queryKey: ["bookingShareSettings"]
      });
      setVisible(false);
    } catch (error) {
      setError(bookingError(error));
    } finally {
      setBusy(false);
    }
  }
  return <View style={{
    margin: 12
  }}>
      <CustomBtn title="Revenue Share Settings" onPress={() => {
      setError("");
      setVisible(true);
    }} />
      <ModalWithBlur visible={visible} contentHeight="85%" scrollableContent onClose={() => {
      if (!busy) setVisible(false);
    }}>
        <Text style={{
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16
      }}>Revenue Share Settings</Text>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{
        gap: 18,
        paddingBottom: 24
      }}>
          {settings.isPending ? <ActivityIndicator /> : settings.isError ? <CustomBtn title="Retry loading settings" onPress={() => settings.refetch()} /> : <>
              {rules.map((rule, index) => <View key={rule.id} style={{
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 12,
            padding: 12,
            gap: 8
          }}>
                  <Dropdown style={{
              padding: 12
            }} data={[...ROLE_OPTIONS]} labelField="label" valueField="value" value={rule.role} mode="modal" disable={busy} onChange={row => update(index, "role", row.value)} placeholder="Select role" />
                  {[["minDeal", "Minimum property price"], ["maxDeal", "Maximum property price"], ["minExperience", "Minimum experience (optional)"], ["maxExperience", "Maximum experience (optional)"], ["percentage", "Share (%)"], ["effectiveFrom", "Effective from (YYYY-MM-DD)"], ["effectiveUntil", "Effective until (YYYY-MM-DD)"]].map(([key, label]) => <CustomInput key={key} label={label} value={String(rule[key] ?? "")} onChangeText={value => update(index, key, value)} props={{
              editable: !busy,
              keyboardType: key.startsWith("effective") ? "default" : "decimal-pad"
            }} />)}
                  <CustomBtn title="Remove rule" disabled={busy} onPress={() => setRules(current => current.filter((_, i) => i !== index))} />
                </View>)}
              <CustomBtn title="Add rule" disabled={busy || rules.length >= 200} onPress={() => setRules(current => [...current, {
            id: `rule-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            role: "",
            minDeal: "",
            maxDeal: "",
            percentage: "",
            minExperience: "",
            maxExperience: "",
            effectiveFrom: "",
            effectiveUntil: ""
          }])} />
              {!!error && <Text accessibilityRole="alert" style={{
            color: "#BE123C"
          }}>{error}</Text>}
              <CustomBtn title="Save Settings" onPress={save} isLoading={busy} />
            </>}
        </ScrollView>
      </ModalWithBlur>
    </View>;
}
