import { useRoute } from "@react-navigation/native";
import moment from "moment";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Popup } from "react-native-popup-confirm-toast";
import { useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";

import Header from "../../components/Header";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomText from "../../myComponents/CustomText/CustomText";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import { roleEnum, userTypes } from "../../utils/data";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { useGetIndividualIncentiveDetail } from "./query/useIncentive";
import { selectUser } from "../../redux/userSlice";

const IncentiveDetail = () => {
  const { params } = useRoute();
  const item = params?.item || {};
  const { data, refetch } = useGetIndividualIncentiveDetail({
    id: item?._id,
  });

  const { user } = useSelector(selectUser);

  const isSubSupSrMng =
    user?.role === roleEnum?.sub_admin ||
    user?.role === roleEnum?.sup_admin ||
    user?.role === roleEnum?.sr_manager;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePayout = async () => {
    try {
      const res = await axiosInstance.post(
        `/api/incentive/payIncentive/${item?._id}`,
      );

      popUpConfToast.successMessage(res?.data || "Payout Successfully!");

      refetch();
    } catch (err) {
      myConsole("errPayout", err?.response?.data);

      popUpConfToast.errorMessage(
        err?.response?.data || "Something went wrong",
      );
    }
  };

  const DetailCard = ({ icon, title, value }: any) => (
    <View style={styles.detailCard}>
      <View style={styles.detailLeft}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={16} color="#2D67C6" />
        </View>

        <View>
          <CustomText style={styles.cardTitle}>{title}</CustomText>
          <CustomText style={styles.cardValue}>{value || "-"}</CustomText>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Header title="Incentive Detail" />

      <Container>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.content}>
            {/* Top Action */}
            {isSubSupSrMng &&
              data?.status !== "paid" &&
              data?.totalIncentive - data?.paidIncentive > 0 && (
                <CustomBtn
                  title="Payout Incentive"
                  containerStyle={styles.payBtn}
                  textStyle={styles.payBtnText}
                  onPress={() => {
                    confirmPayout({
                      callback: () => {
                        handlePayout();

                        confirmPayout({
                          callback: () => console.log("loading"),
                          isLoading: true,
                        });
                      },
                      isLoading: false,
                    });
                  }}
                />
              )}

            {/* Overview Section */}
            <CustomText style={styles.sectionHeading}>Overview</CustomText>

            <DetailCard
              icon="user"
              title="Employee Name"
              value={data?.userId?.name}
            />

            <DetailCard
              icon="briefcase"
              title="Role"
              value={userTypes?.[data?.userId?.role]}
            />

            <DetailCard
              icon="check-circle"
              title="Status"
              value={data?.status}
            />

            <DetailCard
              icon="gift"
              title="Total Incentive"
              value={`₹${data?.totalIncentive || 0}`}
            />

            <DetailCard
              icon="credit-card"
              title="Paid Incentive"
              value={`₹${data?.paidIncentive || 0}`}
            />

            <DetailCard
              icon="bar-chart-2"
              title="Total Revenue"
              value={`₹${data?.totalRevenue || 0}`}
            />

            <DetailCard
              icon="credit-card"
              title="Amount to be Paid"
              value={`₹${data?.totalIncentive - data?.paidIncentive || 0}`}
            />

            {/* Closed Booking */}
            <CustomText style={styles.sectionHeading}>
              Closed Bookings
            </CustomText>

            {data?.bookings?.length > 0 ? (
              data?.bookings?.map((el, i) => <BookingCard key={i} item={el} />)
            ) : (
              <EmptyCard />
            )}

            {/* Pending Booking */}
            <CustomText style={styles.sectionHeading}>
              Pending Bookings
            </CustomText>

            {data?.pendingBookings?.length > 0 ? (
              data?.pendingBookings?.map((el, i) => (
                <BookingCard key={i} item={el} />
              ))
            ) : (
              <EmptyCard />
            )}

            {/* Pay Details */}
            <CustomText style={styles.sectionHeading}>Pay Details</CustomText>

            {data?.distributions?.length > 0 ? (
              data?.distributions?.map((el, i) => (
                <PayDetailCard key={i} item={el} />
              ))
            ) : (
              <EmptyCard />
            )}
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

const BookingCard = ({ item }: any) => (
  <View style={styles.bookingCard}>
    <DetailItem
      icon="user"
      label="Lead Name"
      value={item?.bookingId?.clientName || "N/A"}
    />

    <DetailItem
      icon="home"
      label="Project Name"
      value={item?.bookingId?.projectName || "N/A"}
    />

    <DetailItem
      icon="dollar-sign"
      label="Revenue"
      value={`₹${item?.revenue || 0}`}
    />
  </View>
);

const PayDetailCard = ({ item }: any) => (
  <View style={styles.bookingCard}>
    <DetailItem
      icon="credit-card"
      label="Amount"
      value={`₹${item?.amount || 0}`}
    />

    <DetailItem
      icon="calendar"
      label="Date"
      value={
        item?.createdAt ? moment(item?.createdAt).format("DD MMM YYYY") : "N/A"
      }
    />

    <DetailItem
      icon="user-check"
      label="Paid By"
      value={item?.userId?.name || "N/A"}
    />
  </View>
);

const DetailItem = ({ icon, label, value }: any) => (
  <View style={styles.detailItem}>
    <View style={styles.itemLeft}>
      <Feather name={icon} size={15} color="#2D67C6" />
      <CustomText style={styles.itemLabel}>{label}</CustomText>
    </View>

    <CustomText style={styles.itemValue}>{value || "-"}</CustomText>
  </View>
);

const EmptyCard = () => (
  <View style={styles.emptyBox}>
    <CustomText style={styles.emptyText}>No Data Found</CustomText>
  </View>
);

export default IncentiveDetail;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },

  content: {
    padding: 16,
  },

  payBtn: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#2D67C6",
  },

  payBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },

  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    marginTop: 18,
  },

  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },

  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    backgroundColor: "#EEF4FF",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 12,
    color: "#64748B",
  },

  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2,
  },

  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },

  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  itemLabel: {
    fontSize: 13,
    color: "#64748B",
  },

  itemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: color.mainTxtColor,
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});

const confirmPayout = ({ callback, isLoading }: any) => {
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
    okButtonStyle: {
      backgroundColor: "#2D67C6",
    },
    confirmButtonStyle: {
      borderColor: "#CBD5E1",
      borderWidth: 1,
    },
  });
};
