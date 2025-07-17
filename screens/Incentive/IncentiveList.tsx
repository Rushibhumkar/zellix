import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Header from "../../components/Header";
import useSelectList from "../../hooks/useSelectList";
import Container from "../../myComponents/Container/Container";
import InfiniteScroll from "../../myComponents/InfiniteScroll/InfiniteScroll";
import { routeIncentive } from "../../utils/routes";
import IncentiveCard from "./component/IncentiveCard";
import { useGetIndividualIncentiveList } from "./query/useIncentive";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { debounce } from "../../utils/debounce";
import { myConsole } from "../../hooks/useConsole";

const IncentiveList = () => {
  const { navigate } = useNavigation();
  const { selected, handleSelect } = useSelectList();

  //   const [searchValue, setSearchValue] = useState("");
  //   const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
  //   myConsole("SearchValue", searchValue);
  //   myConsole("DebounceSearch", debouncedSearch);
  // Debounce function to reduce API calls (added dependency on setDebouncedSearch)
  //   const debounceSearch = useCallback(
  //     debounce((value) => {
  //       //   console.log("Debounced search:", value);
  //       setDebouncedSearch(value);
  //     }, 500),
  //     [setDebouncedSearch] // Ensures function updates when state changes
  //   );

  // Effect to trigger API call when search query updates
  //   useEffect(() => {
  //     // console.log("Search query updated:", debouncedSearch);
  //   }, [debouncedSearch]);

  // Fetch incentives with the updated search query
  const individualIncentive = useGetIndividualIncentiveList({
    search: "", // Ensure the API fetches when this changes
  });

  // Ensure API is fetching correctly
  //   useEffect(() => {
  //     // console.log("Fetched incentives:", individualIncentive?.data);
  //   }, [individualIncentive?.data]);

  // Handle search input change
  //   const handleSearchChange = (v) => {
  //     // console.log("handleSearch", v);
  //     setSearchValue(v);
  //     debounceSearch(v);
  //   };

  return (
    <Container>
      <Header title={"Individual Incentive"} />
      {/* <SearchBar
        onChangeText={(v) => {
          setSearchValue(v);
        }}
        value={searchValue}
        onClickCancel={() => {
          setSearchValue("");
          setDebouncedSearch(""); // Reset debounce search as well
        }}
        containerStyle={{ marginTop: 20 }}
      /> */}
      <InfiniteScroll
        query={individualIncentive}
        renderItems={({ item, index }) => (
          <IncentiveCard
            key={index}
            item={item}
            onPress={() => navigate(routeIncentive.IncentiveDetail, { item })}
          />
        )}
      />
    </Container>
  );
};

export default IncentiveList;

const styles = StyleSheet.create({});
