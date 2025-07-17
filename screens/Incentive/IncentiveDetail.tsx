import { useRoute } from "@react-navigation/native";
import moment from "moment";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Popup } from "react-native-popup-confirm-toast";
import Header from "../../components/Header";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomText from "../../myComponents/CustomText/CustomText";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import RowItem from "../../myComponents/RowItem/RowItem";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import { roleEnum, userTypes } from "../../utils/data";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { useGetIndividualIncentiveDetail } from "./query/useIncentive";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";

const IncentiveDetail = () => {
  const { params } = useRoute();
  const item = params?.item || {};
  const { data, refetch } = useGetIndividualIncentiveDetail({ id: item?._id });

  const { user } = useSelector(selectUser);
  const isSubSupSrMng =
    user?.role === roleEnum?.sub_admin ||
    user?.role === roleEnum?.sup_admin ||
    user?.role === roleEnum?.sr_manager;

  const renderNoData = () => (
    <CustomText style={styles.noDataText}>No Data</CustomText>
  );

  const renderPayCards = (bookings, title) => (
    <>
      <MainTitle title={title} containerStyle={styles.sectionTitle} />
      {bookings.length > 0
        ? bookings.map((el, i) => <PayCard key={i} item={el} />)
        : renderNoData()}
    </>
  );

  const renderPayDetails = () => (
    <>
      <MainTitle title="Pay Detail" containerStyle={styles.sectionTitle} />
      {data?.distributions?.length > 0
        ? data?.distributions?.map((el, i) => <PayDetail key={i} item={el} />)
        : renderNoData()}
    </>
  );

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

  return (
    <>
      <Header title="Incentive Detail" />
      <Container>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <MainTitle
              title="Detail"
              containerStyle={styles.mainTitle}
              icon={
                isSubSupSrMng ? <CustomBtn
                  title="Payout"
                  containerStyle={{ backgroundColor: "gray" }}
                  textStyle={{ fontSize: 14 }}
                  onPress={() => {
                    confirmPayout({
                      callback: () => {
                        handlePayout();
                        confirmPayout({
                          callback: () => console.log("first2"),
                          isLoading: true,
                        });
                      },
                      isLoading: false,
                    });
                  }}
                /> : <></>
              }
            />

            <RowItem
              title="Name"
              value={data?.userId?.name}
              containerStyle={styles.rowItem}
            />
            <RowItem
              title="Role"
              value={userTypes?.[data?.userId?.role]}
              containerStyle={styles.rowItem}
            />
            <RowItem
              title="Status"
              value={data?.status}
              containerStyle={styles.rowItem}
            />
            <RowItem
              title="Total Incentive"
              value={data?.totalIncentive || "0"}
              containerStyle={styles.rowItem}
            />
            <RowItem
              title="Paid Incentive"
              value={data?.paidIncentive || "0"}
              containerStyle={styles.rowItem}
            />
            <RowItem
              title="Total Revenue"
              value={data?.totalRevenue || "0"}
              containerStyle={styles.rowItem}
            />
            <RowItem
              title="Amount to be Pay"
              value={data?.totalIncentive - data?.paidIncentive || "0"}
              containerStyle={styles.rowItem}
            />

            <CustomText
              fontWeight="700"
              fontSize={19}
              color={color.saffronMango}
              style={styles.bookingDetailTitle}
            >
              Booking Detail
            </CustomText>

            {renderPayCards(data?.bookings || [], "Closed Booking")}
            {renderPayCards(data?.pendingBookings || [], "Pending Booking")}
            {renderPayDetails()}
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

const PayCard = ({ item }) => (
  <View style={styles.cardContainer}>
    <CustomText
      fontWeight="600"
      fontSize={18}
      color={color.saffronMango}
      style={styles.cardTitle}
    >
      Calculated
    </CustomText>
    <RowItem
      title="Lead Name"
      value={item?.bookingId?.clientName || "N/A"}
      containerStyle={styles.rowItem}
    />
    <RowItem
      title="Project Name"
      value={item?.bookingId?.projectName || "N/A"}
      containerStyle={styles.rowItem}
    />
    <RowItem
      title="Revenue"
      value={item?.revenue || "0"}
      containerStyle={styles.rowItem}
    />
    <TouchableOpacity style={styles.viewDetailsButton} activeOpacity={0.5}>
      <CustomText fontWeight="600" color={color.saffronMango}>
        View Details
      </CustomText>
    </TouchableOpacity>
  </View>
);

const PayDetail = ({ item }) => (
  <View style={styles.cardContainer}>
    <RowItem
      title="Amount"
      value={item?.amount || "0"}
      containerStyle={styles.rowItem}
    />
    <RowItem
      title="Date & Time"
      value={
        item?.createdAt ? moment(item?.createdAt).format("DD/MM/YYYY") : "N/A"
      }
      containerStyle={styles.rowItem}
    />
    <RowItem
      title="Paid By"
      value={item?.userId?.name || "N/A"}
      containerStyle={styles.rowItem}
    />
  </View>
);

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

export default IncentiveDetail;

const confirmPayout = ({ callback, isLoading }) => {
  Popup.show({
    type: "confirm",
    title: "Confirm!",
    textBody: "Are you sure do you want to payout!",
    buttonText: isLoading ? <ActivityIndicator color={"white"} /> : "Payout",
    confirmText: "Cancel",
    callback: callback,
    cancelCallback: () => {
      Popup.hide();
    },
    buttonContentStyle: {
      flexDirection: "row",
      gap: 20,
    },
    iconHeaderStyle: {
      marginBottom: -10,
    },
    okButtonStyle: { backgroundColor: "#DC7331" },
    confirmButtonStyle: { borderColor: "black", borderWidth: 1 },
  });
};
