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
import SkeletonLoadingRSVP from "./components/SkeletonLoadingRSVP";
import { deleteInvitations, useRSVPInvitations } from "./rsvpApi";
import { Feather } from "@expo/vector-icons";
import { routeRSVP } from "../../utils/routes";
import { myConsole } from "../../hooks/useConsole";
import RSVPListHeading from "./components/RSVPListHeading";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import { useAppToast } from "../../components/AppToast";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { shadowPrimaryColor } from "../../const/globalStyle";

const RSVPInvitationList = () => {
  const toast = useAppToast();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useSelector(selectUser);
  // console.log("reached at RSVPInvitationList screen");

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
  const [showSearch, setShowSearch] = useState(false);

  // Infinite Query
  const {
    data,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRSVPInvitations({
    search: debouncedSearch,
  });

  const invitations = data?.pages?.flatMap((page) => page?.data) || [];

  // SEARCH DEBOUNCE
  const debounceSearch = React.useCallback(
    debounce((text) => setDebouncedSearch(text), 500),
    [],
  );

  const handleSearchChange = (v: any) => {
    setSearchValue(v);
    debounceSearch(v);
  };

  // SELECT ITEM
  const handleSelect = (id: any) => {
    let temp = [...selected];
    let index = temp.indexOf(id);

    index !== -1 ? temp.splice(index, 1) : temp.push(id);
    setSelected(temp);
  };

  // DELETE INVITATIONS
  const handleDeleteInvitation = async () => {
    console.log("🚀 delete clicked, isLoading:", isLoading);
    if (isLoading) return;
    setIsLoading(true);
    console.log("⏳ isLoading set to true");
    try {
      console.log("📤 sending delete request with IDs:", selected);
      const res = await deleteInvitations(selected);
      console.log("✅ delete API success:", res);

      await queryClient.invalidateQueries(["rsvpInvitations"]);
      console.log("♻️ invalidateQueries done");
      toggleModalClose();
      console.log("🔒 modal closed");

      setSnackBar({
        visible: true,
        text: res?.message || "Deleted successfully",
        error: false,
      });

      setSelected([]);
      console.log("🧹 selected cleared");
    } catch (err) {
      console.log("❌ delete error:", err);
      console.log("❌ error response:", err?.response?.data);

      setSnackBar({
        visible: true,
        text: err?.response?.data || "Something went wrong",
        error: true,
      });
    } finally {
      setIsLoading(false);
      console.log("⌛ timeout finished → isLoading false");
      setTimeout(() => setIsLoading(false), 150);
    }
  };

  const toggleModal = () => setModalVisible(!modalVisible);
  const toggleModalClose = () => setModalVisible(false);

  // REFRESH
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries(["rsvpInvitations"]);
    } finally {
      setRefreshing(false);
    }
  };

  // PAGINATION
  const onEndReach = () => {
    if (hasNextPage && !loading) fetchNextPage();
  };

  const { data: permission = {} } = useGetUserPermission(user?._id);
  // myConsole("Invitationssss", permission.Invitation);
  // myConsole("Eventssss", permission.Event);

  const canViewInvitationList = checkPermission(
    permission,
    "Invitation",
    "viewList",
    user?.role,
  );
  const canViewInvitationDetails = checkPermission(
    permission,
    "Invitation",
    "viewDetails",
    user?.role,
  );
  const canSendInvitation = checkPermission(
    permission,
    "Invitation",
    "add",
    user?.role,
  );
  const canDeleteInvitation = checkPermission(
    permission,
    "Invitation",
    "delete",
    user?.role,
  );
  const canViewManagerBtn = checkPermission(
    permission,
    "Event",
    "sidebar",
    user?.role,
  );

  useEffect(() => {
    if (!showSearch) {
      setSearchValue("");
      setDebouncedSearch("");
    }
  }, [showSearch]);

  // myConsole("canDeleteInvitation", canDeleteInvitation);

  return (
    <Container>
      <Header
        title="RSVP Invitations"
        isWithAnimation
        showBackIcon={false}
        showActions={true}
        onPressSearch={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setShowSearch((prev) => !prev);
          setFocusSearch(true);
        }}
        showSearch={showSearch}
        moduleName="rsvp"
        buttons={[
          ...(canSendInvitation
            ? [
                {
                  // title: "Send Invitation",
                  icon: <Feather name="send" size={16} color={"#fff"} />,
                  onPress: () => navigation.navigate(routeRSVP.SendInvitation),
                  style: { backgroundColor: "#fff3" },
                },
              ]
            : []),
          ...(canViewManagerBtn
            ? [
                {
                  title: "Manager",
                  onPress: () => navigation.navigate(routeRSVP.RSVPManagerList),
                },
              ]
            : []),
        ]}
      />

      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />

      <View style={{ flex: 1 }}>
        {!showHeaderActions && (
          <TitleWithAddDelete
            isWithAnimation
            arrLength={selected?.length}
            title="Event(s)"
            showAddBtn={false}
            // buttons={[
            //   ...(canViewManagerBtn
            //     ? [
            //         {
            //           title: "Manager",
            //           onPress: () =>
            //             navigation.navigate(routeRSVP.RSVPManagerList),
            //         },
            //       ]
            //     : []),

            //   ...(canSendInvitation
            //     ? [
            //         {
            //           title: "Send Invitation",
            //           onPress: () =>
            //             navigation.navigate(routeRSVP.SendInvitation),
            //           style: { backgroundColor: "#fff3" },
            //         },
            //       ]
            //     : []),
            // ]}
            // onPressToNavigate={() => navigation.navigate("AddInvitation")}
            onPressToDelete={
              canDeleteInvitation
                ? toggleModal
                : () => toast.error("You don't have permission to delete")
            }
          />
        )}
        {canViewInvitationList ? (
          <FlatList
            // data={[]}
            data={invitations}
            ref={flatListRef}
            keyExtractor={(item) => item?._id}
            contentContainerStyle={{ paddingBottom: 250 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <InvitationRowItem
                item={item}
                index={index}
                selected={selected.includes(item?._id)}
                onPress={() =>
                  selected.length > 0
                    ? handleSelect(item?._id)
                    : canViewInvitationDetails
                      ? navigation.navigate("RSVPInvitationDetail", {
                          id: item?._id,
                        })
                      : null
                }
                onLongPress={() => handleSelect(item?._id)}
              />
            )}
            ListHeaderComponent={
              <>
                <Animated.View
                  entering={FadeInDown.duration(180)}
                  exiting={FadeOutUp.duration(150)}
                  style={{ display: showSearch ? "flex" : "none" }}
                >
                  <SearchBar
                    value={searchValue}
                    onChangeText={handleSearchChange}
                    autoFocus={focusSearch}
                    onClickCancel={() => {
                      setSearchValue("");
                      setDebouncedSearch("");
                      setFocusSearch(false);
                      setShowSearch(false);
                    }}
                  />
                </Animated.View>
                {/* <RSVPListHeading /> */}
              </>
            }
            ListEmptyComponent={
              loading ? (
                <SkeletonLoadingRSVP />
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
              You don't have permission to view Invitations List.
            </CustomText>
          </View>
        )}
      </View>
      <DeleteModel
        modalVisible={modalVisible}
        toggleModal={toggleModal}
        selectedUser={"events"}
        isLoading={isLoading}
        handleDeleteUser={
          canDeleteInvitation
            ? handleDeleteInvitation
            : () => toast.error("You don't have permission to delete events")
        }
      />
    </Container>
  );
};

