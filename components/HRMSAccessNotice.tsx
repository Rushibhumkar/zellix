import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  loadFailed: boolean;
  retrying: boolean;
  onRetry: () => void;
  onBack: () => void;
};

export default function HRMSAccessNotice({ loadFailed, retrying, onRetry, onBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.icon}>
          <Feather name={loadFailed ? "wifi-off" : "shield"} size={36} color="#2E67BE" />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {loadFailed ? "Unable to check HRMS access" : "HRMS access unavailable"}
        </Text>
        <Text style={styles.description}>
          {loadFailed
            ? "We couldn't load your permissions. Check your connection and try again."
            : "You don't have access to any HRMS modules. Please contact your administrator to enable the permissions you need."}
        </Text>
        {loadFailed && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry permission check"
            accessibilityState={{ disabled: retrying, busy: retrying }}
            disabled={retrying}
            onPress={onRetry}
            style={styles.retry}
          >
            {retrying ? <ActivityIndicator color="#2E67BE" /> : (
              <Text style={styles.retryText}>Try again</Text>
            )}
          </Pressable>
        )}
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <Feather name="arrow-left" size={18} color="#FFFFFF" />
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F8FC" },
  content: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  card: { width: "100%", maxWidth: 440, padding: 24, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE5F2", alignItems: "center" },
  icon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 21, fontWeight: "700", color: "#1E3A5F", textAlign: "center" },
  description: { fontSize: 14, lineHeight: 22, color: "#64748B", textAlign: "center", marginTop: 12, marginBottom: 24 },
  retry: { width: "100%", minHeight: 48, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  retryText: { color: "#2E67BE", fontSize: 15, fontWeight: "600" },
  back: { width: "100%", minHeight: 48, padding: 12, borderRadius: 12, backgroundColor: "#2E67BE", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  backText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
