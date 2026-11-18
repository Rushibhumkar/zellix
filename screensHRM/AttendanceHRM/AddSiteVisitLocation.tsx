import React, { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "../../components/AppToast";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import { addSiteVisitLocation } from "../../services/hrmApi/siteVisitLocationsApi";

export default function AddSiteVisitLocation() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const toast = useAppToast();
  const queryClient = useQueryClient();

  const save = async () => {
    if (lock.current || !name.trim() || !link.trim()) return;
    lock.current = true;
    setSaving(true);
    setError("");
    try {
      await addSiteVisitLocation(name.trim(), link.trim());
      void queryClient.invalidateQueries({ queryKey: ["siteVisitLocations"] });
      setOpen(false);
      setName("");
      setLink("");
      toast.success("Site location added.");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(typeof message === "string" ? message : "Could not save the site. Try again.");
    } finally {
      lock.current = false;
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => { setError(""); setOpen(true); }}>
        <Text style={styles.buttonLabel}>Add Site Location</Text>
      </Pressable>
      <ModalWithBlur visible={open} onClose={() => { if (!saving) setOpen(false); }}>
        <Text style={styles.title}>Add Site Location</Text>
        <TextInput accessibilityLabel="Site name" placeholder="Site name" style={styles.input}
          value={name} onChangeText={setName} maxLength={100} editable={!saving} />
        <TextInput accessibilityLabel="Site map link" placeholder="Paste a Google Maps or Apple Maps pin link" style={styles.input}
          value={link} onChangeText={setLink} maxLength={2048} autoCapitalize="none" autoCorrect={false} keyboardType="url" editable={!saving} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Pressable accessibilityRole="button" style={[styles.button, (saving || !name.trim() || !link.trim()) && styles.disabled]}
          onPress={() => void save()} disabled={saving || !name.trim() || !link.trim()}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonLabel}>Save Site</Text>}
        </Pressable>
      </ModalWithBlur>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, alignItems: "flex-start" },
  title: { color: "#1D2939", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, color: "#1D2939" },
  button: { borderRadius: 8, backgroundColor: "#2E67BE", paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
  buttonLabel: { fontWeight: "600", color: "#FFFFFF" },
  disabled: { opacity: 0.6 },
  error: { color: "#B42318", marginBottom: 10 },
});
