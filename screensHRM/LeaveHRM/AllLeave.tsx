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
import React, { useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CardHRM from "../../myComponentsHRM/CardHRM/CardHRM";
import TitleHRM from "../../myComponentsHRM/TitleHRM/TitleHRM";
import RowLeaveInAllList from "../../myComponentsHRM/Row/RowLeaveInAllList";
import { useNavigation } from "@react-navigation/native";
import { routeLeave } from "../../utils/routesHRM";
import AddIcon from "../../assets/svgHRM/AddIcon";
import { useGetAllLeave } from "../../hooks/useGetQuerryHRM";
import { myConsole } from "../../hooks/useConsole";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import HeaderRowLeave from "../../myComponentsHRM/Row/rowHeader/HeaderRowLeave";
import CircularBarChart from "../../myComponentsHRM/CircularBarChart/CircularBarChart";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import SearchBox from "../../myComponentsHRM/SearchBox/SearchBox";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import { checkPermission } from "../../utils/commonFunctions";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";

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
  const { data, hasNextPage, isLoading, fetchNextPage, isFetchingNextPage } =
    useGetAllLeave({ ...searchSubmit });
  const onEndReach = () => {
    if (hasNextPage && !isLoading && data?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const handleSearchSubmit = (v) => {
    setSearchSubmit(v);
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

  const canViewLeaves = checkPermission(
    permission,
    "Leaves",
    "viewLeaves",
    user?.role
  );

  const canAddAdvanceLeaves = checkPermission(
    permission,
    "Leaves",
    "addAdvanceLeaves",
    user?.role
  );

  return (
    <ContainerHRM headingTitle="Leave Module">
      {canViewLeaves ? (
        <>
          {currentDate < 25 && canAddAdvanceLeaves && (
            <TouchableOpacity
              onPress={() => navigate(routeLeave?.LeaveApplication)}
              activeOpacity={0.5}
              style={{
                position: "absolute",
                bottom: Platform.OS === "ios" ? 40 : 70,
                right: 10,
                zIndex: 5,
              }}
            >
              <AddIcon />
            </TouchableOpacity>
          )}

          <FlatList
            ListHeaderComponent={
              <>
                <CircularBarChart type="leavesChart" />
                {!isAgent && <CardHRM />}
                {isAgent && <CircularBarChart type="attendanceChart" />}
                <TitleHRM
                  title="Total Leaves"
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
                <HeaderRowLeave />
              </>
            }
            contentContainerStyle={{ paddingBottom: 80, padding: 20 }}
            data={data}
            renderItem={({ item }) => {
              const canViewDetails = checkPermission(
                permission,
                "Leaves",
                "viewLeaveDetails",
                user?.role
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
                        "You are not authorized to view leave details."
                      );
                    }
                  }}
                />
              );
            }}
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
          {/* <CustomBtn
                title='next'
                disabled={!hasNextPage}
                onPress={fetchNextPage}
                isLoading={isFetchingNextPage}
            /> */}
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 16, color: "#555" }}>
            You do not have permission to view leave records. Please contact
            your administrator.
          </Text>
        </View>
      )}
    </ContainerHRM>
  );
};

export default AllLeave;

const styles = StyleSheet.create({});