// ROW ITEM COMPONENT
const InvitationRowItem = ({
  item,
  selected,
  onPress,
  onLongPress,
  index,
}: any) => {
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Attended":
        return "#4caf4f4a";
      case "Pending":
        return "#ffc10749";
      case "Declined":
        return "#f4433646";
      case "Accepted":
        return "#2196F348";
      default:
        return "#9e9e9e4b";
    }
  };

  return (
    <SlideFadeIn>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.6}
        style={[
          styles.card,
          {
            marginTop: index === 0 ? 25 : 14,
            backgroundColor: selected ? "rgba(227, 238, 252, 1)" : "#F8F9FC",
          },
        ]}
      >
        <View style={styles.leftContainer}>
          <View style={styles.avatar}>
            <CustomText style={styles.avatarText}>
              {item?.clientName?.charAt(0) || "?"}
            </CustomText>
          </View>
          <View style={styles.clientInfo}>
            <View style={styles.nameRow}>
              <CustomText style={styles.title} numberOfLines={1}>
                {item?.clientName}
              </CustomText>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item?.responseStatus) },
                ]}
              >
                <CustomText style={styles.statusText}>
                  {item?.responseStatus}
                </CustomText>
              </View>
            </View>
            <CustomText style={styles.subTitle}>
              {item?.clientMobile}
            </CustomText>
          </View>
        </View>

        <View style={styles.rightContainer}>
          <View style={styles.attendStatusContainer}>
            <CustomText style={styles.attendStatus}>
              {item?.attendStatus}
            </CustomText>
          </View>
          <View style={styles.dateTimeContainer}>
            <Feather name="calendar" size={12} color={color.mainTxtColor} />
            <CustomText style={styles.dateTimeText}>
              {moment(item?.dateTime).format("DD MMM YYYY • hh:mm A")}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </SlideFadeIn>
  );
};

const styles = StyleSheet.create({
  status: { fontSize: 14, fontWeight: "600", color: color.mainTxtColor },
  dateLabel: { fontSize: 12, color: color.mainTxtColor },
  date: { fontSize: 12, color: color.mainTxtColor, fontWeight: "500" },
  card: {
    borderWidth: 1,
    borderColor: "#E3E8EF",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 12,
    alignItems: "center",
    ...shadowPrimaryColor,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  clientInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    width: "120%",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: color.mainTxtColor,
    maxWidth: "60%",
  },
  subTitle: {
    fontSize: 13,
    color: color.mainTxtColor,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#000000",
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  attendStatusContainer: {
    // optional: you can style if needed
  },
  attendStatus: {
    fontSize: 12,
    color: color.mainTxtColor,
    fontWeight: "500",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 12,
    color: color.mainTxtColor,
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default RSVPInvitationList;
