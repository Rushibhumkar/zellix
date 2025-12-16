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
    []
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
    user?.role
  );
  const canViewInvitationDetails = checkPermission(
    permission,
    "Invitation",
    "viewDetails",
    user?.role
  );
  const canSendInvitation = checkPermission(
    permission,
    "Invitation",
    "add",
    user?.role
  );
  const canDeleteInvitation = checkPermission(
    permission,
    "Invitation",
    "delete",
    user?.role
  );
  const canViewManagerBtn = checkPermission(
    permission,
    "Event",
    "sidebar",
    user?.role
  );

  // myConsole("canDeleteInvitation", canDeleteInvitation);

  return (
    <Container>
      <Header
        title="RSVP Invitations"
        isWithAnimation
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
              ...(canViewManagerBtn
                ? [
                    {
                      title: "Manager",
                      onPress: () =>
                        navigation.navigate(routeRSVP.RSVPManagerList),
                    },
                  ]
                : []),

              ...(canSendInvitation
                ? [
                    {
                      title: "Send Invitation",
                      onPress: () =>
                        navigation.navigate(routeRSVP.SendInvitation),
                      style: { backgroundColor: "#fff3" },
                    },
                  ]
                : []),
            ]}
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
                <RSVPListHeading />
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
        },
      ]}
    >
      <View style={{ width: "40%", gap: 4 }}>
        <CustomText style={styles.title}>{item?.clientName}</CustomText>
        <CustomText style={styles.subTitle}>{item?.clientMobile}</CustomText>
      </View>

      <View style={{ width: "30%", alignItems: "center", gap: 4 }}>
        <CustomText style={styles.status}>{item?.responseStatus}</CustomText>
        <CustomText style={styles.dateLabel}>{item?.attendStatus}</CustomText>
      </View>

      <View style={{ width: "30%", alignItems: "flex-end", gap: 4 }}>
        <CustomText style={styles.dateLabel}>
          {moment(item?.dateTime).format("DD/MM/YYYY")}
        </CustomText>

        <CustomText style={styles.date}>
          {moment(item?.dateTime).format("hh:mm A")}
        </CustomText>
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

export default RSVPInvitationList;
