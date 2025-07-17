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
import { shadow1 } from "../../const/globalStyle";
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
import {useGetUserPermission} from '../../services/rootApi/permissionApi'
let bgByStatus = {
  assign: "#FECBA6",
  new: "#D6E5FD",
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

  const { navigate } = useNavigation();
  const isFocused = useIsFocused();

  const dispatch = useDispatch();
  //
  const [filteredData, setFilteredData] = useState(copyLead);
  const [searchValue, setSearchValue] = useState("");
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

  //

  // useEffect(() => {
  //   let temp = advanceLead !== null ? advanceLead : lead;
  //   if (advanceLead === null) {
  //     let filterTemp = temp?.filter((el) => el?.type === selectLeadType)
  //     setCopyLead(filterTemp);
  //     setFilteredData(filterTemp);
  //   } else {
  //     setCopyLead(temp);
  //     setFilteredData(temp);
  //     setSelectLeadType(advanceLead?.[0]?.type)
  //   }
  //   // if (temp?.length > 0) {
  //   //   let filterTemp = temp.filter((el) => el?.type === leadType)
  //   //   setCopyLead(filterTemp);
  //   //   setFilteredData(filterTemp);
  //   //   if (advanceLead !== null) {
  //   //     setSelectLeadType(advanceLead?.[0]?.status)
  //   //   }
  //   // }

  // }, [lead, selectLeadType, advanceLead]);

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

  //filterLogic
  // useEffect(() => {
  //   if (!!searchValue) {
  //     let temp = copyLead?.filter((el) => {
  //       return el?.type?.toLowerCase()?.includes(searchValue?.toLowerCase())
  //         ||
  //         el?.name?.toLowerCase()?.includes(searchValue?.toLowerCase())
  //         ||
  //         el?.status?.toLowerCase()?.includes(searchValue?.toLowerCase())
  //         ||
  //         el?.clientName?.toLowerCase()?.includes(searchValue?.toLowerCase())
  //     })
  //     setFilteredData(temp)
  //   }
  // }, [searchValue])

  const handleFilterTextOnChange = (value) => {
    if (value) {
      setSearchValue(value);
    } else {
      setSearchValue("");
      setFilteredData([...copyLead]);
    }
  };

  // useEffect(() => {
  //   if (isFocused) {
  //     setSelected([])
  //     setSearchValue('')
  //     let temp = [...copyLead]
  //     temp?.sort((a, b) => Date.parse(b?.updatedAt) - Date.parse(a?.updatedAt))
  //     setFilteredData(temp)
  //   }
  // }, [isFocused, advanceLead, lead])

  // useEffect(() => {
  //   if (!assignLeadModal) {
  //     setSelected([])
  //     setSearchValue('')
  //     let temp = [...copyLead]
  //     temp?.sort((a, b) => Date.parse(b?.updatedAt) - Date.parse(a?.updatedAt))
  //     setFilteredData(temp)
  //   }
  // }, [assignLeadModal])
  const debounceSearch = useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    []
  );

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };

  const handleLeadTypeSelect = (key) => {
    setSelectLeadType(key);
    toggleLeadTypeModal();
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
    const canAddLead = checkPermission(
      permission,
      "Leads",
      "add",
      user?.role
    );

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
    const canLeadPoolManagement = checkPermission(
      permission,
      "Leads",
      "leadPoolManagement",
      user?.role
    );
    const canViewProjects = checkPermission(
      permission,
      "Leads",
      "viewProjects",
      user?.role
    );
    myConsole('permissionnnn',permission)
  return (
    <>
      <Header title={"All Leads"} onBack={() => navigate('dashboard')} />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {true ? (
        <Container>
          <TitleWithAddDelete
            arrLength={selected?.length}
            title="Leads"
    onPressToNavigate={() => {
  if (canAddLead) {
    navigate("AddLeads");
  } else {
    popUpConfToast.errorMessage(
      "You are not authorized to add new leads. Please contact your administrator."
    );
  }
}}

            onPressToDelete={
              canDeleteLead &&
              user?.role === roleEnum.sub_admin ||
                user?.role === roleEnum.sup_admin
                ? toggleModal
                : false
            }
            onPressToAssignLead={
             canAssignLead && user?.role === "agent" ? false : () => toggleModalAssignLead()
            }
            onPressToFilter={() => navigate("AdvanceSearch", { type: "lead" })}
            onCloseSearch={
              leadQueryKey !== null
                ? () => dispatch(setLeadQueryKey(null))
                : false
            }
            onSelectLeadType={
              leadQueryKey === null ? () => toggleLeadTypeModal() : false
            }
          />
          {isPoolRestricted === false && canLeadPoolManagement && (
            <TouchableOpacity
              onPress={() => navigate("LeadPool")}
              activeOpacity={0.5}
              style={{
                position: "absolute",
                bottom: 100,
                right: 20,
                zIndex: 5,
              }}
            >
              <Text style={{ color: "white", fontWeight: 800 }}></Text>
              <LeadPoolIcon width={60} height={60} />
            </TouchableOpacity>
          )}
          <FlatList
            data={leadData}
            // data={[]}
            renderItem={({ item, index }) => {
              return (
                <LeadRowItem
                  index={index}
                  item={item}
                  selected={selected.indexOf(item?._id) !== -1}
                  bgColor={bgByStatus[item?.status]}
                  onPress={() =>
                    selected?.length === 0
                      ? navigate("LeadsDetails", { item })
                      : handleSelect(item?._id)
                  }
                  onLongPress={
                    user?.role === roleEnum.agent
                      ? undefined
                      : () => handleSelect(item?._id)
                  }
                />
              );
            }}
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
                    handleSearchChange("");
                    // setSearchValue('')
                    // setFilteredData([...copyLead])
                  }}
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
                <ActivityIndicator size={"small"} color={"#002E6B"} />
              )
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </Container>
      ) : (
        <NoDataFound />
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
      <ModalWithBlur visible={openLeadTypeModal} onClose={toggleLeadTypeModal}>
        {/* <DropdownRNE
          arrOfObj={[{
            name: 'asd',
            _id: 1212
          }]}
        /> */}
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
      </ModalWithBlur>
    </>
  );
};

