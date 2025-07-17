import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import CardHRM from '../../myComponentsHRM/CardHRM/CardHRM'
import TitleHRM from '../../myComponentsHRM/TitleHRM/TitleHRM'
import RowOnLeave from '../../myComponentsHRM/Row/RowOnLeave'
import RowEmployee from '../../myComponentsHRM/Row/RowEmployee'
import { myConsole } from '../../hooks/useConsole'
import { useNavigation } from '@react-navigation/native'
import { routeUser } from '../../utils/routesHRM'
import { color } from '../../const/color'
import AddIcon from '../../assets/svgHRM/AddIcon'
import { useGetAllUserHRM } from '../../hooks/useGetQuerryHRM'
import LoadingCompo from '../../myComponentsHRM/LoadingCompo/LoadingCompo'
import NoDataFound from '../../myComponents/NoDataFound/NoDataFound'
import CircularBarChart from '../../myComponentsHRM/CircularBarChart/CircularBarChart'
import HeaderRowEmployee from '../../myComponentsHRM/Row/rowHeader/HeaderRowEmployee'
import { popUpConfToast } from '../../utils/toastModalByFunction'
import SearchBox from '../../myComponentsHRM/SearchBox/SearchBox'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeyHRM } from '../../utils/queryKeys'
import { selectUser } from '../../redux/userSlice'
import { useSelector } from 'react-redux'
import { roleEnum } from '../../utils/data'

const AllUSersHRM = () => {
    const { navigate } = useNavigation();
    const queryClient = useQueryClient();
    const { user } = useSelector(selectUser);
    const isSubSup = user?.role === roleEnum.sub_admin || user?.role === roleEnum.sup_admin;
    const [searchSubmit, setSearchSubmit] = useState({
        search: '',
        startDate: '',
        endDate: ''
    });
    const [refreshing, setRefreshing] = useState(false);
    const {
        data: allUsers,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage } = useGetAllUserHRM({ search: searchSubmit?.search });
    const onEndReach = () => {
        console.log('hasNextPage', hasNextPage)
        if (hasNextPage && !isLoading && allUsers?.length > 0) {
            fetchNextPage && fetchNextPage()
        }
    }

    const handleSearchSubmit = (v) => {
        setSearchSubmit(v)
    }

    const onRefresh = () => {
        try {
            setRefreshing(true)
            queryClient.invalidateQueries({
                queryKey: [queryKeyHRM.getAllUserHRM]
            })
        }
        catch (e) {
            console.log('refreshInUser', e)
        }
        finally {
            setRefreshing(false)
        }
    }
    return (
        <ContainerHRM
            headingTitle='User Module'
        >
            {isSubSup && <TouchableOpacity
                onPress={() => navigate(routeUser.AddUserHRM)}
                activeOpacity={0.5}
                style={{
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 40 : 70,
                    right: 10,
                    zIndex: 5
                }}
            >
                <AddIcon />
            </TouchableOpacity>}
            <View style={{ minHeight: 600 }}>
                <FlatList
                    data={allUsers ?? []}
                    renderItem={({ item }) => {
                        return <RowEmployee
                            onPress={() => navigate(routeUser.UserDetailHRM, { item })}
                            containerStyle={{ marginBottom: 10 }}
                            item={item}
                        />
                    }}
                    ListHeaderComponent={<>
                        <CircularBarChart
                            type='userChart'
                        />
                        <CardHRM />
                        <TitleHRM
                            title='Total Employees'
                            marginBottom={20}
                            onPressFilter={() => popUpConfToast.plzWait({
                                bodyComponent: () => <SearchBox
                                    onPressSubmit={handleSearchSubmit}
                                    initialValue={searchSubmit}
                                    hideFiles={{
                                        endDate: true,
                                        startDate: true
                                    }}
                                />
                            })}
                        />
                        <HeaderRowEmployee />
                    </>
                    }
                    contentContainerStyle={{ paddingBottom: 80, padding: 20 }}
                    onEndReached={onEndReach}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingNextPage && <ActivityIndicator
                            size={'small'}
                            color={'#002E6B'}
                        />
                    }
                    ListEmptyComponent={
                        <>
                            {isLoading && <LoadingCompo />}
                            {allUsers?.length === 0 && <NoDataFound
                                height={200}
                                width={200}
                            />}
                        </>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            </View>
        </ContainerHRM>
    )
}

export default AllUSersHRM

const styles = StyleSheet.create({})