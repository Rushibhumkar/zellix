import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
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
  setAdvanceLead,
  setLeadQueryKey,
} from "../../redux/userSlice";
import Container from "../../myComponents/Container/Container";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { deleteLead } from "../../services/rootApi/leadApi";
import * as reduxAction from "../../redux/action";
import { shadow1, shadowPrimaryColor } from "../../const/globalStyle";
import { myConsole } from "../../hooks/useConsole";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import DeleteModel from "../../myComponents/DeleteModel";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { color } from "../../const/color";
import LeadListHeading from "../../components/Leads/LeadHeading/LeadListHeading";
import SkeletonLoadingLead from "../../components/Leads/SkeletonLoadingLead/SkeletonLoadingLead";
import MultipleLeadAssign from "./MultipleLeadAssign";
import {
  leadTypeObj,
  roleEnum,
  statusColorObj,
  statusObj,
} from "../../utils/data";
import { useGetLead } from "../../hooks/useCRMgetQuerry";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "../../utils/debounce";
import { queryKeyCRM } from "../../utils/queryKeys";
import LeadPoolIcon from "../../assets/svg/LeadPoolIcon";
import {
  checkPermission,
  formatDate,
  getTimeAgo,
} from "../../utils/commonFunctions";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import CustomText from "../../myComponents/CustomText/CustomText";
import { sizes } from "../../const";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import { Feather, FontAwesome } from "@expo/vector-icons";

let bgByStatus = {
  assign: "#dfe9faff", // soft blue tint for assigned
  new: "#C9DCFA", // lighter blue for new
};

// Debounce function

