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
import React, { useState } from "react";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CardHRM from "../../myComponentsHRM/CardHRM/CardHRM";
import TitleHRM from "../../myComponentsHRM/TitleHRM/TitleHRM";
import RowOnLeave from "../../myComponentsHRM/Row/RowOnLeave";
import RowEmployee from "../../myComponentsHRM/Row/RowEmployee";
import { myConsole } from "../../hooks/useConsole";
import { useNavigation } from "@react-navigation/native";
import { routeUser } from "../../utils/routesHRM";
import { color } from "../../const/color";
import AddIcon from "../../assets/svgHRM/AddIcon";
import { useGetAllUserHRM } from "../../hooks/useGetQuerryHRM";
import LoadingCompo from "../../myComponentsHRM/LoadingCompo/LoadingCompo";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CircularBarChart from "../../myComponentsHRM/CircularBarChart/CircularBarChart";
import HeaderRowEmployee from "../../myComponentsHRM/Row/rowHeader/HeaderRowEmployee";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import SearchBox from "../../myComponentsHRM/SearchBox/SearchBox";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyHRM } from "../../utils/queryKeys";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { roleEnum } from "../../utils/data";
import { Feather } from "@expo/vector-icons";

const AllUSersHRM = () => {
  const { navigate } = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useSelector(selectUser);
  const isSubSup =
    user?.role === roleEnum.sub_admin || user?.role === roleEnum.sup_admin;
  const [searchSubmit, setSearchSubmit] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: allUsers,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetAllUserHRM({ search: searchSubmit?.search });
  const onEndReach = () => {
    console.log("hasNextPage", hasNextPage);
    if (hasNextPage && !isLoading && allUsers?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const handleSearchSubmit = (v) => {
    setSearchSubmit(v);
  };

  const onRefresh = () => {
    try {
      setRefreshing(true);
      queryClient.invalidateQueries({
        queryKey: [queryKeyHRM.getAllUserHRM],
      });
    } catch (e) {
      console.log("refreshInUser", e);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ContainerHRM headingTitle="Users">
      {isSubSup && (
        <TouchableOpacity
          onPress={() => navigate(routeUser.AddUserHRM)}
          activeOpacity={0.7}
          style={styles.fabButton}
        >
          <AddIcon />
        </TouchableOpacity>
      )}
      <View style={styles.container}>
        <FlatList
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
              <CardHRM />
              <TitleHRM
                title="Total Employees"
                marginTop={12}
                marginBottom={20}
                onPressFilter={() =>
                  popUpConfToast.plzWait({
                    bodyComponent: () => (
                      <SearchBox
                        onPressSubmit={handleSearchSubmit}
                        initialValue={searchSubmit}
                        hideFiles={{
                          endDate: true,
                          startDate: true,
                        }}
                      />
                    ),
                  })
                }
              />
              <HeaderRowEmployee />
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
                <View style={styles.emptyContainer}>
                  <NoDataFound height={200} width={200} />
                  <Text style={styles.emptyText}>No employees found</Text>
                </View>
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
        />
      </View>
    </ContainerHRM>
  );
};

export default AllUSersHRM;

const styles = StyleSheet.create({
  container: {
    minHeight: 600,
  },
  listContent: {
    paddingBottom: 180,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  rowContainer: {
    marginBottom: 12,
  },
  fabButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 120 : 100,
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
    color: "#718096",
    fontWeight: "500",
  },
});
