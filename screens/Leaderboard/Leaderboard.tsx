import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import { color } from "../../const/color";
import Container from "../../myComponents/Container/Container";
import CustomText from "../../myComponents/CustomText/CustomText";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import {
  LeaderboardPeriod,
  useGetLeaderboard,
} from "../../services/rootApi/leaderboardApi";

type Entry = {
  rank: number;
  score: number;
  previousRank?: number | null;
  rankChange?: number | null;
  user: { _id: string; name: string; role: string };
  scoreBreakdown: Record<string, number>;
  metrics: Record<string, number>;
};

const periods: { label: string; value: LeaderboardPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Custom", value: "custom" },
];

const roles = [
  { label: "Agents", value: "agent" },
  { label: "Team Leads", value: "team_lead" },
  {
    label: "Managers",
    value: "sr_manager,manager,assistant_manager",
  },
];

const formatDuration = (seconds = 0) => {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
};

const formatAmount = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const roleLabel = (role = "") =>
  role.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const Avatar = ({ entry, size = 48 }: { entry: Entry; size?: number }) => (
  <View
    style={[
      styles.avatar,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor:
          entry.rank === 1
            ? "#FFF5D7"
            : entry.rank === 2
              ? "#EDF1F5"
              : entry.rank === 3
                ? "#FFF0E7"
                : "#EAF2FF",
      },
    ]}
  >
    <CustomText style={[styles.avatarText, { fontSize: size * 0.34 }]}>
      {(entry.user?.name || "U").trim().charAt(0).toUpperCase()}
    </CustomText>
  </View>
);

