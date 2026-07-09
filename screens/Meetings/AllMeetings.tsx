import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import { selectUser, setMeetingQueryKey } from "../../redux/userSlice";
import Container from "../../myComponents/Container/Container";
import { deleteMeeting } from "../../services/rootApi/meetingApi";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { shadowPrimaryColor } from "../../const/globalStyle";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import DeleteModel from "../../myComponents/DeleteModel";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { color } from "../../const/color";
import SkeletonLoadingMeeting from "../../components/Dashboard/SkeletonLoadingMeeting";
import { roleEnum } from "../../utils/data";
import { askLocationPermission } from "../../utils/location";
import { useGetMeeting } from "../../hooks/useCRMgetQuerry";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "../../utils/debounce";
import { queryKeyCRM } from "../../utils/queryKeys";
import { sizes } from "../../const";
import CustomText from "../../myComponents/CustomText/CustomText";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import { Feather } from "@expo/vector-icons";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";

let bgByStatus = {
  reschedule: "#A8C4F5", // soft blue tint
  schedule: "#C9DCFA", // lighter blue for planned
  conducted: "#E4EEFC", // pale bluish-white for done
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [focusSearch, setFocusSearch] = useState(false);

  //refresh
  const [refreshing, setRefreshing] = React.useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  ///ReactQuery
  const {
    data: meetingData,
    isLoading: loading,
    totalCount,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetMeeting({
    search: debouncedSearch,
    ...meetingQueryKey,
  });

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
    [],
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
      <Header
        title={"Meetings"}
        showBackIcon={false}
        totalCount={totalCount}
        isWithAnimation
        showActions={true}
        moduleName={"meeting"}
        onPressSearch={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setShowSearch((prev) => !prev);
          setFocusSearch(true);
        }}
        showSearch={showSearch}
        onPressFilter={() => navigate("AdvanceSearch", { type: "meeting" })}
        onPressAdd={() => navigate("AddMeeting")}
        onCloseSearch={
          meetingQueryKey !== null
            ? () => dispatch(setMeetingQueryKey(null))
            : false
        }
      />

      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {true ? (
        <View>
          {!showHeaderActions && (
            <TitleWithAddDelete
              isWithAnimation
              arrLength={selected?.length}
              title="Meeting"
              showAddBtn={false}
              // onPressToNavigate={() => navigate("AddMeeting")}
              onPressToDelete={
                user?.role === roleEnum?.sup_admin ? toggleModal : false
              }
              // onPressToFilter={() =>
              //   navigate("AdvanceSearch", { type: "meeting" })
              // }
              // onCloseSearch={
              //   meetingQueryKey !== null
              //     ? () => dispatch(setMeetingQueryKey(null))
              //     : false
              // }
            />
          )}

          <FlatList
            data={meetingData}
            ref={flatListRef}
            // data={[]}
            renderItem={({ item, index }) => {
              let status = item?.meetings[item?.meetings?.length - 1]?.status;
              return (
                <MeetingRowItem
                  item={item}
                  index={index}
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
                      isWithAnimation
                      onChangeText={(v) => handleSearchChange(v)}
                      autoFocus={focusSearch}
                    />
                  </Animated.View>
                )}

                {/* <MeetingListHeading /> */}
              </>
            }
            ListHeaderComponentStyle={{ paddingTop: 5 }}
            ListEmptyComponent={
              loading ? (
                <SkeletonLoadingMeeting />
              ) : (
                <NoDataFound style={{ marginTop: sizes.height / 5 }} showTxt />
              )
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
            onScroll={(e) => {
              const offsetY = e.nativeEvent.contentOffset.y;
              const show = offsetY > 180;
              if (show !== showHeaderActions) {
                setShowHeaderActions(show);
              }
            }}
            scrollEventThrottle={16}
          />
        </View>
      ) : (
        <NoDataFound showTxt />
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

const MeetingRowItem = ({
  item,
  onPress,
  onLongPress,
  selected,
  index,
}: any) => {
  const latestMeeting = item?.meetings?.[item?.meetings?.length - 1];

  const meetingTime = latestMeeting?.scheduleDate || item?.scheduleDate;

  const formattedTime = meetingTime
    ? moment(meetingTime).format("hh:mm A")
    : "N/A";

  const formattedDate = meetingTime ? moment(meetingTime).format("DD MMM") : "";

  const status = latestMeeting?.status || "";

  const statusColor =
    status === "conducted"
      ? { bg: "#D4F3E3", text: "#0A8F4B" }
      : { bg: "#DCE8FA", text: "#2D67C6" };

  return (
    <SlideFadeIn>
      <TouchableOpacity
        style={[
          styles.cardContainer,
          selected && { backgroundColor: "rgba(252,244,227,1)" },
        ]}
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {/* 🔹 LEFT TIME SECTION */}
        <View style={styles.timeContainer}>
          {/* Serial Number Top Right */}
          <CustomText style={styles.serialNumber}>{index + 1}</CustomText>

          <CustomText style={styles.timeText}>{formattedTime}</CustomText>

          <CustomText style={styles.dateText}>{formattedDate}</CustomText>
        </View>

        {/* 🔹 RIGHT CONTENT SECTION */}
        <View style={styles.contentContainer}>
          {/* Top Row */}
          <View style={styles.topRow}>
            <CustomText style={styles.clientName}>
              {item?.lead?.clientName || "N/A"}
            </CustomText>

            <View
              style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
            >
              <CustomText
                style={[styles.statusText, { color: statusColor.text }]}
              >
                {status === "conducted" ? "Conducted" : "Scheduled"}
              </CustomText>
            </View>
          </View>

          {/* Product */}
          <CustomText style={styles.productText}>
            {item?.productPitch || "-"}
          </CustomText>

          {/* Location + Type */}
          <View style={styles.bottomRow}>
            <View style={styles.infoPill}>
              <Feather name="map-pin" size={12} color="#7A869A" />
              <CustomText style={styles.pillText}>
                {item?.clientCity || item?.clientCountry || "-"}
              </CustomText>
            </View>

            <View style={styles.infoPill}>
              <Feather name="video" size={12} color="#7A869A" />
              <CustomText style={styles.pillText}>
                {latestMeeting?.isMobile ? "Video Call" : "In-Person"}
              </CustomText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
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
    marginTop: 20,
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    borderColor: color.strokeColor,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    ...shadowPrimaryColor,
  },

  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#F7F9FC",
    borderRadius: 18,
    padding: 10,
    marginHorizontal: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E3E8EF",
    ...shadowPrimaryColor,
  },

  timeContainer: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  serialNumber: {
    position: "absolute",
    top: 0,
    left: 4,
    fontSize: 12,
    fontWeight: "400",
    color: "#707070",
  },

  timeText: {
    fontWeight: "700",
    color: "#1E293B",
  },

  dateText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#7A869A",
    marginTop: 2,
  },

  contentContainer: {
    flex: 1,
    paddingLeft: 10,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  clientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D67C6",
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  productText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#475569",
    marginTop: 6,
  },

  bottomRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  pillText: {
    fontSize: 11,
    marginLeft: 4,
    color: "#64748B",
  },
});

export default AllMeetings;
