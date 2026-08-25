import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import CustomText from "../../myComponents/CustomText/CustomText";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { debounce } from "../../utils/debounce";
import { useRSVPEventAgents, useRSVPEventOptions } from "./rsvpApi";

const RSVPAgentsList = ({ route }: any) => {
  const navigation: any = useNavigation();
  const [eventId, setEventId] = useState(route.params?.eventId || "");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: eventsData } = useRSVPEventOptions();
  const events = eventsData?.data || [];
  const selectedEvent = useMemo(
    () =>
      events.find((event: any) => event._id === eventId) || route.params?.event,
    [eventId, events, route.params?.event],
  );
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useRSVPEventAgents({ eventId, search: debouncedSearch });
  const agents = data?.pages?.flatMap((page: any) => page?.data || []) || [];
  const totalAgents = (data?.pages?.[0] as any)?.pagination?.totalItem || 0;

  const onSearch = React.useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 400),
    [],
  );

  return (
    <Container>
      <Header title="Agents" totalCount={totalAgents} />
      <FlatList
        data={agents}
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
            <Dropdown
              style={styles.dropdown}
              data={events}
              labelField="title"
              valueField="_id"
              value={eventId}
              placeholder="Select event"
              placeholderStyle={styles.placeholder}
              selectedTextStyle={styles.selectedText}
              onChange={(event: any) => {
                setEventId(event._id);
                navigation.replace("RSVPAgentsList", {
                  eventId: event._id,
                  event,
                });
              }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate("RSVPClientsList", {
                eventId,
                agentId: item._id,
                event: selectedEvent,
                agent: item,
              })
            }
          >
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <CustomText style={styles.avatarText}>
                  {(item.name || "?").slice(0, 1).toUpperCase()}
                </CustomText>
              </View>
              <View style={styles.content}>
                <CustomText style={styles.name}>
                  {[item.name, item.lastName].filter(Boolean).join(" ") || "-"}
                </CustomText>
                <CustomText style={styles.email}>{item.email || "-"}</CustomText>
              </View>
              <Feather name="chevron-right" size={20} color="#2E67BE" />
            </View>
            <View style={styles.metricsRow}>
              {[["Leads", item.assignedLeadCount], ["Sent", item.invitationCount], ["Accepted", item.acceptedInvitationCount], ["Pending", item.pendingInvitationCount], ["Declined", item.declinedInvitationCount], ["Attended", item.attendedCount]].map(([label, value]) => (
                <View key={label} style={styles.metric}>
                  <CustomText style={styles.metricValue}>{value || 0}</CustomText>
                  <CustomText style={styles.metricLabel}>{label}</CustomText>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
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
  dropdown: {
    height: 48,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D7E2F3",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
  },
  placeholder: { color: "#8C97A8" },
  selectedText: { color: "#2F3A4A", fontSize: 15 },
  card: {
    marginHorizontal: 12,
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E7EDF5",
  },
  topRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2E67BE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  content: { flex: 1, marginLeft: 12 },
  name: { color: "#263548", fontWeight: "700", fontSize: 15 },
  email: { color: "#788497", fontSize: 12, marginTop: 3 },
  metricsRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#EDF2F7", marginTop: 9, paddingTop: 8 },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { color: "#2E67BE", fontWeight: "700", fontSize: 13 },
  metricLabel: { color: "#788497", fontSize: 8, marginTop: 1 },
  loader: { marginTop: 60 },
});

export default RSVPAgentsList;
