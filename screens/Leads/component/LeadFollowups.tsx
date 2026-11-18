import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Linking,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { selectUser } from "../../../redux/userSlice";
import { axiosInstance } from "../../../services/authApi/axiosInstance";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { meetingStatus, statusObj } from "../../../utils/data";

import { formatCallDuration as formatSeconds } from "../../../utils/callOutcome";

function formatActivityDuration(value: string | number | boolean | null) {
  const match = /^(\d+)\s*(?:s|sec)?$/i.exec(String(value).trim());
  if (!match) return String(value);
  const total = Number(match[1]);
  if (!Number.isSafeInteger(total)) return String(value);
  return formatSeconds(total);
}

function formatActivitySummary(event: ActivityEvent) {
  if (event.kind !== "call_saved" || event.restricted) return event.summary;
  const normalized = event.summary.replace(
    /^(Call [^·]* · )(\d+s)(?= · |$)/i,
    (_, prefix, duration) => prefix + formatActivityDuration(duration),
  );
  return normalized.replace(
    /^(Call saved · )(\d+\s*(?:sec)?)$/i,
    (_, prefix, duration) => prefix + formatActivityDuration(duration),
  );
}

type ActivityStyle = {
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  backgroundColor: string;
};

const activityStyles: Record<string, ActivityStyle> = {
  meeting: { icon: "calendar", color: "#5B21B6", backgroundColor: "#EDE9FE" },
  meeting_created: {
    icon: "calendar",
    color: "#5B21B6",
    backgroundColor: "#EDE9FE",
  },
  meeting_updated: {
    icon: "edit-2",
    color: "#78350F",
    backgroundColor: "#FEF3C7",
  },
  meeting_rescheduled: {
    icon: "clock",
    color: "#075985",
    backgroundColor: "#E0F2FE",
  },
  meeting_conducted: {
    icon: "check-circle",
    color: "#065F46",
    backgroundColor: "#D1FAE5",
  },
  meeting_cancelled: {
    icon: "x-circle",
    color: "#9F1239",
    backgroundColor: "#FFE4E6",
  },
  meeting_deleted: {
    icon: "trash-2",
    color: "#9F1239",
    backgroundColor: "#FFE4E6",
  },
  note: { icon: "file-text", color: "#92400E", backgroundColor: "#FFFBEB" },
  note_updated: {
    icon: "edit-2",
    color: "#92400E",
    backgroundColor: "#FFFBEB",
  },
  note_deleted: {
    icon: "trash-2",
    color: "#9F1239",
    backgroundColor: "#FFE4E6",
  },
  reminder: { icon: "bell", color: "#115E59", backgroundColor: "#F0FDFA" },
  reminder_rescheduled: {
    icon: "clock",
    color: "#075985",
    backgroundColor: "#E0F2FE",
  },
  reminder_completed: {
    icon: "check-circle",
    color: "#065F46",
    backgroundColor: "#D1FAE5",
  },
  reminder_missed: {
    icon: "bell-off",
    color: "#78350F",
    backgroundColor: "#FEF3C7",
  },
  reminder_deleted: {
    icon: "trash-2",
    color: "#9F1239",
    backgroundColor: "#FFE4E6",
  },
  call: { icon: "phone", color: "#065F46", backgroundColor: "#ECFDF5" },
  status: { icon: "arrow-right", color: "#4338CA", backgroundColor: "#EEF2FF" },
  assignment: {
    icon: "user-plus",
    color: "#2E67BE",
    backgroundColor: "#EFF6FF",
  },
  reassignment: {
    icon: "refresh-cw",
    color: "#2E67BE",
    backgroundColor: "#EFF6FF",
  },
};
const defaultActivityStyle: ActivityStyle = {
  icon: "activity",
  color: "#334155",
  backgroundColor: "#F1F5F9",
};

type ProfileName = { id?: string; name: string };

type ActivityEvent = {
  id: string;
  kind: string;
  occurredAt: string | null;
  actor: ProfileName | null;
  assignmentUsers?: {
    from: ProfileName | null;
    to: ProfileName;
    fresh: boolean;
  };
  summary: string;
  restricted: boolean;
  unavailable: boolean;
  target: { type: string; id: string; entryId?: string } | null;
  details?: Record<string, string | number | boolean | null> | null;
};

