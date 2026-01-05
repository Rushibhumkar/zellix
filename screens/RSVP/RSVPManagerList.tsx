import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import DeleteModel from "../../myComponents/DeleteModel";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { color } from "../../const/color";
import { debounce } from "../../utils/debounce";
import { sizes } from "../../const";
import CustomText from "../../myComponents/CustomText/CustomText";
import moment from "moment";
import { deleteEvents, useRSVPEventsList } from "./rsvpApi";
import { routeRSVP } from "../../utils/routes";
import SkeletonLoadingEvents from "./components/SkeletonLoadingEvents";
import RSVPEventsHeading from "./components/RSVPEventsHeading";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

const RSVPManagerList = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useSelector(selectUser);

  const [selected, setSelected] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  // Refresh
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Infinite Query
  const {
    data,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRSVPEventsList({
    search: debouncedSearch,
  });

  const events = data?.pages?.flatMap((page) => page?.data) || [];

  // SEARCH DEBOUNCE
  const debounceSearch = React.useCallback(
    debounce((text) => setDebouncedSearch(text), 500),
    []
  );

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };

  // SELECT ITEM
  const handleSelect = (id) => {
    let temp = [...selected];
    let index = temp.indexOf(id);

    index !== -1 ? temp.splice(index, 1) : temp.push(id);
    setSelected(temp);
  };

  const toggleModal = () => setModalVisible(!modalVisible);
  const toggleModalClose = () => setModalVisible(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries(["rsvpEventsList"]);
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReach = () => {
    if (hasNextPage && !loading) fetchNextPage();
  };

  const { data: permission = {} } = useGetUserPermission(user?._id);
  // myConsole("Invitationssss", permission.Invitation);
  // myConsole("Eventssss", permission.Event);

  const canViewEventsList = checkPermission(
    permission,
    "Event",
    "viewList",
    user?.role
  );
  const canAddEvent = checkPermission(permission, "Event", "add", user?.role);
  const canDeleteEvent = checkPermission(
    permission,
    "Event",
    "delete",
    user?.role
  );
  const canViewEventDetails = checkPermission(
    permission,
    "Event",
    "viewDetails",
    user?.role
  );

  const handleDeleteEvent = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await deleteEvents(selected);
      await queryClient.invalidateQueries(["rsvpEventsList"]);
      toggleModalClose();

      setSnackBar({
        visible: true,
        text: res?.message || "Event(s) deleted successfully",
        error: false,
      });

      setSelected([]);
    } catch (err) {
      setSnackBar({
        visible: true,
        text: err?.response?.data || "Something went wrong",
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header
        title="RSVP Manager"
        isWithAnimation
        showBackIcon={false}
        showActions={showHeaderActions}
        onPressSearch={() => setFocusSearch(true)}
      />

      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />

      <View style={{ flex: 1 }}>
        {!showHeaderActions && (
          <TitleWithAddDelete
            isWithAnimation
            arrLength={selected?.length}
            title="Event(s)"
            showAddBtn={false}
            buttons={[
              {
                title: "Invitations",
                onPress: () =>
                  navigation.navigate(routeRSVP.RSVPInvitationList),
                style: { backgroundColor: "rgba(255, 255, 255, 0.47)" },
              },
              ...(canAddEvent
                ? [
                    {
                      title: "Add Event",
                      onPress: () => navigation.navigate(routeRSVP.AddEvent),
                      style: { backgroundColor: "rgba(255, 255, 255, 0.47)" },
                    },
                  ]
                : []),
            ]}
            onPressToDelete={
              canDeleteEvent
                ? toggleModal
                : () =>
                    setSnackBar({
                      visible: true,
                      text: "You don't have permission to delete events",
                      error: true,
                    })
            }
          />
        )}
        {canViewEventsList ? (
          <FlatList
            // data={[]}
            data={events}
            ref={flatListRef}
            keyExtractor={(item) => item?._id}
            contentContainerStyle={{ paddingBottom: 250 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <EventsRowItem
                item={item}
                index={index}
                selected={selected.includes(item?._id)}
                onPress={() =>
                  selected.length > 0
                    ? handleSelect(item?._id)
                    : canViewEventDetails
                    ? navigation.navigate("RSVPEventDetail", { id: item?._id })
                    : null
                }
                onLongPress={() => handleSelect(item?._id)}
              />
            )}
            ListHeaderComponent={
              <>
                <SearchBar
                  value={searchValue}
                  onChangeText={handleSearchChange}
                  autoFocus={focusSearch}
                  onClickCancel={() => {
                    setSearchValue("");
                    setDebouncedSearch("");
                    setFocusSearch(false);
                  }}
                />
                <RSVPEventsHeading />
              </>
            }
            ListEmptyComponent={
              loading ? (
                <SkeletonLoadingEvents />
              ) : (
                <NoDataFound
                  style={{ marginTop: sizes.height / 5 }}
                  showTxt={true}
                />
              )
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onScroll={(e) => {
              const show = e.nativeEvent.contentOffset.y > 180;
              setShowHeaderActions(show);
            }}
            onEndReached={onEndReach}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage && (
                <ActivityIndicator
                  size="small"
                  color={color.mainTxtColor}
                  style={{ marginTop: 12 }}
                />
              )
            }
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CustomText
              style={{
                width: "80%",
                alignSelf: "center",
                textAlign: "center",
                color: color.mainTxtColor,
              }}
            >
              You don't have permission to view events.
            </CustomText>
          </View>
        )}
      </View>

      <DeleteModel
        modalVisible={modalVisible}
        toggleModal={toggleModal}
        selectedUser={"events"}
        isLoading={isLoading}
        handleDeleteUser={canDeleteEvent ? handleDeleteEvent : () => null}
      />
    </Container>
  );
};

// ROW ITEM COMPONENT
const EventsRowItem = ({
  item,
  selected,
  onPress,
  onLongPress,
  index,
}: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.6}
      style={[
        styles.card,
        {
          marginTop: index === 0 ? 25 : 14,
          backgroundColor: selected ? "rgba(227, 238, 252, 1)" : "#F8F9FC",
          paddingBottom: 0,
        },
      ]}
    >
      <View style={{ width: "26%", gap: 4 }}>
        <SlideFadeIn>
          <CustomText style={styles.title}>{item?.title}</CustomText>
        </SlideFadeIn>
      </View>

      <View style={{ width: "32%", alignItems: "center", gap: 4 }}>
        <SlideFadeIn>
          <CustomText style={styles.status}>{item?.eventType}</CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText style={styles.dateLabel}>{item?.attendStatus}</CustomText>
        </SlideFadeIn>
      </View>

      <View style={{ width: "42%", alignItems: "flex-end", gap: 4 }}>
        <SlideFadeIn>
          <CustomText style={styles.date}>
            {moment(item?.startDateTime).format("DD/MM/YYYY • hh:mm A")}
          </CustomText>
        </SlideFadeIn>
        <SlideFadeIn>
          <CustomText style={styles.date}>
            {moment(item?.endDateTime).format("DD/MM/YYYY • hh:mm A")}
          </CustomText>
        </SlideFadeIn>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    borderColor: color.strokeColor,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },
  title: { fontSize: 14, fontWeight: "600", color: color.mainTxtColor },
  subTitle: { fontSize: 13, color: color.mainTxtColor },
  status: { fontSize: 14, fontWeight: "600", color: color.mainTxtColor },
  dateLabel: { fontSize: 12, color: color.mainTxtColor },
  date: { fontSize: 12, color: color.mainTxtColor, fontWeight: "500" },
});

export default RSVPManagerList;
