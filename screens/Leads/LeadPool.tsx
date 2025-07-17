import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Header from '../../components/Header'
import Container from '../../myComponents/Container/Container'
import { useGetLeadPool } from '../../hooks/useCRMgetQuerry'
import { myConsole } from '../../hooks/useConsole'
import LeadListHeading from '../../components/Leads/LeadHeading/LeadListHeading'
import SkeletonLoadingLead from '../../components/Leads/SkeletonLoadingLead/SkeletonLoadingLead'
import NoDataFound from '../../myComponents/NoDataFound/NoDataFound'
import { debounce } from '../../utils/debounce'
import SearchBar from '../../myComponents/SearchBar/SearchBar'
import { useNavigation } from '@react-navigation/native'
import { shadow1 } from '../../const/globalStyle'
import { leadTypeObj, roleEnum, statusObj } from '../../utils/data'
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn'
import { popupModal2 } from '../../utils/toastFunction'
import { claimLead, deleteLeadsByIds } from '../../services/rootApi/leadApi'
import { useSelector } from 'react-redux'
import { selectUser } from '../../redux/userSlice'
import TitleWithAddDelete from '../../myComponents/TitleWithAddDelete/TitleWithAddDelete'
import { queryKeyCRM } from '../../utils/queryKeys'
import { useQueryClient } from '@tanstack/react-query'

// let bgByStatus = {
//     assign: '#FECBA6',
//     new: '#D6E5FD',
// }

const LeadPool = () => {
    const queryClient = useQueryClient();
    const { user, leadQueryKey } = useSelector(selectUser);
    const isSubSup = user?.role === roleEnum.sub_admin || user?.role === roleEnum.sup_admin;
    const { navigate } = useNavigation();
    const [selected, setSelected] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const {
        data: leadData,
        isLoading: loading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch } = useGetLeadPool({
            search: debouncedSearch,
        })

    const onEndReach = () => {
        if (hasNextPage && !loading && leadData?.length > 0) {
            fetchNextPage && fetchNextPage()
        }
    }

    const onRefresh = async () => {
        try {
            setRefreshing(true)
            await refetch()
        }
        catch (e) {
            console.log('refreshGetAllLeave', e)
        }
        finally {
            setRefreshing(false)
        }
    }

    const debounceSearch = useCallback(
        debounce((value) => setDebouncedSearch(value), 500),
        []
    );

    const handleSearchChange = (v) => {
        setSearchValue(v);
        debounceSearch(v);
    };

    const handleSelect = (id) => {
        let temp = [...selected];
        let index = temp.indexOf(id);
        if (index !== -1) {
            temp.splice(index, 1);
        } else {
            temp.push(id);
        }
        setSelected(temp);
    };

    const handleDeleteLeadPool = async () => {
        await deleteLeadsByIds(selected)
        refetch();
        setSelected([]);
    }

    return (
        <>
            <Header title={"Lead Pool"} />
            <Container>
                <TitleWithAddDelete
                    arrLength={selected?.length}
                    title="Lead"
                    onPressToNavigate={() => navigate("AddLeads")}
                    onPressToDelete={() => popupModal2.wantDelete({ onConfirm: handleDeleteLeadPool })}

                />
                <FlatList
                    data={leadData}
                    renderItem={({ item, index }) => {
                        return (
                            <LeadPoolRowItem
                                index={index}
                                item={item}
                                selected={selected?.indexOf(item?._id) !== -1}
                                // bgColor={bgByStatus[item?.status]}
                                onPress={() => {
                                    if (isSubSup) {
                                        selected?.length === 0
                                            ? navigate("LeadsDetails", { item })
                                            : handleSelect(item._id)
                                    }
                                }}
                                // onLongPress={isSubSup ? () => handleSelect(item._id) : undefined}
                                onPressClaim={() => {
                                    popupModal2.wantDelete({
                                        onConfirm: async () => {
                                            !!item?._id && await claimLead(item?._id)
                                            refetch();
                                        },
                                        title: 'Do yo want to claim!'
                                    })
                                }}
                            />
                        );
                    }}
                    keyExtractor={(item) => item?._id}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{
                        paddingBottom: 100,
                    }}
                    ListHeaderComponent={
                        <View>
                            <SearchBar
                                onChangeText={(v) => handleSearchChange(v)}
                                value={searchValue}
                                onClickCancel={() => {
                                    handleSearchChange('')
                                    // setSearchValue('')
                                    // setFilteredData([...copyLead])
                                }}
                            />
                            <LeadPoolHeading />
                        </View>
                    }
                    ListHeaderComponentStyle={{ paddingTop: 5 }}
                    ListEmptyComponent={loading ?
                        <SkeletonLoadingLead />
                        :
                        <NoDataFound />
                    }
                    onEndReached={onEndReach}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingNextPage && <ActivityIndicator
                            size={'small'}
                            color={'#002E6B'}
                        />
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            </Container>
        </>
    )
}