type ActivityPage = {
  data: ActivityEvent[];
  nextCursor: string | null;
  cutoff: string | null;
};

function formatFollowupDateTime(value: moment.MomentInput) {
  const date = moment(value);
  return value && date.isValid()
    ? date.format("DD MMM YYYY · hh:mm A")
    : "Date unavailable";
}

export default function LeadFollowups({
  leadId,
  onOpen,
  onOpenUser,
}: {
  leadId: string;
  onOpen: (
    target: NonNullable<ActivityEvent["target"]>,
  ) => Promise<void> | void;
  onOpenUser?: (userId: string) => void;
}) {
  const { user } = useSelector(selectUser);
  const [activity, setActivity] = useState<ActivityEvent | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  useEffect(() => {
    setActivity(null);
    setOpening(null);
  }, [leadId, user?._id]);
  const query = useInfiniteQuery({
    queryKey: ["leadFollowups", user?._id, leadId],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await axiosInstance.get<ActivityPage>(`/api/lead/${leadId}/followups`, {
          params: { cursor: pageParam || undefined },
          signal,
        })
      ).data,
    getNextPageParam: (page) => page.nextCursor || undefined,
    enabled: !!leadId && !!user?._id,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 20000,
  });
  useFocusEffect(
    React.useCallback(() => {
      void query.refetch();
    }, [leadId, user?._id, query.refetch]),
  );
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "lead-followups-refresh",
      () => {
        void query.refetch();
      },
    );
    return () => subscription.remove();
  }, [query.refetch]);
  const items = [
    ...new Map(
      (query.data?.pages || [])
        .flatMap((page) => page.data)
        .map((event) => [event.id, event]),
    ).values(),
  ];
  const sections = new Map<string, ActivityEvent[]>();
  if (!query.isError)
    for (const event of items) {
      const date = event.occurredAt ? moment(event.occurredAt) : null;
      const key = date?.isValid() ? date.format("YYYY-MM-DD") : "";
      if (!sections.has(key)) sections.set(key, []);
      sections.get(key)?.push(event);
    }
  const today = moment();
  const yesterday = today.clone().subtract(1, "day");
  const toggleDetails = async (event: ActivityEvent) => {
    if (!event.target || opening) return;
    if (activity?.id === event.id) {
      setActivity(null);
      return;
    }
    setOpening(event.id);
    try {
      const { data } = await axiosInstance.get<ActivityPage>(
        `/api/lead/${leadId}/followups`,
        { params: { eventId: event.id } },
      );
      const entry = data.data?.[0];
      if (!entry?.target)
        throw new Error("This activity is no longer available");
      if (entry.target.type === "note") await onOpen(entry.target);
      else setActivity(entry);
    } catch (error: any) {
      Alert.alert(
        "Activity unavailable",
        error?.response?.data?.message || error.message || "Please try again.",
      );
      void query.refetch();
    } finally {
      setOpening(null);
    }
  };
  const openTarget = async (target: NonNullable<ActivityEvent["target"]>) => {
    try {
      await onOpen(target);
    } catch (error) {
      Alert.alert(
        "Activity unavailable",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };
  return (
    <SectionList
      sections={[...sections].map(([date, data]) => ({
        key: date || "unknown",
        title: !date
          ? "Date unavailable"
          : today.isSame(date, "day")
            ? "Today"
            : yesterday.isSame(date, "day")
              ? "Yesterday"
              : moment(date).format("DD MMM YYYY"),
        data,
      }))}
      keyExtractor={(event) => event.id}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 100,
        flexGrow: 1,
      }}
      stickySectionHeadersEnabled
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      onRefresh={() => {
        void query.refetch();
      }}
      ListHeaderComponent={
        query.data?.pages[0]?.cutoff ? (
          <CustomText style={styles.secondary}>
            Showing activity from your assignment.
          </CustomText>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          {query.isPending && query.isFetching ? (
            <ActivityIndicator size="large" color="#2E67BE" />
          ) : query.isError ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void query.refetch();
              }}
              style={styles.error}
            >
              <CustomText style={{ color: "#B91C1C" }}>
                Unable to load activity logs. Tap to retry.
              </CustomText>
            </Pressable>
          ) : (
            <CustomText style={styles.secondary}>
              No activity to show.
            </CustomText>
          )}
        </View>
      }
      ListFooterComponent={
        !query.isError && query.hasNextPage ? (
          <Pressable
            accessibilityRole="button"
            disabled={query.isFetching}
            onPress={() => {
              void query.fetchNextPage();
            }}
            style={{ padding: 14 }}
          >
            {query.isFetchingNextPage ? (
              <ActivityIndicator color="#2E67BE" />
            ) : (
              <CustomText style={{ color: "#2E67BE", textAlign: "center" }}>
                Load more
              </CustomText>
            )}
          </Pressable>
        ) : null
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <CustomText style={styles.sectionTitle}>{section.title}</CustomText>
          <View style={styles.sectionRule} />
        </View>
      )}
      renderItem={({ item, index, section }) => (
        <ActivityRow
          event={item}
          last={index === section.data.length - 1}
          opening={opening}
          details={activity?.id === item.id ? activity : null}
          onToggle={toggleDetails}
          onOpen={openTarget}
          onOpenUser={onOpenUser}
        />
      )}
    />
  );
}

