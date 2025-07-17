import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import TitleHRM from '../../myComponentsHRM/TitleHRM/TitleHRM'
import HeaderRowAttendance from '../../myComponentsHRM/Row/rowHeader/HeaderRowAttendance'
import LoadingCompo from '../../myComponentsHRM/LoadingCompo/LoadingCompo'
import NoDataFound from '../../myComponents/NoDataFound/NoDataFound'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import HeaderRowUserAtt from '../../myComponentsHRM/Row/rowHeader/HeaderRowUserAtt'
import RowSingleUserAtt from '../../myComponentsHRM/Row/RowSingleUserAtt'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useGetSingleUserAttList } from '../../hooks/useGetQuerryHRM'
import { myConsole } from '../../hooks/useConsole'
import { routeAttendance } from '../../utils/routesHRM'
import { roleHRM } from '../../utils/hrmKeysMatchToBE'
import { popUpConfToast } from '../../utils/toastModalByFunction'
import SearchBox from '../../myComponentsHRM/SearchBox/SearchBox'

const UserAttendanceList = () => {
  const { params } = useRoute();
  const { navigate } = useNavigation();
  const [searchSubmit, setSearchSubmit] = useState({
    search: '',
    startDate: '',
    endDate: ''
  });
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetSingleUserAttList({ userId: params?.item?.user, ...searchSubmit });

  const onEndReach = () => {
    if (hasNextPage && !isLoading) {
      fetchNextPage && fetchNextPage()
    }
  }

  const handleSearchSubmit = (v) => {
    setSearchSubmit(v)
  }
  return (
    <ContainerHRM
      isBAck={{
        title: 'Single User Attendance'
      }}
    >
      {/* <View style={{ padding: 20 }}> <HeaderRowUserAtt /></View> */}
      <View style={{ paddingHorizontal: 20, marginTop: 15, paddingBottom: 10, gap: 15 }} >
        <TitleHRM
          title={`${params?.item?.name} (${roleHRM[params?.item?.role]})`}
          onPressFilter={() => popUpConfToast.plzWait({
            bodyComponent: () => <SearchBox
              onPressSubmit={handleSearchSubmit}
              initialValue={searchSubmit}
            />
          })}
        />
        <HeaderRowUserAtt />
      </View>
      <FlatList
        ListHeaderComponent={<></>}
        ListEmptyComponent={
          <>
            {isLoading && <LoadingCompo />}
            {!isLoading && <NoDataFound />}
          </>
        }
        contentContainerStyle={{ gap: 15, paddingHorizontal: 20, paddingBottom: 50 }}
        data={data ?? []}
        renderItem={({ item }) => {
          return <RowSingleUserAtt
            item={item}
            onPress={() => navigate(routeAttendance.AttendanceDetail, { item })}
          />
        }}
        onEndReached={onEndReach}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage && <ActivityIndicator
            size={'small'}
            color={'#002E6B'}
          />
        }
      />
    </ContainerHRM>
  )
}

export default UserAttendanceList

const styles = StyleSheet.create({})

// const 