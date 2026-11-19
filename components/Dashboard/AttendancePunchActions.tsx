import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import CheckInOut from "../../screensHRM/DashboardHRM/CheckInOut";

export default function AttendancePunchActions({ refreshing }: { refreshing: boolean }) {
  const { user } = useSelector(selectUser);
  const canPunch = Boolean(user?._id && user?.role) &&
    !["sup_admin", "sub_admin", "office_admin"].includes(user.role);

  return canPunch ? <PunchActions key={user._id} refreshing={refreshing} /> : null;
}

function PunchActions({ refreshing }: { refreshing: boolean }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    if (refreshing) setRetryVersion((version) => version + 1);
  }, [refreshing]);

  return (
    <View>
      <CheckInOut onLoadError={setLoadFailed} retryVersion={retryVersion} />
      {loadFailed && (
        <View style={styles.errorCard} accessibilityLiveRegion="polite">
          <View style={styles.errorCopy}>
            <Text style={styles.title}>Attendance actions couldn’t load</Text>
            <Text style={styles.description}>Check your connection and try again.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Retry attendance actions"
            style={styles.retry} onPress={() => setRetryVersion((version) => version + 1)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorCard: { marginHorizontal: 12, marginTop: 8, marginBottom: 12, padding: 14, borderRadius: 14,
    backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", flexDirection: "row", alignItems: "center", gap: 12 },
  errorCopy: { flex: 1 },
  title: { color: "#334155", fontSize: 13, fontWeight: "600" },
  description: { color: "#64748B", fontSize: 12, marginTop: 4 },
  retry: { backgroundColor: "#2E67BE", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  retryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
});
