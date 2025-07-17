import {
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import moment from "moment";

import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import CustomText from "../../myComponents/CustomText/CustomText";
import RowItemDetail from "../../myComponentsHRM/Row/RowItemDetail";
import ImageViewModal from "../../myComponentsHRM/ImageViewModal/ImageViewModal";
import { useGetReferralById } from "./useQuery/useReferral";
import { myConsole } from "../../hooks/useConsole";
import { color } from "../../const/color";
import { updateReferralStatus } from "../../services/rootApi/referralApi";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { queryClient } from "../../App";
import { useQueryClient } from "@tanstack/react-query";

const ReferralDetails = () => {
  const route = useRoute();
  const { item } = route.params;
  const { _id } = item;
  const { navigate, goBack } = useNavigation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } =
    useGetReferralById(_id);

  // const onRefresh = () => {
  //   setRefreshing(true);
  //   refetch;
  //   setRefreshing(false);
  // };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <CustomText>No referral data found.</CustomText>
      </View>
    );
  }

  const referral = data;

  const referralDetails = [
    { title: "Client Name", value: referral?.clientName },
    { title: "Email", value: referral?.email },
    { title: "Phone", value: referral?.mobile },
    { title: "Passport Number", value: referral?.passportNumber },
    { title: "EID", value: referral?.eidNumber },
    { title: "Nationality", value: referral?.nationality },
    { title: "Address", value: referral?.address },
    { title: "Project Name", value: referral?.projectNumber },
    { title: "Unit Name", value: referral?.unitName },
    { title: "Developer Name", value: referral?.developerName },
    {
      title: "Referral Amount",
      value: referral?.referralAmount ? `${referral?.referralAmount} ₹` : "-",
    },
    { title: "Status", value: referral?.status },

    {
      title: "Created On",
      value: referral?.createdAt,
      isDate: true,
    },
    {
      title: "Attachments",
      key: "attachments",
      value: [
        ...(referral?.passportDocument &&
        referral.passportDocument.startsWith("http")
          ? [referral.passportDocument]
          : []),
        ...(referral?.visaDocument && referral.visaDocument.startsWith("http")
          ? [referral.visaDocument]
          : []),
        ...(referral?.eidDocument && referral.eidDocument.startsWith("http")
          ? [referral.eidDocument]
          : []),
      ],
    },
  ];

  clickOnConfirm: async () => {
    await updateReferralStatus({
      refferal_id: referral._id,
      status: "Paid",
    });
    refetch?.();
  };

  return (
    <Container>
      <Header title="Referral Details" />
      <View style={{ padding: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <MainTitle
            title="Referral Details"
            containerStyle={{ marginBottom: 20 }}
          />
          {referral?.status === "unPaid" && (
            <TouchableOpacity
              style={styles.payoutBtn}
              activeOpacity={0.6}
              onPress={() =>
                popUpConfToast.confirmModal({
                  message:
                    "Are you sure you want to mark this referral as Paid?",
                  clickOnConfirm: async () => {
                    await updateReferralStatus({
                      refferal_id: referral._id,
                      status: "Paid",
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["getReferralById"],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["getAllReferrals"],
                    });
                    refetch?.();
                    goBack();
                  },
                })
              }
            >
              <CustomText style={{ fontSize: 16 }}>Payout</CustomText>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={referralDetails}
          renderItem={({ item }) => (
            <RowItemDetail
              title={item?.title}
              value={item?.value}
              isDate={item?.isDate}
              containerStyle={{ marginBottom: 14 }}
              component={
                item?.key === "attachments" &&
                item?.value?.length > 0 && (
                  <ImageViewModal imagesUri={item.value} />
                )
              }
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          // refreshControl={
          //   <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
          // }
          ListFooterComponent={<View style={{ height: 50 }} />}
        />
      </View>
    </Container>
  );
};

export default ReferralDetails;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  payoutBtn: {
    marginBottom: 18,
    backgroundColor: color.placeholderGrey,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
