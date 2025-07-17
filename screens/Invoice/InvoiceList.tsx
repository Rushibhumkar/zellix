import { StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Container from "../../myComponents/Container/Container";
import InfiniteScroll from "../../myComponents/InfiniteScroll/InfiniteScroll";
import { useNavigation } from "@react-navigation/native";
import { useGetInvoiceList } from "./query/useInvoice";
import InvoiceCard from "./component/InvoiceCard";
import { routeInvoice } from "../../utils/routes";
import Header from "../../components/Header";
import { debounce } from "../../utils/debounce";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { myConsole } from "../../hooks/useConsole";

const InvoiceList = () => {
  const { navigate } = useNavigation();
  // const [searchValue, setSearchValue] = useState("");
  // const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
  const individualIncentive = useGetInvoiceList({
    search: "",
  });
  const { user } = useSelector(selectUser);
  const { data: permission = {} } = useGetUserPermission(user?._id);
  const canViweDetails = checkPermission(
    permission,
    "Invoices",
    "viewDetails",
    user?.role
  );
  myConsole("ksjdlfkjdlsf", permission);
  // const debounceSearch = useCallback(
  //   debounce((value) => {
  //     console.log("Debounced search:", value);
  //     setDebouncedSearch(value);
  //   }, 500),
  //   [setDebouncedSearch] // Ensures function updates when state changes
  // );

  // // Effect to trigger API call when search query updates
  // useEffect(() => {
  //   console.log("Search query updated:", debouncedSearch);
  // }, [debouncedSearch]);

  return (
    <Container>
      <Header title={"Individual Invoice"} />
      {/* <SearchBar
        onChangeText={(v) => handleSearchChange(v)}
        value={searchValue}
        onClickCancel={() => {
          setSearchValue("");
          setDebouncedSearch(""); // Reset debounce search as well
        }}
        containerStyle={{ marginTop: 20 }}
      /> */}
      <InfiniteScroll
        query={individualIncentive}
        renderItems={({ item, index }) => {
          return (
            <InvoiceCard
              item={item}
              onPress={() => {
                if (canViweDetails) {
                  navigate(routeInvoice.InvoiceDetail, { item });
                } else {
                  popUpConfToast.errorMessage(
                    "You are not authorized to view invoice details."
                  );
                }
              }}
            />
          );
        }}
      />
    </Container>
  );
};

export default InvoiceList;

const styles = StyleSheet.create({});
