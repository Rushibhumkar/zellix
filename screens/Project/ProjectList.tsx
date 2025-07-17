import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Header from '../../components/Header'
import Container from '../../myComponents/Container/Container'
import TitleWithAddDelete from '../../myComponents/TitleWithAddDelete/TitleWithAddDelete'
import { useNavigation } from '@react-navigation/native'
import { popupModal2 } from '../../utils/toastFunction'
import { routeProject } from '../../utils/routes'
import { debounce } from '../../utils/debounce'
import { useGetProjectList } from './useQuery/useProject'
import NoDataFound from '../../myComponents/NoDataFound/NoDataFound'
import SkeletonLoadingLead from '../../components/Leads/SkeletonLoadingLead/SkeletonLoadingLead'
import SearchBar from '../../myComponents/SearchBar/SearchBar'
import CardProject, { HeaderProjectList } from './component/CardProject'
import { myConsole } from '../../hooks/useConsole'
import { deleteProject } from '../../services/rootApi/projectApi'

const ProjectList = () => {
    const { navigate } = useNavigation();
    const [selected, setSelected] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const {
        data,
        isLoading: loading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch } = useGetProjectList({
            search: debouncedSearch,
        })

    const onEndReach = () => {
        if (hasNextPage && !loading && data?.length > 0) {
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


    const handleDeleteProject = async () => {
        if (selected?.length > 0) {
            popupModal2.wantLoading()
            await deleteProject({
                idArr: selected
            })
            refetch()
            setSelected([])
        }

    }
    return (
        <>
            <Header title={"Project List"} />
            <Container>
                <TitleWithAddDelete
                    arrLength={selected?.length}
                    title="Project"
                    onPressToNavigate={() => navigate(routeProject.ProjectForm)}
                    onPressToDelete={() => popupModal2.wantDelete({ onConfirm: handleDeleteProject })}

                />

                <FlatList
                    data={data}
                    renderItem={({ item, index }) => {
                        return (
                            <CardProject
                                index={index}
                                item={item}
                                selected={selected?.indexOf(item?._id) !== -1}
                                // bgColor={bgByStatus[item?.status]}
                                onPress={() => {
                                    // if (true) {
                                    selected?.length === 0
                                        ? navigate(routeProject.ProjectDetail, { item })
                                        : handleSelect(item._id)
                                    // }
                                }}
                                onLongPress={() => handleSelect(item._id)}
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
                            <HeaderProjectList />
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

export default ProjectList

const styles = StyleSheet.create({})