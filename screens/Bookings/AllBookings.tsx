import { AntDesign } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import {
  selectUser,
  setAdvanceBooking,
  setBookingQueryKey,
} from "../../redux/userSlice";
import DeleteIcon from "../../assets/svg/DeleteIcon";
import { deleteBookings } from "../../services/rootApi/bookingApi";
import { getAllBookingFunc } from "../../redux/action";
import { myConsole } from "../../hooks/useConsole";
import CustomText from "../../myComponents/CustomText/CustomText";
import { shadow2, shadow1, shadowPrimaryColor } from "../../const/globalStyle";
import { color } from "../../const/color";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import DeleteModel from "../../myComponents/DeleteModel";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import BookingListHeading from "../../components/Booking/BookingListHeader";
import SkeletonLoadingBooking from "../../components/Booking/SkeletonLoadingBooking";
import { roleEnum } from "../../utils/data";
import { useGetBooking } from "../../hooks/useCRMgetQuerry";
import { debounce } from "../../utils/debounce";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyCRM } from "../../utils/queryKeys";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import CustomCheckBox from "../../myComponentsHRM/CutomCheckBox/CustomCheckBox";
import CustomModal from "../../myComponents/CustomModal/CustomModal";
import useModal from "../../hooks/useModal";
import { checkPermission } from "../../utils/commonFunctions";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { sizes } from "../../const";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

let bookingStatus = [
  { value: "", label: "All" },
  { value: "confirm_business", label: "Confirm Business" },
  { value: "eoi", label: "EOI" },
  { value: "canceled", label: "Canceled" },
  { value: "eoi_canceled", label: "EOI Canceled" },
];

const AllBookings = () => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation();
  const { user, bookingQueryKey } = useSelector(selectUser);
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");

  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [focusSearch, setFocusSearch] = useState(false);

  const [selectedBookings, setSelectedBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });
  const [refreshing, setRefreshing] = React.useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [businessStatus, setBusinessStatus] = useState("");
  const modalBusinessStatus = useModal();
  const {
    data: bookingData,
    isLoading: loading,
    totalCount,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetBooking({
    search: debouncedSearch,
    businessStatus,
    ...bookingQueryKey,
  });

  const handleSelect = (id) => {
    let temp = [...selectedBookings];
    let index = temp.indexOf(id);
    if (index !== -1) {
      temp.splice(index, 1);
    } else {
      temp.push(id);
    }
    setSelectedBookings(temp);
  };

  const handleDeleteBooking = async () => {
    setIsLoading(true);
    try {
      let res = await deleteBookings(selectedBookings);
      // await dispatch(getAllBookingFunc()); //editkaro
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getBooking],
      });
      setSelectedBookings([]);
      toggleModalClose();
      setSnackBar({
        visible: true,
        text: res?.data,
        error: false,
      });
    } catch (error) {
      //myConsole("error", error);
      setSnackBar({
        visible: true,
        text: error?.response?.data,
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
  //
  // useEffect(() => {
  //   if (!!searchValue) {
  //     let temp = copyBooking?.filter((item) => {
  //       return item?.projectName.toLowerCase().includes(searchValue?.toLowerCase())
  //         ||
  //         item?.status?.toLowerCase().includes(searchValue?.toLowerCase())
  //         ||
  //         item?.propertyDetails.toLowerCase().includes(searchValue?.toLowerCase())
  //     })
  //     myConsole('temp', temp)
  //     setFilteredData(temp)
  //   }

  // }, [searchValue])

  // const handleFilterTextOnChange = (value) => {
  //   if (value) {
  //     setSearchValue(value)
  //   } else {
  //     setSearchValue('')
  //     setFilteredData([...copyBooking])
  //   }
  // }

  // useEffect(() => {
  //   if (isFocused) {
  //     // handleFilterTextOnChange('')
  //     setSearchValue('')
  //     setSelectedBookings([]);
  //     let temp = [...copyBooking]
  //     temp?.sort((a, b) => Date.parse(b?.updatedAt) - Date.parse(a?.updatedAt))
  //     setFilteredData(temp)
  //   }
  // }, [isFocused, advanceBooking, bookings])
  const debounceSearch = React.useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    [],
  );

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };
  const onEndReach = () => {
    if (hasNextPage && !loading && bookingData?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getBooking],
      });
    } catch (e) {
      console.log("refreshGetBooking", e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const { data: permission = {} } = useGetUserPermission(user?._id);

  const canAddBooking = checkPermission(
    permission,
    "Bookings",
    "add",
    user?.role,
  );
  const canViewBookingDetail = checkPermission(
    permission,
    "Bookings",
    "viewDetails",
    user?.role,
  );
  const canDeleteBooking = checkPermission(
    permission,
    "Bookings",
    "delete",
    user?.role,
  );

  // myConsole("canAddBookinggg", canAddBooking);
  // myConsole("permissionnnn", permission);
  // myConsole("bookingDataaaa", bookingData[0]);
  return (
    <View style={{ flex: 1 }}>
      <Header
        title={"Bookings"}
        totalCount={totalCount}
        isWithAnimation
        showActions={true}
        moduleName="booking"
        onPressSearch={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setTimeout(() => {
            setFocusSearch((prev) => !prev); // toggles every time
          }, 100);
        }}
        onPressToFilter={() => navigate("AdvanceSearch", { type: "booking" })}
        onCloseSearch={
          bookingQueryKey !== null
            ? () => dispatch(setBookingQueryKey(null))
            : undefined
        }
        onPressAdd={
          canAddBooking
            ? () => navigate("DeveloperInformation")
            : () =>
                setSnackBar({
                  visible: true,
                  text: "You are not authorized to add booking details.",
                  error: true,
                })
        }
        onSelectLeadType={() => {
          modalBusinessStatus.openModal();
        }}
      />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {/* {isLoading && <ActivityIndicator />} */}

      <Container>
        {!showHeaderActions && (
          <TitleWithAddDelete
            isWithAnimation
            arrLength={selectedBookings?.length}
            title="Bookings"
            showAddBtn={false}
            // onPressToNavigate={
            //   canAddBooking
            //     ? () => navigate("DeveloperInformation")
            //     : () =>
            //         setSnackBar({
            //           visible: true,
            //           text: "You are not authorized to add booking details.",
            //           error: true,
            //         })
            // }
            onPressToDelete={
              canDeleteBooking && user?.role === roleEnum?.sup_admin
                ? toggleModal
                : undefined
            }
            // onPressToFilter={() =>
            //   navigate("AdvanceSearch", { type: "booking" })
            // }
            // onCloseSearch={
            //   bookingQueryKey !== null
            //     ? () => dispatch(setBookingQueryKey(null))
            //     : undefined
            // }
            // onSelectLeadType={() => {
            //   modalBusinessStatus.openModal();
            // }}
          />
        )}

        <FlatList
          data={bookingData}
          ref={flatListRef}
          renderItem={({ item, index }) => {
            return (
              <BookingRowItem
                index={index}
                item={item}
                onPress={() =>
                  selectedBookings.length === 0
                    ? canViewBookingDetail
                      ? navigate("BookingDetail", { item })
                      : setSnackBar({
                          visible: true,
                          text: "You are not authorized to view booking details.",
                          error: true,
                        })
                    : handleSelect(item?._id)
                }
                onLongPress={
                  user?.role === roleEnum?.sup_admin
                    ? () => handleSelect(item?._id)
                    : undefined
                }
                selected={selectedBookings.indexOf(item?._id) !== -1}
              />
            );
          }}
          keyExtractor={(item) => item?._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <>
              <SearchBar
                value={searchValue}
                onClickCancel={() => {
                  (handleSearchChange(""), setFocusSearch(false));
                }}
                onChangeText={(v) => handleSearchChange(v)}
                isWithAnimation
                autoFocus={focusSearch}
              />
              {/* <BookingListHeading /> */}
            </>
          }
          ListHeaderComponentStyle={{ paddingTop: 5 }}
          ListEmptyComponent={
            loading ? (
              <SkeletonLoadingBooking />
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
        />
      </Container>

      <DeleteModel
        isLoading={isLoading}
        handleDeleteUser={handleDeleteBooking}
        toggleModal={toggleModal}
        modalVisible={modalVisible}
      />

      <CustomModal
        hasBackdrop={true}
        visible={modalBusinessStatus.visible}
        onClose={modalBusinessStatus.closeModal}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            width: 250,
          }}
        >
          <SlideFadeIn>
            <CustomText
              fontSize={16}
              fontWeight="600"
              color={color.mainTxtColor}
            >
              Business Status
            </CustomText>
          </SlideFadeIn>
          <View style={{ height: 15 }} />
          {bookingStatus?.map((item, index) => {
            return (
              <CustomCheckBox
                key={index}
                title={item?.label}
                isCheck={businessStatus === item?.value}
                onPress={() => {
                  setBusinessStatus(item?.value);
                  modalBusinessStatus.closeModal();
                }}
                marginBottom={15}
              />
            );
          })}
        </View>
      </CustomModal>
    </View>
  );
};

