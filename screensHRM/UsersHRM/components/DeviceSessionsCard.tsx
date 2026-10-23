import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/userSlice";
import { axiosInstance } from "../../../services/authApi/axiosInstance";

type Session = { _id: string; deviceName: string; platform: string; loginTime: string; lastActivity: string; logoutTime: string; status: string; logoutReason?: string };
type HistoryPage = { data: Session[]; total: number; page: number; pageSize: number; activeCounts: { Web: number; Mobile: number }; allowMultipleDeviceLogins: boolean; sessionLimitExempt?: boolean; timezone: string };

export default function DeviceSessionsCard({ userId }: { userId: string }) {
  const { user } = useSelector(selectUser);
  const allowed = ["sup_admin", "sub_admin"].includes(user?.role);
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<string | null>(null);
  const loadingNext = useRef(false);
  const queryClient = useQueryClient();
  const { data, isPending, error, refetch, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["deviceSessions", "history", userId],
    enabled: Boolean(userId) && allowed,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }): Promise<HistoryPage> => (await axiosInstance.get(`/api/hrms/user/${userId}/sessions`, { params: { page: pageParam }, signal })).data,
    getNextPageParam: (last) => last.page * last.pageSize < last.total ? last.page + 1 : undefined,
    refetchOnMount: "always",
    refetchInterval: 30000,
    retry: 3,
  });
  const firstFocus = useRef(true);
  useFocusEffect(useCallback(() => {
    if (firstFocus.current) { firstFocus.current = false; return; }
    if (allowed && userId) void refetch();
  }, [allowed, userId, refetch]));
  if (!allowed) return null;
  const summary = data?.pages[0];
  const sessions = Array.from(new Map((data?.pages.flatMap((page) => page.data) || []).map((row) => [row._id, row])).values());
  const loadMore = async () => {
    if (!hasNextPage || isFetching || loadingNext.current || error) return;
    loadingNext.current = true;
    try { await fetchNextPage(); } finally { loadingNext.current = false; }
  };
  const logOut = (record: Session) => Alert.alert("Log out device?", `End the session on ${record.deviceName}? Login history will be preserved.`, [
    { text: "Cancel", style: "cancel" },
    { text: "Log out", style: "destructive", onPress: async () => {
      setBusy(record._id);
      try {
        await axiosInstance.post(`/api/hrms/user/${userId}/sessions/${record._id}/logout`);
        await queryClient.invalidateQueries({ queryKey: ["deviceSessions", "history", userId] });
      } catch (err: any) { Alert.alert("Unable to log out", err?.response?.data?.message || "Check your connection and try again."); }
      finally { setBusy(null); }
    } },
  ]);
  return <FlatList
    style={{ flex: 1 }}
    contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 120 }]}
    data={sessions}
    keyExtractor={(item) => item._id}
    onEndReached={loadMore}
    onEndReachedThreshold={0.35}
    ListHeaderComponent={<>
      <View style={styles.headingRow}><View style={styles.icon}><Feather name="shield" size={20} color="#2E67BE" /></View><View style={styles.grow}><Text style={styles.title}>Device Login Management</Text><Text style={styles.subtitle}>Active devices & login history</Text></View>{isFetching && !isPending && !isFetchingNextPage && <ActivityIndicator size="small" color="#2E67BE" />}</View>
      {summary && <>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Feather name="monitor" size={20} color="#2E67BE" /><Text style={styles.count}>{summary.activeCounts.Web}</Text><Text style={styles.statLabel}>Active Web</Text></View>
          <View style={styles.stat}><Feather name="smartphone" size={20} color="#2E67BE" /><Text style={styles.count}>{summary.activeCounts.Mobile}</Text><Text style={styles.statLabel}>Active Mobile</Text></View>
        </View>
        <View style={styles.policy}><View style={styles.policyTitle}><Feather name="lock" size={15} color="#2E67BE" /><Text style={styles.policyHeading}>{summary.allowMultipleDeviceLogins ? "Multiple logins allowed" : "One Web + one Mobile login"}</Text></View><Text style={styles.note}>{summary.sessionLimitExempt ? "Super Admin has unlimited device logins." : "Android and iOS share the Mobile login slot. Manage this user's login allowance under Permissions."}</Text><Text style={styles.subtitle}>Timezone: {summary.timezone}</Text></View>
        <View style={styles.historyHeading}><Text style={styles.sectionTitle}>LOGIN HISTORY</Text><Text style={styles.subtitle}>{sessions.length} of {summary.total}</Text></View>
      </>}
      {!!error && <View style={styles.error}><Text style={styles.errorText}>Unable to load device history. Check your connection.</Text><TouchableOpacity accessibilityRole="button" onPress={() => refetch()} style={styles.retry}><Text style={styles.errorText}>Retry</Text></TouchableOpacity></View>}
    </>}
    ListEmptyComponent={isPending ? <View style={styles.empty}><ActivityIndicator color="#2E67BE" /><Text style={styles.subtitle}>Loading devices…</Text></View> : !error ? <View style={styles.empty}><View style={styles.icon}><Feather name="smartphone" size={26} color="#739FE1" /></View><Text style={styles.emptyTitle}>No login history yet</Text><Text style={styles.emptyNote}>Device sessions will appear here when this user logs in.</Text></View> : null}
    renderItem={({ item }) => {
      const active = item.status === "active";
      return <View style={styles.card}>
        <View style={styles.cardHeader}><View style={styles.icon}><Feather name={item.platform === "Web" ? "monitor" : "smartphone"} size={20} color="#2E67BE" /></View><View style={styles.grow}><Text style={styles.deviceName}>{item.deviceName || "Unknown device"}</Text><Text style={styles.subtitle}>{item.platform === "Web" ? "Web browser" : `Mobile · ${item.platform}`}</Text></View><View style={[styles.badge, !active && styles.inactiveBadge]}><Text style={[styles.badgeText, !active && styles.inactiveText]}>{active ? "Active" : "Logged Out"}</Text></View></View>
        <View style={styles.cardBody}>{[["Login time", item.loginTime], ["Last activity", item.lastActivity], ["Logout time", item.logoutTime]].map(([label, value]) => <View key={label} style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value || "—"}</Text></View>)}</View>
        {(active || item.logoutReason) && <View style={styles.cardFooter}>{active ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Log out ${item.deviceName}`} disabled={busy !== null} onPress={() => logOut(item)} style={[styles.logout, busy !== null && { opacity: 0.5 }]}>{busy === item._id ? <ActivityIndicator size="small" color="#DC4343" /> : <Feather name="log-out" size={14} color="#DC4343" />}<Text style={styles.logoutText}>Log out device</Text></TouchableOpacity> : <Text style={styles.note}>{item.logoutReason}</Text>}</View>}
      </View>;
    }}
    ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 18 }} color="#2E67BE" /> : summary && sessions.length > 0 && !hasNextPage ? <Text style={styles.endText}>All sessions shown</Text> : null}
  />;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 22 }, grow: { flex: 1, gap: 4 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 }, icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#EDF4FF", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700", color: "#1E293B" }, subtitle: { fontSize: 12, color: "#7D8CA3" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 14 }, stat: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#DFE9F7", backgroundColor: "#F6F9FF", gap: 8 }, count: { fontSize: 27, fontWeight: "700", color: "#2E67BE" }, statLabel: { fontSize: 12, color: "#64748B" },
  policy: { padding: 14, borderRadius: 14, backgroundColor: "#F5F8FC", gap: 8, marginBottom: 24 }, policyTitle: { flexDirection: "row", alignItems: "center", gap: 7 }, policyHeading: { flex: 1, fontSize: 13, fontWeight: "600", color: "#365B8C" }, note: { fontSize: 12, lineHeight: 18, color: "#7D8CA3" },
  historyHeading: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }, sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, color: "#64748B" },
  card: { borderWidth: 1, borderColor: "#E2EAF5", borderRadius: 16, backgroundColor: "#fff", marginBottom: 14, overflow: "hidden" }, cardHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, padding: 14, backgroundColor: "#F8FAFE" }, deviceName: { fontSize: 14, fontWeight: "600", color: "#1E293B" }, badge: { backgroundColor: "#EAF8F0", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 }, badgeText: { color: "#268552", fontSize: 10, fontWeight: "600" }, inactiveBadge: { backgroundColor: "#EBEFF5" }, inactiveText: { color: "#7D8CA3" },
  cardBody: { padding: 14, gap: 15 }, detailRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 7 }, detailLabel: { width: 90, color: "#8290A4", fontSize: 12 }, detailValue: { flex: 1, minWidth: 120, color: "#334155", fontSize: 12 }, cardFooter: { borderTopWidth: 1, borderTopColor: "#F0F3F8", padding: 12, alignItems: "flex-end" }, logout: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 9, paddingHorizontal: 12, minHeight: 40, backgroundColor: "#FFF1F1" }, logoutText: { color: "#DC4343", fontSize: 12, fontWeight: "600" },
  empty: { paddingVertical: 36, paddingHorizontal: 20, alignItems: "center", gap: 12, backgroundColor: "#F8FAFE", borderRadius: 16, borderWidth: 1, borderColor: "#E2EAF5" }, emptyTitle: { fontSize: 15, fontWeight: "600", color: "#334155" }, emptyNote: { color: "#8290A4", fontSize: 12, lineHeight: 18, textAlign: "center" },
  error: { padding: 14, borderRadius: 12, backgroundColor: "#FFF6EF", gap: 8, marginBottom: 14 }, errorText: { color: "#9A5526", fontSize: 12, lineHeight: 18 }, retry: { alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#FFE9D8", borderRadius: 8 }, endText: { fontSize: 11, color: "#94A3B8", textAlign: "center", paddingVertical: 12 },
});
