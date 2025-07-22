import { useIsFocused, useNavigation } from "@react-navigation/native";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import {
  selectUser,
  setAdvanceMeeting,
  setMeetingQueryKey,
} from "../../redux/userSlice";
import Container from "../../myComponents/Container/Container";
import { getAllMeetingFunc } from "../../redux/action";
import { deleteMeeting } from "../../services/rootApi/meetingApi";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { shadow1 } from "../../const/globalStyle";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import DeleteModel from "../../myComponents/DeleteModel";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { color } from "../../const/color";
import MeetingListHeading from "../../components/Meeting/MeetingListHeading";
import SkeletonLoadingBooking from "../../components/Booking/SkeletonLoadingBooking";
import SkeletonLoadingMeeting from "../../components/Dashboard/SkeletonLoadingMeeting";
import { roleEnum } from "../../utils/data";
import { askLocationPermission } from "../../utils/location";
import { useGetMeeting } from "../../hooks/useCRMgetQuerry";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "../../utils/debounce";
import { myConsole } from "../../hooks/useConsole";
import { queryKeyCRM } from "../../utils/queryKeys";

let bgByStatus = {
  reschedule: "#FECBA6",
  schedule: "#D6E5FD",
  conducted: "rgb(236, 255, 220)",
};

const AllMeetings = () => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation();
  // const isFocused = useIsFocused();

  const { user, meetingQueryKey } = useSelector(selectUser);

  // const { meeting, advanceMeeting } = useSelector(selectUser);
  const dispatch = useDispatch();
  // let copyMeeting = advanceMeeting !== null ? [...advanceMeeting] : [...meeting]
  // const [filteredMeeting, setFilteredMeeting] = useState(copyMeeting)
  const [selected, setSelected] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });
  const [searchValue, setSearchValue] = useState("");
  //refresh
  const [refreshing, setRefreshing] = React.useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  ///ReactQuery
  const {
    data: meetingData,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetMeeting({
    search: debouncedSearch,
    ...meetingQueryKey,
  });

  //

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

  const handleDeleteMeeting = async () => {
    setIsLoading(true);
    try {
      let res = await deleteMeeting(selected);
      // await dispatch(getAllMeetingFunc());
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getMeeting],
      });
      setSelected([]);
      toggleModalClose();
      setSnackBar({
        visible: true,
        text: res?.data,
        error: false,
      });
    } catch (error) {
      setSnackBar({
        visible: true,
        text: err?.response?.data,
        error: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toggleModalClose = () => {
    setModalVisible(false);
  };

  // useEffect(() => {
  //   if (!!searchValue && copyMeeting !== null) {
  //     let temp = copyMeeting?.filter((el) => {
  //       return el?.lead?.clientName.toLowerCase().includes(searchValue.toLowerCase())
  //         ||
  //         el?.meetings[el?.meetings?.length - 1].status?.toLowerCase().includes(searchValue.toLowerCase())
  //         ||
  //         el?.productPitch?.toLowerCase().includes(searchValue?.toLowerCase())
  //     })
  //     setFilteredMeeting(temp)
  //   }

  // }, [searchValue])

  // const handleFilterTextOnChange = (value) => {
  //   if (value) {
  //     setSearchValue(value)
  //   } else {
  //     setSearchValue('')
  //     setFilteredMeeting(copyMeeting !== null ? [...copyMeeting] : [])
  //   }
  // }

  // useEffect(() => {
  //   if (isFocused) {
  //     // handleFilterTextOnChange('')
  //     setSearchValue('')
  //     setSelected([])
  //     let temp = [...copyMeeting]
  //     temp?.sort((a, b) => Date.parse(b?.updatedAt) - Date.parse(a?.updatedAt))
  //     setFilteredMeeting(temp)
  //   }
  // }, [isFocused, advanceMeeting, meeting])

  useEffect(() => {
    (async () => {
      await askLocationPermission();
    })();
  }, []);

  const debounceSearch = React.useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    []
  );

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };

  const onEndReach = () => {
    if (hasNextPage && !loading && meetingData?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: ["getLead"],
      });
    } catch (e) {
      console.log("refreshGetAllLeave", e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <Container>
      <Header title={"All Meetings"} />

      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {true ? (
        <View>
          <TitleWithAddDelete
            arrLength={selected?.length}
            title="Meeting"
            onPressToNavigate={() => navigate("AddMeeting")}
            onPressToDelete={
              user?.role === roleEnum?.sup_admin ? toggleModal : false
            }
            onPressToFilter={() =>
              navigate("AdvanceSearch", { type: "meeting" })
            }
            onCloseSearch={
              meetingQueryKey !== null
                ? () => dispatch(setMeetingQueryKey(null))
                : false
            }
          />
          <FlatList
            data={meetingData}
            // data={[]}
            renderItem={({ item }) => {
              let status = item?.meetings[item?.meetings?.length - 1]?.status;
              return (
                <MeetingRowItem
                  item={item}
                  onPress={() =>
                    selected?.length > 0
                      ? handleSelect(item._id)
                      : navigate("MeetingDetails", { item })
                  }
                  selected={selected.indexOf(item?._id) !== -1}
                  onLongPress={
                    user?.role === roleEnum?.sup_admin
                      ? () => handleSelect(item?._id)
                      : undefined
                  }
                  bgColor={bgByStatus[status]}
                />
              );
            }}
            keyExtractor={(item) => item?._id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              paddingBottom: 300,
            }}
            ListHeaderComponent={
              <>
                <SearchBar
                  onClickCancel={() => {
                    // setSearchValue('')
                    // setFilteredMeeting([...copyMeeting])
                    handleSearchChange("");
                  }}
                  value={searchValue}
                  onChangeText={(v) => handleSearchChange(v)}
                />
                {/* <MeetingRowItem
                item={{
                  lead: { clientName: 'Client Name' },
                  productPitch: 'Product Pitch',
                  meetings: [{ status: 'Status' }],
                  scheduleDate: 'Schedule Date'
                }}
                bgColor={color.saffronMango}

              /> */}
                <MeetingListHeading />
              </>
            }
            ListHeaderComponentStyle={{ paddingTop: 5 }}
            ListEmptyComponent={
              loading ? <SkeletonLoadingMeeting /> : <NoDataFound />
            }
            onEndReached={onEndReach}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage && (
                <ActivityIndicator size={"small"} color={"#002E6B"} />
              )
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      ) : (
        <NoDataFound />
      )}
      <DeleteModel
        isLoading={isLoading}
        handleDeleteUser={handleDeleteMeeting}
        selectedUser={selected?.email}
        toggleModal={toggleModal}
        modalVisible={modalVisible}
      />
    </Container>
  );
};

