import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import {
  AttendanceEmployee,
  getAttendanceEmployees,
} from "../../services/hrmApi/attendanceListApi";
import { attendanceUserName } from "../../utils/attendanceDisplay";
import ModalWithBlur from "../ModalWithBlur/ModalWithBlur";

export default function AttendanceEmployeeSelect({
  employee,
  onSelect,
}: {
  employee: AttendanceEmployee;
  onSelect: (employee: AttendanceEmployee) => void;
}) {
  const { user } = useSelector(selectUser);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);
  const query = useInfiniteQuery({
    queryKey: ["attendanceEmployees", user?._id, search],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      getAttendanceEmployees({ search, pageParam, signal }),
    getNextPageParam: (page) =>
      page.pagination.currentPage < page.pagination.totalPage
        ? Number(page.pagination.currentPage) + 1
        : undefined,
    enabled: open && !!user?._id,
    retry: false,
  });
  const pendingSearch = input.trim() !== search;
  const employees = [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.data)
        .map((item) => [item._id, item]) ?? [],
    ).values(),
  ];
  const close = () => {
    setOpen(false);
    setInput("");
    setSearch("");
  };
  const status = (query.error as any)?.response?.status;
  const denied = status === 401 || status === 403;
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select employee"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Employee</Text>
          <Text numberOfLines={1} style={styles.name}>
            {attendanceUserName(employee)}
          </Text>
        </View>
        <Feather name="chevron-down" size={20} color="#002E6B" />
      </Pressable>
      <ModalWithBlur
        visible={open}
        onClose={close}
        contentHeight="75%"
        scrollableContent
      >
        <Text style={styles.heading}>Select employee</Text>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#64748B" />
          <TextInput accessibilityLabel="Search employee by name or email" placeholder="Search name or email"
            placeholderTextColor="#64748B" value={input} onChangeText={setInput}
            autoCapitalize="none" autoCorrect={false} style={styles.input} />
          {!!input && <Pressable accessibilityRole="button" accessibilityLabel="Clear employee search"
            onPress={() => setInput("")} style={styles.clear}>
            <Feather name="x" size={18} color="#64748B" />
          </Pressable>}
        </View>
        {pendingSearch || query.isLoading ? (
          <ActivityIndicator color="#002E6B" />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={denied ? [] : employees}
            keyExtractor={(item) => item._id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: item._id === employee._id }}
                style={[
                  styles.option,
                  item._id === employee._id && styles.selected,
                ]}
                onPress={() => {
                  onSelect(item);
                  close();
                }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.name}>{attendanceUserName(item)}</Text>
                  {!!item.email && <Text style={styles.label}>{item.email}</Text>}
                </View>
                {item._id === employee._id && <Feather name="check" size={20} color="#002E6B" />}
              </Pressable>
            )}
            ListEmptyComponent={
              !query.isError ? (
                <Text style={styles.message}>No employees found.</Text>
              ) : undefined
            }
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetching && !query.isError)
                void query.fetchNextPage();
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              <>
                {query.isFetchingNextPage && (
                  <ActivityIndicator color="#002E6B" />
                )}
                {query.isError && (
                  <View style={styles.error} accessibilityRole="alert">
                    <Text>
                      {denied
                        ? "Employee list is not available to your account."
                        : "Unable to load employees. Please try again."}
                    </Text>
                    {!denied && (
                      <Pressable
                        accessibilityRole="button"
                        disabled={query.isFetching}
                        style={{ minHeight: 44, justifyContent: "center" }}
                        onPress={() => {
                          void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch());
                        }}
                      >
                        <Text style={styles.retry}>{query.isFetching ? "Retrying…" : "Retry"}</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </>
            }
          />
        )}
      </ModalWithBlur>
    </>
  );
}
const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
  },
  label: { color: "#64748B", fontSize: 13, marginBottom: 3 },
  name: { color: "#1E293B", fontSize: 16 },
  heading: {
    color: "#002E6B",
    fontSize: 20,
    marginBottom: 18,
    paddingRight: 35,
  },
  searchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, paddingLeft: 12, marginBottom: 12 },
  input: { flex: 1, minWidth: 0, minHeight: 48, padding: 12, color: "#1E293B" },
  clear: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  option: { flexDirection: "row", alignItems: "center", minHeight: 64, padding: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 10 },
  selected: { backgroundColor: "#EFF6FF" },
  message: { textAlign: "center", color: "#64748B", padding: 20 },
  error: {
    backgroundColor: "#FFF7ED",
    padding: 14,
    borderRadius: 10,
    marginVertical: 12,
  },
  retry: { color: "#002E6B", paddingTop: 12, fontWeight: "600" },
});
