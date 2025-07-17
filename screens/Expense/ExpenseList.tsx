import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useGetExpensesList } from "./query/useExpense";
import ExpenseCard from "./component/ExpenseCard";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import InfiniteScroll from "../../myComponents/InfiniteScroll/InfiniteScroll";
import { routeExpense } from "../../utils/routes";
import LeadPoolIcon from "../../assets/svg/LeadPoolIcon";
import TitleWithAddDelete from "../../myComponents/TitleWithAddDelete/TitleWithAddDelete";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";

const ExpenseList = () => {
  const nav = useNavigation();
  const { user } = useSelector(selectUser);
  const { data: permission = {} } = useGetUserPermission(user?._id);
  const expenseQuery = useGetExpensesList({ search: "" });
  const canAddExpense = checkPermission(
    permission,
    "Expenses",
    "add",
    user?.role
  );
  const canEditExpense = checkPermission(
    permission,
    "Expenses",
    "edit",
    user?.role
  );
  const canViewExpDetail = checkPermission(
    permission,
    "viewDExpensesetails",
    "viewDetails",
    user?.role
  );
  const canDeleteExp = checkPermission(
    permission,
    "Expenses",
    "delete",
    user?.role
  );
  const canAddCat = checkPermission(
    permission,
    "Expenses",
    "addCategory",
    user?.role
  );
  const canEditCat = checkPermission(
    permission,
    "Expenses",
    "editCategory",
    user?.role
  );
  const canDelCat = checkPermission(
    permission,
    "Expenses",
    "deleteCategory",
    user?.role
  );

  const canViewExpenses = checkPermission(
    permission,
    "Expenses",
    "view",
    user?.role
  );

  return (
    <>
      <Header title={"Expense List"} />
      <Container>
        <TitleWithAddDelete
          arrLength={0}
          title="Expense"
          onPressToNavigate={() => nav.navigate(routeExpense.ExpenseForm)}
        />
        {canViewExpenses && (
          <TouchableOpacity
            onPress={() => nav.navigate(routeExpense.ExpenseCategoryList)}
            activeOpacity={0.5}
            style={{
              position: "absolute",
              bottom: 100,
              right: 20,
              zIndex: 5,
            }}
          >
            <LeadPoolIcon width={60} height={60} />
          </TouchableOpacity>
        )}
        <InfiniteScroll
          query={expenseQuery}
          renderItems={({ item }) => (
            <ExpenseCard
              item={item}
              onPress={() => nav.navigate("ExpenseDetail", { item })}
            />
          )}
        />
      </Container>
    </>
  );
};

export default ExpenseList;

const styles = StyleSheet.create({});