const MeetingRowItem = ({ item, onPress, onLongPress, selected, bgColor }) => {
  return (
    <TouchableOpacity
      style={[
        styles.mainlistcontainer,
        {
          // backgroundColor: selected ? "rgba(252, 244, 227, 1)" : "#FCFAFA",
          backgroundColor: selected ? "rgba(252, 244, 227, 1)" : bgColor,
        },
      ]}
      activeOpacity={0.5}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={{ width: "36%" }}>
        <Text style={{ color: "#000000", fontWeight: "700", fontSize: 16 }}>
          {item?.lead?.clientName}
        </Text>
        <Text style={{ color: "#000000", fontWeight: "300", fontSize: 14 }}>
          {item?.productPitch}
        </Text>
      </View>
      <View style={{ width: "32%", alignItems: "center" }}>
        <Text
          style={{
            color: "#000000",
            fontWeight: "400",
            fontSize: 16,
            textTransform: "capitalize",
          }}
        >
          {item?.meetings[item?.meetings?.length - 1]?.status}
        </Text>
        <Text>
          <Text>
            {`${item?.createdBy?.name} (${item?.createdBy?.role
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())})`}
          </Text>
        </Text>
      </View>
      <View style={{ width: "32%", alignItems: "flex-end" }}>
        <Text style={{ color: "#000000", fontWeight: "700", fontSize: 12 }}>
          Scheduled
        </Text>
        {item?.scheduleDate === "Schedule Date" ? (
          <Text style={{ color: "#000000", fontWeight: "400", fontSize: 12 }}>
            Schedule Date
          </Text>
        ) : (
          <Text style={{ color: "#000000", fontWeight: "400", fontSize: 12 }}>
            {moment(item?.scheduleDate).format("DD/MM/YYYY")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: "#2D67C6",
    width: "100%",
    margin: "auto",
    alignSelf: "center",
    borderBottomWidth: 1,
    marginVertical: -2,
  },
  mainlistcontainer: {
    marginTop: 25,
    // backgroundColor: "#FCFAFA",
    borderWidth: 1,
    padding: 13,
    borderRadius: 11,
    borderColor: "#2D67C6",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    ...shadow1,
  },
});

export default AllMeetings;
