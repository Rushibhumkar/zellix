import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
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
  setAdvanceLead,
  setLeadQueryKey,
} from "../../redux/userSlice";
import Container from "../../myComponents/Container/Container";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { deleteLead } from "../../services/rootApi/leadApi";
import { getAllLeadFunc } from "../../redux/action";
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
import { leadTypeObj, roleEnum, statusObj } from "../../utils/data";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomCheckBox from "../../myComponentsHRM/CutomCheckBox/CustomCheckBox";
import { useGetLead } from "../../hooks/useCRMgetQuerry";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "../../utils/debounce";
import { queryKeyCRM } from "../../utils/queryKeys";
import LeadPoolIcon from "../../assets/svg/LeadPoolIcon";
import { checkPermission } from "../../utils/commonFunctions";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import CustomText from "../../myComponents/CustomText/CustomText";
import { useRoute } from "@react-navigation/native";
import { sizes } from "../../const";
let bgByStatus = {
  assign: "#dfe9faff", // soft blue tint for assigned
  new: "#C9DCFA", // lighter blue for new
};

// Debounce function

const AllLeads = ({ tabType }) => {
  const queryClient = useQueryClient();
  const route = useRoute();
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
    []
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
      await queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
      });
    } catch (e) {
      console.log("refreshGetAllLeave", e);
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
    user?.role
  );
  const canAssignLead = checkPermission(
    permission,
    "Leads",
    "assign",
    user?.role
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
    user?.role
  );

  useEffect(() => {
    if (isFocused) {
      if (tabType === "calling_data") {
        handleLeadTypeSelect("calling_data", false);
      } else if (tabType === "lead") {
        handleLeadTypeSelect("lead", false);
      } else {
        console.log("⚠️ Unknown tabType prop:", tabType);
      }
    }
  }, [isFocused, tabType]);

  return (
    <>
      <Header
        title={
          tabType === "calling_data"
            ? "Calling Data"
            : tabType === "lead"
            ? "Leads"
            : ""
        }
        isWithAnimation
        showBackIcon={false}
        showActions={showHeaderActions}
        onPressSearch={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setTimeout(() => {
            setFocusSearch((prev) => !prev); // toggles every time
          }, 100);
        }}
        onPressFilter={() =>
          navigation.navigate("AdvanceSearch", { type: "lead" })
        }
        onPressAdd={() => {
          if (canAddLead) navigation.navigate("AddLeads");
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
                tabType === "calling_data"
                  ? "Calling Data"
                  : tabType === "lead"
                  ? "Leads"
                  : ""
              }
              onPressToNavigate={() => {
                if (canAddLead) {
                  navigation.navigate("AddLeads");
                } else {
                  popUpConfToast.errorMessage(
                    "You are not authorized to add new leads. Please contact your administrator."
                  );
                }
              }}
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
              onPressToFilter={() =>
                navigation.navigate("AdvanceSearch", { type: "lead" })
              }
              onCloseSearch={
                leadQueryKey !== null
                  ? () => dispatch(setLeadQueryKey(null))
                  : false
              }
              // onSelectLeadType={
              //   leadQueryKey === null ? () => toggleLeadTypeModal() : false
              // }
            />
          )}

          {isPoolRestricted === false && (
            <TouchableOpacity
              onPress={() => navigation.navigate("LeadPool")}
              activeOpacity={0.5}
              style={{
                position: "absolute",
                bottom: 100,
                right: 20,
                zIndex: 5,
              }}
            >
              <CustomText style={{ color: "white", fontWeight: 800 }} />
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
                selected={selected.indexOf(item?._id) !== -1}
                bgColor={bgByStatus[item?.status]}
                onPress={() =>
                  selected?.length === 0
                    ? navigation.navigate("LeadsDetails", { item })
                    : handleSelect(item?._id)
                }
                onLongPress={
                  user?.role === roleEnum.agent
                    ? undefined
                    : () => handleSelect(item?._id)
                }
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
                    handleSearchChange(""), setFocusSearch(false);
                  }}
                  autoFocus={focusSearch}
                  isWithAnimation
                />
                <LeadListHeading
                  noText={"No"}
                  nameText={"Client Name"}
                  typeText={"Assigned"}
                  statusText={"Status"}
                />
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
  ({ item, index, onPress, onLongPress, selected, bgColor }: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={[
          styles.mainlistcontainer,
          {
            marginTop: index === 0 ? 25 : 12,
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
          <View style={{ width: "8%", paddingEnd: 2 }}>
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
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              >
                {index < 9 && `0`}
                {index + 1}
              </CustomText>
            )}
          </View>
          <View style={{ width: "37%", paddingEnd: 2 }}>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.mainTxtColor,
                fontWeight: "700",
                fontSize: 15,
                textTransform: "capitalize",
              }}
            >
              {item?.clientName}
            </CustomText>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.strokeColor,
                fontWeight: "400",
                marginTop: 5,
                textTransform: "capitalize",
              }}
            >
              {item?.clientMobile}
            </CustomText>
          </View>
          <View style={{ width: "34%", paddingEnd: 4, alignItems: "center" }}>
            <CustomText
              numberOfLines={1}
              style={{
                color: color.mainTxtColor,
                fontWeight: "400",
                fontSize: 15,
                textTransform: "capitalize",
              }}
            >
              {item?.assign?.name}
            </CustomText>
          </View>
          <View
            style={{
              width: "25%",
              alignItems: "flex-start",
              paddingEnd: 2,
            }}
          >
            <CustomText
              numberOfLines={2}
              style={{
                color: color.mainTxtColor,
                fontWeight: "400",
                fontSize: 15,
                textTransform: "capitalize",
                //textTransform: "capitalize",
              }}
            >
              {statusObj[item?.status]}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.selected === next.selected &&
    prev.item?._id === next.item?._id &&
    prev.item?.status === next.item?.status
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
    padding: 13,
    borderRadius: 14,
    borderColor: color.mainTxtColorFade,
    marginHorizontal: 20,
    ...shadowPrimaryColor,
  },
});

export default AllLeads;
