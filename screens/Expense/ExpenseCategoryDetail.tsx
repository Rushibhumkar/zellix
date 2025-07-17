import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { Popup } from "react-native-popup-confirm-toast";
import { ActivityIndicator } from "react-native-paper";
import RowItem from "../../myComponents/RowItem/RowItem";
import CustomText from "../../myComponents/CustomText/CustomText";
import { useRoute } from "@react-navigation/native";

import MainTitle from "../../myComponents/MainTitle/MainTitle";

import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";

import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import moment from "moment";
import CustomModalInvoice from "../Invoice/component/ReceivedPopup";
import { useGetExpenseCategoryDetail } from "./query/useExpense";

const ExpenseCategoryDetail = () => {
  const { params } = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const item = params?.item || {};
  const { data: mdata, refetch } = useGetExpenseCategoryDetail({
    id: item?._id,
  });
  const data = mdata?.data;

  return (
    <Container>
      <Header title={"Expense Category Details"} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <MainTitle title="Details" containerStyle={styles.mainTitle} />

          <RowItem
            title="Category Name"
            value={data?.CategoryName}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Sub Category"
            value={
              data?.subCategory?.map((sub) => sub.subCategoryName).join(", ") ||
              "N/A"
            }
            containerStyle={styles.rowItem}
          />
        </View>
        <CustomModalInvoice
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Invoice Payment"
          //     invoiceId={item?._id}
        />
      </ScrollView>
    </Container>
  );
};

export default ExpenseCategoryDetail;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 50,
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    marginBottom: 15,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  rowItem: {
    marginBottom: 10,
  },
  bookingDetailTitle: {
    marginBottom: 20,
  },
  cardContainer: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    marginBottom: 10,
  },
  viewDetailsButton: {
    alignSelf: "flex-end",
  },
  noDataText: {
    marginLeft: 100,
    marginBottom: 20,
  },
});
