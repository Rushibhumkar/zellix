import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { FlatList, Platform, View, Text, Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import { selectUser } from "../../redux/userSlice";
import TeamRowItem from "../../myComponents/TeamRowItem/TeamRowItem";
import Container from "../../myComponents/Container/Container";
import { deleteTeam } from "../../services/rootApi/teamApi";
import { getTeamFunc } from "../../redux/action";
import LeadListHeading from "../../components/Leads/LeadHeading/LeadListHeading";

import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import DeleteModel from "../../myComponents/DeleteModel";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import { color } from "../../const/color";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import SkeletonLoadingUser from "../../components/User/SkeletonLoadingUser";
import { myConsole } from "../../hooks/useConsole";
import { routeTeam } from "../../utils/routes";
import { sizes } from "../../const";
import CustomText from "../../myComponents/CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";

const TeamList = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { team, user, loading } = useSelector(selectUser);
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const [filteredTeam, setFilteredTeam] = useState([]);
  //

  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [focusSearch, setFocusSearch] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  useEffect(() => {
    setFilteredTeam(team);
  }, [isFocused, team]);

  const onSelect = (item) => {
    if (item?._id === selectedTeam._id) {
      setSelectedTeam({});
    } else {
      setSelectedTeam(item);
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };
  const handleDeleteUser = async () => {
    setIsLoading(true);
    try {
      const res = await deleteTeam(selectedTeam?._id);
      await dispatch(getTeamFunc());
      setSnackBar({
        visible: true,
        text: "Delete Teams SuccessFully",
        error: false,
      });
    } catch (err) {
      setSnackBar({
        visible: true,
        text: err?.response?.data,
        error: false,
      });
    } finally {
      setIsLoading(false);
      toggleModal(false);
      setSelectedTeam({});
    }
  };

  useEffect(() => {
    if (!!searchValue) {
      let temp = team?.filter((item) => {
        return (
          item?.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.teamLead?.name
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          item?.srManager?.name
            ?.toLowerCase()
            .includes(searchValue.toLowerCase())
        );
      });

      setFilteredTeam(temp);
    }
  }, [searchValue]);

  const handleFilterTextOnChange = (value) => {
    if (value) {
      setSearchValue(value);
    } else {
      setSearchValue("");
      setFilteredTeam(team !== null ? [...team] : []);
    }
  };

  return (
    <Container>
      <Header
        title={"Teams"}
        showActions
        onPressAdd={() => navigation.navigate("addTeam")}
        showSearch={showSearch}
        moduleName={"teamCRM"}
        isWithAnimation
        totalCount={team?.length}
        onPressSearch={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setShowSearch((prev) => !prev);
          setFocusSearch(true);
        }}
        onPressFilter={() => navigate("AdvanceSearch", { type: "userCRM" })}
      />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {true ? (
        <View>
          {user?.role !== "sr_manager" &&
            user?.role !== "manager" &&
            user?.role !== "team_lead" && (
              <TitleWithAddDelete
                arrLength={!!selectedTeam?._id ? 1 : 0}
                title="Team"
                showAddBtn={false}
                // onPressToNavigate={() => navigation.navigate("addTeam")}
                onPressToEdit={() => {
                  navigation.navigate("addTeam", { data: selectedTeam });
                  setSelectedTeam({});
                }}
                onPressToDelete={toggleModal}
              />
            )}

          <FlatList
            data={filteredTeam}
            // data={[]}
            renderItem={({ item, index }) => {
              return (
                <TeamRowItem
                  serial={index + 1}
                  index={index}
                  managerName={item?.srManager?.name}
                  teamLeadName={item?.teamLead?.name}
                  teamName={item?.name}
                  onLongPress={
                    user?.role === "sr_manager"
                      ? undefined
                      : () => onSelect(item)
                  }
                  isSelected={selectedTeam?._id === item?._id}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === "ios" ? 270 : 250,
              paddingTop: 20,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListHeaderComponent={
              <>
                {showSearch && (
                  <Animated.View
                    entering={FadeInDown.duration(180)}
                    exiting={FadeOutUp.duration(150)}
                  >
                    <SearchBar
                      onClickCancel={() => {
                        setSearchValue("");
                        setFilteredTeam([...team]);
                      }}
                      isWithAnimation
                      autoFocus={focusSearch}
                      value={searchValue}
                      onChangeText={(v) => handleFilterTextOnChange(v)}
                      containerStyle={{
                        marginTop: 15,
                      }}
                    />
                  </Animated.View>
                )}
                {/* <TeamListHeading /> */}
              </>
            }
            ListHeaderComponentStyle={{ marginBottom: 10, marginTop: -20 }}
            // ListEmptyComponent={<SkeletonLoadingLead isTeam />}
            ListEmptyComponent={
              loading?.team ? (
                <SkeletonLoadingUser />
              ) : (
                <NoDataFound style={{ marginTop: sizes.height / 4 }} showTxt />
              )
            }
          />
        </View>
      ) : (
        <NoDataFound style={{ marginTop: sizes.height / 4 }} showTxt />
      )}
      {/* modal delete */}
      <DeleteModel
        isLoading={isLoading}
        handleDeleteUser={handleDeleteUser}
        style={{
          width: "10%",
        }}
        selectedUser={selectedTeam?.email}
        toggleModal={toggleModal}
        modalVisible={modalVisible}
      />
    </Container>
  );
};

export default TeamList;

const TeamListHeading = () => {
  return (
    <LinearGradient
      colors={["#2E67BE", "#4985F2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 14,
          justifyContent: "space-between",
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 16,
        },
      ]}
    >
      <CustomText
        style={{
          width: "10%",
          color: "white",
          paddingRight: 3,
        }}
        numberOfLines={1}
      >
        No.
      </CustomText>
      <CustomText
        style={{
          width: "30%",
          color: "white",
          paddingRight: 3,
        }}
      >
        Team
      </CustomText>
      <CustomText
        style={{
          width: "30%",
          color: "white",
          paddingRight: 3,
        }}
        numberOfLines={1}
      >
        Manager
      </CustomText>
      <CustomText
        style={{
          width: "30%",
          color: "white",
        }}
        numberOfLines={1}
      >
        Team Lead
      </CustomText>
    </LinearGradient>
  );
};
