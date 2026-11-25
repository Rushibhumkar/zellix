import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import LeadReadRetry from "./component/LeadReadRetry";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import { selectUser, setLeadQueryKey } from "../../redux/userSlice";
import Container from "../../myComponents/Container/Container";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { deleteLead, leadStatusUpdate } from "../../services/rootApi/leadApi";
import { deleteCallingData } from "../../services/rootApi/callingDataApi";
import * as reduxAction from "../../redux/action";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { myConsole } from "../../hooks/useConsole";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import DeleteModel from "../../myComponents/DeleteModel";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { color } from "../../const/color";
import SkeletonLoadingLead from "../../components/Leads/SkeletonLoadingLead/SkeletonLoadingLead";
import MultipleLeadAssign from "./MultipleLeadAssign";
import QuickStatusSheet from "./component/QuickStatusSheet";
import { roleEnum, statusColorObj, statusObj } from "../../utils/data";
import { useGetLead } from "../../hooks/useCRMgetQuerry";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "../../utils/debounce";
import { queryKeyCRM } from "../../utils/queryKeys";
import LeadPoolIcon from "../../assets/svg/LeadPoolIcon";
import { checkPermission, getTimeAgo } from "../../utils/commonFunctions";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import CustomText from "../../myComponents/CustomText/CustomText";
import { sizes } from "../../const";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useAppToast } from "../../components/AppToast";
import Animated, {
  FadeInDown,
  FadeOutUp,
  runOnJS,
} from "react-native-reanimated";
import {
  LeadFolderBar,
  LeadFoldersModal,
  useLeadFolders,
} from "./component/LeadFolders";
import { openWhatsApp } from "../../utils/openWhatsApp";

let bgByStatus = {
  assign: "#dfe9faff", // soft blue tint for assigned
  new: "#C9DCFA", // lighter blue for new
};

// Debounce function

