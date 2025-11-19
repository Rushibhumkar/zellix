import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import {
  useGetAllLeave,
  useGetTodayAbsent,
  useGetTodayLeaveEmp,
} from "../../hooks/useGetQuerryHRM";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CardAgentLeaveCount from "../../myComponentsHRM/CardHRM/CardAgentLeaveCount";
import CardHRM from "../../myComponentsHRM/CardHRM/CardHRM";
import CircularBarChart from "../../myComponentsHRM/CircularBarChart/CircularBarChart";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import RowAbsent from "../../myComponentsHRM/Row/RowAbsent";
import RowLeaveInAllList from "../../myComponentsHRM/Row/RowLeaveInAllList";
import RowOnLeave from "../../myComponentsHRM/Row/RowOnLeave";
import TitleHRM from "../../myComponentsHRM/TitleHRM/TitleHRM";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import { routeAttendance, routeLeave } from "../../utils/routesHRM";
import CheckInOut from "./CheckInOut";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import { color } from "../../const/color";

const DashboardHRM = () => {
  const { user } = useSelector(selectUser);
  const { navigate } = useNavigation();
  const isAgent = user?.role === roleEnum.agent;
  const punchAccess =
    user?.role === roleEnum.agent ||
    user?.role === roleEnum.manager ||
    user?.role === roleEnum.team_lead ||
    user?.role === roleEnum.assistant_manager;
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const {
    data: todayLeaveList,
    isLoading: isLoadingTodayLeave,
    refetch: refetchTodayLeave,
  } = useGetTodayLeaveEmp();
  const {
    data: leaveList,
    isLoading: isLoadingLeave,
    refetch: refetchLeaveList,
  } = useGetAllLeave({ search: "" });
  const {
    data: todayAbsentList,
    isLoading: isLoadingAbsent,
    refetch: refetchTodayAbsent,
  } = useGetTodayAbsent();

  const onRefresh = async () => {
    setRefreshing(true);
    refetchTodayLeave();
    refetchLeaveList();
    refetchTodayAbsent();
    setRefreshing(false);
    isAgent &&
      queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getAgentLeaveCount],
      });
    !isAgent &&
      queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getAttendanceChart],
      });
  };

  return (
    <ContainerHRM>
      <FlatList
        ListHeaderComponent={
          <FlatList
            data={null}
            renderItem={() => null}
            ListHeaderComponent={punchAccess && <CheckInOut />}
            ListFooterComponent={!isAgent && <CardHRM />}
          />
        }
        data={null}
        renderItem={() => null}
        contentContainerStyle={styles.container}
        ListFooterComponent={
          <View>
            {!isAgent && (
              <View style={{ marginTop: 12 }}>
                <View
                  style={{
                    marginBottom: 24,
                    borderColor: color.borderColor,
                    borderRadius: 14,
                    borderWidth: 1.4,
                    paddingHorizontal: 8,
                  }}
                >
                  <TitleHRM
                    title="Employees on Leave Today"
                    marginBottom={20}
                    marginTop={20}
                  />
                  <FlatList
                    ListEmptyComponent={
                      <>
                        {isLoadingTodayLeave && <LoadingCompo />}
                        {todayLeaveList?.data?.length === 0 && (
                          <View
                            style={{
                              backgroundColor: "#fff",
                              borderRadius: 12,
                              paddingBottom: 12,
                            }}
                          >
                            <NoDataFound height={120} width={120} />
                          </View>
                        )}
                      </>
                    }
                    data={todayLeaveList?.data ?? []}
                    renderItem={({ item }) => (
                      <RowOnLeave
                        containerStyle={styles.rowContainer}
                        item={item}
                        onPress={() =>
                          navigate(routeLeave.AllLeaveStack, {
                            params: { item: { ...item } },
                            screen: routeLeave?.LeaveDetail,
                            initial: false,
                          })
                        }
                      />
                    )}
                  />
                </View>
                <View
                  style={{
                    marginBottom: 24,
                    borderColor: "#739FE133",
                    borderRadius: 14,
                    borderWidth: 1.4,
                    paddingHorizontal: 8,
                  }}
                >
                  <TitleHRM
                    title="Employees Absent Today"
                    marginBottom={20}
                    marginTop={20}
                  />
                  <FlatList
                    ListEmptyComponent={
                      <>
                        {isLoadingAbsent && <LoadingCompo />}
                        {todayAbsentList?.data?.length === 0 && (
                          <NoDataFound height={120} width={120} />
                        )}
                      </>
                    }
                    data={todayAbsentList?.data ?? []}
                    renderItem={({ item }) => (
                      <RowAbsent
                        containerStyle={styles.rowContainer}
                        item={item}
                        onPress={() =>
                          navigate(routeAttendance?.AttendanceStack, {
                            params: { item: { ...item } },
                            screen: routeAttendance?.AttendanceDetail,
                            initial: false,
                          })
                        }
                      />
                    )}
                  />
                </View>
              </View>
            )}
            {isAgent && (
              <>
                <CircularBarChart type="attendanceChart" />
                <CardAgentLeaveCount />
              </>
            )}
            <View
              style={{
                borderColor: "#739FE133",
                borderRadius: 14,
                borderWidth: 1.4,
                paddingHorizontal: 8,
              }}
            >
              <TitleHRM
                title="Leave Application Status"
                marginBottom={20}
                marginTop={20}
              />
              <FlatList
                ListEmptyComponent={
                  <>
                    {isLoadingLeave && <LoadingCompo />}
                    {leaveList?.length === 0 && (
                      <NoDataFound height={120} width={120} />
                    )}
                  </>
                }
                data={leaveList?.slice(0, 10)}
                renderItem={({ item }) => (
                  <RowLeaveInAllList
                    containerStyle={styles.rowContainer}
                    item={item}
                    onPress={() =>
                      navigate(routeLeave?.AllLeaveStack, {
                        params: { item: { ...item } },
                        screen: routeLeave?.LeaveDetail,
                        initial: false,
                      })
                    }
                  />
                )}
              />
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </ContainerHRM>
  );
};

export default DashboardHRM;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 180,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  rowContainer: {
    marginBottom: 12,
  },
});
