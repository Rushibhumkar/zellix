import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useState } from "react";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { useRoute } from "@react-navigation/native";
import { useGetInvoiceDetail } from "./query/useInvoice";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import moment from "moment";
import CustomText from "../../myComponents/CustomText/CustomText";
import { Feather } from "@expo/vector-icons";
import { color } from "../../const/color";
import CustomModalInvoice from "./component/ReceivedPopup";
import * as Linking from "expo-linking";
import { iconWrapperStyle } from "../../const/globalStyle";
import { myConsole } from "../../hooks/useConsole";

const InvoiceDetail = () => {
  const { params } = useRoute();
  const item = params?.item || {};
  const { data: mdata, refetch } = useGetInvoiceDetail({ id: item?._id });
  const data = mdata?.data;

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadInvoice = async () => {
    const url = data?.receipt?.[0];

    if (!url) return;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };
  myConsole("dataaaaaa", data);
  const InfoRow = ({ icon, label, value }: any) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Feather name={icon} size={16} color="#2D67C6" />
        <CustomText style={styles.label}>{label}</CustomText>
      </View>
      <CustomText style={styles.value}>{value || "-"}</CustomText>
    </View>
  );

  return (
    <Container>
      <Header
        title={"Invoice Details"}
        rightSide={
          data?.receipt?.length > 0 && (
            <Pressable
              onPress={handleDownloadInvoice}
              style={{ ...iconWrapperStyle, padding: 6 }}
            >
              <Feather name="external-link" size={20} color="#fff" />
            </Pressable>
          )
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Card */}
          <View style={styles.card}>
            <InfoRow icon="user" label="Client" value={data?.clientName} />
            <InfoRow
              icon="users"
              label="Developer"
              value={data?.developer?.name || "N/A"}
            />
            <InfoRow icon="hash" label="Invoice No" value={data?.invoiceNo} />
            <InfoRow
              icon="calendar"
              label="Sale Date"
              value={
                data?.saleDate
                  ? moment(data?.saleDate).format("DD MMM YYYY")
                  : "-"
              }
            />
            <InfoRow
              icon="dollar-sign"
              label="Unit Price"
              value={`₹${data?.unitPrice || 0}`}
            />
            <InfoRow
              icon="briefcase"
              label="Company Commission"
              value={`₹${data?.companyCommission || 0}`}
            />
            <InfoRow
              icon="percent"
              label="VAT %"
              value={`${data?.vatPercent || 0}%`}
            />
            <InfoRow
              icon="trending-up"
              label="VAT Amount"
              value={`₹${data?.vatAmount || 0}`}
            />
            <InfoRow
              icon="file-text"
              label="Excl. VAT"
              value={`₹${data?.totalExcludedVat || 0}`}
            />
            <InfoRow
              icon="layers"
              label="Incl. VAT"
              value={`₹${data?.totalIncludedVat || 0}`}
            />
          </View>
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
    padding: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginTop: 10,
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
