import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
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
import { useAppToast } from "../../components/AppToast";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";

const ReferralList = () => {
  const { navigate } = useNavigation();
  const toast = useAppToast();
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
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetAllReferrals({ search: debouncedSearch });

  const onEndReach = () => {
    // if (hasNextPage && !loading && data?.length > 0) {
    if (hasNextPage && !loading && data?.pages?.length > 0) {
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

  const handleDeleteReferral = async () => {
    if (selected?.length > 0) {
      popupModal2.wantLoading();
      await deleteReferral({ idArr: selected }, toast);
      await refetch();
      setSelected([]);
    }
  };

  return (
    <>
      <Header
        title="Referral List"
        moduleName={"referral"}
        showActions={true}
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
          title="Referral"
          onPressToNavigate={() => navigate(routeReferral.AddReferrals)}
          onPressToDelete={() =>
            popupModal2.wantDelete({ onConfirm: handleDeleteReferral })
          }
          showAddBtn={false}
        />

        <FlatList
          // data={data}
          ref={flatListRef}
          data={data?.pages?.flatMap((p) => p?.data || [])}
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
          // keyExtractor={(item) => item?._id}
          keyExtractor={(item) => item?._id?.toString()}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 100 }}
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
                    onChangeText={handleSearchChange}
                    autoFocus={focusSearch}
                  />
                </Animated.View>
              )}
              <HeaderReferralList />
            </>
          }
          ListHeaderComponentStyle={{ paddingTop: 5 }}
          ListEmptyComponent={
            loading ? (
              <SkeletonLoadingLead />
            ) : (
              <View
                style={{
                  flex: 1,
                  marginTop: 60,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <NoDataFound height={200} width={200} />
                <CustomText style={{ color: color.mainTxtColor }}>
                  No referrals found
                </CustomText>
              </View>
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
