import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as MailComposer from "expo-mail-composer";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import RowItem from "../../myComponents/RowItem/RowItem";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { color } from "../../const/color";
import * as Linking from "expo-linking";
import { useNavigation, useRoute } from "@react-navigation/native";
import { myConsole } from "../../hooks/useConsole";
import { leadTypeObj } from "../../utils/data";
import {
  approvedBooking,
  rejectBooking,
  updateCase,
} from "../../services/rootApi/bookingApi";
import { useDispatch, useSelector } from "react-redux";
import { getAllBookingFunc } from "../../redux/action";
import { selectUser, setCallDetect } from "../../redux/userSlice";
import { developerOptions, roleEnum, statusEnum } from "../../utils/data";
import EditIcon from "../../assets/svg/EditIcon";
import { routeBooking } from "../../utils/routes";
import CustomText from "../../myComponents/CustomText/CustomText";
import ImgViewer from "../../myComponents/ImgViewer/ImgViewer";
import { bookingEntryStatusObj } from "../../utils/data";
import CustomModal from "../../myComponents/CustomModal/CustomModal";
import { WIDTH } from "../../const/deviceInfo";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import ExpoImagePicker from "../../myComponents/ExpoImagePicker/ExpoImagePicker";
import { Ionicons } from "@expo/vector-icons";
import mime from "mime";
import moment from "moment";
import {
  useGetBookingById,
  useGetDeveloperList,
} from "../../hooks/useCRMgetQuerry";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyCRM } from "../../utils/queryKeys";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import Payout from "./component/Payout";
import { shadow1 } from "../../const/globalStyle";
import useModal from "../../hooks/useModal";
import ThreeDotVerSvg from "../../assets/svg/ThreeDotVerSvg";
import { checkPermission } from "../../utils/commonFunctions";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";

const approvalStatus = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const approvalStatusColor = {
  approved: color.green,
  rejected: "red",
  pending: "rgb(242,146,57)",
};

const paymentStatusObj = {
  not_received: "Not Received",
  received: "Received",
  pending: "Pending",
};

const inputStatusKey = {
  reject_timeout: "Reject timeout",
  awaiting_documents: "Awaiting documents",
  Executed: "executed",
  awaiting_token_payment: "Awaiting token payment",
  buyer_confirmation: "Buyer confirmation",
  spa_signed: "Spa signed",
  rejected: "Rejected",
};