const Leaderboard = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const [role, setRole] = useState("agent");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const filters = useMemo(
    () => ({
      period,
      role,
      ...(period === "custom" && startDate && endDate
        ? {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }
        : {}),
    }),
    [period, role, startDate, endDate],
  );

  const customRangeIncomplete = period === "custom" && (!startDate || !endDate);
  const leaderboardQuery = useGetLeaderboard(filters);
  const entries: Entry[] = leaderboardQuery.data?.rankings || [];
  const topThree: Entry[] = leaderboardQuery.data?.topThree || [];
  const queryError: any = leaderboardQuery.error;
  const errorMessage =
    queryError?.response?.data?.message ||
    queryError?.message ||
    "Unable to load the leaderboard. Please try again.";

  const selectPeriod = (value: LeaderboardPeriod) => {
    setPeriod(value);
    if (value !== "custom") {
      setStartDate(null);
      setEndDate(null);
    }
  };

  return (
    <Container>
      <Header title="Leaderboard" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={leaderboardQuery.isFetching && !leaderboardQuery.isLoading}
            onRefresh={leaderboardQuery.refetch}
            tintColor={color.mainTxtColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Feather name="award" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.introTitle}>Performance leaderboard</CustomText>
            <CustomText style={styles.introSubtitle}>
              Rankings update from calls, follow-ups, conversions and booking value.
            </CustomText>
          </View>
        </View>

        <CustomText style={styles.sectionLabel}>Period</CustomText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {periods.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => selectPeriod(item.value)}
              style={[styles.chip, period === item.value && styles.chipActive]}
            >
              <CustomText style={[styles.chipText, period === item.value && styles.chipTextActive]}>
                {item.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {period === "custom" && (
          <View style={styles.customDates}>
            <DatePickerExpo
              title="Start date"
              initialValue={startDate?.toISOString()}
              maximumDate={endDate || new Date()}
              onSelect={(date) => setStartDate(date ? new Date(date) : null)}
              boxContainerStyle={styles.dateField}
            />
            <DatePickerExpo
              title="End date"
              initialValue={endDate?.toISOString()}
              minimumDate={startDate || undefined}
              maximumDate={new Date()}
              onSelect={(date) => setEndDate(date ? new Date(date) : null)}
              boxContainerStyle={styles.dateField}
            />
          </View>
        )}

        <CustomText style={styles.sectionLabel}>Show rankings for</CustomText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {roles.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setRole(item.value)}
              style={[styles.chip, role === item.value && styles.chipActive]}
            >
              <CustomText style={[styles.chipText, role === item.value && styles.chipTextActive]}>
                {item.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {customRangeIncomplete ? (
          <View style={styles.messageCard}>
            <Feather name="calendar" size={22} color={color.mainTxtColor} />
            <CustomText style={styles.messageTitle}>Choose a date range</CustomText>
            <CustomText style={styles.messageText}>
              Select both start and end dates to view custom rankings.
            </CustomText>
          </View>
        ) : leaderboardQuery.isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={color.mainTxtColor} size="large" />
            <CustomText style={styles.loadingText}>Loading leaderboard...</CustomText>
          </View>
        ) : leaderboardQuery.isError ? (
          <View style={styles.messageCard}>
            <Feather name="wifi-off" size={24} color="#DC2626" />
            <CustomText style={styles.messageTitle}>Could not load rankings</CustomText>
            <CustomText style={styles.messageText}>{errorMessage}</CustomText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => leaderboardQuery.refetch()}
            >
              <CustomText style={styles.retryText}>Try again</CustomText>
            </TouchableOpacity>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.messageCard}>
            <Feather name="bar-chart-2" size={24} color={color.mainTxtColor} />
            <CustomText style={styles.messageTitle}>No rankings yet</CustomText>
            <CustomText style={styles.messageText}>
              There is no performance activity for this selection.
            </CustomText>
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <CustomText style={styles.sectionTitle}>Top performers</CustomText>
              <View style={styles.totalBadge}>
                <CustomText style={styles.totalText}>
                  {leaderboardQuery.data?.totalUsers || entries.length} members
                </CustomText>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topThreeList}>
              {topThree.map((entry) => (
                <TouchableOpacity key={entry.user._id} onPress={() => setSelectedEntry(entry)} style={styles.topCard}>
                  <View style={styles.rankMedal}>
                    <Feather name="award" size={14} color={entry.rank === 1 ? "#B77900" : color.mainTxtColor} />
                    <CustomText style={styles.rankMedalText}>#{entry.rank}</CustomText>
                  </View>
                  <Avatar entry={entry} size={54} />
                  <CustomText numberOfLines={1} style={styles.topName}>{entry.user.name}</CustomText>
                  <CustomText numberOfLines={1} style={styles.topRole}>{roleLabel(entry.user.role)}</CustomText>
                  <CustomText style={styles.topScore}>{entry.score}</CustomText>
                  <CustomText style={styles.scoreCaption}>points</CustomText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.summaryRow}>
              <CustomText style={styles.sectionTitle}>All rankings</CustomText>
              {leaderboardQuery.isFetching && <ActivityIndicator size="small" color={color.mainTxtColor} />}
            </View>
            {entries.map((entry) => (
              <TouchableOpacity key={entry.user._id} style={styles.entryCard} onPress={() => setSelectedEntry(entry)}>
                <View style={styles.rankCircle}>
                  <CustomText style={styles.rankText}>{entry.rank}</CustomText>
                </View>
                <Avatar entry={entry} />
                <View style={styles.entryDetails}>
                  <CustomText numberOfLines={1} style={styles.entryName}>{entry.user.name}</CustomText>
                  <CustomText numberOfLines={1} style={styles.entryRole}>{roleLabel(entry.user.role)}</CustomText>
                  <CustomText style={styles.entryMetric}>
                    {entry.metrics.validCalls || 0} calls · {entry.metrics.bookingsCreated || 0} bookings
                  </CustomText>
                </View>
                <View style={styles.scoreArea}>
                  <CustomText style={styles.entryScore}>{entry.score}</CustomText>
                  <CustomText style={[styles.trend, entry.rankChange && entry.rankChange < 0 && styles.trendDown]}>
                    {entry.rankChange ? `${entry.rankChange > 0 ? "↑" : "↓"} ${Math.abs(entry.rankChange)}` : "—"}
                  </CustomText>
                </View>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        visible={Boolean(selectedEntry)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEntry(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setSelectedEntry(null)} />
          {selectedEntry && (
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View style={styles.sheetPerson}>
                  <Avatar entry={selectedEntry} size={52} />
                  <View style={{ flex: 1 }}>
                    <CustomText numberOfLines={1} style={styles.sheetName}>{selectedEntry.user.name}</CustomText>
                    <CustomText style={styles.sheetRole}>{roleLabel(selectedEntry.user.role)} · Rank #{selectedEntry.rank}</CustomText>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedEntry(null)} style={styles.closeButton}>
                  <Feather name="x" size={20} color="#475569" />
                </TouchableOpacity>
              </View>
              <View style={styles.scoreBox}>
                <CustomText style={styles.scoreBoxLabel}>Total score</CustomText>
                <CustomText style={styles.scoreBoxValue}>{selectedEntry.score}<CustomText style={styles.scoreOutOf}> / 100</CustomText></CustomText>
              </View>
              <CustomText style={styles.breakdownTitle}>Score breakdown</CustomText>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.breakdownList}>
                {[
                  ["Calls", "calls", `${selectedEntry.metrics.validCalls || 0} valid calls`, "phone-call"],
                  ["Call duration", "callDuration", formatDuration(selectedEntry.metrics.callDurationSeconds), "clock"],
                  ["Follow-up compliance", "followUps", `${selectedEntry.metrics.followUpCompliance || 0}% completed`, "check-circle"],
                  ["Lead to meeting", "leadToMeeting", `${selectedEntry.metrics.leadToMeetingRate || 0}% conversion`, "target"],
                  ["Meeting to booking", "meetingToBooking", `${selectedEntry.metrics.meetingToBookingRate || 0}% conversion`, "trending-up"],
                  ["Booking value", "bookingValue", formatAmount(selectedEntry.metrics.bookingValue), "credit-card"],
                ].map(([label, key, value, icon]) => (
                  <View key={key} style={styles.breakdownRow}>
                    <View style={styles.metricIcon}><Feather name={icon as any} size={17} color={color.mainTxtColor} /></View>
                    <View style={{ flex: 1 }}>
                      <CustomText style={styles.metricLabel}>{label}</CustomText>
                      <CustomText style={styles.metricValue}>{value}</CustomText>
                    </View>
                    <CustomText style={styles.metricPoints}>{selectedEntry.scoreBreakdown[key] || 0} pts</CustomText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </Container>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  intro: { flexDirection: "row", gap: 12, borderRadius: 18, backgroundColor: "#F2F7FF", padding: 14, marginBottom: 20 },
  introIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: color.mainTxtColor },
  introTitle: { color: "#0F172A", fontWeight: "700", fontSize: 16 },
  introSubtitle: { color: "#64748B", fontSize: 12, lineHeight: 18, marginTop: 3 },
  sectionLabel: { color: "#334155", fontWeight: "700", fontSize: 13, marginBottom: 8 },
  chips: { gap: 8, paddingBottom: 18 },
  chip: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 18, paddingVertical: 8, paddingHorizontal: 13, backgroundColor: "#fff" },
  chipActive: { backgroundColor: color.mainTxtColor, borderColor: color.mainTxtColor },
  chipText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  customDates: { flexDirection: "row", gap: 12, marginBottom: 18 },
  dateField: { flex: 1 },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, marginBottom: 12 },
  sectionTitle: { color: "#0F172A", fontSize: 17, fontWeight: "700" },
  totalBadge: { backgroundColor: "#EAF2FF", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  totalText: { color: color.mainTxtColor, fontSize: 11, fontWeight: "700" },
  topThreeList: { gap: 12, paddingBottom: 22 },
  topCard: { width: 144, borderRadius: 17, alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", padding: 13, elevation: 2, shadowColor: "#0F172A", shadowOpacity: 0.06, shadowRadius: 7, shadowOffset: { width: 0, height: 2 } },
  rankMedal: { alignSelf: "stretch", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 3, marginBottom: 9 },
  rankMedalText: { color: "#475569", fontWeight: "700", fontSize: 12 },
  avatar: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: color.mainTxtColor, fontWeight: "800" },
  topName: { color: "#0F172A", fontWeight: "700", fontSize: 13, width: "100%", textAlign: "center", marginTop: 8 },
  topRole: { color: "#64748B", fontSize: 10, width: "100%", textAlign: "center", marginTop: 2 },
  topScore: { color: color.mainTxtColor, fontWeight: "800", fontSize: 22, marginTop: 11 },
  scoreCaption: { color: "#94A3B8", fontSize: 10 },
  entryCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 15, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", padding: 11, marginBottom: 9 },
  rankCircle: { width: 25, height: 25, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9" },
  rankText: { color: "#475569", fontSize: 11, fontWeight: "800" },
  entryDetails: { flex: 1, minWidth: 0 },
  entryName: { color: "#0F172A", fontSize: 14, fontWeight: "700" },
  entryRole: { color: "#64748B", fontSize: 11, marginTop: 1 },
  entryMetric: { color: "#94A3B8", fontSize: 10, marginTop: 3 },
  scoreArea: { alignItems: "flex-end", minWidth: 30 },
  entryScore: { color: color.mainTxtColor, fontSize: 18, fontWeight: "800" },
  trend: { color: "#16A34A", fontSize: 11, fontWeight: "700", marginTop: 2 },
  trendDown: { color: "#DC2626" },
  loadingState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  loadingText: { color: "#64748B", fontSize: 13 },
  messageCard: { borderWidth: 1, borderColor: "#DCE8FA", backgroundColor: "#F8FBFF", borderRadius: 18, alignItems: "center", padding: 28, marginTop: 6 },
  messageTitle: { color: "#1E293B", fontSize: 16, fontWeight: "700", marginTop: 10 },
  messageText: { color: "#64748B", fontSize: 13, textAlign: "center", lineHeight: 19, marginTop: 5 },
  retryButton: { marginTop: 16, backgroundColor: color.mainTxtColor, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.45)" },
  sheet: { maxHeight: "80%", borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: "#fff", padding: 20, paddingBottom: 28 },
  sheetHandle: { width: 42, height: 4, borderRadius: 3, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sheetPerson: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  sheetName: { color: "#0F172A", fontSize: 16, fontWeight: "800" },
  sheetRole: { color: "#64748B", fontSize: 11, marginTop: 3 },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  scoreBox: { borderRadius: 14, backgroundColor: "#F2F7FF", padding: 15, marginTop: 18 },
  scoreBoxLabel: { color: "#64748B", fontSize: 12 },
  scoreBoxValue: { color: color.mainTxtColor, fontSize: 30, fontWeight: "800", marginTop: 2 },
  scoreOutOf: { color: "#94A3B8", fontSize: 14, fontWeight: "600" },
  breakdownTitle: { color: "#0F172A", fontSize: 16, fontWeight: "800", marginTop: 19, marginBottom: 8 },
  breakdownList: { gap: 8 },
  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 13, backgroundColor: "#F8FAFC", padding: 11 },
  metricIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#EAF2FF", alignItems: "center", justifyContent: "center" },
  metricLabel: { color: "#334155", fontSize: 13, fontWeight: "700" },
  metricValue: { color: "#64748B", fontSize: 11, marginTop: 2 },
  metricPoints: { color: color.mainTxtColor, fontSize: 12, fontWeight: "800" },
});
