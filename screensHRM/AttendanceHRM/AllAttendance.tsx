import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CardHRM from "../../myComponentsHRM/CardHRM/CardHRM";
import RowAttendance from "../../myComponentsHRM/Row/RowAttendance";
import RowSingleUserAtt from "../../myComponentsHRM/Row/RowSingleUserAtt";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CircularBarChart from "../../myComponentsHRM/CircularBarChart/CircularBarChart";
import ListingSearch from "../../myComponentsHRM/SearchBox/ListingSearch";
import { useHRMListingSearch } from "../../hooks/useHRMListingSearch";
import { useAttendanceListing } from "../../hooks/useAttendanceListing";
import { selectUser } from "../../redux/userSlice";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { approveAttendance } from "../../services/hrmApi/attendanceListApi";
import { checkPermission } from "../../utils/commonFunctions";
import { canViewAttendanceSummary } from "../../utils/attendanceSummary";
import {
  AttendanceTab,
  attendanceTabQueryKey,
  getAttendanceTabs,
} from "../../utils/attendanceTabs";
import { routeAttendance } from "../../utils/routesHRM";
import { queryKeyHRM } from "../../utils/queryKeys";
import { useAppToast } from "../../components/AppToast";
import AttendanceAutoApproval, {
  attendanceSettingsKey,
} from "./AttendanceAutoApproval";
import { canManageAttendanceAutoApproval } from "../../utils/attendanceAutoApproval";