function StatusBadge({ value, type }: { value: string; type?: string }) {
  const status = value.toLowerCase().replace(/[\s-]+/g, "_");
  const label =
    (type === "meeting" &&
      meetingStatus[status as keyof typeof meetingStatus]) ||
    statusObj[status as keyof typeof statusObj];
  const [icon, backgroundColor, color]: [
    React.ComponentProps<typeof Feather>["name"],
    string,
    string,
  ] = /cancel|lost|missed|negative|not_interested|disqualified|wrong/.test(
    status,
  )
    ? ["x-circle", "#FFE4E6", "#9F1239"]
    : /done|booked|complete|conducted|positive|^connected$/.test(status)
      ? ["check-circle", "#D1FAE5", "#065F46"]
      : /schedul/.test(status)
        ? ["calendar", "#E0E7FF", "#3730A3"]
        : /assign|claim/.test(status)
          ? ["user-check", "#E0F2FE", "#075985"]
          : /follow_?up|pending/.test(status)
            ? ["clock", "#FEF3C7", "#78350F"]
            : /call|response|contact|connect/.test(status)
              ? ["phone", "#CCFBF1", "#115E59"]
              : status === "active_hot"
                ? ["zap", "#FFEDD5", "#7C2D12"]
                : status === "active_cold"
                  ? ["wind", "#E0F2FE", "#075985"]
                  : ["circle", "#F1F5F9", "#334155"];
  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Feather name={icon} size={12} color={color} />
      <CustomText style={[styles.statusText, { color }]}>
        {typeof label === "string" ? label : value.replace(/_/g, " ")}
      </CustomText>
    </View>
  );
}

function StatusTransition({
  from,
  to,
  describe = false,
}: {
  from?: string;
  to?: string;
  describe?: boolean;
}) {
  return (
    <View style={styles.inline}>
      {describe && (
        <CustomText style={styles.badgeText}>Changed status from</CustomText>
      )}
      {!!from && <StatusBadge value={from} />}
      {!!from &&
        !!to &&
        (describe ? (
          <CustomText style={styles.badgeText}>to</CustomText>
        ) : (
          <Feather name="arrow-right" size={13} color="#64748B" />
        ))}
      {!!to && <StatusBadge value={to} />}
    </View>
  );
}