const AllLeads = () => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  // let lead = []
  // let loading = false;
  let advanceLead = [];
  const { user, leadQueryKey } = useSelector(selectUser);
  const isPoolRestricted = user.isPoolRestrict;
  // let copyLead = [];
  const [copyLead, setCopyLead] = useState([]);

  const navigation = useNavigation();

  const isFocused = useIsFocused();

  const dispatch = useDispatch();
  //
  const [filteredData, setFilteredData] = useState(copyLead);
  const [searchValue, setSearchValue] = useState("");

  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [focusSearch, setFocusSearch] = useState(false);
  //
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });
  const [assignLeadModal, setAssignLeadModal] = useState(false);
  const [selectLeadType, setSelectLeadType] = useState("calling_data");
  const [openLeadTypeModal, setOpenLeadTypeModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  //get Query
  const {
    data: leadData,
    totalCount,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetLead({
    search: debouncedSearch,
    type: leadQueryKey?.type ?? selectLeadType,
    ...leadQueryKey,
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

  const handleDeleteLead = async () => {
    setIsLoading(true);
    try {
      let res = await deleteLead(selected);
      // await dispatch(getAllLeadFunc());
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
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
        text: res?.data,
        error: false,
      });
      myConsole("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toggleModalAssignLead = () => {
    setAssignLeadModal(!assignLeadModal);
  };

  const toggleModalClose = () => {
    setModalVisible(false);
  };
  const toggleLeadTypeModal = () => {
    setOpenLeadTypeModal((prev) => !prev);
  };

  const handleFilterTextOnChange = (value) => {
    if (value) {
      setSearchValue(value);
    } else {
      setSearchValue("");
      setFilteredData([...copyLead]);
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

  const handleLeadTypeSelect = (key, shouldToggle = true) => {
    setSelectLeadType(key);
    if (shouldToggle) toggleLeadTypeModal();
  };

  const onEndReach = () => {
    if (hasNextPage && !loading && leadData?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getLead] }),
        dispatch(reduxAction.refetchLoggedInUser()),
      ]);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  };
  const { data: permission = {} } = useGetUserPermission(user?._id);
  const canAddLead = checkPermission(permission, "Leads", "add", user?.role);

  const canDeleteLead = checkPermission(
    permission,
    "Leads",
    "delete",
    user?.role,
  );
  const canAssignLead = checkPermission(
    permission,
    "Leads",
    "assign",
    user?.role,
  );
  // const canLeadPoolManagement = checkPermission(
  //   permission,
  //   "Leads",
  //   "leadPoolManagement",
  //   user?.role
  // );
  const canViewProjects = checkPermission(
    permission,
    "Leads",
    "viewProjects",
    user?.role,
  );

  const handleCallPress = async (mobile: any) => {
    if (!mobile) return;
    const phoneUrl = `tel:${mobile}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
    } else {
      popUpConfToast.errorMessage("Calling not supported on this device");
    }
  };

  const onEmailPress = (email: any) => {
    if (!email) return;

    const url = `mailto:${email}`;

    Linking.openURL(url).catch((err) =>
      console.log("Error opening email client", err),
    );
  };
  // const isAgent = true;
  const isAgent = user?.role === roleEnum.agent || user?.role === roleEnum.seo;

  const handleTab = (tab: any) => {
    setSelectLeadType(tab);
  };

  return (
    <>
      <Header
        // title={
        //   tabType === "calling_data"
        //     ? "Calling Data"
        //     : tabType === "lead"
        //       ? "Leads"
        //       : ""
        // }
        title={"Data Center"}
        totalCount={totalCount}
        isWithAnimation
        showBackIcon={false}
        showActions={true}
        moduleName={"lead"}
        // showActions={showHeaderActions}
        onPressSearch={() => {
          // flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setTimeout(() => {
            setFocusSearch((prev) => !prev); // toggles every time
          }, 100);
        }}
        onCloseSearch={
          leadQueryKey !== null ? () => dispatch(setLeadQueryKey(null)) : false
        }
        onPressFilter={() =>
          navigation.navigate("AdvanceSearch", {
            type: "lead",
            sourceTab: selectLeadType,
            isAgent: isAgent,
          })
        }
        onPressAdd={() => {
          if (canAddLead)
            navigation.navigate("AddLeads", { tabType: selectLeadType });
          else popUpConfToast.errorMessage("Not authorized to add leads.");
        }}
      />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {true ? (
        <Container>
          {!showHeaderActions && (
            <TitleWithAddDelete
              arrLength={selected?.length}
              isWithAnimation
              title={
                selectLeadType === "calling_data" ? "Calling Data" : "Leads"
              }
              showAddBtn={false}
              onPressToDelete={
                (canDeleteLead && user?.role === roleEnum.sub_admin) ||
                user?.role === roleEnum.sup_admin
                  ? toggleModal
                  : false
              }
              onPressToAssignLead={
                canAssignLead && user?.role === "agent"
                  ? false
                  : () => toggleModalAssignLead()
              }
            />
          )}

          {selectLeadType === "lead" && isPoolRestricted === false && (
            <TouchableOpacity
              onPress={() => navigation.navigate("LeadPool")}
              activeOpacity={0.5}
              style={{
                position: "absolute",
                bottom: Platform.OS === "ios" ? 100 : 110,
                right: 20,
                zIndex: 5,
              }}
            >
              <LeadPoolIcon width={60} height={60} />
            </TouchableOpacity>
          )}

          <FlatList
            ref={flatListRef}
            data={leadData}
            renderItem={({ item, index }) => (
              <LeadRowItem
                index={index}
                item={item}
                isAgent={isAgent}
                user={user}
                selected={selected.indexOf(item?._id) !== -1}
                bgColor={bgByStatus[item?.status]}
                onPress={() =>
                  selected?.length === 0
                    ? navigation.navigate("LeadsDetails", {
                        item,
                        selectLeadType,
                      })
                    : handleSelect(item?._id)
                }
                onLongPress={
                  user?.role === roleEnum.agent
                    ? undefined
                    : () => handleSelect(item?._id)
                }
                onCallPress={() => handleCallPress(item?.clientMobile)}
                onWhatsappIconPress={() => {
                  if (!item?.whatsapp) return;
                  Linking.openURL(item?.whatsapp);
                }}
                onEmailPress={() => onEmailPress(item?.clientEmail)}
              />
            )}
            keyExtractor={(item) => item?._id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
            ListHeaderComponent={
              <View>
                <SearchBar
                  onChangeText={(v) => handleSearchChange(v)}
                  value={searchValue}
                  onClickCancel={() => {
                    (handleSearchChange(""), setFocusSearch(false));
                  }}
                  autoFocus={focusSearch}
                  isWithAnimation
                  moduleName={"lead"}
                />

                <View style={styles.container}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      selectLeadType === "calling_data" && styles.activeTab,
                    ]}
                    onPress={() => handleTab("calling_data")}
                  >
                    <CustomText
                      style={[
                        styles.tabText,
                        selectLeadType === "calling_data" && styles.activeText,
                      ]}
                    >
                      Calling Data
                    </CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      selectLeadType === "lead" && styles.activeTab,
                    ]}
                    onPress={() => handleTab("lead")}
                  >
                    <CustomText
                      style={[
                        styles.tabText,
                        selectLeadType === "lead" && styles.activeText,
                      ]}
                    >
                      Leads
                    </CustomText>
                  </TouchableOpacity>
                </View>

                {/* <LeadListHeading
                  noText={"No"}
                  nameText={"Client Name"}
                  belowNameText={"Mobile no."}
                  typeText={isAgent ? "Status" : "Assigned"}
                  belowTypeText={"Assigned At"}
                  statusText={isAgent ? "" : "Status"}
                /> */}
              </View>
            }
            ListHeaderComponentStyle={{ paddingTop: 5 }}
            ListEmptyComponent={
              loading ? <SkeletonLoadingLead /> : <NoDataFound />
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
            removeClippedSubviews={true}
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
            scrollEventThrottle={16}
          />
        </Container>
      ) : (
        <NoDataFound style={{ marginTop: sizes.height / 4 }} showTxt />
      )}

      <DeleteModel
        isLoading={isLoading}
        handleDeleteUser={handleDeleteLead}
        toggleModal={toggleModal}
        modalVisible={modalVisible}
      />
      <MultipleLeadAssign
        selected={selected}
        visible={assignLeadModal}
        setSelected={setSelected}
        toggleModal={toggleModalAssignLead}
        setSnackBar={setSnackBar}
      />
      {/* <ModalWithBlur visible={openLeadTypeModal} onClose={toggleLeadTypeModal}>
        <View style={{ gap: 20 }}>
          <CustomCheckBox
            title="Lead"
            isCheck={selectLeadType === "lead"}
            onPress={(v) => v && handleLeadTypeSelect("lead")}
          />
          <CustomCheckBox
            title="Calling Data"
            isCheck={selectLeadType === "calling_data"}
            onPress={(v) => v && handleLeadTypeSelect("calling_data")}
          />
        </View>
      </ModalWithBlur> */}
    </>
  );
};

const LeadRowItem = React.memo(
  ({
    item,
    index,
    onPress,
    onLongPress,
    selected,
    bgColor,
    onCallPress,
    onWhatsappIconPress,
    onEmailPress,
    isAgent,
    user,
  }: any) => {
    const statusKey = item?.status ?? "";
    return (
      <SlideFadeIn>
        <TouchableOpacity
          activeOpacity={0.5}
          style={[
            styles.mainlistcontainer,
            {
              marginTop: index === 0 ? 20 : 10,
              backgroundColor: selected
                ? color.primary200
                : bgColor
                  ? bgColor
                  : "white",
            },
          ]}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: isAgent ? "10%" : "6%", paddingEnd: 2 }}>
              {index === "S.No" ? (
                <CustomText
                  style={{
                    color: color.mainTxtColor,
                    fontWeight: "500",
                    textTransform: "capitalize",
                  }}
                >
                  No.
                </CustomText>
              ) : (
                <CustomText
                  style={{
                    color: color.mainTxtColor,
                    // fontWeight: "500",
                    textTransform: "capitalize",
                    fontSize: 12,
                  }}
                >
                  {index + 1}
                </CustomText>
              )}
            </View>
            <View
              style={{
                width: isAgent ? "34%" : "32%",
                paddingEnd: 2,
                marginRight: isAgent ? 8 : 2,
              }}
            >
              <CustomText
                numberOfLines={1}
                style={{
                  color: color.mainTxtColor,
                  fontWeight: "500",
                  fontSize: 14,
                  textTransform: "capitalize",
                }}
              >
                {item?.clientName}
              </CustomText>
              {isAgent ? (
                <CustomText
                  numberOfLines={1}
                  style={{
                    color: color.strokeColor,
                    fontWeight: "400",
                    // textTransform: "capitalize",
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  {item?.clientMobile}
                </CustomText>
              ) : (
                <CustomText
                  numberOfLines={1}
                  style={{
                    color: color.mainTxtColor,
                    fontWeight: "300",
                    textTransform: "capitalize",
                    marginTop: 2,
                  }}
                >
                  {item?.assign?.name}
                </CustomText>
              )}
            </View>

            <View
              style={{
                width: isAgent ? "34%" : "30%",
                // alignItems: "center",
              }}
            >
              <CustomText
                numberOfLines={1}
                style={{
                  color: color.mainTxtColor,
                  fontWeight: "400",
                  fontSize: 13,
                  textTransform: "capitalize",
                  backgroundColor: statusColorObj?.[statusKey] ?? "#eee",
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 6,
                  alignSelf: "flex-start",
                }}
              >
                {statusObj[item?.status]}
              </CustomText>
              <CustomText
                numberOfLines={1}
                style={{
                  color: color.mainTxtColor,
                  fontWeight: "400",
                  fontSize: 11,
                  textTransform: "capitalize",
                  marginTop: 4,
                }}
              >
                {getTimeAgo(item?.assignedAt)}
              </CustomText>
            </View>
            {item?.clientMobile && (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 4,
                  paddingRight: 6,
                }}
              >
                <TouchableOpacity onPress={onCallPress} style={styles.iconBtn}>
                  <Feather name="phone-call" size={17} color="#4985F2" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onWhatsappIconPress}
                  style={[styles.iconBtn, { backgroundColor: "#49f26529" }]}
                >
                  <FontAwesome name="whatsapp" size={18} color="#49f265" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onEmailPress}
                  style={[styles.iconBtn, { backgroundColor: "#ff6b6b14" }]}
                >
                  <Feather name="mail" size={17} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </SlideFadeIn>
    );
  },
  (prev, next) =>
    prev.selected === next.selected &&
    prev.item?._id === next.item?._id &&
    prev.item?.status === next.item?.status,
);

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
    borderWidth: 1,
    borderColor: "#E3E8EF",
    paddingVertical: 12,
    paddingLeft: 8,
    borderRadius: 16,
    marginHorizontal: 8,
    ...shadowPrimaryColor,
  },
  iconBtn: {
    borderRadius: 12,
    backgroundColor: "#4984f21e",
    // backgroundColor: "red",
    padding: 8,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#3E6EC6",
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 20,
    marginTop: 10,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },

  activeTab: {
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },

  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D6E3FF",
  },

  activeText: {
    color: "#2D5FB8",
  },
});

export default AllLeads;