const BookingDetail = () => {
  const queryClient = useQueryClient();
  const { params } = useRoute();
  const { navigate, goBack } = useNavigation();
  // const data = params?.item ?? null;
  const [isApproveExecuted, setisApproveExecuted] = useState(false);
  const { data, isLoading } = useGetBookingById(params?.item?._id);
  const dispatch = useDispatch();
  const { user, lead, allUsers } = useSelector(selectUser);
  // const filterLead = lead.find((lead) => lead._id === data?.meeting?.lead);
  // const filterLead = data?.lead || {};
  const [filterLead, setFilterLead] = useState({}); //
  const { data: developerList, isLoading: loadingDev } = useGetDeveloperList(
    data?.developer
  );
  useEffect(() => {
    let temp = {
      name: data?.name || data?.lead?.name || "NA",
      clientName: data?.clientName || data?.lead?.clientName || "NA",
      clientEmail: data?.clientEmail || data?.lead?.clientEmail || "NA",
      clientMobile: data?.clientMobile || data?.lead?.clientMobile || "NA",
      comments: data?.comments || data?.lead?.comments || "NA",
      type: data?.type || data?.lead?.type || "NA",
      whatsapp: data?.whatsapp || data?.lead?.whatsapp || "NA",
    };
    setFilterLead(temp);
    data?.inputStatus &&
      setisApproveExecuted((prev) => {
        return data?.inputStatus === "executed" ? true : false;
      });
  }, [data]);

  const developerObj = {};
  developerOptions.forEach((el) => (developerObj[el?._id] = el?.name));

  const [isHideBtn, setIsHideBtn] = useState(true);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isMailAvail, setIsMailAvail] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [appRejRemarks, setAppRejRemarks] = useState("");
  const [modalApproveReject, setModalApproveReject] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"approve" | "reject">(
    null
  );
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isModalUpdateCase, setIsModalUpdateCase] = useState(false);
  const [updateCaseData, setUpdateCaseData] = useState({
    remarks: "",
    file: {},
  });
  const [updateCaseLoading, setUpdateCaseLoading] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState({});
  const ownerInfoModal = useModal();
  const { data: permission = {} } = useGetUserPermission(user?._id);
  const canUpdateBooking = checkPermission(
    permission,
    "Bookings",
    "update",
    user?.role
  );

  const canApproveRejectBooking = checkPermission(
    permission,
    "Bookings",
    "approveReject",
    user?.role
  );
  const canChangePaymentStatus = checkPermission(
    permission,
    "Bookings",
    "changePaymentStatus",
    user?.role
  );

  const isUpdateBooking =
    user?.role === roleEnum?.sup_admin ||
    ((data?.createdBy === user?._id ||
      user?.role === roleEnum?.sub_admin ||
      user?.role === roleEnum?.sr_manager) &&
      data?.status !== statusEnum.approved);

  const handleAcceptRejectBooking = async (key: "approve" | "reject") => {
    setIsLoadingStatus(true);
    try {
      if (key === "reject") {
        let a = await rejectBooking(data?._id, { remarks: appRejRemarks });
        await dispatch(getAllBookingFunc());
        setIsHideBtn(false);
      }
      if (key === "approve") {
        let a = await approvedBooking(data?._id, { remarks: appRejRemarks });
        await dispatch(getAllBookingFunc());
        setIsHideBtn(false);
      }
    } catch (err) {
      myConsole("err HandleAcceptRejectBooking", err);
    } finally {
      // setIsLoadingReject(false);
      // setIsLoadingApprove(false);
      setIsLoadingStatus(false);
      goBack();
    }
  };

  const openMail = (mailAddress) => {
    MailComposer.composeAsync({
      recipients: [`${mailAddress}`],
    });
  };

  useEffect(() => {
    async function checkAvailabilityMail() {
      let isMailAvailTemp = await MailComposer.isAvailableAsync();
      setIsMailAvail(isMailAvailTemp);
    }
    checkAvailabilityMail();
  }, []);

  const toggleModalApproveReject = (status) => {
    setModalApproveReject((prev) => !prev);
    setSelectedStatus(status);
  };

  const toggleIsModalUpdateCase = () => {
    setIsModalUpdateCase(!isModalUpdateCase);
    setUpdateCaseData({ file: {}, remarks: "" });
  };

  const submitUpdateCase = async () => {
    setUpdateCaseLoading(true);
    let formData = new FormData();
    let ios = Platform.OS === "ios";
    let { file, remarks } = updateCaseData;
    formData.append("remarks", remarks);
    if (!!file?.uri) {
      formData.append("caseFile", {
        uri: ios ? file?.uri : file?.uri,
        type: ios ? file?.type : mime.getType(file?.uri),
        name: ios ? file?.fileName : file?.uri?.split("/").pop(),
      });
    }
    try {
      let a = await updateCase(data?._id, formData);
      // await dispatch(getAllBookingFunc());
      // navigate(routeBooking.allBookings)
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getBookingById, data?._id],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getBooking],
      });
    } catch (err) {
      console.log("err in update case", err);
    } finally {
      setIsModalUpdateCase(false);
      setUpdateCaseLoading(false);
    }
  };
  const navToCall = async () => {
    await dispatch(
      setCallDetect({
        isCall: true,
        leadId: data?.lead,
      })
    );
    await Linking.openURL(`tel:+${filterLead?.clientMobile}`);
  };

  // myConsole("ownerInfo.passport1", ownerInfo.passport1);
  // myConsole("dataaadsdfdsf", data);
  return (
    <>
      <Header title={"Booking Details"} />
      <Container>
        <ScrollView>
          <View style={{ padding: 20, paddingBottom: 100 }}>
            {isLoading && <ActivityIndicator />}
            <>
              {data?.ownerShipDetails?.length > 0 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <MainTitle
                      title="Ownership Detail"
                      containerStyle={{ marginBottom: 20 }}
                    />
                    <TouchableOpacity
                      style={{
                        marginBottom: 16,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                      }}
                      activeOpacity={0.6}
                      onPress={() => setShowPopup(!showPopup)}
                    >
                      <ThreeDotVerSvg />
                    </TouchableOpacity>
                    <CustomModal
                      visible={showPopup}
                      onClose={() => setShowPopup(false)} // Close the modal on close
                      hasBackdrop={true}
                    >
                      <View style={styles.modalContent}>
                        <TouchableOpacity
                          style={styles.modalOption}
                          onPress={() => {
                            navigate("ReferralNavigator", {
                              screen: "AddReferrals",
                              params: { data: data, type: "clientLoyality" },
                            }),
                              setShowPopup(false);
                          }}
                        >
                          <Text style={styles.modalText}>
                            Pay Client Loyalty
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.modalOption}
                          onPress={() => {
                            navigate("ReferralNavigator", {
                              screen: "AddReferrals",
                              params: { data: data, type: "bookingRefferal" },
                            }),
                              setShowPopup(false);
                          }}
                        >
                          <Text style={styles.modalText}>
                            Pay Booking Referral
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </CustomModal>
                  </View>
                  {data?.ownerShipDetails?.map((el, i) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setOwnerInfo(el);
                          ownerInfoModal.openModal();
                        }}
                        key={i}
                        activeOpacity={0.8}
                        style={{
                          padding: 10,
                          backgroundColor: "white",
                          borderRadius: 5,
                          ...shadow1,
                          marginBottom: 15,
                        }}
                      >
                        <CustomText fontSize={16} fontWeight="500">
                          Client Info 1
                        </CustomText>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              <MainTitle
                title="Other Details"
                containerStyle={{ marginBottom: 20 }}
                icon={
                  canUpdateBooking ? (
                    <TouchableOpacity
                      style={{ padding: 5 }}
                      onPress={() =>
                        navigate(routeBooking?.DeveloperInformation, { data })
                      }
                    >
                      <EditIcon />
                    </TouchableOpacity>
                  ) : (
                    <></>
                  )
                }
              />
              <RowItem
                title="Source"
                value={filterLead?.name ?? "N/A"}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Client Name"
                value={filterLead?.clientName ?? "N/A"}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Mobile Number"
                component={
                  filterLead?.clientMobile ? (
                    <TouchableOpacity
                      onPress={() =>
                        // Linking.openURL(`tel:${filterLead?.clientMobile}`)
                        navToCall()
                      }
                    >
                      <Text>{filterLead?.clientMobile}</Text>
                    </TouchableOpacity>
                  ) : (
                    <CustomText>{"N/A"}</CustomText>
                  )
                }
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Email Address"
                component={
                  filterLead?.clientEmail ? (
                    <TouchableOpacity
                      onPress={() =>
                        isMailAvail ? openMail(filterLead?.clientEmail) : null
                      }
                    >
                      <Text numberOfLines={1}>{filterLead?.clientEmail}</Text>
                    </TouchableOpacity>
                  ) : (
                    <CustomText>{"N/A"}</CustomText>
                  )
                }
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Whatsapp Link"
                icon={filterLead?.whatsapp ? "whatsapp" : "n/a"}
                containerStyle={{ marginBottom: 10 }}
                onPressIcon={() =>
                  filterLead?.whatsapp
                    ? Linking.openURL(`${filterLead?.whatsapp}`)
                    : null
                }
              />
              <RowItem
                title="Date Of Birth"
                value={
                  data?.dateOfBirth
                    ? moment(data?.dateOfBirth).format("DD/MM/YYYY")
                    : "N/A"
                }
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Type Of Property"
                value={data?.typeOfProperty ?? "N/A"}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Type"
                value={leadTypeObj[filterLead?.type] ?? "N/A"}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Comments"
                value={filterLead?.comments ?? "N/A"}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Approval Status"
                containerStyle={{ marginBottom: 15 }}
                // value={data?.status ?? "N/A"}
                component={
                  <CustomText color={approvalStatusColor[data?.status]}>
                    {approvalStatus[data?.status] ?? "N/A"}
                  </CustomText>
                }
              />
              <RowItem title="Ownership" value={data?.ownership ?? "N/A"} />
              {data?.remarks && (
                <RowItem
                  title="Remarks"
                  containerStyle={{ marginBottom: 15 }}
                  // value={data?.status ?? "N/A"}
                  component={<CustomText>{data?.remarks}</CustomText>}
                />
              )}
              {data?.paymentProofArr?.length > 0 &&
                data?.paymentProofArr?.map((el, i) => {
                  return (
                    <RowItem
                      key={i}
                      title="Payment Proof"
                      containerStyle={{ marginBottom: 10 }}
                      component={<ImgViewer uri={`${el}`} />}
                      // onPressIcon={() => Linking.openURL(`${filterLead?.passport}`)}
                    />
                  );
                })}
              {data?.otherDocs?.length > 0 &&
                data?.otherDocs?.map((el, i) => {
                  return (
                    <RowItem
                      key={i}
                      title="Other Docs"
                      containerStyle={{ marginBottom: 10 }}
                      component={<ImgViewer uri={`${el}`} />}
                      // onPressIcon={() => Linking.openURL(`${filterLead?.passport}`)}
                    />
                  );
                })}

              {data?.passport && (
                <RowItem
                  title="Client Passport"
                  containerStyle={{ marginBottom: 10 }}
                  component={<ImgViewer uri={`${data?.passport}`} />}
                  // onPressIcon={() => Linking.openURL(`${filterLead?.passport}`)}
                />
              )}
              {data?.passport2 && (
                <RowItem
                  title="Client Passport 2"
                  containerStyle={{ marginBottom: 10 }}
                  component={<ImgViewer uri={`${data?.passport2}`} />}
                  // onPressIcon={() => Linking.openURL(`${filterLead?.passport}`)}
                />
              )}
              {data?.passportNumber && (
                <RowItem
                  title="Passport Number"
                  containerStyle={{ marginBottom: 10 }}
                  component={<CustomText>{data?.passportNumber}</CustomText>}
                />
              )}
              {data?.address && (
                <RowItem
                  title="Address"
                  containerStyle={{ marginBottom: 10 }}
                  component={<CustomText>{data?.address}</CustomText>}
                />
              )}
              {data?.emiratesID && (
                <RowItem
                  title="Client ID"
                  value="Maxini"
                  containerStyle={{ marginBottom: 10 }}
                  component={<ImgViewer uri={`${data?.emiratesID}`} />}
                />
              )}
              {data?.emiratesID2 && (
                <RowItem
                  title="Client ID 2"
                  value="Maxini"
                  containerStyle={{ marginBottom: 10 }}
                  component={<ImgViewer uri={`${data?.emiratesID2}`} />}
                />
              )}
              {data?.visa && (
                <RowItem
                  title="Client Visa"
                  value="Maxini"
                  containerStyle={{ marginBottom: 30 }}
                  component={<ImgViewer uri={`${data?.visa}`} />}
                />
              )}
              {data?.visa2 && (
                <RowItem
                  title="Client Visa 2"
                  value="Maxini"
                  containerStyle={{ marginBottom: 30 }}
                  component={<ImgViewer uri={`${data?.visa2}`} />}
                />
              )}
              {data?.paymentProof && (
                <RowItem
                  title="payment Proof"
                  value="Maxini"
                  containerStyle={{ marginBottom: 30 }}
                  component={<ImgViewer uri={`${data?.paymentProof}`} />}
                />
              )}
              {data?.paymentProof2 && (
                <RowItem
                  title="payment Proof2"
                  value="Maxini"
                  containerStyle={{ marginBottom: 10 }}
                  component={<ImgViewer uri={`${data?.paymentProof2}`} />}
                />
              )}
            </>

            {/* unit details */}
            <>
              <MainTitle
                title="Unit Details"
                containerStyle={{ marginVertical: 20 }}
              />
              <RowItem
                title="Developer Name"
                // value={developerList?.name}
                // value={developerList?.find((el) => el._id === data?.developer)?.name}
                value={data?.developer?.name || "N/A"}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Relationship Manager"
                value={data?.relationshipManager}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Project Name"
                value={data?.projectName}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Unit Number"
                value={data?.unit}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Area SQFT"
                value={data?.areaSQFT}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Total Price"
                value={data?.total}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Booking Details"
                value={data?.propertyDetails}
                containerStyle={{ marginBottom: 10 }}
              />
            </>
            <>
              <MainTitle
                title="Entry Status"
                containerStyle={{ marginVertical: 20 }}
              />
              <RowItem
                title="Status"
                value={
                  bookingEntryStatusObj[data?.inputStatus?.toString()] ?? "N/A"
                }
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Payment Status"
                value={
                  !!data?.paymentStatus
                    ? paymentStatusObj[data?.paymentStatus]
                    : "N/A"
                }
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Remarks"
                value={data?.remarks?.toString()}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Business Status"
                value={data?.businessStatus ?? "N/A"}
                containerStyle={{ marginBottom: 10 }}
              />
            </>

            {/* Payment Details */}
            <>
              <MainTitle
                title="Payment Details"
                containerStyle={{ marginVertical: 20 }}
              />
              <RowItem
                title="Payment Plan"
                value={data?.paymentPlan ?? ""}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Mode of Payment"
                value={data?.paymentMode ?? ""}
                containerStyle={{ marginBottom: 10 }}
              />
              {/* all good */}
              <RowItem
                title="Token Paid"
                value={data?.token ? "Paid" : "UnPaid"}
                containerStyle={{ marginBottom: 10 }}
              />
              {/* rest */}
              <RowItem
                title="Booking Amount"
                value={data?.bookingAmount?.toString()}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Client Loyalty"
                value={data?.clientLoyalty?.toString() ?? "0"}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Broker Referral"
                value={data?.brokerReferral?.toString() ?? "0"}
                containerStyle={{ marginBottom: 10 }}
              />
              {/* <RowItem
                title="Proof of Payment"
                value="N/A"
                containerStyle={{ marginBottom: 10 }}
                onPressIcon={() => Linking.openURL(`${data?.paymentProof}`)}
              /> */}
            </>

            <>
              <MainTitle
                title="Commission Information"
                containerStyle={{ marginVertical: 20 }}
              />
              <RowItem
                title="Total Commission"
                value={data?.commission?.toString()}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Net Commission"
                value={(
                  data?.commission -
                  (data?.clientLoyalty ?? 0) -
                  (data?.brokerReferral ?? 0)
                )
                  .toFixed(2)
                  .toString()}
                // value={data?.commission?.toString()}
                containerStyle={{ marginBottom: 10 }}
              />
            </>
            <>
              <MainTitle
                title="Agent and Their Commission"
                containerStyle={{ marginVertical: 20 }}
              />
              {data?.agents?.map((agent) => {
                return (
                  <RowItem
                    key={agent?._id}
                    title={
                      allUsers?.find((user) => user._id === agent?._id)?.name
                    }
                    value={agent?.commission.toString()}
                    containerStyle={{ marginBottom: 10 }}
                  />
                );
              })}
            </>
            {/* update case */}
            <>
              {canUpdateBooking && (
                <MainTitle
                  title="Update Case"
                  icon={
                    <TouchableOpacity
                      style={{ padding: 5 }}
                      onPress={toggleIsModalUpdateCase}
                    >
                      <EditIcon />
                    </TouchableOpacity>
                  }
                  containerStyle={{ marginVertical: 20 }}
                />
              )}
              {data?.updateCase?.length > 0 &&
                data?.updateCase?.map((el, i) => {
                  return (
                    <View key={i}>
                      <RowItem
                        title="Remarks"
                        containerStyle={{ marginBottom: 10 }}
                        component={<CustomText>{el?.remarks}</CustomText>}
                      />
                      <RowItem
                        title="File"
                        value={el?.file}
                        containerStyle={{ marginBottom: 10 }}
                        component={
                          !!el?.file ? (
                            <ImgViewer uri={`${el?.file}`} />
                          ) : (
                            <CustomText>---</CustomText>
                          )
                        }
                      />
                    </View>
                  );
                })}
            </>
            {user?.role === roleEnum.sup_admin &&
              canChangePaymentStatus &&
              data?.status === "approved" && (
                <>
                  <Payout id={data?._id} />
                </>
              )}
            {/* approve reject btn */}
            {(user?.role === roleEnum.sup_admin ||
              user?.role === roleEnum.sub_admin ||
              user?.role === roleEnum.sr_manager) &&
              canApproveRejectBooking && (
                <>
                  {isHideBtn && data?.status === "pending" && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: 20,
                        marginTop: 30,
                      }}
                    >
                      <CustomBtn
                        title="Reject"
                        // onPress={() => handleAcceptRejectBooking("reject")}
                        onPress={() => toggleModalApproveReject("reject")}
                        isLoading={isLoadingReject}
                        containerStyle={{
                          width: "45%",
                          backgroundColor: "rgb(243,213,213)",
                          borderColor: "rgb(183,49,42)",
                          borderWidth: 0.5,
                        }}
                        textStyle={{
                          color: "rgb(183,49,42)",
                        }}
                      />
                      <CustomBtn
                        title="Approve"
                        // onPress={() => handleAcceptRejectBooking("approve")}
                        onPress={() => toggleModalApproveReject("approve")}
                        isLoading={isLoadingApprove}
                        containerStyle={{
                          width: "45%",
                          backgroundColor: "rgb(213,242,214)",
                          borderColor: "rgb(16,206,29)",
                          borderWidth: 0.5,
                        }}
                        textStyle={{
                          color: "rgb(16,206,29)",
                        }}
                      />
                    </View>
                  )}
                </>
              )}
          </View>
        </ScrollView>
      </Container>
      <CustomModal
        visible={modalApproveReject}
        onClose={toggleModalApproveReject}
        hasBackdrop={false}
      >
        <View
          style={{
            backgroundColor: "white",
            width: WIDTH * 0.8,
            padding: 20,
            borderRadius: 10,
          }}
        >
          <CustomText fontSize={20} fontWeight="500" marginBottom={20}>
            Reject Booking
          </CustomText>
          <CustomInput
            props={{
              multiline: true,
            }}
            inputStyle={{
              height: 100,
              justifyContent: "flex-end",
            }}
            placeholder="Remarks"
            onChangeText={(v) => setAppRejRemarks(v)}
            value={appRejRemarks}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 20,
            }}
          >
            <CustomBtn
              title="Cancel"
              containerStyle={{
                backgroundColor: "blue",
                marginEnd: 15,
              }}
              textStyle={{
                fontSize: 14,
              }}
              onPress={toggleModalApproveReject}
            />
            <CustomBtn
              title={selectedStatus === "reject" ? "Reject" : "Approve"}
              containerStyle={{
                backgroundColor: selectedStatus === "reject" ? "red" : "green",
              }}
              textStyle={{
                fontSize: 14,
              }}
              onPress={() => handleAcceptRejectBooking(selectedStatus)}
              isLoading={isLoadingStatus}
            />
          </View>
        </View>
      </CustomModal>
      <CustomModal
        visible={isModalUpdateCase}
        hasBackdrop={false}
        onClose={toggleIsModalUpdateCase}
      >
        <Pressable
          style={{
            backgroundColor: "white",
            width: WIDTH * 0.8,
            paddingHorizontal: 20,
            borderRadius: 10,
            paddingTop: 10,
            paddingBottom: 20,
          }}
          onPress={() => Keyboard.dismiss()}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <CustomText fontSize={18} fontWeight="500">
              Update Case
            </CustomText>
            <Ionicons
              name="close"
              size={25}
              style={{
                alignSelf: "flex-end",
                // paddingHorizontal: 10
              }}
              onPress={toggleIsModalUpdateCase}
            />
          </View>
          <CustomInput
            label="Remarks"
            props={{
              multiline: true,
              textAlignVertical: "top",
            }}
            inputStyle={{
              height: 100,
              justifyContent: "flex-end",
              marginBottom: 20,
            }}
            placeholder="Remarks"
            onChangeText={(v) =>
              setUpdateCaseData((prev) => {
                {
                  return { ...prev, remarks: v };
                }
              })
            }
            value={updateCaseData.remarks}
          />
          <ExpoImagePicker
            label="File"
            boxContainerStyle={{ marginBottom: 30 }}
            onSelect={(v) =>
              setUpdateCaseData((prev) => {
                {
                  return { ...prev, file: v?.assets[0] };
                }
              })
            }
          />
          <CustomBtn
            title="Submit"
            onPress={submitUpdateCase}
            disabled={!updateCaseData?.remarks}
            isLoading={updateCaseLoading}
          />
        </Pressable>
      </CustomModal>
      <CustomModal
        hasBackdrop={true}
        onClose={ownerInfoModal.closeModal}
        visible={ownerInfoModal.visible}
      >
        <ScrollView
          style={{
            backgroundColor: "white",
            width: 300,
            borderRadius: 10,
            padding: 15,
            maxHeight: 500,
          }}
        >
          <RowItem
            title="Client Name"
            value={ownerInfo?.clientName || "N/A"}
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Client Mobile"
            value={ownerInfo?.clientMobile || "N/A"}
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Client Email"
            value={ownerInfo?.clientEmail || "N/A"}
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Passport 1"
            component={
              ownerInfo?.passport ? (
                <ImgViewer uri={`${ownerInfo.passport}`} />
              ) : (
                <CustomText>N/A</CustomText>
              )
            }
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Passport 2"
            component={
              ownerInfo?.passport2 ? (
                <ImgViewer uri={`${ownerInfo.passport2}`} />
              ) : (
                <CustomText>N/A</CustomText>
              )
            }
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Emirates ID"
            component={
              ownerInfo?.emiratesID ? (
                <ImgViewer uri={`${ownerInfo.emiratesID}`} />
              ) : (
                <CustomText>N/A</CustomText>
              )
            }
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Emirates ID2"
            component={
              ownerInfo?.emiratesID2 ? (
                <ImgViewer uri={`${ownerInfo.emiratesID2}`} />
              ) : (
                <CustomText>N/A</CustomText>
              )
            }
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Visa"
            component={
              ownerInfo?.visa ? (
                <ImgViewer uri={`${ownerInfo.visa}`} />
              ) : (
                <CustomText>N/A</CustomText>
              )
            }
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Visa 2"
            component={
              ownerInfo?.visa2 ? (
                <ImgViewer uri={`${ownerInfo.visa2}`} />
              ) : (
                <CustomText>N/A</CustomText>
              )
            }
            containerStyle={{ marginBottom: 10 }}
          />

          <RowItem
            title="Passport Number"
            value={ownerInfo?.passportNumber || "N/A"}
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Date of Birth"
            value={moment(ownerInfo?.dateOfBirth).format("DD/MM/YYYY") || "N/A"}
            containerStyle={{ marginBottom: 10 }}
          />
          <RowItem
            title="Address"
            value={ownerInfo?.address || "N/A"}
            containerStyle={{ marginBottom: 10 }}
          />
        </ScrollView>
      </CustomModal>
    </>
  );
};

export default BookingDetail;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    width: 200, // Set the width as per your requirement
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
  },
});
