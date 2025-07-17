import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { useGetAllLeave, useGetTodayAbsent, useGetTodayLeaveEmp } from '../../hooks/useGetQuerryHRM'
import NoDataFound from '../../myComponents/NoDataFound/NoDataFound'
import CardAgentLeaveCount from '../../myComponentsHRM/CardHRM/CardAgentLeaveCount'
import CardHRM from '../../myComponentsHRM/CardHRM/CardHRM'
import CircularBarChart from '../../myComponentsHRM/CircularBarChart/CircularBarChart'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import LoadingCompo from '../../myComponentsHRM/LoadingCompo/LoadingCompo'
import RowAbsent from '../../myComponentsHRM/Row/RowAbsent'
import RowLeaveInAllList from '../../myComponentsHRM/Row/RowLeaveInAllList'
import RowOnLeave from '../../myComponentsHRM/Row/RowOnLeave'
import TitleHRM from '../../myComponentsHRM/TitleHRM/TitleHRM'
import { selectUser } from '../../redux/userSlice'
import { roleEnum } from '../../utils/data'
import { routeAttendance, routeLeave } from '../../utils/routesHRM'
import CheckInOut from './CheckInOut'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeyHRM } from '../../utils/queryKeys'
// import RowOnLeave from '../../myComponentsHRM/Row/RowOnLeave'

const DashboardHRM = () => {
    const { user } = useSelector(selectUser);
    const { navigate } = useNavigation();
    const isAgent = user?.role === roleEnum.agent;
    const punchAccess = (user?.role === roleEnum.agent || user?.role === roleEnum.manager || user?.role === roleEnum.team_lead || user?.role === roleEnum.assistant_manager)
    const [refreshing, setRefreshing] = useState(false);
    const queryClient = useQueryClient();
    const {
        data: todayLeaveList,
        isLoading: isLoadingTodayLeave,
        refetch: refetchTodayLeave
    } = useGetTodayLeaveEmp();
    const {
        data: leaveList,
        isLoading: isLoadingLeave,
        refetch: refetchLeaveList
    } = useGetAllLeave({ search: '' });
    const {
        data: todayAbsentList,
        isLoading: isLoadingAbsent,
        refetch: refetchTodayAbsent
    } = useGetTodayAbsent()

    const onRefresh = async () => {
        setRefreshing(true);
        refetchTodayLeave();
        refetchLeaveList();
        refetchTodayAbsent();
        setRefreshing(false);
        isAgent && queryClient.invalidateQueries({
            queryKey: [queryKeyHRM.getAgentLeaveCount]
        })
        !isAgent && queryClient.invalidateQueries({
            queryKey: [queryKeyHRM.getAttendanceChart]
        })
    }
    return (
        <ContainerHRM >
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
                contentContainerStyle={{ paddingBottom: 80, padding: 20 }}
                ListFooterComponent={<View>
                    {!isAgent && <>
                        <TitleHRM
                            title='Employees on Leave Today'
                            marginBottom={20}
                        />
                        <FlatList
                            ListEmptyComponent={<>
                                {isLoadingTodayLeave && <LoadingCompo />}
                                {todayLeaveList?.data?.length === 0 &&
                                    <NoDataFound height={150} width={150} />
                                }
                            </>
                            }
                            data={todayLeaveList?.data ?? []}
                            renderItem={({ item }) => <RowOnLeave
                                // key={i}
                                containerStyle={{ marginBottom: 10 }}
                                item={item}
                                // onPress={() => navigate(routeLeave?.LeaveDetail, { item })}
                                onPress={() => navigate(routeLeave.AllLeaveStack, {
                                    params: { item: { ...item } },
                                    screen: routeLeave?.LeaveDetail,
                                    initial: false
                                })}
                            />}
                        />
                        <TitleHRM
                            title='Employees Absent Today'
                            marginBottom={20}
                            marginTop={20}
                        />
                        <FlatList
                            ListEmptyComponent={<>
                                {isLoadingAbsent && <LoadingCompo />}
                                {todayAbsentList?.data?.length === 0 &&
                                    <NoDataFound height={150} width={150} />
                                }
                            </>
                            }
                            data={todayAbsentList?.data ?? []}
                            renderItem={({ item }) => <RowAbsent
                                // key={i}
                                containerStyle={{ marginBottom: 10 }}
                                item={item}
                                // onPress={() => navigate(routeAttendance.AttendanceDetail, { item })}
                                onPress={() => navigate(routeAttendance?.AttendanceStack, {
                                    params: { item: { ...item } },
                                    screen: routeAttendance?.AttendanceDetail,
                                    initial: false
                                })}
                            />

                            }
                        />
                    </>}
                    {isAgent && <>
                        <CircularBarChart type='attendanceChart' />
                        <CardAgentLeaveCount />
                    </>}
                    <TitleHRM
                        title='Leave Application Status'
                        marginBottom={20}
                        marginTop={20}
                    />
                    <FlatList
                        ListEmptyComponent={<>
                            {isLoadingLeave && <LoadingCompo />}
                            {leaveList?.length === 0 &&
                                <NoDataFound height={150} width={150} />
                            }
                        </>
                        }
                        data={leaveList?.slice(0, 10)}
                        renderItem={({ item }) => <RowLeaveInAllList
                            containerStyle={{ marginBottom: 10 }}
                            item={item}
                            // onPress={() => navigate(routeLeave.LeaveDetail, { item })}
                            onPress={() => navigate(routeLeave?.AllLeaveStack, {
                                params: { item: { ...item } },
                                screen: routeLeave?.LeaveDetail,
                                initial: false
                            })}
                        />}
                    />
                </View>}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </ContainerHRM>
    )
}

export default DashboardHRM

const styles = StyleSheet.create({})