import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGetExpensesDetail } from "./query/useExpense";
import { myConsole } from "../../hooks/useConsole";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import RowItem from "../../myComponents/RowItem/RowItem";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import { routeExpense } from "../../utils/routes";
import EditIcon from "../../assets/svg/EditIcon";
import moment from "moment";

const ExpenseDetail = () => {
  const nav = useNavigation();
  const { params } = useRoute();
  const item = params?.item;
  const { data, isLoading } = useGetExpensesDetail({ id: item?._id });
  const expense = data?.data || {};
  return (
    <>
      <Header title={"Expense Detail"} />
      <Container>
        <ScrollView>
          <View
            style={{
              padding: 20,
              paddingBottom: 100,
            }}
          >
            <MainTitle
              title="Detail"
              containerStyle={{ marginBottom: 20 }}
              icon={
                <Pressable
                  onPress={() =>
                    nav.navigate(routeExpense.ExpenseForm, { item: data?.data })
                  }
                  style={{ padding: 5, paddingRight: 0 }}
                >
                  {/* <EditIcon /> */}
                </Pressable>
              }
            />
            <RowItem
              title="Expense Category"
              value={expense?.expenseCategory?.name}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Creation Date"
              value={moment(expense?.createdAt).format("DD/MM/YYYY")}
              containerStyle={{ marginBottom: 10 }}
            />

            <RowItem
              title="Expense Sub Category"
              value={expense?.expenseSubCategory?.name}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Office Name"
              value={expense?.officeName}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Expense Amount"
              value={expense?.expenseAmount}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="VAT Percent"
              value={`${expense?.vatPercent} %`}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="VAT Amount"
              value={expense?.vatAmount?.toFixed(2)}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="VAT Amount Excluded"
              value={expense?.amountExcludedVat?.toFixed(2)}
              containerStyle={{ marginBottom: 10 }}
            />
            <RowItem
              title="Team Name"
              value={expense?.team?.name}
              containerStyle={{ marginBottom: 10 }}
            />
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

export default ExpenseDetail;

const styles = StyleSheet.create({});