const LeadRowItem = ({
  item,
  index,
  onPress,
  onLongPress,
  selected,
  bgColor,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[
        styles.mainlistcontainer,
        {
          backgroundColor: selected
            ? "rgba(252, 244, 227, 1)"
            : bgColor
              ? bgColor
              : "white",
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: "10%", paddingEnd: 3 }}>
          {index === "S.No" ? (
            <Text
              style={{
                color: "#000000",
                fontWeight: "500",
                textTransform: "capitalize",
              }}
            >
              No.
            </Text>
          ) : (
            <Text
              style={{
                color: "#000000",
                fontWeight: "500",
                textTransform: "capitalize",
              }}
            >
              {index < 9 && `0`}
              {index + 1}
            </Text>
          )}
        </View>
        <View style={{ width: "36%", paddingEnd: 3 }}>
          <Text
            numberOfLines={1}
            style={{
              color: "#000000",
              fontWeight: "700",
              fontSize: 16,
              textTransform: "capitalize",
            }}
          >
            {item?.clientName}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: "#000000",
              fontWeight: "400",
              marginTop: 5,
              textTransform: "capitalize",
            }}
          >
            {item?.clientMobile}
          </Text>
        </View>
        <View style={{ width: "27%", paddingEnd: 3, alignItems: "center" }}>
          <Text
            numberOfLines={1}
            style={{
              color: "#000000",
              fontWeight: "400",
              fontSize: 15,
              textTransform: "capitalize",
            }}
          >
            {item?.assign?.name}
          </Text>
        </View>
        <View style={{ width: "27%", alignItems: "flex-end", paddingEnd: 3 }}>
          <Text
            numberOfLines={2}
            style={{
              color: "#000000",
              fontWeight: "400",
              fontSize: 16,
              textTransform: "capitalize",
              //textTransform: "capitalize",
            }}
          >
            {statusObj[item?.status]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: "#FFC857",
    width: "100%",
    margin: "auto",
    alignSelf: "center",
    borderBottomWidth: 1,
    marginVertical: -2,
  },
  mainlistcontainer: {
    marginTop: 25,
    borderWidth: 1,
    padding: 13,
    borderRadius: 10,
    borderColor: "#FFC857",
    marginHorizontal: 20,
    ...shadow1,
  },
});

export default AllLeads;
