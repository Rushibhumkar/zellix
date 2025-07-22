import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { useNavigation } from "@react-navigation/native";
import { debounce } from "../../utils/debounce";
import { myConsole } from "../../hooks/useConsole";
import { useGetAllReferrals } from "./useQuery/useReferral";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import SkeletonLoadingLead from "../../components/Leads/SkeletonLoadingLead/SkeletonLoadingLead";
import { popupModal2 } from "../../utils/toastFunction";
import { routeReferral } from "../../utils/routes";
import CardReferral, { HeaderReferralList } from "./components/CardReferral";
import { deleteReferral } from "../../services/rootApi/referralApi";

const ReferralList = () => {
  const { navigate } = useNavigation();
  const [selected, setSelected] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    data,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetAllReferrals({ search: debouncedSearch });

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
      console.log("refreshGetAllReferral", e);
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleDeleteReferral = async () => {
    if (selected?.length > 0) {
      popupModal2.wantLoading();
      await deleteReferral({ idArr: selected });
      await refetch();
      setSelected([]);
    }
  };
  return (
    <>
      <Header title="Referral List" />
      <Container>
        <TitleWithAddDelete
          arrLength={selected?.length}
          title="Referral"
          onPressToNavigate={() => navigate(routeReferral.AddReferrals)}
          onPressToDelete={() =>
            popupModal2.wantDelete({ onConfirm: handleDeleteReferral })
          }
          showAddBtn={false}
        />

        <FlatList
          data={data}
          renderItem={({ item, index }) => (
            <CardReferral
              index={index}
              item={item}
              selected={selected?.includes(item?._id)}
              onPress={() =>
                selected?.length === 0
                  ? navigate(routeReferral.ReferralDetails, { item })
                  : handleSelect(item._id)
              }
              onLongPress={() => handleSelect(item._id)}
            />
          )}
          keyExtractor={(item) => item?._id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <View>
              <SearchBar
                onChangeText={handleSearchChange}
                value={searchValue}
                onClickCancel={() => handleSearchChange("")}
              />
              <HeaderReferralList />
            </View>
          }
          ListHeaderComponentStyle={{ paddingTop: 5 }}
          ListEmptyComponent={
            loading ? (
              <SkeletonLoadingLead />
            ) : (
              <NoDataFound height={340} width={340} />
            )
          }
          onEndReached={onEndReach}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage && (
              <ActivityIndicator size="small" color="#002E6B" />
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

export default ReferralList;

const styles = StyleSheet.create({});
