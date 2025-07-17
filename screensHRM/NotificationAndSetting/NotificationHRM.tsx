import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import CustomText from '../../myComponents/CustomText/CustomText'
import { color } from '../../const/color'
import { useGetNotificationHrm } from '../../hooks/useGetQuerryHRM'
import { myConsole } from '../../hooks/useConsole'
import LoadingCompo from '../../myComponentsHRM/LoadingCompo/LoadingCompo'
import NoDataFound from '../../myComponents/NoDataFound/NoDataFound'
import { useNavigation } from '@react-navigation/native'
import { routeAttendance, routeLeave, routeUser } from '../../utils/routesHRM'
import moment from 'moment'

const NotificationHRM = () => {
    const { navigate } = useNavigation();
    const {
        data,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch
    } = useGetNotificationHrm();
    const [refreshing, setRefreshing] = useState(false);
    //
    const groupNotificationsByDate = (notifications) => {
        const today = moment().startOf("day");
        const yesterday = moment().subtract(1, "days").startOf("day");

        return notifications.reduce((acc, notification) => {
            const notificationDate = moment(notification.time).startOf("day");
            let groupKey;

            if (notificationDate.isSame(today, "day")) {
                groupKey = "Today";
            } else if (notificationDate.isSame(yesterday, "day")) {
                groupKey = "Yesterday";
            } else {
                groupKey = notificationDate.format("MMMM DD, YYYY");
            }

            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }

            acc[groupKey].push(notification);
            return acc;
        }, {});
    };
    const groupData = groupNotificationsByDate(!!data?.[0] ? data : []);//object m key m array
    //
    const onEndReach = () => {
        if (hasNextPage && !isLoading && data?.length > 0) {
            fetchNextPage && fetchNextPage()
        }
    }
    const onRefresh = () => {
        setRefreshing(true);
        refetch();
        setRefreshing(false);
    }

    const handleNotificationSeen = async (item) => {
        myConsole('item', item)
        try {

            if (!item?.seen) {
                // await getNotificationSeenById(user?._id, item?._id);
                // refetch();
            }
            if (item?.type === 'leave') {
                navigate(routeLeave?.AllLeaveStack, {
                    screen: routeLeave?.LeaveDetail,
                    initial: false,
                    params: { item: { ...item, from: 'nav' } }
                });
            } else if (item?.type === "user") {
                navigate(routeUser?.AllUsersHRMStack, {
                    screen: routeUser?.UserDetailHRM,
                    initial: false,
                    params: { item: { ...item, from: 'nav' } }
                });
            } else if (item?.type === "attendance") {
                navigate(routeAttendance?.AttendanceStack, {
                    screen: routeAttendance?.AttendanceDetail,
                    initial: false,
                    params: { item: { ...item, from: 'nav' } }
                });
            }
            // getNotification();
        } catch (err) {
            console.log("err", err);
        }
    };
    return (
        <ContainerHRM
            isBAck={{
                title: 'Notification'
            }}
        >
            <FlatList
                data={Object.entries(groupData)}
                keyExtractor={(item) => item[0]}
                renderItem={({ item }) => {
                    const [date, dateWiseData] = item;
                    console.log('dateWiseData', dateWiseData);
                    return <View>
                        <CustomText
                            fontSize={18}
                            fontWeight='700'
                            style={{ alignSelf: 'center' }}
                        >{date}
                        </CustomText>
                        <FlatList
                            keyExtractor={(item) => item?._id?.toString()}
                            data={dateWiseData?.[0] ? dateWiseData : []}
                            renderItem={({ item }) => {
                                return <RowNotification
                                    item={item}
                                    onPress={() => handleNotificationSeen(item)}
                                />
                            }}
                            style={{ paddingHorizontal: 20, gap: 15, paddingTop: 20, paddingBottom: 20 }}
                        />
                    </View>
                }}
                contentContainerStyle={{ paddingVertical: 20 }}
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
                        {!isLoading && data?.length === 0 && <NoDataFound />}
                    </>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

        </ContainerHRM>
    )
}

export default NotificationHRM

const styles = StyleSheet.create({})

interface TRowNotification {
    item: {
        message: string,
        title: string,
        type: string,
        seen: boolean,
        time: string,
    };
    onPress: () => void;
}
const RowNotification = ({
    item,
    onPress
}: TRowNotification) => {
    return <TouchableOpacity
        onPress={onPress}
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            gap: 10,
            overflow: 'hidden'
        }}
    >
        <View
            style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: color.gray,
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <CustomText
                color='white'
                fontWeight='900'
                fontSize={19}
                style={{ textTransform: 'capitalize' }}
            >{item?.type?.[0] ?? '-'}</CustomText>
        </View>
        <View
            style={{ width: '90%' }}
        >
            <CustomText
                fontSize={18}
                fontWeight='600'
            >{item?.title ?? '--'}
            </CustomText>
            <CustomText
                numberOfLines={3}
                style={{ paddingEnd: 15 }}
            >
                {item?.message ?? '--'}
            </CustomText>
        </View>
    </TouchableOpacity>
}