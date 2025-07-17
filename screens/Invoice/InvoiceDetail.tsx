import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { Popup } from "react-native-popup-confirm-toast";
import { ActivityIndicator } from "react-native-paper";
import RowItem from "../../myComponents/RowItem/RowItem";
import CustomText from "../../myComponents/CustomText/CustomText";
import { useRoute } from "@react-navigation/native";
import { useGetInvoiceDetail } from "./query/useInvoice";
import MainTitle from "../../myComponents/MainTitle/MainTitle";

import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";

import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import moment from "moment";
import CustomModalInvoice from "./component/ReceivedPopup";

const InvoiceDetail = () => {
  const { params } = useRoute();
  const item = params?.item || {};
  const { data: mdata, refetch } = useGetInvoiceDetail({ id: item?._id });
  const data = mdata?.data;

  const handlePayout = async () => {
    try {
      const res = await axiosInstance.post(
        `/api/incentive/payIncentive/${item?._id}`
      );
      popUpConfToast.successMessage(res?.data || "Payout Successfully!");
      refetch();
    } catch (err) {
      myConsole("errPayout", err?.response?.data);
      popUpConfToast.errorMessage(
        err?.response?.data || "Something went wrong"
      );
    }
    // finally {
    //     Popup.hide();
    // }
  };

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <Container>
      <Header title={"Invoice Details"} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <MainTitle
            title="Details"
            containerStyle={styles.mainTitle}
            icon={
              <View style={{ flexDirection: "row", gap: 20 }}>
                {/* <CustomBtn
                  title="Download"
                  containerStyle={{ backgroundColor: "#00A4D6" }}
                  textStyle={{ fontSize: 14 }}
                /> */}
                {/* <CustomBtn
                  title="Received"
                  containerStyle={{ backgroundColor: "#1FA016" }}
                  textStyle={{ fontSize: 14 }}
                  onPress={() => setModalVisible(true)}
                /> */}
              </View>
            }
          />

          <RowItem
            title="Client Name"
            value={data?.clientName}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Developer Name"
            value={data?.developer?.name || "N/A"}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Invoice Number"
            value={data?.invoiceNo}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Sale Date"
            value={
              data?.saleDate
                ? moment(item?.createdAt).format("DD/MM/YYYY")
                : "0"
            }
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Unit Price"
            value={data?.unitPrice || "0"}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Company Commission"
            value={data?.companyCommission || "0"}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Vat%"
            value={`${data?.vatPercent} %` || "0"}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Vat Amount"
            value={data?.vatAmount || "0"}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Vat Amount Excluded"
            value={data?.totalExcludedVat || "0"}
            containerStyle={styles.rowItem}
          />
          <RowItem
            title="Vat Amount Included"
            value={data?.totalIncludedVat || "0"}
            containerStyle={styles.rowItem}
          />
        </View>
        <CustomModalInvoice
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Invoice Payment"
          invoiceId={item?._id}
        />
      </ScrollView>
    </Container>
  );
};

export default InvoiceDetail;

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