function ActivityRow({
  event,
  last,
  opening,
  details,
  onToggle,
  onOpen,
  onOpenUser,
}: {
  event: ActivityEvent;
  last: boolean;
  opening: string | null;
  details: ActivityEvent | null;
  onToggle: (event: ActivityEvent) => Promise<void>;
  onOpen: (target: NonNullable<ActivityEvent["target"]>) => Promise<void>;
  onOpenUser?: (userId: string) => void;
}) {
  const date = event.occurredAt ? moment(event.occurredAt) : null;
  const actor = event.actor?.name;
  const actorId = event.actor?.id;
  const initials = actor
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const accent =
    activityStyles[event.kind] ||
    activityStyles[event.kind.split("_")[0]] ||
    defaultActivityStyle;
  const canOpen = !!event.target && !event.restricted;
  const canOpenNote = canOpen && event.target?.type === "note";
  const canExpand =
    canOpen &&
    !["note", "status", "assignment"].includes(event.target?.type || "");
  const isNote =
    ["note_added", "note_updated"].includes(event.kind) && !event.restricted;
  const [transition, ...remarks] =
    event.kind === "status_changed" && !event.restricted
      ? event.summary.split(" · ")
      : [];
  const [from, to] = transition?.split(" → ") || [];
  const hasTransition = !!(from && to);
  const message = isNote
    ? event.summary
    : hasTransition
      ? remarks.join(" · ")
      : "";
  const statusOnly = hasTransition && !message.trim();
  const { status, outcome, ...content } = details?.details || {};
  const fields = Object.entries(content).filter(
    ([key, value]) =>
      !["mode", "locationQuery"].includes(key) && value != null && value !== "",
  );
  const target = details?.target;
  const assignment =
    !event.restricted && onOpenUser ? event.assignmentUsers : null;
  const renderUser = ({ id, name }: ProfileName) =>
    id && onOpenUser ? (
      <Text
        accessibilityRole="link"
        style={styles.inlineProfileLink}
        onPress={() => onOpenUser(id)}
      >
        {name}
      </Text>
    ) : (
      name
    );
  return (
    <View style={styles.row}>
      <CustomText style={styles.time}>
        {date?.isValid() ? date.format("hh:mm A") : "—"}
      </CustomText>
      <View style={styles.rail}>
        {!last && <View style={styles.connector} />}
        <View
          style={[styles.marker, { backgroundColor: accent.backgroundColor }]}
        >
          {initials ? (
            <CustomText style={[styles.initials, { color: accent.color }]}>
              {initials}
            </CustomText>
          ) : (
            <Feather
              name={event.restricted ? "lock" : "activity"}
              size={12}
              color={accent.color}
            />
          )}
        </View>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.inline}>
          {!!actor &&
            (onOpenUser && actorId ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => onOpenUser(actorId)}
                hitSlop={5}
                style={styles.actorLink}
              >
                <CustomText style={[styles.rowActor, styles.actorLinkText]}>
                  {actor}
                </CustomText>
              </Pressable>
            ) : (
              <CustomText style={styles.rowActor}>{actor}</CustomText>
            ))}
          {!statusOnly && (
            <View
              style={[
                styles.kindBadge,
                { backgroundColor: accent.backgroundColor },
              ]}
            >
              <Feather
                name={event.restricted ? "lock" : accent.icon}
                size={11}
                color={accent.color}
              />
              <CustomText style={[styles.kindText, { color: accent.color }]}>
                {event.kind.replace(/_/g, " ")}
              </CustomText>
            </View>
          )}
        </View>
        {hasTransition ? (
          <StatusTransition from={from} to={to} describe={statusOnly} />
        ) : (
          !isNote && (
            <CustomText style={styles.summary}>
              {assignment ? (
                <>
                  {assignment.from ? (
                    <>Reassigned lead from {renderUser(assignment.from)} to </>
                  ) : (
                    "Assigned lead to "
                  )}
                  {renderUser(assignment.to)}
                  {assignment.fresh && " (Fresh assignment)"}
                </>
              ) : (
                formatActivitySummary(event)
              )}
            </CustomText>
          )
        )}
        {!!message && (
          <CustomText
            style={styles.summary}
            numberOfLines={canOpenNote ? 2 : undefined}
          >
            {message}
          </CustomText>
        )}
        {event.unavailable && (
          <CustomText style={styles.secondary}>No longer available</CustomText>
        )}
        {(canOpenNote || canExpand) && (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                expanded: canExpand ? !!details : undefined,
              }}
              disabled={!!opening}
              onPress={() => {
                void onToggle(event);
              }}
              style={styles.detailsButton}
            >
              {opening === event.id ? (
                <ActivityIndicator size="small" color="#2E67BE" />
              ) : (
                <>
                  <CustomText style={styles.detailsLink}>
                    {canOpenNote
                      ? "Open note"
                      : details
                        ? "View less"
                        : "View more"}
                  </CustomText>
                  {canExpand && (
                    <Feather
                      name={details ? "chevron-up" : "chevron-down"}
                      size={13}
                      color="#2E67BE"
                    />
                  )}
                </>
              )}
            </Pressable>
            {canExpand && details && (
              <View style={styles.preview}>
                {!!(status || outcome) && (
                  <View style={styles.detailStatus}>
                    <StatusBadge
                      value={String(status || outcome)}
                      type={target?.type}
                    />
                  </View>
                )}
                {fields.map(([key, value]) => (
                  <View key={key} style={styles.detailField}>
                    <CustomText style={styles.detailLabel}>
                      {key.replace(/([A-Z])/g, " $1")}
                    </CustomText>
                    <View style={styles.detailValue}>
                      {key === "location" && target?.type === "meeting" ? (
                        <Pressable
                          accessibilityRole="link"
                          onPress={() => {
                            const query = encodeURIComponent(
                              String(content.locationQuery || value),
                            );
                            void Linking.openURL(
                              `https://www.google.com/maps?q=${query}`,
                            ).catch(() =>
                              Alert.alert(
                                "Unable to open Maps",
                                "Please try again.",
                              ),
                            );
                          }}
                        >
                          <CustomText
                            style={[styles.badgeText, styles.profileLink]}
                          >
                            {String(value)}
                          </CustomText>
                        </Pressable>
                      ) : (
                        <CustomText style={styles.badgeText}>
                          {["scheduledFor", "reminderTime"].includes(key)
                            ? formatFollowupDateTime(value as string)
                            : key === "duration" && event.kind === "call_saved"
                              ? formatActivityDuration(value)
                              : String(value)}
                        </CustomText>
                      )}
                    </View>
                  </View>
                ))}
                {!fields.length && !status && !outcome && (
                  <CustomText style={styles.badgeText}>
                    {details.summary}
                  </CustomText>
                )}
                {target?.type === "meeting" && (
                  <Pressable
                    accessibilityRole="link"
                    style={styles.detailsButton}
                    onPress={() => {
                      void onOpen(target);
                    }}
                  >
                    <CustomText style={styles.detailsLink}>
                      Open meeting
                    </CustomText>
                  </Pressable>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  secondary: { fontSize: 11, color: "#64748B", marginTop: 6 },
  summary: { fontSize: 13, color: "#475569", lineHeight: 20, marginTop: 5 },
  empty: {
    flex: 1,
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#475569",
  },
  sectionRule: { height: 1, flex: 1, backgroundColor: "#E2E8F0" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  time: {
    width: 59,
    paddingTop: 5,
    fontSize: 11,
    color: "#64748B",
    fontVariant: ["tabular-nums"],
  },
  rail: { width: 26, alignSelf: "stretch", alignItems: "center" },
  connector: {
    position: "absolute",
    top: 24,
    bottom: 0,
    width: 1,
    backgroundColor: "#CBD5E1",
  },
  marker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 10, fontWeight: "700" },
  rowBody: { flex: 1, minWidth: 0, paddingTop: 2, paddingBottom: 13 },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 4,
  },
  rowActor: { fontSize: 13, color: "#1E293B", fontWeight: "700" },
  actorLink: {
    flexShrink: 1,
    paddingBottom: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2E67BE",
  },
  actorLinkText: { color: "#2E67BE" },
  profileLink: { color: "#2E67BE", textDecorationLine: "underline" },
  inlineProfileLink: { textDecorationLine: "underline" },
  kindBadge: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  kindText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusBadge: {
    alignSelf: "flex-start",
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  badgeText: { flexShrink: 1, fontSize: 12, color: "#334155" },
  preview: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  detailField: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 5,
  },
  detailLabel: {
    width: 68,
    fontSize: 11,
    color: "#64748B",
    textTransform: "capitalize",
  },
  detailValue: { flex: 1, minWidth: 0 },
  detailStatus: { marginBottom: 6 },
  detailsButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 30,
  },
  detailsLink: { fontSize: 12, fontWeight: "700", color: "#2E67BE" },
  error: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    marginTop: 10,
  },
});
