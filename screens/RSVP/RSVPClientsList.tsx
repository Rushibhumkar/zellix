import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Feather, FontAwesome } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { Buffer } from "buffer";
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
  getRSVPEventClients,
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

const formatSelectedDateAndSlot = (client: any) => {
  if (client?.responseStatus !== "Accepted" || !client?.selectedDate) {
    return { date: "-", slot: "" };
  }

  const selectedDate = moment(client.selectedDate, "YYYY-MM-DD", true);
  const slotLabels: Record<string, string> = {
    "9am-12pm": "9 AM – 12 PM",
    "12pm-4pm": "12 PM – 4 PM",
    "4pm-8pm": "4 PM – 8 PM",
  };

  return {
    date: selectedDate.isValid() ? selectedDate.format("DD MMM YYYY") : "-",
    slot: slotLabels[client.timeSlot] || client.timeSlot || "",
  };
};

const formatExportDateTime = (value: any) =>
  value && moment(value).isValid()
    ? moment(value).format("DD MMM YYYY, hh:mm A")
    : "";

const getWhatsAppLink = (client: any) => {
  const phoneNumber = String(
    client?.whatsappNum || client?.clientMobile || "",
  ).replace(/\D/g, "");

  return phoneNumber ? `https://wa.me/${phoneNumber}` : "";
};

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
  const [isExporting, setIsExporting] = useState(false);
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

  const copyRsvpLink = async (rsvpLink: string) => {
    if (!rsvpLink) return;

    try {
      await Clipboard.setStringAsync(rsvpLink);
      toast.success("RSVP link copied");
    } catch {
      toast.error("Unable to copy RSVP link");
    }
  };

  const exportClients = async () => {
    if (isExporting) return;
    if (!eventId) {
      toast.error("Select an event before exporting clients");
      return;
    }

    try {
      setIsExporting(true);
      const exportRows: any[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await getRSVPEventClients({
          eventId,
          agentId,
          pageParam: page,
          limit: 500,
          search: debouncedSearch,
        });
        exportRows.push(...(response?.data || []));
        totalPages = response?.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);

      if (!exportRows.length) {
        toast.error("No clients available to export");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(
        exportRows.map((client: any) => {
          const assignedAgent = [
            client?.agent?.name,
            client?.agent?.lastName,
          ]
            .filter(Boolean)
            .join(" ");
          const comments = Array.isArray(client.comments)
            ? client.comments.join(" | ")
            : client.comments || "";
          const { date: selectedDate, slot: selectedTimeSlot } =
            formatSelectedDateAndSlot(client);

          return {
            "Client Name": client.clientName || "",
            Email: client.clientEmail || "",
            Mobile: client.clientMobile || "",
            WhatsApp: getWhatsAppLink(client),
            Event: selectedEvent?.title || "",
            "Assigned Agent":
              assignedAgent ||
              client.assignedUserName ||
              client.initialAssigneeName ||
              "",
            Source: client.source || "",
            "RSVP Status": client.responseStatus || "Not sent",
            "Selected Date": selectedDate === "-" ? "" : selectedDate,
            "Selected Time Slot": selectedTimeSlot,
            Guests: client.guests ?? "",
            "Attendance Status": client.attendStatus || "Not Attended",
            "Client Notes": client.clientNotes || "",
            Comments: comments,
            "Lead Received At": formatExportDateTime(client.receivedAt),
            "Assigned At": formatExportDateTime(client.assignedAt),
            "Invitation Sent At": formatExportDateTime(client.invitationSentAt),
            "RSVP Response At": formatExportDateTime(client.responseTime),
            "RSVP Expires At": formatExportDateTime(client.rsvpExpiresAt),
            "RSVP Link": client.rsvpLink || "",
          };
        }),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "RSVP Clients");
      const binary = XLSX.write(workbook, { type: "binary", bookType: "xlsx" });
      const fileUri = `${FileSystem.documentDirectory}rsvp-clients-${Date.now()}.xlsx`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(binary, "binary").toString("base64"),
        { encoding: "base64" },
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        toast.success("RSVP client export created");
      }
    } catch (error) {
      toast.error("Unable to export RSVP clients");
    } finally {
      setIsExporting(false);
    }
  };

  const sendRsvpOnWhatsApp = async (client: any) => {
    if (!client?.rsvpLink) return;

    const phoneNumber = String(
      client?.whatsappNum || client?.clientMobile || "",
    ).replace(/\D/g, "");
    if (!phoneNumber) {
      toast.error("WhatsApp or mobile number is not available");
      return;
    }

    const eventName = selectedEvent?.title || "the event";
    const startDateTime = selectedEvent?.startDateTime
      ? moment(selectedEvent.startDateTime)
      : null;
    const endDateTime = selectedEvent?.endDateTime
      ? moment(selectedEvent.endDateTime)
      : null;
    const eventDate = startDateTime
      ? endDateTime && !startDateTime.isSame(endDateTime, "day")
        ? `${startDateTime.format("DD MMM YYYY")} – ${endDateTime.format("DD MMM YYYY")}`
        : startDateTime.format("DD MMM YYYY")
      : "To be confirmed";
    const eventTime = startDateTime
      ? `${startDateTime.format("hh:mm A")}${endDateTime ? ` – ${endDateTime.format("hh:mm A")}` : ""}`
      : "To be confirmed";
    const eventVenue = selectedEvent?.location || "To be confirmed";
    const message = `Dear ${client.clientName || "Valued Guest"},

Thank you for registering for our ${eventName}.

We are pleased to confirm your RSVP and look forward to welcoming you to an exclusive event hosted by SKG Estates in collaboration with Damac Properties.

Event Details
📅 Date: ${eventDate}
🕐 Time: ${eventTime}
📍 Venue: ${eventVenue}

Join us to explore the latest developments and discover exceptional investment opportunities in Dubai. Meet with our property experts, gain valuable Dubai market insights, and receive personalized guidance to help you make informed investment decisions.

Our team will be available throughout the event to answer your questions and assist you in finding the opportunity that best matches your goals.

We look forward to welcoming you.

RSVP Link: ${client.rsvpLink}`;

    try {
      await Linking.openURL(
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      );
    } catch {
      toast.error("Unable to open WhatsApp");
    }
  };

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
    const hasActiveRsvpLink =
      Boolean(item.rsvpLink) &&
      (!item.rsvpExpiresAt || moment(item.rsvpExpiresAt).isAfter(moment()));
    const selectedDateAndSlot = formatSelectedDateAndSlot(item);

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
          <View style={styles.dateTimeColumn}>
            {/* <Feather name="calendar" size={14} color="#2E67BE" /> */}
            <CustomText style={styles.dateLabel}>
              Selected Date & Slot
            </CustomText>
            <CustomText style={styles.dateText}>
              {selectedDateAndSlot.date}
            </CustomText>
            <CustomText style={styles.timeText}>
              {selectedDateAndSlot.slot}
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
        <View style={styles.actions}>
          {(!item.responseStatus || item.responseStatus === "Pending") &&
            canManage && (
              <TouchableOpacity
                accessibilityLabel={
                  item.responseStatus
                    ? "Resend RSVP on email"
                    : "Send RSVP on email"
                }
                disabled={loadingId === item._id}
                onPress={() =>
                  runAction(item._id, () =>
                    sendRSVPForEventLead({ eventId, eventLeadId: item._id }),
                  )
                }
                style={styles.actionIcon}
              >
                <Feather name="mail" size={18} color="#2E67BE" />
              </TouchableOpacity>
            )}
          {canManage && hasActiveRsvpLink && (
            <TouchableOpacity
              accessibilityLabel="Copy RSVP link"
              onPress={() => copyRsvpLink(item.rsvpLink)}
              style={styles.actionIcon}
            >
              <Feather name="copy" size={17} color="#2E67BE" />
            </TouchableOpacity>
          )}
          {canManage &&
            hasActiveRsvpLink &&
            (item.whatsappNum || item.clientMobile) && (
              <TouchableOpacity
                accessibilityLabel="Send RSVP on WhatsApp"
                onPress={() => sendRsvpOnWhatsApp(item)}
                style={styles.actionIcon}
              >
                <FontAwesome name="whatsapp" size={19} color="#128C42" />
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
              style={styles.checkInButton}
            >
              <Feather name="check-circle" size={15} color="#FFF" />
              <CustomText style={styles.checkIn}>Check in</CustomText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Container>
      <Header
        title="Clients"
        totalCount={totalClients}
        showActions
        buttons={[
          {
            title: isExporting ? "Exporting" : "Export",
            onPress: exportClients,
            icon: <Feather name="download" size={18} color="#FFF" />,
          },
        ]}
      />
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
  dateTimeColumn: {
    alignItems: "flex-end",
    marginLeft: 10,
    minWidth: 104,
  },
  dateLabel: {
    color: "#788497",
    fontSize: 10,
    marginTop: 3,
    textAlign: "right",
  },
  dateText: { color: "#43526A", fontSize: 11, marginTop: 3 },
  timeText: { color: "#788497", fontSize: 11, marginTop: 1 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E7EDF5",
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F6FE",
  },
  checkInButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#14803D",
  },
  checkIn: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  loader: { marginTop: 60 },
});

export default RSVPClientsList;
