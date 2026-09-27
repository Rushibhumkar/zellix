import { isValidRole, ROLE_LABELS } from "../../utils/roles";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { FlatList, Platform, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import DeleteModel from "../../myComponents/DeleteModel";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import UserRowItem from "../../myComponents/UserRowItem/UserRowItem";
import { getUserFunc } from "../../redux/action";
import { selectUser } from "../../redux/userSlice";
import { deleteUser } from "../../services/rootApi/userApi";
import { color } from "../../const/color";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import UserListHeading from "../../components/User/UserListHeading";
import SkeletonLoadingUser from "../../components/User/SkeletonLoadingUser";
import { myConsole } from "../../hooks/useConsole";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

type UserListItem = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
};

const roleType = ROLE_LABELS;

const UserList = () => {
  const isFocused = useIsFocused();
  const { allUsers: storedUsers, loading, user } = useSelector(selectUser) as {
    allUsers: UserListItem[];
    loading: { allUsers?: boolean };
    user: UserListItem;
  };
  const allUsers = Array.isArray(storedUsers) ? storedUsers : [];
  const { navigate } = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [filteredUser, setFilteredUser] = useState<UserListItem[]>(allUsers);
  //
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [focusSearch, setFocusSearch] = useState(false);

  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  const toggleModal = (visible?: boolean) => {
    // setSelectedUser({ name: item?.name, id: item?._id })
    setModalVisible(typeof visible === "boolean" ? visible : !modalVisible);
  };
  const handleSelect = (item: UserListItem) => {
    if (selectedUser?._id === item._id) {
      setSelectedUser(null);
    } else {
      setSelectedUser({ ...item });
    }
  };

  useEffect(() => {
    if (!!searchValue) {
      const temp = allUsers.filter((item) => {
        return (
          item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.role?.toLowerCase().includes(searchValue.toLowerCase())
        );
      });

      setFilteredUser(temp);
    }
  }, [searchValue]);

  const handleFilterTextOnChange = (value: string) => {
    if (value) {
      setSearchValue(value);
    } else {
      setSearchValue("");
      setFilteredUser(allUsers !== null ? [...allUsers] : []);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?._id) return;
    setIsLoading(true);
    try {
      let res = await deleteUser(selectedUser?._id);
      await dispatch(getUserFunc());
      setSnackBar({
        visible: true,
        text: res.data,
        error: false,
      });
      setSelectedUser(null);
    } catch (err: any) {
      setSnackBar({
        visible: true,
        text: err?.response?.data?.message || err?.response?.data || "Unable to delete user",
        error: true,
      });
    } finally {
      setIsLoading(false);
      toggleModal(false);
    }
  };

  useEffect(() => {
    setFilteredUser(allUsers);
  }, [!!isFocused, allUsers]);

  return (
    <Container>
      <Header
        title={"Users"}
        showActions={true}
        // onPressAdd={() => navigate("addUsers")}
        showSearch={showSearch}
        moduleName={"userCRM"}
        isWithAnimation
        totalCount={allUsers.length ?? ""}
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
          {user?.role !== "sr_manager" && (
            <TitleWithAddDelete
              arrLength={!!selectedUser?._id ? 1 : 0}
              title="User"
              // onPressToNavigate={() => navigate("addUsers")}
              showAddBtn={false}
              onPressToEdit={() => {
                navigate("addUsers", { data: { ...selectedUser } });
                setSelectedUser(null);
              }}
              onPressToDelete={
                user?.role === "agent" || user?.role === "sr_manager"
                  ? undefined
                  : toggleModal
              }
            />
          )}
          <FlatList
            data={filteredUser}
            renderItem={({ item, index }) => {
              return (
                <UserRowItem
                  serialNo={index}
                  email={item.email || "N/A"}
                  userName={item.name || "N/A"}
                  role={item.role && isValidRole(item.role) ? roleType[item.role] : item.role || "N/A"}
                  bgColor="#FFFFFF"
                  onLongPress={
                    user?.role === "sr_manager"
                      ? undefined
                      : () => handleSelect(item)
                  }
                  isSelected={selectedUser?._id === item?._id}
                />
              );
            }}
            keyExtractor={(item) => item?._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === "ios" ? 270 : 250,
              paddingTop: 10,
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
                        setFilteredUser([...allUsers]);
                      }}
                      isWithAnimation
                      autoFocus={focusSearch}
                      value={searchValue}
                      onChangeText={(v) => handleFilterTextOnChange(v)}
                      containerStyle={{
                        marginBottom: 15,
                      }}
                    />
                  </Animated.View>
                )}
                {/* <UserListHeading /> */}
              </>
            }
            ListHeaderComponentStyle={{ marginBottom: 10, marginTop: -6 }}
            // ListEmptyComponent={<SkeletonLoadingUser />}
            ListEmptyComponent={
              loading?.allUsers ? <SkeletonLoadingUser /> : <NoDataFound />
            }
          />
        </View>
      ) : (
        <NoDataFound />
      )}
      <DeleteModel
        isLoading={isLoading}
        handleDeleteUser={handleDeleteUser}
        selectedUser={selectedUser?.email}
        toggleModal={toggleModal}
        modalVisible={modalVisible}
      />
    </Container>
  );
};

export default UserList;
