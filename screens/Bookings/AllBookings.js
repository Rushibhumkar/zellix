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
import { selectUser, setAdvanceBooking, setBookingQueryKey } from "../../redux/userSlice";
import DeleteIcon from "../../assets/svg/DeleteIcon";
import { deleteBookings } from "../../services/rootApi/bookingApi";
import { getAllBookingFunc } from "../../redux/action";
import { myConsole } from "../../hooks/useConsole";
import CustomText from "../../myComponents/CustomText/CustomText";
import { shadow2, shadow1 } from "../../const/globalStyle";
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

let bookingStatus = [
  { value: '', label: 'All' },
  { value: 'confirm_business', label: 'Confirm Business' },
  { value: 'eoi', label: 'EOI' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'eoi_canceled', label: 'EOI Canceled' },
];


const AllBookings = () => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation();
  const { user, bookingQueryKey } = useSelector(selectUser)
  // const { bookings, advanceBooking, } = useSelector(selectUser);
  // let copyBooking = advanceBooking !== null ? [...advanceBooking] : [...bookings]
  // const isFocused = useIsFocused();
  const dispatch = useDispatch();
  //
  // const [filteredData, setFilteredData] = useState(copyBooking)
  const [searchValue, setSearchValue] = useState("")
  //
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });
  const [refreshing, setRefreshing] = React.useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [businessStatus, setBusinessStatus] = useState('');
  const modalBusinessStatus = useModal();
  const {
    data: bookingData,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useGetBooking({
    search: debouncedSearch,
    businessStatus,
    ...bookingQueryKey
  })


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
        queryKey: [queryKeyCRM.getBooking]
      })
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
    setModalVisible(false)
  }
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
    []
  );

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };
  const onEndReach = () => {
    if (hasNextPage && !loading && bookingData?.length > 0) {
      fetchNextPage && fetchNextPage()
    }
  }

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true)
      await queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getBooking]
      })
    }
    catch (e) {
      console.log('refreshGetBooking', e)
    }
    finally {
      setRefreshing(false)
    }
  }, []);



   const { data: permission = {} } = useGetUserPermission(user?._id);

const canAddBooking = checkPermission(permission, "Bookings", "add", user?.role);
const canViewBookingDetail = checkPermission(permission, "Bookings", "viewDetails", user?.role);
const canDeleteBooking = checkPermission(permission, "Bookings", "delete", user?.role);
const canViewBookings = checkPermission(permission, "Bookings", "view", user?.role);

myConsole('canAddBooking',canAddBooking)
  return (
    <View style={{ flex: 1 }}>
      <Header title={"All Bookings"} />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {/* {isLoading && <ActivityIndicator />} */}
     {canViewBookings ? (
  <Container>
    <TitleWithAddDelete
      arrLength={selectedBookings?.length}
      title="Bookings"
      showAddBtn={canAddBooking}
      onPressToNavigate={canAddBooking ? () => navigate("DeveloperInformation") : undefined}
      onPressToDelete={canDeleteBooking && user?.role === roleEnum?.sup_admin ? toggleModal : undefined}
      onPressToFilter={() => navigate('AdvanceSearch', { type: 'booking' })}
      onCloseSearch={bookingQueryKey !== null ? () => dispatch(setBookingQueryKey(null)) : undefined}
      onSelectLeadType={() => {
        modalBusinessStatus.openModal();
      }}
    />

    <FlatList
      data={bookingData}
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
            onClickCancel={() => handleSearchChange("")}
            onChangeText={(v) => handleSearchChange(v)}
          />
          <BookingListHeading />
        </>
      }
      ListHeaderComponentStyle={{ paddingTop: 5 }}
      ListEmptyComponent={
        loading ? <SkeletonLoadingBooking /> : <NoDataFound />
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
  </Container>
) : (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    }}
  >
    <Text style={{ textAlign: "center", fontSize: 16, color: "#555" }}>
      You do not have permission to view booking records. Please contact your administrator.
    </Text>
  </View>
)}

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
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 250 }}>
          <CustomText
            fontSize={16}
            fontWeight="600"
          >Business Status</CustomText>
          <View style={{ height: 15 }} />
          {bookingStatus?.map((item, index) => {
            return (
              <CustomCheckBox
                key={index}
                title={item?.label}
                isCheck={businessStatus === item?.value}
                onPress={() => {
                  setBusinessStatus(item?.value)
                  modalBusinessStatus.closeModal()
                }}
                marginBottom={15}
              />
            )
          })}
        </View>
      </CustomModal>
    </View>
  );
};

const BookingRowItem = ({ index, item, onPress, onLongPress, selected, bgColor }) => {
  let statusColor = {
    approved: color.green,
    rejected: "red",
    pending: "rgb(242,146,57)",
  };
  return (
    <TouchableOpacity
      style={[
        styles.mainlistcontainer,
        {
          marginHorizontal: 20,
          backgroundColor: selected ? "rgba(252, 244, 227, 1)" : bgColor ? bgColor : "#FCFAFA",
        },
      ]}
      activeOpacity={0.5}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* <View> */}
      {/* <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
        <CustomText
          fontSize={12}
          fontWeight="600"
          color={color.green}
        >{item?.status}</CustomText>
      </View> */}
      <View style={{ flexDirection: "row", }}>
        <View style={{ width: "10%", paddingEnd: 3 }}>
          {index === 'S.No' ? <CustomText fontSize={14} fontWeight="400">
            No.
          </CustomText> : <CustomText fontSize={14} fontWeight="400">
            {" "}
            {index < 9 && "0"}
            {index + 1}
          </CustomText>}
        </View>
        <View style={{ width: "33%", paddingEnd: 3 }}>
          <View>
            <CustomText
              fontSize={16}
              fontWeight="700"
              marginBottom={5}
              numberOfLines={2}
            >
              {item?.projectName}
            </CustomText>
            {/* <CustomText
              fontSize={12}
              fontWeight="300"
            >{item?.bookingAmount}
            </CustomText> */}
          </View>
        </View>
        <View style={{ width: "32%", paddingEnd: 3 }}>
          {/* <CustomText
            color={color.green}
            fontWeight="500"
          >  {item?.token ? 'Paid' : 'Unpaid'}
          </CustomText> */}
          <CustomText
            // fontSize={12}
            fontWeight="600"
            color={statusColor[item?.status]}
            style={{ textTransform: 'capitalize' }}
          >{item?.status}
          </CustomText>
        </View>
        <View
          style={{ width: '25%' }}>
          <View style={{ alignItems: 'flex-end' }}>
            <CustomText
              marginBottom={5}
              numberOfLines={1}
            > {item?.propertyDetails}
            </CustomText>
            <CustomText
              fontSize={10}
              fontWeight="300"
            > {moment(item?.date).format('DD/MM/YYYY')}
            </CustomText>
          </View>

        </View>
      </View>
    </TouchableOpacity>
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
    marginTop: 25,
    borderWidth: 1,
    padding: 10,
    borderRadius: 11,
    borderColor: color.saffronMango,
    ...shadow1,
  },
});

export default AllBookings;