const BookingRowItem = ({
  index,
  item,
  onPress,
  onLongPress,
  selected,
  bgColor,
}: any) => {
  let statusColor = {
    approved: color.green,
    rejected: "red",
    pending: "rgb(242,146,57)",
  };
  return (
    <SlideFadeIn>
      <TouchableOpacity
        style={[
          styles.mainlistcontainer,
          {
            marginTop: index === 0 ? 25 : 12,
            marginHorizontal: 12,
            backgroundColor: selected
              ? color.primaryFade
              : bgColor
                ? bgColor
                : "#FCFAFA",
          },
        ]}
        activeOpacity={0.5}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.projectName}>
              {item?.projectName}
            </CustomText>

            <CustomText style={styles.clientName}>
              {item?.lead?.clientName}
            </CustomText>
          </View>
          <View>
            <View>
              <CustomText style={styles.dateText}>
                {moment(item?.date).format("DD MMM YYYY")}
              </CustomText>
            </View>
            <View style={styles.statusBadge}>
              <CustomText style={styles.statusText}>{item?.status}</CustomText>
            </View>
          </View>
        </View>

        <View style={styles.dividerLine} />

        <View style={styles.cardBottomRow}>
          <View>
            <CustomText style={styles.labelText}>UNIT</CustomText>

            <CustomText style={styles.valueText}>{item?.unit}</CustomText>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <CustomText style={styles.labelText}>TOTAL</CustomText>

            <CustomText style={styles.valueText}>
              {item?.total?.toLocaleString()}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: color.saffronMango,
    width: "100%",
    margin: "auto",
    alignSelf: "center",
    borderBottomWidth: 1,
  },
  mainlistcontainer: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 14,
    borderColor: "#739fe141",
    ...shadowPrimaryColor,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  projectName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2D67C6",
  },

  clientName: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#FFF3CD",
    marginTop: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  dividerLine: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 8,
  },

  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  labelText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  valueText: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
    color: color.mainTxtColor,
  },

  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },
});

export default AllBookings;
