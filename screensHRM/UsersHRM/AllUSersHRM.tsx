import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import TitleHRM from "../../myComponentsHRM/TitleHRM/TitleHRM";
import RowOnLeave from "../../myComponentsHRM/Row/RowOnLeave";
import RowEmployee from "../../myComponentsHRM/Row/RowEmployee";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { routeUser } from "../../utils/routesHRM";
import { color } from "../../const/color";
import AddIcon from "../../assets/svgHRM/AddIcon";
import { useGetAllUserHRM } from "../../hooks/useGetQuerryHRM";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CircularBarChart from "../../myComponentsHRM/CircularBarChart/CircularBarChart";
import HeaderRowEmployee from "../../myComponentsHRM/Row/rowHeader/HeaderRowEmployee";
import ListingSearch from "../../myComponentsHRM/SearchBox/ListingSearch";
import { useHRMListingSearch } from "../../hooks/useHRMListingSearch";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { roleEnum } from "../../utils/data";
import { Feather } from "@expo/vector-icons";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

const AllUSersHRM = () => {
  const { navigate } = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useSelector(selectUser);
  useFocusEffect(useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["getUserStatusChart"] });
  }, [queryClient]));
  const isSubSup = [
    roleEnum.sub_admin,
    roleEnum.sup_admin,
    roleEnum.developer,
  ].includes(user?.role);
  const canOnboardUsers = isSubSup || user?.role === roleEnum.hr;
  const canManageRolePermissions =
    isSubSup || user?.role === roleEnum.office_admin;
  const [searchSubmit, setSearchSubmit] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const updateSearch = useCallback(
    (search: string) =>
      setSearchSubmit((prev) =>
        prev.search === search ? prev : { ...prev, search },
      ),
    [],
  );
  const search = useHRMListingSearch(updateSearch);
  const {
    data: allUsers,
    totalCount,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetAllUserHRM({ search: searchSubmit?.search });
  const onEndReach = () => {
    if (hasNextPage && !isLoading && allUsers?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getAllUserHRM],
      });
      await queryClient.invalidateQueries({ queryKey: ["getUserStatusChart"] });
    } catch (e) {
      console.log("refreshInUser", e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ContainerHRM
      headingTitle="Users"
      totalCount={totalCount}
      onPressSearch={search.toggleSearch}
      showSearch={search.showSearch}
      childStyle={{ flex: 1, height: undefined }}
    >
      {search.showSearch && (
        <ListingSearch
          value={search.searchValue}
          onChangeText={search.setSearchValue}
          onClose={search.closeSearch}
        />
      )}
      {canOnboardUsers && (
        <TouchableOpacity
          onPress={() => navigate(routeUser.AddUserHRM)}
          activeOpacity={0.7}
          style={styles.fabButton}
        >
          <AddIcon />
        </TouchableOpacity>
      )}
      <View style={styles.container}>
        {canManageRolePermissions && (
          <TouchableOpacity
            onPress={() => navigate(routeUser.RolePermissionSetsHRM)}
            style={styles.rolePermissionsButton}
          >
            <Feather name="shield" size={18} color="#2E67BE" />
            <Text style={styles.rolePermissionsText}>Role Permission Sets</Text>
          </TouchableOpacity>
        )}
        <FlatList
          ref={search.listRef}
          data={allUsers ?? []}
          renderItem={({ item }) => {
            return (
              <RowEmployee
                onPress={() => navigate(routeUser.UserDetailHRM, { item })}
                containerStyle={styles.rowContainer}
                item={item}
              />
            );
          }}
          ListHeaderComponent={
            <>
              <CircularBarChart type="userChart" />
              <TitleHRM
                title="Total Employees"
                marginTop={12}
                marginBottom={20}
              />
            </>
          }
          contentContainerStyle={styles.listContent}
          onEndReached={onEndReach}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size={"small"} color={"#2D67C6"} />
              </View>
            )
          }
          ListEmptyComponent={
            <>
              {isLoading && <LoadingCompo />}
              {allUsers?.length === 0 && (
                <SlideFadeIn>
                  <View style={styles.emptyContainer}>
                    <NoDataFound height={200} width={200} />
                    <Text style={styles.emptyText}>No employees found</Text>
                  </View>
                </SlideFadeIn>
              )}
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2D67C6"]}
              tintColor={"#2D67C6"}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </View>
    </ContainerHRM>
  );
};

export default AllUSersHRM;

const styles = StyleSheet.create({
  rolePermissionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#fff",
    borderColor: "#BFD4F3",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  rolePermissionsText: { color: "#2E67BE", fontSize: 14, fontWeight: "700" },
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 180,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  rowContainer: {
    marginBottom: 12,
  },
  fabButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 60 : 100,
    right: 20,
    zIndex: 5,
    // backgroundColor: "#2D67C6",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: color.mainTxtColor,
    fontWeight: "500",
  },
});
