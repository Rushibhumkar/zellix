import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import CustomText from "../../myComponents/CustomText/CustomText";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { debounce } from "../../utils/debounce";
import { useAppToast } from "../../components/AppToast";
import {
  checkInRSVPEventLead,
  sendRSVPForEventLead,
  updateRSVPEventLeadStatus,
  useRSVPEventAgents,
  useRSVPEventClients,
  useRSVPEventOptions,
} from "./rsvpApi";

const badgeColors: any = {
  Accepted: ["#DCFCE7", "#047857"],
  Declined: ["#FEE2E2", "#B91C1C"],
  Pending: ["#FEF3C7", "#B45309"],
  "Not sent": ["#F1F5F9", "#475569"],
  Attended: ["#DCFCE7", "#047857"],
  "Not Attended": ["#F1F5F9", "#475569"],
  "-": ["#F1F5F9", "#64748B"],
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.message ||
  error?.response?.data ||
  error?.message ||
  "Unable to update client";

const hasAttendingTimeArrived = (dateTime: any) =>
  Boolean(dateTime) &&
  moment(dateTime).isValid() &&
  Date.now() >= moment(dateTime).valueOf();

const StatusBadge = ({ value }: any) => {
  const [backgroundColor, color] = badgeColors[value] || badgeColors["-"];
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <CustomText style={[styles.badgeText, { color }]}>{value}</CustomText>
    </View>
  );
};

