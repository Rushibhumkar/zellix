import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import { useGetLeadPool } from "../../hooks/useCRMgetQuerry";
import { myConsole } from "../../hooks/useConsole";
import LeadListHeading from "../../components/Leads/LeadHeading/LeadListHeading";
import SkeletonLoadingLead from "../../components/Leads/SkeletonLoadingLead/SkeletonLoadingLead";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { debounce } from "../../utils/debounce";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { useNavigation } from "@react-navigation/native";
import { shadow1, shadowPrimaryColor } from "../../const/globalStyle";
import { leadTypeObj, roleEnum, statusObj } from "../../utils/data";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { popupModal2 } from "../../utils/toastFunction";
import { claimLead, deleteLeadsByIds } from "../../services/rootApi/leadApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { queryKeyCRM } from "../../utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

// let bgByStatus = {
//     assign: '#FECBA6',
//     new: '#D6E5FD',
// }

const LeadPool = () => {
  const queryClient = useQueryClient();
  const { user, leadQueryKey } = useSelector(selectUser);
  const isSubSup =
    user?.role === roleEnum.sub_admin || user?.role === roleEnum.sup_admin;
  const { navigate } = useNavigation();
  const [selected, setSelected] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    data: leadData,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetLeadPool({
    search: debouncedSearch,
  });

  const onEndReach = () => {
    if (hasNextPage && !loading && leadData?.length > 0) {
      fetchNextPage && fetchNextPage();
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (e) {
      console.log("refreshGetAllLeave", e);
    } finally {
      setRefreshing(false);
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

  const handleDeleteLeadPool = async () => {
    await deleteLeadsByIds(selected);
    refetch();
    setSelected([]);
  };

  return (
    <>
      <Header
        title={"Lead Pool"}
        onPressAdd={() => navigate("AddLeads")}
        showActions={true}
      />
      <Container>
        <TitleWithAddDelete
          arrLength={selected?.length}
          title="Lead"
          showAddBtn={false}
          // onPressToNavigate={() => navigate("AddLeads")}
          onPressToDelete={() =>
            popupModal2.wantDelete({ onConfirm: handleDeleteLeadPool })
          }
        />
        <FlatList
          data={leadData}
          renderItem={({ item, index }) => {
            return (
              <LeadPoolRowItem
                index={index}
                item={item}
                selected={selected?.indexOf(item?._id) !== -1}
                // bgColor={bgByStatus[item?.status]}
                onPress={() => {
                  if (isSubSup) {
                    selected?.length === 0
                      ? navigate("LeadsDetails", { item })
                      : handleSelect(item._id);
                  }
                }}
                // onLongPress={isSubSup ? () => handleSelect(item._id) : undefined}
                onPressClaim={() => {
                  popupModal2.wantDelete({
                    onConfirm: async () => {
                      !!item?._id && (await claimLead(item?._id));
                      refetch();
                    },
                    title: "Do you want to claim!",
                  });
                }}
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
              <LeadPoolHeading />
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
                style={{ marginTop: 20 }}
              />
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </Container>
    </>
  );
};

export default LeadPool;

const LeadPoolRowItem = ({
  item,
  onPress,
  index,
  selected,
  bgColor,
  onLongPress,
  onPressClaim,
}: any) => {
  const { user } = useSelector(selectUser);

  const isSubSup =
    user?.role === roleEnum.sub_admin || user?.role === roleEnum.sup_admin;

  return (
    <TouchableOpacity
      key={index}
      activeOpacity={0.9}
      style={[
        styles.mainlistcontainer,
        {
          marginTop: index === 0 ? 18 : 14,
          backgroundColor: selected ? "#EEF4FF" : bgColor ? bgColor : "#FFFFFF",
          borderColor: selected ? color.primaryColor : "#E8EEF7",
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.leftContent}>
          <SlideFadeIn>
            <CustomText numberOfLines={1} style={styles.projectName}>
              {item?.name || "N/A"}
            </CustomText>
          </SlideFadeIn>

          <SlideFadeIn>
            <CustomText numberOfLines={1} style={styles.clientName}>
              {item?.clientName || "N/A"}
            </CustomText>
          </SlideFadeIn>
        </View>

        <View style={styles.rightContent}>
          <View style={styles.typeBadge}>
            <CustomText numberOfLines={1} style={styles.typeText}>
              {leadTypeObj?.[item?.type] || "N/A"}
            </CustomText>
          </View>

          <CustomText numberOfLines={1} style={styles.sourceText}>
            {item?.source || "N/A"}
          </CustomText>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <CustomBtn
          title="Claim Lead"
          textStyle={{
            fontSize: 15,
            fontWeight: "700",
          }}
          containerStyle={styles.claimBtn}
          onPress={onPressClaim}
        />
      </View>
    </TouchableOpacity>
  );
};

const LeadPoolHeading = () => {
  return (
    <Container style={{ paddingHorizontal: 20 }}>
      <View style={styles.headingContainer}>
        <CustomText style={styles.headingTitle}>Available Leads</CustomText>

        <CustomText style={styles.headingSubTitle}>
          Claim and manage your lead pool efficiently
        </CustomText>
      </View>
    </Container>
  );
};

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
    padding: 16,
    borderRadius: 22,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    ...shadowPrimaryColor,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  leftContent: {
    width: "64%",
    paddingRight: 10,
  },

  rightContent: {
    width: "36%",
    alignItems: "flex-end",
  },

  projectName: {
    color: color.mainTxtColor,
    fontWeight: "700",
    fontSize: 17,
    textTransform: "capitalize",
    lineHeight: 22,
  },

  clientName: {
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 8,
    fontSize: 14,
    textTransform: "capitalize",
  },

  typeBadge: {
    backgroundColor: "#EDF4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    alignSelf: "flex-end",
  },

  typeText: {
    color: color.primaryColor,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "capitalize",
  },

  sourceText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 13,
    marginTop: 10,
    textTransform: "capitalize",
  },

  bottomRow: {
    marginTop: 18,
  },

  claimBtn: {
    height: 46,
    borderRadius: 14,
  },

  headingContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginBottom: -2,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E8EEF7",
    ...shadowPrimaryColor,
    shadowOpacity: 0.05,
    elevation: 2,
  },

  headingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: color.mainTxtColor,
  },

  headingSubTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },

  headingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});
