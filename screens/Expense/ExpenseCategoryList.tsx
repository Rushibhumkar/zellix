import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import { useGetExpenseCategoryList } from "./query/useExpense";
import InfiniteScroll from "../../myComponents/InfiniteScroll/InfiniteScroll";
import ExpenseCategoryCard from "./component/ExpenseCategoryCard";
import { myConsole } from "../../hooks/useConsole";
import HeaderCategoryExpense from "./Header/HeaderCategory";
import { routeExpense } from "../../utils/routes";
import { useNavigation } from "@react-navigation/native";
import { checkPermission } from "../../utils/commonFunctions";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { popUpConfToast } from "../../utils/toastModalByFunction";

export default function ExpenseCategoryList() {
  const individualIncentive = useGetExpenseCategoryList({
    search: "",
  });
  const { user } = useSelector(selectUser);
  const { data: permission = {} } = useGetUserPermission(user?._id);
  const canViewCat = checkPermission(
    permission,
    "Expenses",
    "viewCategory",
    user?.role
  );
  const { navigate } = useNavigation();
  return (
    <>
      <Header title={"Expense Category"} />
      <HeaderCategoryExpense />
      <Container>
        <InfiniteScroll
          query={individualIncentive}
          renderItems={({ item, index }) => {
            return (
              <ExpenseCategoryCard
                item={item}
                onPress={() => {
                  if (canViewCat) {
                    navigate(routeExpense.ExpenseCategoryDetail, { item });
                  } else {
                    popUpConfToast.errorMessage(
                      "You are not authorized to view expense category details."
                    );
                  }
                }}
              />
            );
          }}
        />
      </Container>
    </>
  );
}

const styles = StyleSheet.create({});
