import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import TitleHRM from "../../myComponentsHRM/TitleHRM/TitleHRM";
import RowLeaveInAllList from "../../myComponentsHRM/Row/RowLeaveInAllList";
import { useNavigation } from "@react-navigation/native";
import { routeLeave } from "../../utils/routesHRM";
import AddIcon from "../../assets/svgHRM/AddIcon";
import { useGetAllLeave } from "../../hooks/useGetQuerryHRM";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import CircularBarChart from "../../myComponentsHRM/CircularBarChart/CircularBarChart";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import ListingSearch from "../../myComponentsHRM/SearchBox/ListingSearch";
import { useHRMListingSearch } from "../../hooks/useHRMListingSearch";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import { checkPermission } from "../../utils/commonFunctions";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { color } from "../../const/color";

const AllLeave = () => {
  const { user } = useSelector(selectUser);
  const isAgent = user?.role === roleEnum.agent;
  const { navigate } = useNavigation();
  const queryClient = useQueryClient();
  const currentDate = new Date().getDate();
  const [searchSubmit, setSearchSubmit] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const updateSearch = useCallback(
    (search: string) =>
      setSearchSubmit((prev) =>
        prev.search === search ? prev : { ...prev, search },
      ),
    [],
  );
  const search = useHRMListingSearch(updateSearch);
  const { data, totalCount, hasNextPage, isLoading, fetchNextPage, isFetchingNextPage } =
    useGetAllLeave({ ...searchSubmit });
  const onEndReach = () => {
    if (hasNextPage && !isLoading && data?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getAllLeave],
      });
    } catch (e) {
      console.log("refreshGetAllLeave", e);
    } finally {
      setRefreshing(false);
    }
  };
  const { data: permission = {} } = useGetUserPermission(user?._id);

  return (
    <ContainerHRM
      headingTitle="Leave"
      totalCount={totalCount}
      onPressSearch={search.toggleSearch}
      showSearch={search.showSearch}
      childStyle={{ flex: 1, height: undefined }}
    >
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
      <>
        {currentDate < 25 && (
          <TouchableOpacity
            onPress={() => navigate(routeLeave?.LeaveApplication)}
            activeOpacity={0.5}
            style={{
              position: "absolute",
              bottom: Platform.OS === "ios" ? 60 : 40,
              right: 10,
              zIndex: 5,
            }}
          >
            <AddIcon />
          </TouchableOpacity>
        )}

        <FlatList
          ref={search.listRef}
          ListHeaderComponent={
            <>
              {!isAgent && <CircularBarChart type="leavesChart" />}
              <TitleHRM title="Total Leaves" marginTop={12} marginBottom={20} />
              {/* <HeaderRowLeave /> */}
            </>
          }
          contentContainerStyle={{
            paddingBottom: 120,
            paddingHorizontal: 12,
            paddingTop: 20,
          }}
          data={data}
          renderItem={({ item }) => {
            const canViewDetails = checkPermission(
              permission,
              "Leaves",
              "viewLeaveDetails",
              user?.role,
            );

            return (
              <RowLeaveInAllList
                containerStyle={{ marginBottom: 10 }}
                item={item}
                onPress={() => {
                  if (canViewDetails) {
                    navigate(routeLeave?.LeaveDetail, { item });
                  } else {
                    popUpConfToast.errorMessage(
                      "You are not authorized to view leave details.",
                    );
                  }
                }}
              />
            );
          }}
          onEndReached={onEndReach}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListFooterComponent={
            isFetchingNextPage && (
              <ActivityIndicator size={"small"} color={color.mainTxtColor} />
            )
          }
          ListEmptyComponent={
            <>
              {isLoading && <LoadingCompo />}
              {data?.length === 0 && <NoDataFound height={200} width={200} />}
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        {/* <CustomBtn
                title='next'
                disabled={!hasNextPage}
                onPress={fetchNextPage}
                isLoading={isFetchingNextPage}
            /> */}
      </>
    </ContainerHRM>
  );
};

export default AllLeave;

const styles = StyleSheet.create({});
