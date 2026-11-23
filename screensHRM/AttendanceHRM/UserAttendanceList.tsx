import { attendanceUserName } from "../../utils/attendanceDisplay";
import HRMFilters, {
  HRMFilterValues,
  hrmFilterCount,
} from "../../myComponentsHRM/SearchBox/HRMFilters";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import TitleHRM from "../../myComponentsHRM/TitleHRM/TitleHRM";
import HeaderRowAttendance from "../../myComponentsHRM/Row/rowHeader/HeaderRowAttendance";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import HeaderRowUserAtt from "../../myComponentsHRM/Row/rowHeader/HeaderRowUserAtt";
import RowSingleUserAtt from "../../myComponentsHRM/Row/RowSingleUserAtt";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGetSingleUserAttList } from "../../hooks/useGetQuerryHRM";
import { myConsole } from "../../hooks/useConsole";
import { routeAttendance } from "../../utils/routesHRM";
import { roleHRM } from "../../utils/hrmKeysMatchToBE";
import ListingSearch from "../../myComponentsHRM/SearchBox/ListingSearch";
import { useHRMListingSearch } from "../../hooks/useHRMListingSearch";

const UserAttendanceList = () => {
  const { params } = useRoute();
  const { navigate } = useNavigation();
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
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetSingleUserAttList({
    userId: params?.item?.user,
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
    if (hasNextPage && !isLoading) {
      fetchNextPage && fetchNextPage();
    }
  };

  return (
    <ContainerHRM
      totalCount={totalCount}
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
      {/* <View style={{ padding: 20 }}> <HeaderRowUserAtt /></View> */}
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 15,
          paddingBottom: 10,
          gap: 15,
        }}
      >
        <TitleHRM
          title={[attendanceUserName(params?.item), roleHRM[params?.item?.role] ? `(${roleHRM[params.item.role]})` : ""].filter(Boolean).join(" ")}
        />
        {/* <HeaderRowUserAtt /> */}
      </View>
      <FlatList
        ref={search.listRef}
        ListHeaderComponent={<></>}
        ListEmptyComponent={
          <>
            {isLoading && <LoadingCompo />}
            {!isLoading && <NoDataFound />}
          </>
        }
        contentContainerStyle={{
          gap: 15,
          paddingHorizontal: 20,
          paddingBottom: 50,
        }}
        data={data ?? []}
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
        onEndReached={onEndReach}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListFooterComponent={
          isFetchingNextPage && (
            <ActivityIndicator size={"small"} color={"#002E6B"} />
          )
        }
      />
    </ContainerHRM>
  );
};

export default UserAttendanceList;

const styles = StyleSheet.create({});

// const
