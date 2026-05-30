import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import React, { useState } from "react";
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
import SearchBox from "../../myComponentsHRM/SearchBox/SearchBox";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import RowSingleUserAtt from "../../myComponentsHRM/Row/RowSingleUserAtt";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import moment from "moment";
const AllAttendance = () => {
  const { user } = useSelector(selectUser);
  const { data: permission = {} } = useGetUserPermission(user?._id);
  const isAgent = user?.role === roleEnum.agent;
  const { navigate } = useNavigation();
  const queryClient = useQueryClient();
  const [searchSubmit, setSearchSubmit] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const { data, hasNextPage, isLoading, fetchNextPage, isFetchingNextPage } =
    useGetAllAttendance({ ...searchSubmit });
  const {
    data: issueAttList,
    isLoading: isLoadingIssue,
    hasNextPage: hasNextPageIssue,
    isFetchingNextPage: isFetchingNextPageIssue,
    fetchNextPage: fetchNextPageIssue,
  } = useGetIssueAttendance();
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

  const handleSearchSubmit = (v) => {
    setSearchSubmit(v);
  };
  //
  const onRefresh = async () => {
    const defaultDates = {
      search: "",
      startDate: moment().subtract(11, "months").startOf("month").toDate(),
      endDate: moment().endOf("month").toDate(),
    };

    setSearchSubmit(defaultDates);
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getAllAttendance],
      });
      await queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getIssueAttendance],
      });
    } catch (e) {
      console.log("refreshInUser", e);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ContainerHRM headingTitle="Attendance">
      <FlatList
        ListHeaderComponent={
          <>
            <CircularBarChart type="attendanceChart" />
            {!isAgent && <CardHRM />}
            <FlatList
              style={{ gap: 2 }}
              ListHeaderComponent={
                <>
                  <TitleHRM title="Issues" marginBottom={0} marginTop={12} />
                  {/* {!isAgent ? <HeaderRowAttendance /> : <HeaderRowUserAtt />} */}
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
            <TitleHRM
              title="Attendance"
              marginBottom={0}
              marginTop={8}
              onPressFilter={() =>
                popUpConfToast.bottomSheet({
                  snapPoints: ["55%"],
                  bodyComponent: () => (
                    <SearchBox
                      onPressSubmit={handleSearchSubmit}
                      initialValue={searchSubmit}
                    />
                  ),
                })
              }
            />
            {/* {!isAgent ? <HeaderRowAttendance /> : <HeaderRowUserAtt />} */}
          </>
        }
        // contentContainerStyle={{ paddingBottom: 80, padding: 20 }}
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
