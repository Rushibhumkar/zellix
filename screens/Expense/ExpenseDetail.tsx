import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGetExpensesDetail } from "./query/useExpense";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import { routeExpense } from "../../utils/routes";
import moment from "moment";
import CustomText from "../../myComponents/CustomText/CustomText";
import { Feather } from "@expo/vector-icons";
import { color } from "../../const/color";
import IconWrapper from "../../components/IconWrapper";
import { iconWrapperStyle } from "../../const/globalStyle";

const ExpenseDetail = () => {
  const { navigate } = useNavigation();
  const { params } = useRoute();
  const item = params?.item;
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, isLoading, refetch } = useGetExpensesDetail({
    id: item?._id,
  });

  const expense = data?.data || {};

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Feather name={icon} size={16} color="#2D67C6" />
        <CustomText style={styles.label}>{label}</CustomText>
      </View>
      <CustomText style={styles.value}>{value || "-"}</CustomText>
    </View>
  );

  return (
    <>
      <Header
        title={"Expense Detail"}
        rightSide={
          <Pressable
            onPress={() =>
              navigate(routeExpense.ExpenseForm, {
                item: expense,
              })
            }
            style={{
              ...iconWrapperStyle,
            }}
          >
            <Feather name="edit-2" size={18} color="#fff" />
          </Pressable>
        }
      />
      <Container>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={color.mainTxtColor}
            />
          }
        >
          <View style={styles.container}>
            {/* Card */}
            <View style={styles.card}>
              <InfoRow
                icon="tag"
                label="Category"
                value={expense?.expenseCategory?.name}
              />
              <InfoRow
                icon="layers"
                label="Sub Category"
                value={expense?.expenseSubCategory?.name}
              />
              <InfoRow
                icon="calendar"
                label="Created Date"
                value={moment(expense?.createdAt).format("DD MMM YYYY")}
              />
              <InfoRow icon="home" label="Office" value={expense?.officeName} />
              <InfoRow
                icon="credit-card"
                label="Amount"
                value={`₹${expense?.expenseAmount || 0}`}
              />
              <InfoRow
                icon="percent"
                label="VAT %"
                value={`${expense?.vatPercent || 0}%`}
              />
              <InfoRow
                icon="trending-up"
                label="VAT Amount"
                value={`₹${expense?.vatAmount?.toFixed(2) || 0}`}
              />
              <InfoRow
                icon="file-text"
                label="Excl. VAT"
                value={`₹${expense?.amountExcludedVat?.toFixed(2) || 0}`}
              />
              <InfoRow icon="users" label="Team" value={expense?.team?.name} />
            </View>
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

export default ExpenseDetail;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  label: {
    fontSize: 13,
    color: "#64748B",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
});