const AllAttendance = () => {
  const { user } = useSelector(selectUser);
  const { data: permission = {} } = useGetUserPermission(user?._id);
  const isAgent = user?.role === "agent";
  const showAttendanceSummary = canViewAttendanceSummary(
    permission,
    user?.role,
  );
  const tabs = getAttendanceTabs(user?.role);
  const [selectedTab, setSelectedTab] = useState<AttendanceTab>("all");
  const activeTab = tabs.some((tab) => tab.key === selectedTab)
    ? selectedTab
    : "all";
  const { navigate } = useNavigation<any>();
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const [searchSubmit, setSearchSubmit] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const approvalLock = useRef(false);
  const updateSearch = useCallback(
    (search: string) =>
      setSearchSubmit((prev) =>
        prev.search === search ? prev : { ...prev, search },
      ),
    [],
  );
  const search = useHRMListingSearch(updateSearch);
  const {
    data,
    totalCount,
    isLoading,
    isError,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useAttendanceListing({
    ...searchSubmit,
    tab: activeTab,
    accountId: user?._id,
    role: user?.role,
    userId: isAgent ? user?._id : "",
  });
  const approval = useMutation({
    mutationFn: approveAttendance,
    onSuccess: () => {
      for (const tab of ["all", "issues", "unapproved"] as AttendanceTab[])
        void queryClient.invalidateQueries({
          queryKey: [attendanceTabQueryKey(tab)],
        });
      void queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getAttendanceChart],
      });
      void queryClient.invalidateQueries({
        queryKey: ["getSingleUserAttList"],
      });
      toast.success("Attendance approved");
    },
    onError: (error: any) => {
      const message = error?.response?.data;
      toast.error(
        typeof message === "string"
          ? message
          : message?.message || "Unable to approve attendance",
      );
    },
  });
  const canApprove =
    !isAgent &&
    checkPermission(permission, "HRMS", "attendanceApproval", user?.role);
  const confirmApprove = (id: string) => {
    if (!canApprove || approvalLock.current || approval.isPending) return;
    Alert.alert(
      "Approve attendance?",
      "This record will move to All Attendance.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            if (approvalLock.current) return;
            approvalLock.current = true;
            try {
              await approval.mutateAsync(id);
            } catch {
              /* Mutation displays the error. */
            } finally {
              approvalLock.current = false;
            }
          },
        },
      ],
    );
  };
  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({
        queryKey: [attendanceTabQueryKey(activeTab)],
      });
      if (showAttendanceSummary)
        void queryClient.invalidateQueries({
          queryKey: [queryKeyHRM.getAttendanceChart],
        });
      if (canManageAttendanceAutoApproval(user?.role))
        void queryClient.invalidateQueries({ queryKey: attendanceSettingsKey });
    }, [queryClient, activeTab, showAttendanceSummary, user?.role]),
  );
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      if (canManageAttendanceAutoApproval(user?.role))
        await queryClient.invalidateQueries({
          queryKey: attendanceSettingsKey,
        });
      if (showAttendanceSummary)
        await queryClient.invalidateQueries({
          queryKey: [queryKeyHRM.getAttendanceChart],
        });
    } finally {
      setRefreshing(false);
    }
  };
  const openAttendance = (item: any) => {
    if (
      !checkPermission(permission, "HRMS", "viewAttendanceDetails", user?.role)
    ) {
      toast.error("You are not authorized to view attendance details.");
      return;
    }
    navigate(
      activeTab === "all" && !isAgent
        ? routeAttendance.UserAttendanceList
        : routeAttendance.AttendanceDetail,
      { item },
    );
  };
  return (
    <ContainerHRM
      headingTitle="Attendance"
      totalCount={totalCount}
      onPressSearch={search.toggleSearch}
      showSearch={search.showSearch}
      childStyle={{ flex: 1, height: undefined }}
    >
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          accessibilityRole="tablist"
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.key }}
              onPress={() => {
                setSelectedTab(tab.key);
                search.listRef.current?.scrollToOffset({
                  offset: 0,
                  animated: false,
                });
              }}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {search.showSearch && (
        <ListingSearch
          value={search.searchValue}
          onChangeText={search.setSearchValue}
          onClose={search.closeSearch}
          dates={searchSubmit}
          onDateChange={(key, value) =>
            setSearchSubmit((prev) => ({ ...prev, [key]: value }))
          }
        />
      )}
      <FlatList
        key={activeTab}
        ref={search.listRef}
        data={data}
        keyExtractor={(item) => String(item._id)}
        ListHeaderComponent={
          <>
            <AttendanceAutoApproval role={user?.role} userId={user?._id} />
            {showAttendanceSummary && (
              <>
                <CircularBarChart type="attendanceChart" />
                <CardHRM />
              </>
            )}
            <Text style={styles.listTitle}>
              {tabs.find((tab) => tab.key === activeTab)?.label}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            {isAgent ? (
              <RowSingleUserAtt
                item={item}
                onPress={() => openAttendance(item)}
              />
            ) : (
              <RowAttendance
                item={item}
                onPress={() => openAttendance(item)}
                action={
                  activeTab === "unapproved" && canApprove ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Approve attendance for ${item.name || "employee"}`}
                      hitSlop={4}
                      disabled={approval.isPending}
                      onPress={() => confirmApprove(item._id)}
                      style={[
                        styles.approveButton,
                        approval.isPending && { opacity: 0.5 },
                      ]}
                    >
                      <Text style={styles.approveText}>
                        {approval.isPending && approval.variables === item._id
                          ? "Approving…"
                          : "Approve"}
                      </Text>
                    </Pressable>
                  ) : undefined
                }
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingCompo />
          ) : isError ? (
            <View style={styles.empty}>
              <Text style={styles.error}>Unable to load attendance.</Text>
              <Pressable
                accessibilityRole="button"
                disabled={isFetching}
                onPress={() => refetch()}
                style={styles.retry}
              >
                <Text style={styles.approveText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <NoDataFound height={200} width={200} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color="#2E67BE" style={{ marginVertical: 12 }} />
          ) : isError && data.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => refetch()}
              style={styles.empty}
            >
              <Text style={styles.error}>Unable to refresh. Tap to retry.</Text>
            </Pressable>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchingNextPage)
            void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </ContainerHRM>
  );
};
export default AllAttendance;

const styles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E4EAF2",
  },
  tabs: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  activeTab: { backgroundColor: "#2E67BE" },
  tabText: { color: "#475467", fontSize: 13, fontWeight: "600" },
  activeTabText: { color: "#fff" },
  listContent: { paddingBottom: 160, paddingHorizontal: 12, paddingTop: 12 },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2939",
    marginTop: 8,
    marginBottom: 12,
  },
  row: { marginBottom: 10 },
  approveButton: {
    paddingHorizontal: 14,
    minWidth: 90,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E67BE",
    borderRadius: 8,
  },
  approveText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  empty: { alignItems: "center", padding: 20 },
  error: { color: "#B42318", fontSize: 13 },
  retry: {
    backgroundColor: "#2E67BE",
    padding: 12,
    marginTop: 12,
    borderRadius: 10,
  },
});
