import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import React, { useCallback, useState } from "react";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { useNavigation } from "@react-navigation/native";
import { popupModal2 } from "../../utils/toastFunction";
import { routeProject } from "../../utils/routes";
import { debounce } from "../../utils/debounce";
import { useGetProjectList } from "./useQuery/useProject";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import SkeletonLoadingLead from "../../components/Leads/SkeletonLoadingLead/SkeletonLoadingLead";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import CardProject, { HeaderProjectList } from "./component/CardProject";
import { myConsole } from "../../hooks/useConsole";
import { deleteProject } from "../../services/rootApi/projectApi";
import { color } from "../../const/color";

const ProjectList = () => {
  const { navigate } = useNavigation();
  const [selected, setSelected] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);
  const flatListRef = React.useRef(null);

  const {
    data,
    isLoading: loading,
    hasNextPage,
    totalCount,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetProjectList({
    search: debouncedSearch,
  });

  const onEndReach = () => {
    if (hasNextPage && !loading && data?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (e) {
      console.log("refreshGetAllLeave", e);
    } finally {
      setRefreshing(false);
    }
  };

  const debounceSearch = useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    [],
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
      popupModal2.wantLoading();
      await deleteProject({
        idArr: selected,
      });
      refetch();
      setSelected([]);
    }
  };

  // myConsole("dataaaa", data);
  return (
    <>
      <Header
        title={"Project List"}
        totalCount={totalCount}
        moduleName="projects"
        showActions={true}
        onPressAdd={() => navigate(routeProject.ProjectForm)}
        onPressSearch={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setShowSearch((prev) => !prev);
          setFocusSearch(true);
        }}
        showSearch={showSearch}
      />
      <Container>
        <TitleWithAddDelete
          arrLength={selected?.length}
          title="Project"
          // onPressToNavigate={() => navigate(routeProject.ProjectForm)}
          showAddBtn={false}
          onPressToDelete={() =>
            popupModal2.wantDelete({ onConfirm: handleDeleteProject })
          }
        />

        <FlatList
          data={data}
          ref={flatListRef}
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
                    : handleSelect(item._id);
                  // }
                }}
                onLongPress={() => handleSelect(item._id)}
              />
            );
          }}
          keyExtractor={(item) => item?._id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
          ListHeaderComponent={
            <>
              {showSearch && (
                <Animated.View
                  entering={FadeInDown.duration(180)}
                  exiting={FadeOutUp.duration(150)}
                >
                  <SearchBar
                    onClickCancel={() => {
                      handleSearchChange("");
                      setFocusSearch(false);
                      setShowSearch(false);
                    }}
                    value={searchValue}
                    onChangeText={(v) => handleSearchChange(v)}
                    autoFocus={focusSearch}
                  />
                </Animated.View>
              )}
              <HeaderProjectList />
            </>
          }
          ListHeaderComponentStyle={{ paddingTop: 5 }}
          ListEmptyComponent={
            loading ? <SkeletonLoadingLead /> : <NoDataFound />
          }
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </Container>
    </>
  );
};

export default ProjectList;

const styles = StyleSheet.create({});