const RSVPClientsList = ({ route }: any) => {
  const toast = useAppToast();
  const queryClient = useQueryClient();
  const { user } = useSelector(selectUser);
  const isAgent = user?.role === "agent";
  const isOwnAgentView = Boolean(route.params?.isOwnAgentView) || isAgent;
  const [eventId, setEventId] = useState(route.params?.eventId || "");
  const [agentId, setAgentId] = useState(
    route.params?.agentId || (isOwnAgentView ? user?._id : ""),
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const { data: eventsData } = useRSVPEventOptions();
  const events = eventsData?.data || [];
  const { data: agentsData } = useRSVPEventAgents({ eventId, search: "" });
  const agents =
    agentsData?.pages?.flatMap((page: any) => page?.data || []) || [];
  const agentOptions = [
    { _id: "", name: "All agents" },
    ...agents.map((agent: any) => ({
      ...agent,
      name: [agent.name, agent.lastName].filter(Boolean).join(" ") || "-",
    })),
  ];
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useRSVPEventClients({ eventId, agentId, search: debouncedSearch });
  const clients = data?.pages?.flatMap((page: any) => page?.data || []) || [];
  const totalClients = (data?.pages?.[0] as any)?.pagination?.totalItem || 0;
  const isAdmin = ["sup_admin", "sub_admin"].includes(user?.role);
  const selectedEvent = useMemo(
    () =>
      events.find((event: any) => event._id === eventId) || route.params?.event,
    [eventId, events, route.params?.event],
  );

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["rsvpEventClients"] });
    await queryClient.invalidateQueries({ queryKey: ["rsvpEventAgents"] });
  };
  const onSearch = React.useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 400),
    [],
  );

  const runAction = async (id: string, action: () => Promise<any>) => {
    try {
      setLoadingId(id);
      const response = await action();
      toast.success(response?.message || "Client updated successfully");
      await invalidate();
    } catch (error) {
      toast.error(String(getErrorMessage(error)));
    } finally {
      setLoadingId("");
    }
  };

  const chooseStatus = (
    client: any,
    type: "responseStatus" | "attendStatus",
  ) => {
    const values =
      type === "responseStatus"
        ? ["Pending", "Accepted", "Declined"]
        : ["Not Attended", "Attended"];
    Alert.alert(
      type === "responseStatus" ? "Update RSVP" : "Update attendance",
      "Select a status",
      [
        ...values.map((value) => ({
          text: value,
          onPress: () =>
            runAction(client._id, () =>
              updateRSVPEventLeadStatus({
                eventId,
                eventLeadId: client._id,
                [type]: value,
              }),
            ),
        })),
        { text: "Cancel", style: "cancel" as const },
      ],
    );
  };

  const renderClient = ({ item }: any) => {
    const responseStatus = item.responseStatus || "Not sent";
    const attendanceAvailable =
      responseStatus === "Accepted" &&
      hasAttendingTimeArrived(item.attendingDateTime);
    const canManage =
      isAdmin || String(item.initialAssigneeId) === String(user?._id);
    const canCheckIn =
      canManage && attendanceAvailable && item.attendStatus !== "Attended";
    const attendance = attendanceAvailable
      ? item.attendStatus || "Not Attended"
      : "-";

    return (
      <View style={styles.card}>
        <View style={styles.rowTop}>
          <View style={styles.avatar}>
            <CustomText style={styles.avatarText}>
              {(item.clientName || "?").slice(0, 1).toUpperCase()}
            </CustomText>
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.name}>
              {item.clientName || "-"}
            </CustomText>
            <CustomText style={styles.subText}>
              {item.clientEmail || "-"}
            </CustomText>
            <CustomText style={styles.subText}>
              {item.clientMobile || "-"}
            </CustomText>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.statusRow}>
          <View style={styles.statusGroup}>
            <CustomText style={styles.label}>RSVP</CustomText>
            <TouchableOpacity
              disabled={
                !canManage || !item.invitationId || loadingId === item._id
              }
              onPress={() => chooseStatus(item, "responseStatus")}
            >
              <StatusBadge value={responseStatus} />
            </TouchableOpacity>
          </View>
          <View style={styles.statusGroup}>
            <CustomText style={styles.label}>Attendance</CustomText>
            <TouchableOpacity
              disabled={
                !canManage || !attendanceAvailable || loadingId === item._id
              }
              onPress={() => chooseStatus(item, "attendStatus")}
            >
              <StatusBadge value={attendance} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.slotRow}>
          <Feather name="calendar" size={14} color="#2E67BE" />
          <CustomText style={styles.slotText}>
            {responseStatus === "Accepted" && item.attendingDateTime
              ? moment(item.attendingDateTime).format("DD MMM YYYY, hh:mm A")
              : "-"}
          </CustomText>
        </View>
        <View style={styles.actions}>
          {(!item.responseStatus || item.responseStatus === "Pending") &&
            canManage && (
              <TouchableOpacity
                disabled={loadingId === item._id}
                onPress={() =>
                  runAction(item._id, () =>
                    sendRSVPForEventLead({ eventId, eventLeadId: item._id }),
                  )
                }
              >
                <CustomText style={styles.primaryAction}>
                  {item.responseStatus ? "Resend RSVP" : "Send RSVP"}
                </CustomText>
              </TouchableOpacity>
            )}
          {canCheckIn && (
            <TouchableOpacity
              disabled={loadingId === item._id}
              onPress={() =>
                runAction(item._id, () =>
                  checkInRSVPEventLead({ eventId, eventLeadId: item._id }),
                )
              }
            >
              <CustomText style={styles.checkIn}>Check in</CustomText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Container>
      <Header title="Clients" totalCount={totalClients} />
      <FlatList
        data={clients}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.filters}>
            <SearchBar
              value={search}
              onChangeText={(value: string) => {
                setSearch(value);
                onSearch(value);
              }}
              onClickCancel={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
            />
            <View style={styles.dropdownRow}>
              <Dropdown
                style={[
                  styles.dropdown,
                  isOwnAgentView ? styles.fullDropdown : styles.halfDropdown,
                ]}
                data={events}
                labelField="title"
                valueField="_id"
                value={eventId}
                placeholder="Select event"
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectedText}
                onChange={(event: any) => {
                  setEventId(event._id);
                  setAgentId(isOwnAgentView ? user?._id : "");
                }}
              />
              {!isOwnAgentView && (
                <Dropdown
                  style={[styles.dropdown, styles.halfDropdown]}
                  data={agentOptions}
                  labelField="name"
                  valueField="_id"
                  value={agentId}
                  placeholder="All agents"
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  renderItem={(agent: any) => (
                    <View style={styles.dropdownItem}>
                      <CustomText>{agent.name}</CustomText>
                    </View>
                  )}
                  onChange={(agent: any) => setAgentId(agent._id)}
                />
              )}
            </View>
          </View>
        }
        renderItem={renderClient}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.loader} color="#2E67BE" />
          ) : (
            <NoDataFound showTxt />
          )
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color="#2E67BE" /> : null
        }
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: 100, flexGrow: 1 },
  filters: { gap: 12, marginBottom: 8 },
  dropdownRow: { flexDirection: "row" },
  dropdown: {
    marginHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#D7E2F3",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
  },
  halfDropdown: { flex: 1, minWidth: 0 },
  fullDropdown: { flex: 1 },
  placeholder: { color: "#8C97A8" },
  selectedText: { color: "#2F3A4A", fontSize: 15 },
  dropdownItem: { padding: 12 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E7EDF5",
  },
  rowTop: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2E67BE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  name: { color: "#263548", fontWeight: "700", fontSize: 15 },
  subText: { color: "#788497", fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "#E7EDF5", marginVertical: 12 },
  statusRow: { flexDirection: "row", justifyContent: "space-between" },
  statusGroup: { gap: 6 },
  label: { color: "#788497", fontSize: 11 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: { fontWeight: "700", fontSize: 12 },
  slotRow: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    marginTop: 14,
  },
  slotText: { color: "#43526A", fontSize: 13 },
  actions: { flexDirection: "row", gap: 18, marginTop: 14 },
  primaryAction: { color: "#2E67BE", fontWeight: "700" },
  checkIn: { color: "#14803D", fontWeight: "700" },
  loader: { marginTop: 60 },
});

export default RSVPClientsList;
