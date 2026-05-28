import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
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
import { Feather, Ionicons } from "@expo/vector-icons";
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
import { shadow1, shadowPrimaryColor } from "../../const/globalStyle";
import useModal from "../../hooks/useModal";
import ThreeDotVerSvg from "../../assets/svg/ThreeDotVerSvg";
import { checkPermission } from "../../utils/commonFunctions";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import * as Clipboard from "expo-clipboard";
import { useAppToast } from "../../components/AppToast";

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
  const toast = useAppToast();
  const queryClient = useQueryClient();
  const { params } = useRoute();
  const { navigate, goBack } = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading } = useGetBookingById(params?.item?._id);

  const dispatch = useDispatch();
  const { user, lead, allUsers } = useSelector(selectUser);
  const [filterLead, setFilterLead] = useState({});
  const { data: developerList, isLoading: loadingDev } = useGetDeveloperList(
    data?.developer,
  );
  useEffect(() => {
    let temp = {
      id: data?.lead?._id || data?._id || "NA",
      name: data?.name || data?.lead?.name || "NA",
      clientName: data?.clientName || data?.lead?.clientName || "NA",
      clientEmail: data?.clientEmail || data?.lead?.clientEmail || "NA",
      clientMobile: data?.clientMobile || data?.lead?.clientMobile || "NA",
      comments: data?.comments || data?.lead?.comments || "NA",
      type: data?.type || data?.lead?.type || "NA",
      whatsapp: data?.whatsapp || data?.lead?.whatsapp || "NA",
    };
    setFilterLead(temp);
  }, [data]);

  const [isHideBtn, setIsHideBtn] = useState(true);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isMailAvail, setIsMailAvail] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [appRejRemarks, setAppRejRemarks] = useState("");
  const [modalApproveReject, setModalApproveReject] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"approve" | "reject">(
    null,
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
    user?.role,
  );

  const canApproveRejectBooking = checkPermission(
    permission,
    "Bookings",
    "approveReject",
    user?.role,
  );
  const canChangePaymentStatus = checkPermission(
    permission,
    "Bookings",
    "changePaymentStatus",
    user?.role,
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
      }),
    );
    await Linking.openURL(`tel:+${filterLead?.clientMobile}`);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getBookingById, params?.item?._id],
      });
      await queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getBooking],
      });
    } catch (e) {
      console.log("Booking refresh error", e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    Clipboard.setStringAsync(text);
    toast?.success?.("Copied to clipboard");
  };

  const renderRow = (
    label: string,
    value: string | number | null | undefined,
    options?: {
      onCopy?: () => void;
      isPhone?: boolean;
      isEmail?: boolean;
      icon?: React.ReactNode;
      rightIcon?: {
        iconName?: string;
        onPress?: () => void;
        btnStyle?: any;
        iconStyle?: {
          size?: number;
          color?: string;
        };
      };
    },
  ) => {
    const displayValue = value ?? "—";
    return (
      <View style={styles.infoRow}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {options?.icon && (
            <View style={{ marginRight: 8 }}>{options.icon}</View>
          )}
          <View>
            <CustomText style={styles.label}>{label}</CustomText>
            <CustomText style={styles.value} numberOfLines={1}>
              {displayValue}
            </CustomText>
          </View>
        </View>
        {/* {options?.onCopy && (
          <TouchableOpacity onPress={options.onCopy} style={styles.copyButton}>
            <Feather name="copy" size={16} color="#9b9b9b" />
          </TouchableOpacity>
        )} */}
        {options?.rightIcon ? (
          <TouchableOpacity
            onPress={options?.rightIcon?.onPress ?? null}
            style={[styles.copyButton, options?.rightIcon?.btnStyle]}
          >
            <Feather
              name={options?.rightIcon?.iconName || "external-link"}
              size={options?.rightIcon?.iconStyle?.size || 16}
              color={options?.rightIcon?.iconStyle?.color || "#9b9b9b"}
            />
          </TouchableOpacity>
        ) : (
          options?.onCopy && (
            <TouchableOpacity
              onPress={options.onCopy}
              style={styles.copyButton}
            >
              <Feather name="copy" size={16} color="#9b9b9b" />
            </TouchableOpacity>
          )
        )}
      </View>
    );
  };

  const renderImgRow = (label: string, uri: string) => {
    if (!uri) return null;
    return (
      <View style={styles.infoRow}>
        <View style={{ flex: 1 }}>
          <CustomText style={styles.label}>{label}</CustomText>
          <ImgViewer uri={uri} />
        </View>
      </View>
    );
  };

  // myConsole("ownerInfooo", ownerInfo);
  return (
    <>
      <Header title={"Booking Details"} />
      <Container>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 18,
              ...shadowPrimaryColor,
            }}
          >
            {isLoading && <ActivityIndicator />}

            {/* Ownership Details Card */}
            {data?.ownerShipDetails?.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <CustomText style={styles.sectionTitle}>
                    Ownership Details
                  </CustomText>
                  <TouchableOpacity
                    onPress={() => setShowPopup(!showPopup)}
                    style={styles.menuButton}
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
                          (navigate("ReferralNavigator", {
                            screen: "AddReferrals",
                            params: { data: data, type: "clientLoyality" },
                          }),
                            setShowPopup(false));
                        }}
                      >
                        <CustomText style={styles.modalText}>
                          Pay Client Loyalty
                        </CustomText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                          (navigate("ReferralNavigator", {
                            screen: "AddReferrals",
                            params: { data: data, type: "bookingRefferal" },
                          }),
                            setShowPopup(false));
                        }}
                      >
                        <CustomText style={styles.modalText}>
                          Pay Booking Referral
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  </CustomModal>
                </View>
                <View style={styles.divider} />
                {data?.ownerShipDetails?.map((el, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setOwnerInfo(el);
                      ownerInfoModal.openModal();
                    }}
                    activeOpacity={0.8}
                    style={styles.ownerItem}
                  >
                    <Feather
                      name="users"
                      size={20}
                      color={color.primaryColor}
                    />
                    <CustomText style={styles.ownerText}>
                      Client Info {i + 1}
                    </CustomText>
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={color.mainTxtColor}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Other Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <CustomText style={styles.sectionTitle}>
                  Other Details
                </CustomText>
                {canUpdateBooking && (
                  <TouchableOpacity
                    onPress={() =>
                      navigate(routeBooking?.DeveloperInformation, { data })
                    }
                    style={styles.editButton}
                  >
                    <Feather
                      name="edit-2"
                      size={16}
                      color={color.mainTxtColor}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.divider} />

              {renderRow("Source", filterLead?.name)}
              {renderRow("Client Name", filterLead?.clientName, {
                rightIcon: {
                  iconName: "external-link",
                  onPress: () => {
                    if (!filterLead?.id) return;

                    navigate("allLead2", {
                      screen: "LeadsDetails",
                      params: {
                        item: { _id: filterLead.id },
                      },
                    });
                  },
                },
              })}

              {filterLead?.clientMobile && (
                <View style={styles.infoRow}>
                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>Mobile Number</CustomText>
                    <TouchableOpacity onPress={navToCall}>
                      <CustomText style={styles.value}>
                        {filterLead?.clientMobile}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCopy(filterLead?.clientMobile)}
                    style={styles.copyButton}
                  >
                    <Feather name="copy" size={16} color="#9b9b9b" />
                  </TouchableOpacity>
                </View>
              )}
              {filterLead?.clientEmail && (
                <View style={styles.infoRow}>
                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>Email Address</CustomText>
                    <TouchableOpacity
                      onPress={() =>
                        isMailAvail && openMail(filterLead?.clientEmail)
                      }
                      disabled={!isMailAvail}
                    >
                      <CustomText style={styles.value}>
                        {filterLead?.clientEmail}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCopy(filterLead?.clientEmail)}
                    style={styles.copyButton}
                  >
                    <Feather name="copy" size={16} color="#9b9b9b" />
                  </TouchableOpacity>
                </View>
              )}
              {filterLead?.whatsapp && (
                <View style={styles.infoRow}>
                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.label}>WhatsApp Link</CustomText>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(filterLead.whatsapp)}
                    >
                      <CustomText style={[styles.value, { color: "#25D366" }]}>
                        Open WhatsApp
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {renderRow(
                "Date of Birth",
                data?.dateOfBirth
                  ? moment(data.dateOfBirth).format("DD/MM/YYYY")
                  : null,
              )}
              {renderRow("Type of Property", data?.typeOfProperty)}
              {renderRow("Type", leadTypeObj[filterLead?.type])}
              {renderRow("Comments", filterLead?.comments)}
              <View style={styles.infoRow}>
                <View>
                  <CustomText style={styles.label}>Approval Status</CustomText>
                  <CustomText
                    style={[
                      styles.value,
                      {
                        color:
                          approvalStatusColor[data?.status] ||
                          color.mainTxtColor,
                      },
                    ]}
                  >
                    {approvalStatus[data?.status] ?? "N/A"}
                  </CustomText>
                </View>
              </View>
              {renderRow("Ownership", data?.ownership)}
              {data?.remarks && renderRow("Remarks", data?.remarks)}

              {/* Payment Proofs */}
              {data?.paymentProofArr?.map((el, i) =>
                renderImgRow(`Payment Proof ${i + 1}`, el),
              )}
              {data?.otherDocs?.map((el, i) =>
                renderImgRow(`Other Doc ${i + 1}`, el),
              )}
              {renderImgRow("Client Passport", data?.passport)}
              {renderImgRow("Client Passport 2", data?.passport2)}
              {renderRow("Passport Number", data?.passportNumber)}
              {renderRow("Address", data?.address)}
              {renderImgRow("Emirates ID", data?.emiratesID)}
              {renderImgRow("Emirates ID 2", data?.emiratesID2)}
              {renderImgRow("Visa", data?.visa)}
              {renderImgRow("Visa 2", data?.visa2)}
              {renderImgRow("Payment Proof", data?.paymentProof)}
              {renderImgRow("Payment Proof 2", data?.paymentProof2)}
            </View>

            {/* Unit Details Card */}
            <View style={styles.card}>
              <CustomText style={styles.sectionTitle}>Unit Details</CustomText>
              <View style={styles.divider} />
              {renderRow("Developer Name", data?.developer?.name)}
              {renderRow("Relationship Manager", data?.relationshipManager)}
              {renderRow("Project Name", data?.projectName)}
              {renderRow("Unit Number", data?.unit)}
              {renderRow("Area SQFT", data?.areaSQFT)}
              {renderRow("Total Price", data?.total)}
              {renderRow("Booking Details", data?.propertyDetails)}
            </View>

            {/* Entry Status Card */}
            <View style={styles.card}>
              <CustomText style={styles.sectionTitle}>Entry Status</CustomText>
              <View style={styles.divider} />
              {renderRow(
                "Status",
                bookingEntryStatusObj[data?.inputStatus?.toString()],
              )}
              {renderRow(
                "Payment Status",
                data?.paymentStatus
                  ? paymentStatusObj[data?.paymentStatus]
                  : null,
              )}
              {renderRow("Remarks", data?.remarks?.toString())}
              {renderRow("Business Status", data?.businessStatus)}
            </View>

            {/* Payment Details Card */}
            <View style={styles.card}>
              <CustomText style={styles.sectionTitle}>
                Payment Details
              </CustomText>
              <View style={styles.divider} />
              {renderRow("Payment Plan", data?.paymentPlan)}
              {renderRow("Mode of Payment", data?.paymentMode)}
              {renderRow("Token Paid", data?.token ? "Paid" : "Unpaid")}
              {renderRow("Booking Amount", data?.bookingAmount?.toString())}
              {renderRow(
                "Client Loyalty",
                data?.clientLoyalty?.toString() ?? "0",
              )}
              {renderRow(
                "Broker Referral",
                data?.brokerReferral?.toString() ?? "0",
              )}
            </View>

            {/* Commission Information Card */}
            <View style={styles.card}>
              <CustomText style={styles.sectionTitle}>
                Commission Information
              </CustomText>
              <View style={styles.divider} />
              {renderRow("Total Commission", data?.commission?.toString())}
              {renderRow(
                "Net Commission",
                (
                  data?.commission -
                  (data?.clientLoyalty ?? 0) -
                  (data?.brokerReferral ?? 0)
                )
                  .toFixed(2)
                  .toString(),
              )}
            </View>

            {/* Agent Commissions Card */}
            {data?.agents?.length > 0 && (
              <View style={styles.card}>
                <CustomText style={styles.sectionTitle}>
                  Agent & Commission
                </CustomText>
                <View style={styles.divider} />
                {data?.agents?.map((agent) => (
                  <View key={agent?._id} style={styles.infoRow}>
                    <CustomText style={styles.label}>
                      {allUsers?.find((u) => u._id === agent?._id)?.name ||
                        "Agent"}
                    </CustomText>
                    <CustomText style={styles.value}>
                      {agent?.commission.toString()}
                    </CustomText>
                  </View>
                ))}
              </View>
            )}

            {/* Update Case Card */}
            {canUpdateBooking && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <CustomText style={styles.sectionTitle}>
                    Update Case
                  </CustomText>
                  <TouchableOpacity
                    onPress={toggleIsModalUpdateCase}
                    style={styles.editButton}
                  >
                    <Feather name="plus" size={18} color={color.mainTxtColor} />
                  </TouchableOpacity>
                </View>
                <View style={styles.divider} />
                {data?.updateCase?.length > 0 ? (
                  data?.updateCase?.map((el, i) => (
                    <View key={i} style={{ marginBottom: 12 }}>
                      {renderRow("Remarks", el?.remarks)}
                      {el?.file && renderImgRow("File", el?.file)}
                    </View>
                  ))
                ) : (
                  <CustomText style={styles.value}>No updates yet</CustomText>
                )}
              </View>
            )}

            {/* Payout Section */}
            {user?.role === roleEnum.sup_admin &&
              canChangePaymentStatus &&
              data?.status === "approved" && <Payout id={data?._id} />}

            {/* Approve/Reject Buttons */}
            {(user?.role === roleEnum.sup_admin ||
              user?.role === roleEnum.sub_admin ||
              user?.role === roleEnum.sr_manager) &&
              canApproveRejectBooking &&
              isHideBtn &&
              data?.status === "pending" && (
                <View style={styles.buttonRow}>
                  <CustomBtn
                    title="Reject"
                    onPress={() => toggleModalApproveReject("reject")}
                    containerStyle={styles.rejectButton}
                    textStyle={{ fontSize: 14 }}
                  />
                  <CustomBtn
                    title="Approve"
                    onPress={() => toggleModalApproveReject("approve")}
                    containerStyle={styles.approveButton}
                    textStyle={{ fontSize: 14 }}
                  />
                </View>
              )}
          </View>
        </ScrollView>
      </Container>

      {/* Modals (unchanged) */}
      <CustomModal
        visible={modalApproveReject}
        onClose={toggleModalApproveReject}
        hasBackdrop={false}
      >
        <View style={styles.modalContent}>
          <CustomText
            fontSize={20}
            fontWeight="500"
            marginBottom={20}
            color={color.mainTxtColor}
          >
            {selectedStatus === "reject" ? "Reject Booking" : "Approve Booking"}
          </CustomText>
          <CustomInput
            props={{ multiline: true }}
            inputStyle={{ height: 100, justifyContent: "flex-end" }}
            placeholder="Remarks"
            onChangeText={(v) => setAppRejRemarks(v)}
            value={appRejRemarks}
          />
          <View style={styles.modalButtonRow}>
            <CustomBtn
              title="Cancel"
              containerStyle={styles.cancelButton}
              textStyle={{ fontSize: 14 }}
              onPress={toggleModalApproveReject}
            />
            <CustomBtn
              title={selectedStatus === "reject" ? "Reject" : "Approve"}
              containerStyle={
                selectedStatus === "reject"
                  ? styles.rejectButton
                  : styles.approveButton
              }
              textStyle={{ fontSize: 14 }}
              onPress={() => handleAcceptRejectBooking(selectedStatus)}
              isLoading={isLoadingStatus}
            />
          </View>
        </View>
      </CustomModal>

      <CustomModal
        visible={isModalUpdateCase}
        hasBackdrop={true}
        onClose={toggleIsModalUpdateCase}
      >
        <Pressable
          style={styles.updateModal}
          onPress={() => Keyboard.dismiss()}
        >
          <View style={styles.updateModalHeader}>
            <CustomText
              fontSize={18}
              fontWeight="500"
              color={color.mainTxtColor}
            >
              Update Case
            </CustomText>
            <Ionicons
              name="close"
              size={25}
              color={color.mainTxtColor}
              onPress={toggleIsModalUpdateCase}
            />
          </View>
          <CustomInput
            label="Remarks"
            props={{ multiline: true, textAlignVertical: "top" }}
            inputStyle={{
              height: 100,
              justifyContent: "flex-end",
              marginBottom: 20,
            }}
            placeholder="Remarks"
            onChangeText={(v) =>
              setUpdateCaseData((prev) => ({ ...prev, remarks: v }))
            }
            value={updateCaseData.remarks}
          />
          <ExpoImagePicker
            label="File"
            boxContainerStyle={{ marginBottom: 30 }}
            onSelect={(v) =>
              setUpdateCaseData((prev) => ({ ...prev, file: v?.assets[0] }))
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
        <ScrollView style={styles.ownerModal}>
          {renderRow("Client Name", ownerInfo?.clientName)}
          {renderRow("Client Mobile", ownerInfo?.clientMobile, {
            onCopy: () => handleCopy(ownerInfo?.clientMobile),
          })}
          {renderRow("Client Email", ownerInfo?.clientEmail, {
            onCopy: () => handleCopy(ownerInfo?.clientEmail),
          })}
          {renderImgRow("Passport 1", ownerInfo?.passport)}
          {renderImgRow("Passport 2", ownerInfo?.passport2)}
          {renderImgRow("Emirates ID", ownerInfo?.emiratesID)}
          {renderImgRow("Emirates ID 2", ownerInfo?.emiratesID2)}
          {renderImgRow("Visa", ownerInfo?.visa)}
          {renderImgRow("Visa 2", ownerInfo?.visa2)}
          {renderRow("Passport Number", ownerInfo?.passportNumber)}
          {renderRow(
            "Date of Birth",
            ownerInfo?.dateOfBirth
              ? moment(ownerInfo.dateOfBirth).format("DD/MM/YYYY")
              : null,
          )}
          {renderRow("Address", ownerInfo?.address)}
        </ScrollView>
      </CustomModal>
    </>
  );
};

export default BookingDetail;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E67BE",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6EAF0",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#8C97A8",
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F3A4A",
  },
  copyButton: {
    backgroundColor: "#9b9b9b18",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  menuButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: "#F0F4FA",
    borderRadius: 20,
  },
  ownerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  ownerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: color.mainTxtColor,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  rejectButton: {
    width: "45%",
    backgroundColor: "#F44336",
  },
  approveButton: {
    width: "45%",
    backgroundColor: "#4CAF50",
  },
  modalContent: {
    backgroundColor: "white",
    width: WIDTH * 0.8,
    padding: 20,
    borderRadius: 10,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#2196F3",
    marginRight: 15,
  },
  updateModal: {
    backgroundColor: "white",
    // width: WIDTH * 0.4,
    paddingHorizontal: 20,
    borderRadius: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  updateModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ownerModal: {
    backgroundColor: "white",
    width: 300,
    borderRadius: 10,
    padding: 15,
    maxHeight: 500,
  },

  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  modalText: {
    fontSize: 16,
    color: color.mainTxtColor,
  },
});
