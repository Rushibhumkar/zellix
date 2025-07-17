import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CardHRM from "../../myComponentsHRM/CardHRM/CardHRM";
import TitleHRM from "../../myComponentsHRM/TitleHRM/TitleHRM";
import RowAttendance from "../../myComponentsHRM/Row/RowAttendance";
import { Popup, Toast, SPSheet } from "react-native-popup-confirm-toast";
import EditIcon from "../../assets/svg/EditIcon";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { HEIGHT } from "../../const/deviceInfo";
import { useNavigation } from "@react-navigation/native";
import { routeAttendance, routeLeave } from "../../utils/routesHRM";
import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import LeaveAppRemark from "../LeaveHRM/components/LeaveAppRemark";
import {
  useGetAllAttendance,
  useGetIssueAttendance,
} from "../../hooks/useGetQuerryHRM";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CircularBarChart from "../../myComponentsHRM/CircularBarChart/CircularBarChart";
import HeaderRowAttendance from "../../myComponentsHRM/Row/rowHeader/HeaderRowAttendance";
import PleaseWait from "../../myComponentsHRM/PleaseWait/PleaseWait";
import SearchBox from "../../myComponentsHRM/SearchBox/SearchBox";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import RowSingleUserAtt from "../../myComponentsHRM/Row/RowSingleUserAtt";
import HeaderRowUserAtt from "../../myComponentsHRM/Row/rowHeader/HeaderRowUserAtt";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
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
  myConsole("issueAttList", issueAttList?.length);
  return (
    <ContainerHRM headingTitle="Attendance Module">
      {checkPermission(permission, "HRMS", "viewAttendance", user?.role) ? (
        <FlatList
          ListHeaderComponent={
            <>
              <CircularBarChart type="attendanceChart" />
              {!isAgent && <CardHRM />}
              <FlatList
                style={{ gap: 10 }}
                ListHeaderComponent={
                  <>
                    <TitleHRM title="Issues" marginBottom={20} />
                    {!isAgent ? <HeaderRowAttendance /> : <HeaderRowUserAtt />}
                  </>
                }
                ListEmptyComponent={
                  <>
                    {isLoadingIssue && <LoadingCompo />}
                    {issueAttList?.length === 0 && (
                      <NoDataFound height={200} width={200} />
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
                          user?.role
                        );

                        if (canViewDetails) {
                          navigate(routeAttendance.AttendanceDetail, { item });
                        } else {
                          popUpConfToast.errorMessage(
                            "You are not authorized to view attendance details."
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
                          user?.role
                        );

                        if (canViewDetails) {
                          navigate(routeAttendance.AttendanceDetail, { item });
                        } else {
                          popUpConfToast.errorMessage(
                            "You are not authorized to view attendance details."
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
                          width: 80,
                          alignSelf: "flex-end",
                          backgroundColor: color.prussianBlue,
                        }}
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
                marginBottom={20}
                onPressFilter={() =>
                  popUpConfToast.plzWait({
                    bodyComponent: () => (
                      <SearchBox
                        onPressSubmit={handleSearchSubmit}
                        initialValue={searchSubmit}
                      />
                    ),
                  })
                }
              />
              {!isAgent ? <HeaderRowAttendance /> : <HeaderRowUserAtt />}
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
                    user?.role
                  );

                  if (canViewDetails) {
                    navigate(routeAttendance.UserAttendanceList, { item });
                  } else {
                    popUpConfToast.errorMessage(
                      "You are not authorized to view attendance details."
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
                    user?.role
                  );

                  if (canViewDetails) {
                    navigate(routeAttendance.AttendanceDetail, { item });
                  } else {
                    popUpConfToast.errorMessage(
                      "You are not authorized to view attendance details."
                    );
                  }
                }}
              />
            );
          }}
          contentContainerStyle={{ paddingBottom: 80, padding: 20, gap: 10 }}
          onEndReached={onEndReach}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage && (
              <ActivityIndicator size={"small"} color={"#002E6B"} />
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
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <CustomText
            style={{ textAlign: "center", fontSize: 16, color: "#555" }}
          >
            You do not have permission to view attendance records. Please
            contact your administrator for access.
          </CustomText>
        </View>
      )}
    </ContainerHRM>
  );
};

export default AllAttendance;

const styles = StyleSheet.create({});
