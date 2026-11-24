import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import HRMFilters, {
  HRMFilterValues,
  hrmFilterCount,
} from "../../myComponentsHRM/SearchBox/HRMFilters";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import AttendanceEmployeeSelect from "../../myComponentsHRM/SearchBox/AttendanceEmployeeSelect";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import RowSingleUserAtt from "../../myComponentsHRM/Row/RowSingleUserAtt";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGetSingleUserAttList } from "../../hooks/useGetQuerryHRM";
import { routeAttendance } from "../../utils/routesHRM";
import ListingSearch from "../../myComponentsHRM/SearchBox/ListingSearch";
import { useHRMListingSearch } from "../../hooks/useHRMListingSearch";

const UserAttendanceList = () => {
  const { params } = useRoute<any>();
  const { navigate, setParams } = useNavigation<any>();
  const { user } = useSelector(selectUser);
  const routeEmployee = params?.item?.user;
  const employee = { ...params?.item, ...(typeof routeEmployee === "object" ? routeEmployee : {}),
    _id: typeof routeEmployee === "object" ? routeEmployee?._id : routeEmployee };
  const [filters, setFilters] = useState<HRMFilterValues>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchSubmit, setSearchSubmit] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const {
    data,
    totalCount,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetSingleUserAttList({
    userId: employee._id,
    accountId: user?._id,
    ...searchSubmit,
    ...filters,
  });
  const updateSearch = useCallback(
    (search: string) =>
      setSearchSubmit((prev) =>
        prev.search === search ? prev : { ...prev, search },
      ),
    [],
  );
  const search = useHRMListingSearch(updateSearch);

  const onEndReach = () => {
    if (hasNextPage && !isFetching && !isError) {
      fetchNextPage && fetchNextPage();
    }
  };

  const denied = [401, 403].includes((error as any)?.response?.status);
  const errorCard = isError ? (
    <View accessibilityRole="alert" style={{ backgroundColor: "#FFF7ED", borderRadius: 12, padding: 16, gap: 12 }}>
      <Text style={{ color: "#9A3412" }}>{denied
        ? "This employee's attendance is not available to you. Please choose another employee."
        : "Unable to load attendance. Please try again."}</Text>
      {!denied && <Pressable accessibilityRole="button" disabled={isFetching} onPress={() => { void refetch(); }}
        style={{ alignSelf: "flex-start", minHeight: 44, justifyContent: "center" }}>
        <Text style={{ color: "#002E6B", fontWeight: "600" }}>{isFetching ? "Retrying…" : "Retry"}</Text>
      </Pressable>}
    </View>
  ) : null;

  return (
    <ContainerHRM
      totalCount={isError ? 0 : totalCount}
      onPressFilter={() => setFiltersOpen(true)}
      filterCount={hrmFilterCount(filters)}
      onPressSearch={search.toggleSearch}
      showSearch={search.showSearch}
      childStyle={{ flex: 1, height: undefined }}
      isBAck={{
        title: "Single User Attendance",
      }}
    >
      <HRMFilters
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        kind="attendance"
        values={filters}
        onApply={(values) => {
          setFilters(values);
          search.listRef.current?.scrollToOffset({
            offset: 0,
            animated: false,
          });
        }}
      />
      {search.showSearch && (
        <ListingSearch
          value={search.searchValue}
          onChangeText={search.setSearchValue}
          onClose={search.closeSearch}
        />
      )}
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 15,
          paddingBottom: 10,
          gap: 15,
        }}
      >
        <AttendanceEmployeeSelect key={user?._id} employee={employee} onSelect={(selected) => {
          search.closeSearch();
          setFilters({});
          setSearchSubmit({ search: "", startDate: "", endDate: "" });
          setParams({ item: { ...selected, user: selected._id } });
          search.listRef.current?.scrollToOffset({ offset: 0, animated: false });
        }} />
      </View>
      <FlatList
        ref={search.listRef}
        ListHeaderComponent={errorCard ?? undefined}
        ListEmptyComponent={
          <>
            {isLoading && <LoadingCompo />}
            {!isLoading && !isError && <NoDataFound />}
          </>
        }
        contentContainerStyle={{
          gap: 15,
          paddingHorizontal: 20,
          paddingBottom: 50,
        }}
        data={isError ? [] : data ?? []}
        renderItem={({ item }) => {
          return (
            <RowSingleUserAtt
              item={item}
              onPress={() =>
                navigate(routeAttendance.AttendanceDetail, { item })
              }
            />
          );
        }}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading && !isFetchingNextPage} onRefresh={() => { void refetch(); }} />}
        onEndReached={onEndReach}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator size={"small"} color={"#002E6B"} /> : undefined
        }
      />
    </ContainerHRM>
  );
};

export default UserAttendanceList;
