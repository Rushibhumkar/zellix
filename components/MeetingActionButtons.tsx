import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "../myComponents/CustomText/CustomText";

type Props = {
  onReschedule: () => void;
  onCancel: () => void;
  onConduct: () => void;
  canConduct: boolean;
  conducting: boolean;
};

// Two equal secondary actions and one full-width primary action fit narrow phones
// without squeezing labels or leaving uneven gaps between wrapped buttons.
export default function MeetingActionButtons({ onReschedule, onCancel, onConduct, canConduct, conducting }: Props) {
  return <View style={styles.container}>
    <View style={styles.row}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Reschedule" onPress={onReschedule} activeOpacity={0.8} style={[styles.secondary, styles.reschedule]}>
        <Feather name="refresh-cw" size={16} color="#374151" />
        <CustomText style={styles.secondaryText}>Reschedule</CustomText>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancel Meeting" onPress={onCancel} activeOpacity={0.8} style={[styles.secondary, styles.cancel]}>
        <CustomText style={[styles.secondaryText, styles.cancelText]}>Cancel Meeting</CustomText>
      </TouchableOpacity>
    </View>
    {canConduct && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mark as Conducted" accessibilityState={{ disabled: conducting, busy: conducting }} disabled={conducting} onPress={onConduct} activeOpacity={0.8} style={[styles.primary, conducting && styles.busy]}>
      <LinearGradient colors={["#2E67BE", "#4985F2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryContent}>
        {conducting ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="check-circle" size={17} color="#fff" />}
        <CustomText style={styles.primaryText}>{conducting ? "Saving…" : "Mark as Conducted"}</CustomText>
      </LinearGradient>
    </TouchableOpacity>}
  </View>;
}

const styles = StyleSheet.create({
  container: { width: "100%", gap: 8, marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "stretch", gap: 8 },
  secondary: { flex: 1, minHeight: 44, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 11, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  reschedule: { backgroundColor: "#F3F4F6" },
  cancel: { backgroundColor: "#FEF2F2" },
  secondaryText: { flexShrink: 1, fontSize: 12, fontWeight: "600", color: "#374151", textAlign: "center" },
  cancelText: { color: "#B91C1C" },
  primary: { borderRadius: 9, overflow: "hidden" },
  primaryContent: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 11, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7 },
  primaryText: { flexShrink: 1, fontSize: 13, fontWeight: "600", color: "#fff", textAlign: "center" },
  busy: { opacity: 0.6 },
});