export default LeadPool

const LeadPoolRowItem = ({
    item,
    onPress,
    index,
    selected,
    bgColor,
    onLongPress,
    onPressClaim
}) => {
    const { user, leadQueryKey } = useSelector(selectUser);
    const isSubSup = user?.role === roleEnum.sub_admin || user?.role === roleEnum.sup_admin;
    return <TouchableOpacity
        key={index}
        activeOpacity={isSubSup ? 0.9 : 1}
        style={[
            styles.mainlistcontainer,
            {
                backgroundColor: selected ? "rgba(252, 244, 227, 1)" : bgColor ? bgColor : 'white'
            },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
    >
        <View style={{ flexDirection: "row" }}>
            <View style={{ width: "65%", paddingEnd: 3 }}>
                <Text
                    numberOfLines={1}
                    style={{
                        color: "#000000",
                        fontWeight: "700",
                        fontSize: 16,
                        textTransform: "capitalize",
                    }}
                >
                    {item?.name}
                </Text>
                <Text
                    numberOfLines={1}
                    style={{
                        color: "#000000",
                        fontWeight: "400",
                        marginTop: 5,
                        textTransform: "capitalize",
                    }}
                >
                    {item?.clientName}
                </Text>
            </View>
            <View style={{ width: "35%", paddingEnd: 3, }}>
                <Text
                    numberOfLines={1}
                    style={{
                        color: "#000000",
                        fontWeight: "400",
                        fontSize: 15,
                        textTransform: "capitalize",
                    }}
                >
                    {leadTypeObj?.[item?.type]}
                </Text>
                <Text
                    numberOfLines={1}
                    style={{
                        color: "#000000",
                        fontWeight: "400",
                        fontSize: 15,
                        textTransform: "capitalize",
                        marginTop: 5,
                    }}
                >
                    {item?.source || "N/A"}
                </Text>
            </View>

        </View>
        <CustomBtn
            title='Claim'
            textStyle={{ fontSize: 16, paddingVertical: 5 }}
            containerStyle={{ marginTop: 20 }}
            onPress={onPressClaim}
        />
    </TouchableOpacity>
}


const LeadPoolHeading = () => {
    return (
        <Container style={[{ paddingHorizontal: 20 }]}>
            <View style={styles.headingContainer}>
                <View style={{ width: "65%" }}>
                    <Text
                        style={[styles.headingText]}>{'Project Name'}
                    </Text>
                    <Text
                        style={[styles.headingText, { marginTop: 5 }]}>{'Client Name'}
                    </Text>
                </View>
                <View style={{ width: "35%" }}>
                    <Text
                        style={[styles.headingText]}>{'Type'}
                    </Text>
                    <Text
                        style={[styles.headingText, { marginTop: 5 }]}>{'Source'}
                    </Text>
                </View>
                {/* <View style={{ width: "32%", alignItems: 'center' }}>
                    <Text
                        style={[styles.headingText]}>{'Status'}
                    </Text>
                    <Text
                        style={[styles.headingText, { marginTop: 5 }]}>{'Assigned'}
                    </Text>
                </View> */}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    divider: {
        borderBottomColor: "#FFC857",
        width: "100%",
        margin: "auto",
        alignSelf: "center",
        borderBottomWidth: 1,
        marginVertical: -2,
    },
    mainlistcontainer: {
        marginTop: 25,
        borderWidth: 1,
        padding: 13,
        borderRadius: 10,
        borderColor: "#FFC857",
        marginHorizontal: 20,
        ...shadow1,
    },
    headingContainer: {
        backgroundColor: "#3E3E3E",
        flexDirection: "row",
        padding: 10,
        borderRadius: 11,
        marginBottom: -8,
        marginTop: 25,
        // justifyContent: "space-between",
    },
    headingText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
        lineHeight: 18,
    },
});
