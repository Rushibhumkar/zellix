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

const roleType = {
  sr_manager: 'Sr manager',
  manager: 'Manager',
  team_lead: 'Team Lead',
  agent: 'Agent',
  sup_admin: "Sup Admin",
  assistant_manager: "Assistant Manager",
  sub_admin: 'Sub Admin',
}


const UserList = () => {
  const isFocused = useIsFocused();
  const { allUsers, loading, user } = useSelector(selectUser);
  const { navigate } = useNavigation();
  const dispatch = useDispatch();
  const [filteredUser, setFilteredUser] = useState(allUsers);
  //
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  const toggleModal = () => {
    // setSelectedUser({ name: item?.name, id: item?._id })
    setModalVisible(!modalVisible);
  };
  const handleSelect = (item) => {
    let temp = { ...selectedUser };
    if (temp?._id === item?._id) {
      setSelectedUser({});
    } else {
      setSelectedUser({ ...item });
    }
  };

  useEffect(() => {
    if (!!searchValue) {
      let temp = allUsers?.filter((item) => {
        return (
          item?.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.role.toLowerCase().includes(searchValue.toLowerCase())
        );
      });

      setFilteredUser(temp);
    }
  }, [searchValue]);

  const handleFilterTextOnChange = (value) => {
    if (value) {
      setSearchValue(value);
    } else {
      setSearchValue("");
      setFilteredUser(allUsers !== null ? [...allUsers] : []);
    }
  };

  const handleDeleteUser = async () => {
    setIsLoading(true);
    try {
      let res = await deleteUser(selectedUser?._id);
      await dispatch(getUserFunc());
      setSnackBar({
        visible: true,
        text: res.data,
        error: false,
      });
      setSelectedUser('')
    } catch (err) {
      setSnackBar({
        visible: true,
        text: error?.response?.data,
        error: true,
      });
    } finally {
      setIsLoading(false);
      toggleModal(false);
    }
  };

  useEffect(() => {
    setFilteredUser(allUsers)
  }, [!!isFocused, allUsers])

  return (
    <Container>
      <Header title={"Users"} />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      {true ? (
        <View>
          {user?.role !== "sr_manager" && <TitleWithAddDelete
            arrLength={!!selectedUser?._id ? 1 : 0}
            title="User"
            onPressToNavigate={() => navigate("addUsers")}
            onPressToEdit={() => {
              navigate("addUsers", { data: { ...selectedUser } });
              setSelectedUser({});
            }}
            onPressToDelete={
              user?.role === "agent" || user?.role === "sr_manager"
                ? false
                : toggleModal
            }
          />}

          <FlatList
            data={filteredUser}
            renderItem={({ item, index }) => {
              return (
                <UserRowItem
                  serialNo={index}
                  email={item?.email}
                  userName={item?.name}
                  role={roleType[item?.role]}
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
              paddingBottom: Platform.OS === "ios" ? 300 : 250,
              paddingTop: 5,
              paddingHorizontal: 20,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListHeaderComponent={
              <>
                <SearchBar
                  onClickCancel={() => {
                    setSearchValue("");
                    setFilteredUser([...allUsers]);
                  }}
                  value={searchValue}
                  onChangeText={(v) => handleFilterTextOnChange(v)}
                  containerStyle={{
                    marginHorizontal: 0,
                    marginBottom: 15,
                  }}
                />
                <UserListHeading />
              </>
            }
            ListHeaderComponentStyle={{ paddingTop: 5, marginBottom: 15 }}
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