const AllLeads = () => {
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const [showSearch, setShowSearch] = useState(false);
  const pendingClaims = React.useRef(new Set<string>());
  const [claimingLeadIds, setClaimingLeadIds] = useState<ReadonlySet<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [quickActionLead, setQuickActionLead] = useState<any>(null);

  const [dashboardFilterStatus, setDashboardFilterStatus] = useState<
    string | null
  >(null);
  const [dashboardDateKey, setDashboardDateKey] = useState<string | null>(null);
  const [dashboardMyLeads, setDashboardMyLeads] = useState<boolean>(false);

  const [cameFromDashboard, setCameFromDashboard] = useState(false);

  // let lead = []
  // let loading = false;
  let advanceLead = [];
  const { user, leadQueryKey } = useSelector(selectUser);
  // let copyLead = [];
  const [copyLead, setCopyLead] = useState([]);

  const navigation = useNavigation();
  const route = useRoute();
  const params: any = route?.params;
  const { data: permission = {}, isLoading: permissionLoading } = useGetUserPermission(user?._id);
  const canViewLeads = checkPermission(permission, "Leads", "sidebar", user?.role);
  const canViewCallingData = checkPermission(permission, "CallingData", "sidebar", user?.role);

  const isFocused = useIsFocused();

  const dispatch = useDispatch();
  //
  const [filteredData, setFilteredData] = useState(copyLead);
  const [searchValue, setSearchValue] = useState("");

  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [selectionMode, setSelectionMode] = useState(false);
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
  const [selectLeadType, setSelectLeadType] = useState(
    params?.tabType ?? params?.item?.type ?? "lead",
  );
  const canViewSelectedCollection = selectLeadType === "calling_data" ? canViewCallingData : canViewLeads;
  const [openLeadTypeModal, setOpenLeadTypeModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const { data: leadFolders = [], isSuccess: foldersLoaded } = useLeadFolders(selectLeadType, canViewSelectedCollection);
  const selectedFolder = leadFolders.find(
    (folder: any) => folder._id === selectedFolderId,
  );

  useEffect(() => {
    if (!params?.clearRSVPSelection) return;

    setSelected([]);
    (navigation as any).setParams({ clearRSVPSelection: undefined });
  }, [navigation, params?.clearRSVPSelection]);

  useEffect(() => {
    if (foldersLoaded && selectedFolderId && !selectedFolder) setSelectedFolderId("");
  }, [foldersLoaded, selectedFolder, selectedFolderId]);
  //get Query
  const {
    data: leadData,
    totalCount,
    isLoading: loading,
    isError: leadLoadError,
    error: leadError,
    isFetching: leadsFetching,
    isFetchNextPageError,
    isRefetchError,
    refetch: refetchLeads,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetLead({
    search: debouncedSearch,
    ...leadQueryKey,
    type: selectLeadType,
    folderId: selectedFolderId,
    comingSoon: selectedFolder?.state === "coming_soon",
    enabled: canViewSelectedCollection,
    // ✅ dashboard filters
    ...(dashboardFilterStatus && { status: [dashboardFilterStatus] }),
    ...(dashboardDateKey && { dateKey: dashboardDateKey }),
    ...(dashboardMyLeads && { individual: true }),
  });

  const todaysTasksComingSoon = selectedFolderId === "todays-tasks" && (
    selectedFolder?.state === "coming_soon" ||
    (leadError as any)?.response?.data?.code === "TODAY_TASKS_COMING_SOON"
  );

  const hasActiveFilter =
    !!leadQueryKey ||
    !!dashboardFilterStatus ||
    !!dashboardDateKey ||
    dashboardMyLeads;

  const handleSelect = (id) => {
    if (!id) return;

    if (!selectionMode) {
      // Entering selection mode via long-press deep in the list — the action
      // bar (assign/delete/folder) only renders when showHeaderActions is
      // false, so force it visible immediately without moving the list
      // (the onScroll handler below keeps it visible for the rest of the
      // selection, so no scroll-to-top is needed here).
      setShowHeaderActions(false);
    }
    setSelectionMode(true);

    setSelected((previousSelected) =>
      previousSelected.includes(id)
        ? previousSelected.filter((selectedId) => selectedId !== id)
        : [...previousSelected, id],
    );
  };

  const goBackToDashboard = () => {
    navigation.getParent()?.navigate("dashboard");
  };

  const handleDeleteLead = async () => {
    setIsLoading(true);
    try {
      let res = selectLeadType === "calling_data"
        ? await deleteCallingData(selected)
        : await deleteLead(selected, "lead");
      // await dispatch(getAllLeadFunc());
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
      });
      setSelected([]);
      setSelectionMode(false);
      toggleModalClose();
      toast.success(res?.data || "Lead(s) deleted successfully");
    } catch (error) {
      toast.error(res?.data || "Failed to delete Lead(s)");
      myConsole("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllFilters = () => {
    dispatch(setLeadQueryKey(null));
    setDashboardFilterStatus(null);
    setDashboardDateKey(null);
    setDashboardMyLeads(false);
    setSelectedStatus("all");
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toggleModalAssignLead = () => {
    setAssignLeadModal((previousVisible) => !previousVisible);
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
    if (key === "calling_data" && !canViewCallingData) return;
    if (key === "lead" && !canViewLeads) return;
    setSelectLeadType(key);
    if (shouldToggle) toggleLeadTypeModal();
  };

  const onEndReach = () => {
    if (todaysTasksComingSoon) return;
    if (hasNextPage && !leadsFetching && !leadLoadError && leadData?.length > 0) {
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
  const permissionModule = selectLeadType === "calling_data" ? "CallingData" : "Leads";
  const canAddLead = checkPermission(permission, permissionModule, "add", user?.role);

  const canDeleteLead = checkPermission(
    permission,
    permissionModule,
    "delete",
    user?.role,
  );
  const canAssignLead = checkPermission(
    permission,
    permissionModule,
    "assign",
    user?.role,
  );
  const canLeadPoolManagement = selectLeadType === "lead" && checkPermission(
    permission,
    "Leads",
    "leadPoolManagement",
    user?.role,
  );
  const canViewProjects = checkPermission(
    permission,
    permissionModule,
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

  useEffect(() => {
    if (!cameFromDashboard) return;

    // iOS swipe-back intercept karo
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault(); // default back action rok do

      goBackToDashboard(); // apna custom navigation karo
    });

    return unsubscribe;
  }, [cameFromDashboard, navigation]);

  const onEmailPress = (email: any) => {
    if (!email) return;

    const url = `mailto:${email}`;

    Linking.openURL(url).catch((err) =>
      console.log("Error opening email client", err),
    );
  };
  // const isAgent = true;
  const isAgent = user?.role === roleEnum.agent || user?.role === roleEnum.seo;

  const canManageLeadSelection = !isAgent && (canAssignLead || canDeleteLead);
  // Agents and Team Leads need selection mode so they can send RSVP
  // invitations for their directly assigned leads. Assignment and delete
  // actions remain permission-gated.
  const canSelectLeads =
    isAgent || user?.role === roleEnum.team_lead || canManageLeadSelection;

  const handleTab = (tab: any) => {
    if (tab === "calling_data" && !canViewCallingData) return;
    if (tab === "lead" && !canViewLeads) return;
    setSelectionMode(false);
    setSelectedFolderId("");
    setSelected([]);
    setFolderModalVisible(false);
    setSelectLeadType(tab);
  };

  useFocusEffect(useCallback(() => {
    if (selectedFolderId === "todays-tasks") {
      void queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getLead] });
    }
    void queryClient.invalidateQueries({ queryKey: ["leadFolders"] });
  }, [queryClient, selectedFolderId]));

  const handleFolderChange = (folderId: string) => {
    setSelectedFolderId(folderId);
    setSelected([]);
  };

  const handleChangeStatusSubmit = async (id: string) => {
    if (!id || pendingClaims.current.has(id)) return;
    pendingClaims.current.add(id);
    setClaimingLeadIds(new Set(pendingClaims.current));

    try {
      const payload = {
        status: "claimed",
      };

      const res = await leadStatusUpdate({
        id,
        data: payload,
      });

      toast.success(res?.data?.message || "Status updated successfully");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getLeadDetailById, id] }),
        queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getLead] }),
      ]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      pendingClaims.current.delete(id);
      setClaimingLeadIds(new Set(pendingClaims.current));
    }
  };

  useEffect(() => {
    if (!showSearch) {
      setSearchValue("");
      setDebouncedSearch("");
    }
  }, [showSearch]);

  useEffect(() => {
    setSelected([]);
    setSelectionMode(false);
    setAssignLeadModal(false);
  }, [
    selectLeadType,
    debouncedSearch,
    dashboardFilterStatus,
    dashboardDateKey,
    dashboardMyLeads,
    selectedFolderId,
  ]);

  // console.log("selectleadtypeseb4useeffecrt", selectLeadType);

  useEffect(() => {
    if (route?.params?.fromDashboard) {
      setCameFromDashboard(true);
    }

    if (route?.params?.tabType) {
      setSelectLeadType(route?.params?.tabType);
    } else if (route?.params?.item?.type) {
      setSelectLeadType(route?.params?.item?.type);
    }

    // ✅ Dashboard filter params
    if (route?.params?.filterStatus) {
      setDashboardFilterStatus(route.params.filterStatus);
      setSelectedStatus(route.params.filterStatus);
      setDashboardDateKey(null);
      setDashboardMyLeads(false);
    } else if (route?.params?.dateFilterType) {
      setDashboardDateKey(route.params.dateFilterType);
      setDashboardFilterStatus(null);
      setDashboardMyLeads(false);
      setSelectedStatus("all");
    } else if (route?.params?.filterMyLeads) {
      setDashboardMyLeads(true);
      setDashboardFilterStatus(null);
      setDashboardDateKey(null);
      setSelectedStatus("all");
    } else {
      // reset when navigating normally
      setDashboardFilterStatus(null);
      setDashboardDateKey(null);
      setDashboardMyLeads(false);
    }
  }, [route?.params]);

  useEffect(() => {
    if (permissionLoading) return;
    if (selectLeadType === "calling_data" && canViewCallingData) return;
    if (selectLeadType === "lead" && canViewLeads) return;
    if (canViewLeads) setSelectLeadType("lead");
    else if (canViewCallingData) setSelectLeadType("calling_data");
  }, [permissionLoading, selectLeadType, canViewLeads, canViewCallingData]);

  // console.log("selectleadtypeseuseeffecrt", selectLeadType);

  const filteredLeadData =
    todaysTasksComingSoon ? [] : selectedStatus === "all"
      ? leadData
      : leadData?.filter((item) => item?.status === selectedStatus);
  const visibleLeadIds: string[] = (filteredLeadData || []).map((lead: any) => lead._id);
  const allVisibleSelected = visibleLeadIds.length > 0 && visibleLeadIds.every((id) => selected.includes(id));

  const exitSelection = useCallback(() => {
    setSelected([]);
    setSelectionMode(false);
  }, []);

  useFocusEffect(useCallback(() => {
    if (!selectionMode) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      exitSelection();
      return true;
    });
    return () => subscription.remove();
  }, [selectionMode, exitSelection]));

  useEffect(() => {
    exitSelection();
  }, [selectedStatus, exitSelection]);
  const selectedHasDealBookedLead = selected.some((leadId) =>
    (leadData || []).some(
      (lead: any) =>
        String(lead?._id) === String(leadId) &&
        lead?.status === "deal_booked",
    ),
  );
  const canAssignSelectedLeads =
    user?.role === roleEnum.sup_admin || !selectedHasDealBookedLead;

  const openLeadRSVPInvitation = () => {
    const isAdmin = [roleEnum.sup_admin, roleEnum.sub_admin].includes(
      user?.role,
    );
    const selectedLeads = (filteredLeadData || []).filter((lead: any) =>
      selected.includes(lead?._id),
    );
    const eligibleLeads = isAdmin
      ? selectedLeads
      : selectedLeads.filter(
          (lead: any) =>
            String(lead?.assign?._id || lead?.assign) === String(user?._id),
        );
    const skippedLeadCount = selectedLeads.length - eligibleLeads.length;
    if (!eligibleLeads.length) {
      toast.error(
        "You can send RSVP invitations only for leads assigned to you.",
      );
      return;
    }
    const proceed = () =>
      navigation.navigate("SendLeadRSVPInvitation", {
        leadIds: eligibleLeads.map((lead: any) => lead._id),
        skippedLeadCount,
      });
    if (skippedLeadCount) {
      Alert.alert(
        "Some leads cannot receive an RSVP",
        `${skippedLeadCount} selected lead(s) are assigned to another user. Invitations will be sent only for the ${eligibleLeads.length} lead(s) assigned to you.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: proceed },
        ],
      );
      return;
    }
    proceed();
  };

  // myConsole("filteredLeadDataaa", filteredLeadData);

  // myConsole("alllesad", leadData);
  return (
    <View style={{ flex: 1 }}>
      <Header
        // title={
        //   tabType === "calling_data"
        //     ? "Calling Data"
        //     : tabType === "lead"
        //       ? "Leads"
        //       : ""
        // }
        title={"Data Center"}
        totalCount={totalCount || 0}
        isWithAnimation
        showBackIcon={false}
        showActions={true}
        moduleName={"lead"}
        showSearch={showSearch}
        // showActions={showHeaderActions}
        onPressSearch={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setShowSearch((prev) => !prev);
          setFocusSearch(true);
        }}
        onCloseSearch={hasActiveFilter ? handleClearAllFilters : false}
        onPressFilter={() =>
          navigation.navigate("AdvanceSearch", {
            type: "lead",
            sourceTab: selectLeadType,
            isAgent: isAgent,
          })
        }
        rightSide={
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              gap: 8,
              marginRight: -10,
            }}
          >
            {selectLeadType === "lead" && (
              <>
                <Pressable
                  onPress={() => navigation.navigate("Reminders")}
                  style={styles.reminderIconBtn}
                >
                  <Feather name="clock" size={18} color="#fff" />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("CallListing")}
                  style={styles.reminderIconBtn}
                >
                  <Feather name="phone-call" size={18} color="#fff" />
                </Pressable>
              </>
            )}
          </View>
        }
        onPressAdd={() => {
          if (canAddLead)
            navigation.navigate("AddLeads", { tabType: selectLeadType });
          else popUpConfToast.errorMessage("Not authorized to add leads.");
        }}
      />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {!permissionLoading && canViewSelectedCollection ? (
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
                canAssignLead && !isAgent && canAssignSelectedLeads
                  ? () => toggleModalAssignLead()
                  : false
              }
              onPressToInvite={
                selectLeadType === "lead" && selected?.length
                  ? openLeadRSVPInvitation
                  : undefined
              }
              onPressToFolder={
                selected?.length ? () => setFolderModalVisible(true) : undefined
              }
            />
          )}

          {selectionMode && canSelectLeads && (
            <View style={styles.selectionBar}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel="Select all loaded leads"
                accessibilityState={{ checked: allVisibleSelected ? true : selected.length > 0 ? "mixed" : false }}
                onPress={() => setSelected(allVisibleSelected ? [] : visibleLeadIds)}
                style={styles.selectAllButton}
              >
                <Feather name={allVisibleSelected ? "check-square" : selected.length > 0 ? "minus-square" : "square"} size={22} color="#2E67BE" />
                <CustomText style={styles.selectionText}>Select all loaded ({visibleLeadIds.length})</CustomText>
              </Pressable>
              <CustomText style={styles.selectionCount}>{selected.length} selected</CustomText>
              <Pressable accessibilityRole="button" accessibilityLabel="Exit selection" onPress={exitSelection} hitSlop={8} style={{ padding: 6 }}>
                <Feather name="x" size={22} color="#475569" />
              </Pressable>
            </View>
          )}

          {selectLeadType === "lead" && canLeadPoolManagement && (
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
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            data={filteredLeadData}
            extraData={{ selected, selectionMode }}
            renderItem={({ item, index }) => (
              <LeadRowItem
                index={index}
                item={item}
                isAgent={isAgent}
                user={user}
                selected={selected.indexOf(item?._id) !== -1}
                isSelectionMode={selectionMode}
                isCallingData={selectLeadType === "calling_data"}
                bgColor={bgByStatus[item?.status]}
                onPress={() => {
                  !selectionMode
                    ? navigation.navigate("LeadsDetails", {
                        item,
                        selectLeadType,
                      })
                    : handleSelect(item?._id);
                }}
                onLongPress={
                  canSelectLeads
                    ? () => {
                        setSelectionMode(true);
                        setShowHeaderActions(false);
                        setSelected((ids) => ids.includes(item._id) ? ids : [...ids, item._id]);
                      }
                    : () => setQuickActionLead(item)
                }
                onCallPress={() =>
                  navigation.navigate("LeadsDetails", {
                    item,
                    selectLeadType,
                    triggerCall: true, // 👈 important flag
                  })
                }
                onWhatsappIconPress={() => openWhatsApp(item?.whatsapp)}
                onEmailPress={() => onEmailPress(item?.clientEmail)}
                handleChangeStatus={handleChangeStatusSubmit}
                isClaiming={claimingLeadIds.has(item?._id)}
              />
            )}
            keyExtractor={(item) => item?._id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
            ListHeaderComponent={
              <View>
                <Animated.View
                  entering={FadeInDown.duration(180)}
                  exiting={FadeOutUp.duration(150)}
                  style={{ display: showSearch ? "flex" : "none" }}
                >
                  <SearchBar
                    onChangeText={(v) => handleSearchChange(v)}
                    value={searchValue}
                    onClickCancel={() => {
                      handleSearchChange("");
                      setShowSearch(false);
                      setFocusSearch(false);
                    }}
                    autoFocus={focusSearch}
                    isWithAnimation
                    moduleName={"lead"}
                  />
                </Animated.View>

                <View style={styles.container}>
                  {canViewLeads && <TouchableOpacity
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
                  </TouchableOpacity>}
                  {canViewCallingData && <TouchableOpacity
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
                  </TouchableOpacity>}
                </View>

                <LeadFolderBar
                  type={selectLeadType}
                  selectedFolderId={selectedFolderId}
                  selectedFolderLeadCount={todaysTasksComingSoon ? null : totalCount}
                  onChangeFolder={handleFolderChange}
                  onManage={() => setFolderModalVisible(true)}
                />
                {/* {!!selectedFolder && (
                  <View
                    style={[
                      styles.activeFolderNotice,
                      {
                        borderLeftColor: selectedFolder.color,
                        backgroundColor: `${selectedFolder.color}14`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.activeFolderDot,
                        { backgroundColor: selectedFolder.color },
                      ]}
                    />
                    <CustomText style={styles.activeFolderText}>
                      {selectedFolder.name} folder
                    </CustomText>
                  </View>
                )} */}

                {/* <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingTop: 12,
                    paddingBottom: 4,
                    gap: 8,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedStatus("all")}
                    style={[
                      styles.statusChip,
                      selectedStatus === "all" && styles.activeStatusChip,
                    ]}
                  >
                    <CustomText
                      style={[
                        styles.statusChipText,
                        selectedStatus === "all" && styles.activeStatusChipText,
                      ]}
                    >
                      All
                    </CustomText>
                  </TouchableOpacity>

                  {allLeadsFilterStatuses?.map((item) => {
                    const isSelected = selectedStatus === item?._id;

                    return (
                      <TouchableOpacity
                        key={item?._id}
                        activeOpacity={0.8}
                        onPress={() => setSelectedStatus(item?._id)}
                        style={[
                          styles.statusChip,
                          isSelected && styles.activeStatusChip,
                        ]}
                      >
                        <CustomText
                          style={[
                            styles.statusChipText,
                            isSelected && styles.activeStatusChipText,
                          ]}
                        >
                          {item?.name}
                        </CustomText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView> */}
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
              todaysTasksComingSoon ? (
                <View accessibilityLiveRegion="polite" style={styles.comingSoonCard}>
                  <View style={styles.comingSoonIcon}>
                    <Feather name="clock" size={28} color="#2E67BE" />
                  </View>
                  <CustomText style={styles.comingSoonTitle}>Coming soon</CustomText>
                  <CustomText style={styles.comingSoonDescription}>
                    Today’s Tasks will be available soon.
                  </CustomText>
                </View>
              ) : loading ? <SkeletonLoadingLead /> : leadLoadError ? (
                <LeadReadRetry error={leadError} busy={leadsFetching} message="Leads couldn’t load. Please retry." onRetry={() => { void refetchLeads(); }} />
              ) : <NoDataFound />
            }
            onEndReached={onEndReach}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              todaysTasksComingSoon ? null : leadData?.length > 0 && (isFetchNextPageError || isRefetchError) ? (
                <LeadReadRetry error={leadError} busy={leadsFetching} message={isFetchNextPageError ? "More leads couldn’t load. Please retry." : "Leads couldn’t refresh. Your loaded leads are still available."}
                  onRetry={() => { if (isFetchNextPageError) void fetchNextPage(); else void refetchLeads(); }} />
              ) : isFetchingNextPage && (
                <ActivityIndicator
                  size={"small"}
                  color={color.mainTxtColor}
                  style={{ marginTop: 12 }}
                />
              )
            }
            refreshControl={
              selectionMode ? undefined : <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onScroll={(e) => {
              // Don't let scroll auto-hide the action bar while a selection
              // is active — it needs to stay reachable (folder/delete/assign)
              // no matter how far down the list the user has scrolled.
              if (selectionMode) return;
              const offsetY = e.nativeEvent.contentOffset.y;
              const show = offsetY > 180;
              if (show !== showHeaderActions) {
                setShowHeaderActions(show);
              }
            }}
            removeClippedSubviews={Platform.OS === "android"}
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={10}
            scrollEventThrottle={16}
          />
          <LeadFoldersModal
            key={selectLeadType}
            type={selectLeadType}
            visible={folderModalVisible}
            onClose={() => setFolderModalVisible(false)}
            leadIds={selected}
            selectedFolderId={selectedFolderId}
            onCompleted={exitSelection}
          />
        </Container>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <CustomText style={{ textAlign: "center", color: color.mainTxtColor }}>
            {permissionLoading ? "Loading access…" : "You don’t have permission to view this data."}
          </CustomText>
        </View>
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
        toast={toast}
      />
      <QuickStatusSheet
        visible={selectLeadType === "lead" && !!quickActionLead}
        leadId={quickActionLead?._id}
        initialStatus={quickActionLead?.status}
        selectLeadType={selectLeadType}
        onClose={() => setQuickActionLead(null)}
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
    </View>
  );
};

const LeadRowItem = React.memo(
  ({
    item,
    index,
    onPress,
    onLongPress,
    selected,
    isSelectionMode,
    isCallingData,
    bgColor,
    onCallPress,
    onWhatsappIconPress,
    onEmailPress,
    isAgent,
    user,
    handleChangeStatus,
    isClaiming,
  }: any) => {
    const hasDisplayValue = (value: unknown) => {
      if (value === null || value === undefined || value === false || value === 0)
        return false;
      const normalized = String(value).trim().toLowerCase();
      return ![
        "",
        "restricted",
        "n/a",
        "null",
        "undefined",
        "—",
        "-",
      ].includes(normalized);
    };
    const displayValue = (value: unknown) =>
      hasDisplayValue(value) ? String(value).trim() : "-";
    const statusKey = item?.status ?? "";
    const missingCount = [
      item?.clientMobile,
      item?.whatsapp,
      item?.clientEmail,
    ].filter((value) => !hasDisplayValue(value)).length;

    const showClaimBtn = missingCount >= 2;
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.5}
          delayLongPress={350}
          accessibilityRole={isSelectionMode ? "checkbox" : "button"}
          accessibilityLabel={displayValue(item?.clientName)}
          accessibilityState={isSelectionMode ? { checked: selected } : undefined}
          style={[
            styles.mainlistcontainer,
            {
              marginTop: index === 0 ? 8 : 4,
              // backgroundColor: selected
              //   ? color.primary200
              //   : bgColor
              //     ? bgColor
              //     : "white",
              backgroundColor: item?.isDuplicate
                ? "#FFFBEB"
                : selected
                  ? color.primary200
                  : bgColor
                    ? bgColor
                    : "white",

              borderColor: selected ? "#2E67BE" : item?.isDuplicate ? "#FACC15" : "#E3E8EF",

              borderWidth: item?.isDuplicate ? 1.2 : 1,
            },
          ]}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 24, alignItems: "center" }}>
              {isSelectionMode ? (
                <Feather name={selected ? "check-square" : "square"} size={21} color={selected ? "#2E67BE" : "#94A3B8"} />
              ) : index === "S.No" ? (
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
                flex: 1,
                minWidth: 0,
                paddingEnd: 2,
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
                {displayValue(item?.clientName)}
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
                  {displayValue(item?.clientMobile)}
                </CustomText>
              ) : (
                <CustomText
                  numberOfLines={1}
                  style={{
                    color: color.mainTxtColor,
                    fontWeight: "300",
                    textTransform: "capitalize",
                    marginTop: 2,
                    fontSize: 13,
                  }}
                >
                  {displayValue(
                    [item?.assign?.name?.trim(), item?.assign?.lastName?.trim()]
                      .filter(Boolean)
                      .join(" "),
                  )}
                </CustomText>
              )}
            </View>

            <View
              style={{
                width: "29%",
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
                  paddingVertical: 2,
                  borderRadius: 6,
                  alignSelf: "flex-start",
                }}
              >
                {displayValue(statusObj[item?.status] || item?.status)}
              </CustomText>
              <CustomText
                numberOfLines={1}
                style={{
                  color: color.mainTxtColor,
                  fontWeight: "400",
                  fontSize: 11,
                  textTransform: "capitalize",
                  marginTop: 2,
                }}
              >
                {getTimeAgo(item?.assignedAt)}
              </CustomText>
            </View>

            {isSelectionMode || isCallingData ? null : statusKey === "assign" || statusKey === "re_assigned" ? (
              <TouchableOpacity
                style={{
                  borderRadius: 8,
                  backgroundColor: color.mainTxtColor,
                  // backgroundColor: "red",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  maxHeight: 32,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 2,
                  borderWidth: 0.9,
                  borderColor: color.borderColor,
                  ...shadowPrimaryColor,
                }}
                onPress={() => handleChangeStatus(item?._id)}
                disabled={isClaiming}
                accessibilityState={{ disabled: isClaiming, busy: isClaiming }}
              >
                {isClaiming ? (
                  <ActivityIndicator size="small" color="#4985F2" />
                ) : (
                  <CustomText style={{ fontSize: 12, color: "#fff" }}>
                    Claim
                  </CustomText>
                )}
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  gap: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                {hasDisplayValue(item?.clientMobile) && (
                  <TouchableOpacity
                    onPress={onCallPress}
                    style={styles.iconBtn}
                  >
                    <Feather name="phone-call" size={17} color="#4985F2" />
                  </TouchableOpacity>
                )}

                {hasDisplayValue(item?.whatsapp) && (
                  <TouchableOpacity
                    onPress={onWhatsappIconPress}
                    style={[styles.iconBtn, { backgroundColor: "#49f26529" }]}
                  >
                    <FontAwesome name="whatsapp" size={18} color="#49f265" />
                  </TouchableOpacity>
                )}

                {!isAgent && hasDisplayValue(item?.clientEmail) && (
                  <TouchableOpacity
                    onPress={onEmailPress}
                    style={[styles.iconBtn, { backgroundColor: "#ff6b6b14" }]}
                  >
                    <Feather name="mail" size={17} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  comingSoonCard: { minHeight: 250, margin: 16, padding: 24, alignItems: "center", justifyContent: "center",
    borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", gap: 12 },
  comingSoonIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#E8F0FC", alignItems: "center", justifyContent: "center" },
  comingSoonTitle: { fontSize: 20, fontWeight: "700", color: "#1E293B", textAlign: "center" },
  comingSoonDescription: { fontSize: 14, lineHeight: 21, color: "#64748B", textAlign: "center" },
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF",
    gap: 8,
  },
  selectAllButton: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minHeight: 36 },
  selectionText: { color: "#2E67BE", fontSize: 12, fontWeight: "600" },
  selectionCount: { color: "#475569", fontSize: 12 },
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
    paddingVertical: 7,
    paddingHorizontal: 8,
    minHeight: 58,
    borderRadius: 10,
    marginHorizontal: 8,
    ...shadowPrimaryColor,
  },
  iconBtn: {
    borderRadius: 8,
    backgroundColor: "#4984f21e",
    // backgroundColor: "red",
    padding: 7,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#3E6EC6",
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 12,
    marginTop: 10,
  },
  activeFolderNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginHorizontal: 14,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  activeFolderDot: { width: 8, height: 8, borderRadius: 4 },
  activeFolderText: { color: "#334155", fontSize: 12, fontWeight: "700" },

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
  reminderIconBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "#ffffff29",
    borderWidth: 2,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D6E4FF",
  },

  activeStatusChip: {
    backgroundColor: color.primaryColor,
    borderColor: color.primaryColor,
  },

  statusChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: color.primaryColor,
  },

  activeStatusChipText: {
    color: "#fff",
  },
});

export default AllLeads;
