import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CardHRM from "../../myComponentsHRM/CardHRM/CardHRM";
import TitleHRM from "../../myComponentsHRM/TitleHRM/TitleHRM";
import RowAttendance from "../../myComponentsHRM/Row/RowAttendance";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { useNavigation } from "@react-navigation/native";
import { routeAttendance } from "../../utils/routesHRM";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { color } from "../../const/color";
import {
  useGetAllAttendance,
  useGetIssueAttendance,
} from "../../hooks/useGetQuerryHRM";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CircularBarChart from "../../myComponentsHRM/CircularBarChart/CircularBarChart";
import ListingSearch from "../../myComponentsHRM/SearchBox/ListingSearch";
import { useHRMListingSearch } from "../../hooks/useHRMListingSearch";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import RowSingleUserAtt from "../../myComponentsHRM/Row/RowSingleUserAtt";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import { canViewAttendanceSummary } from "../../utils/attendanceSummary";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import HeaderRowAttendance from "../../myComponentsHRM/Row/rowHeader/HeaderRowAttendance";
import HeaderRowUserAtt from "../../myComponentsHRM/Row/rowHeader/HeaderRowUserAtt";
const AllAttendance = () => {
  const { user } = useSelector(selectUser);
  const { data: permission = {} } = useGetUserPermission(user?._id);
  const isAgent = user?.role === roleEnum.agent;
  const showAttendanceSummary = canViewAttendanceSummary(
    permission,
    user?.role,
  );
  const { navigate } = useNavigation();
  const queryClient = useQueryClient();
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
  const { data, hasNextPage, isLoading, fetchNextPage, isFetchingNextPage } =
    useGetAllAttendance({
      ...searchSubmit,
      userId: isAgent ? user?._id : "",
    });
  const {
    data: issueAttList,
    isLoading: isLoadingIssue,
    hasNextPage: hasNextPageIssue,
    isFetchingNextPage: isFetchingNextPageIssue,
    fetchNextPage: fetchNextPageIssue,
  } = useGetIssueAttendance({ userId: isAgent ? user?._id : "" });
  //
  const onEndReach = () => {
    if (hasNextPage && !isLoading && data?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };
  //
  const loadMoreIssueList = () => {
    if (hasNextPageIssue && !isLoadingIssue && issueAttList?.length > 0) {
      console.log("first@@");
      fetchNextPageIssue && fetchNextPageIssue();
    }
  };

  //
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getAllAttendance],
      });
      await queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getIssueAttendance],
      });
      if (showAttendanceSummary)
        await queryClient.invalidateQueries({
          queryKey: [queryKeyHRM.getAttendanceChart],
        });
    } catch (e) {
      console.log("refreshInUser", e);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ContainerHRM
      headingTitle="Attendance"
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
      <FlatList
        ref={search.listRef}
        ListHeaderComponent={
          <>
            {showAttendanceSummary && (
              <>
                <CircularBarChart type="attendanceChart" />
                <CardHRM />
              </>
            )}
            <FlatList
              style={{ gap: 2 }}
              ListHeaderComponent={
                <>
                  <TitleHRM title="Issues" marginBottom={4} marginTop={12} />
                  {!isAgent ? <HeaderRowAttendance /> : <HeaderRowUserAtt />}
                </>
              }
              ListEmptyComponent={
                <>
                  {isLoadingIssue && <LoadingCompo />}
                  {issueAttList?.length === 0 && (
                    <SlideFadeIn>
                      <View
                        style={{
                          backgroundColor: "#fff",
                          borderWidth: 0.8,
                          borderColor: color.borderColor,
                          borderRadius: 12,
                          paddingBottom: 12,
                        }}
                      >
                        <NoDataFound height={140} width={140} />
                      </View>
                    </SlideFadeIn>
                  )}
                </>
              }
              data={issueAttList ?? []}
              renderItem={({ item }) => {
                return !isAgent ? (
                  <RowAttendance
                    item={item}
                    onPress={() => {
                      const canViewDetails = checkPermission(
                        permission,
                        "HRMS",
                        "viewAttendanceDetails",
                        user?.role,
                      );

                      if (canViewDetails) {
                        navigate(routeAttendance.AttendanceDetail, { item });
                      } else {
                        popUpConfToast.errorMessage(
                          "You are not authorized to view attendance details.",
                        );
                      }
                    }}
                  />
                ) : (
                  <RowSingleUserAtt
                    item={item}
                    onPress={() => {
                      const canViewDetails = checkPermission(
                        permission,
                        "HRMS",
                        "viewAttendanceDetails",
                        user?.role,
                      );

                      if (canViewDetails) {
                        navigate(routeAttendance.AttendanceDetail, { item });
                      } else {
                        popUpConfToast.errorMessage(
                          "You are not authorized to view attendance details.",
                        );
                      }
                    }}
                  />
                );
              }}
              ListFooterComponent={
                <View style={{ marginBottom: 20 }}>
                  {isFetchingNextPageIssue && (
                    <ActivityIndicator size={"small"} color={"#002E6B"} />
                  )}
                  {issueAttList?.length !== 0 && hasNextPageIssue && (
                    <CustomBtn
                      containerStyle={{
                        width: 100,
                        alignSelf: "flex-end",
                        backgroundColor: color.prussianBlue,
                      }}
                      gradientContStyle={{ paddingVertical: 10 }}
                      title="Load More"
                      textStyle={{ fontSize: 12 }}
                      onPress={loadMoreIssueList}
                    />
                  )}
                </View>
              }
            />
            <TitleHRM title="Attendance" marginBottom={4} marginTop={8} />
            {/* {!isAgent ? <HeaderRowAttendance /> : <HeaderRowUserAtt />} */}
          </>
        }
        // contentContainerStyle={{ paddingBottom: 80, padding: 20 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={data?.length > 0 ? data : []}
        renderItem={({ item }) => {
          return !isAgent ? (
            <RowAttendance
              item={item}
              onPress={() => {
                const canViewDetails = checkPermission(
                  permission,
                  "HRMS",
                  "viewAttendanceDetails",
                  user?.role,
                );

                if (canViewDetails) {
                  navigate(routeAttendance.UserAttendanceList, { item });
                } else {
                  popUpConfToast.errorMessage(
                    "You are not authorized to view attendance details.",
                  );
                }
              }}
            />
          ) : (
            <RowSingleUserAtt
              item={item}
              onPress={() => {
                const canViewDetails = checkPermission(
                  permission,
                  "HRMS",
                  "viewAttendanceDetails",
                  user?.role,
                );

                if (canViewDetails) {
                  navigate(routeAttendance.AttendanceDetail, { item });
                } else {
                  popUpConfToast.errorMessage(
                    "You are not authorized to view attendance details.",
                  );
                }
              }}
            />
          );
        }}
        contentContainerStyle={{
          paddingBottom: 160,
          paddingHorizontal: 12,
          paddingTop: 20,
          // gap: 10,
        }}
        onEndReached={onEndReach}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage && (
            <ActivityIndicator
              size={"small"}
              color={color.mainTxtColor}
              style={{ marginTop: 12 }}
            />
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
    </ContainerHRM>
  );
};

export default AllAttendance;

const styles = StyleSheet.create({});
