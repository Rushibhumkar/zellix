import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setBookingQueryKey } from "../../redux/userSlice";
import { color } from "../../const/color";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { checkPermission } from "../../utils/commonFunctions";

const CARD_WIDTH = 80;

type BookingFilterItem = {
  _id: string;
  name: string;
  icon: string;
  type: string;
};

const BookingCard = ({
  item,
  onPress,
}: {
  item: BookingFilterItem;
  onPress: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.card}>
    <View style={styles.iconWrapper}>
      <Feather name={item.icon as any} size={20} color="#2E67BE" />
    </View>
    <Text style={styles.label} numberOfLines={2}>
      {item.name}
    </Text>
  </TouchableOpacity>
);
const BookingStatusScroller = () => {
  const { navigate } = useNavigation<any>();
  const dispatch = useDispatch();

  const { user } = useSelector(selectUser);

  const isAdmin =
    user?.role === roleEnum.sup_admin || user?.role === roleEnum.sub_admin;

  const isAdminSrManager =
    user?.role === roleEnum.sup_admin ||
    user?.role === roleEnum.sub_admin ||
    user?.role === roleEnum.sr_manager;

  const isAdminSrManagerManager =
    user?.role === roleEnum.sup_admin ||
    user?.role === roleEnum.sub_admin ||
    user?.role === roleEnum.sr_manager ||
    user?.role === roleEnum.manager;

  const isAdminSrMngMngAssistantMng =
    user?.role === roleEnum.sup_admin ||
    user?.role === roleEnum.sub_admin ||
    user?.role === roleEnum.sr_manager ||
    user?.role === roleEnum.manager ||
    user?.role === roleEnum.assistant_manager;

  const isAgent = user?.role === roleEnum.agent || user?.role === roleEnum.seo;

  const bookingFilters = [
    // ── Booking Status (all roles) ──
    { _id: "approved", name: "Approved", icon: "check-circle", type: "status" },
    { _id: "pending", name: "Pending", icon: "clock", type: "status" },
    { _id: "rejected", name: "Rejected", icon: "x-circle", type: "status" },

    // ── Input Status (all roles) ──
    {
      _id: "executed",
      name: "Executed",
      icon: "file-text",
      type: "inputStatus",
    },
    {
      _id: "spa_signed",
      name: "SPA Signed",
      icon: "edit",
      type: "inputStatus",
    },
    {
      _id: "clear_case_confirmed",
      name: "Clear/Confirmed",
      icon: "shield",
      type: "inputStatus",
    },
    {
      _id: "commission_received_full",
      name: "Commission Full",
      icon: "dollar-sign",
      type: "inputStatus",
    },
    {
      _id: "deal_cancelled",
      name: "Deal Cancelled",
      icon: "x-octagon",
      type: "inputStatus",
    },
    {
      _id: "eoi_canceled",
      name: "EOI Cancelled",
      icon: "slash",
      type: "inputStatus",
    },

    // ── Payment Status (all roles) ──
    {
      _id: "pending",
      name: "Pay Pending",
      icon: "alert-circle",
      type: "paymentStatus",
    },
    {
      _id: "received",
      name: "Pay Received",
      icon: "trending-up",
      type: "paymentStatus",
    },
    {
      _id: "not_received",
      name: "Not Received",
      icon: "trending-down",
      type: "paymentStatus",
    },

    // ── Mode of Payment (all roles) ──
    { _id: "cash", name: "Cash", icon: "credit-card", type: "paymentMode" },
    { _id: "cheque", name: "Cheque", icon: "book", type: "paymentMode" },
    {
      _id: "bank_tranfer",
      name: "Bank Transfer",
      icon: "repeat",
      type: "paymentMode",
    },

    // ── Token (all roles) ──
    { _id: "token_paid", name: "Token Paid", icon: "star", type: "token" },
    { _id: "token_unpaid", name: "Token Unpaid", icon: "star", type: "token" },

    // ── Summary (all roles) ──
    {
      _id: "confirm_business",
      name: "Confirmed Biz",
      icon: "briefcase",
      type: "summary",
    },
    { _id: "eoi", name: "EOI", icon: "activity", type: "summary" },
    {
      _id: "cancel_business",
      name: "Cancel Biz",
      icon: "trash-2",
      type: "summary",
    },

    // ── Team filters — admin only ──
    ...(isAdmin
      ? [
          {
            _id: "sr_manager",
            name: "Sr Manager",
            icon: "users",
            type: "srManager",
          },
        ]
      : []),

    ...(isAdminSrManager
      ? [{ _id: "manager", name: "Manager", icon: "user", type: "manager" }]
      : []),

    ...(isAdminSrManagerManager
      ? [
          {
            _id: "assistant_manager",
            name: "Asst Manager",
            icon: "user-check",
            type: "assistantManager",
          },
        ]
      : []),

    ...(isAdminSrMngMngAssistantMng
      ? [
          {
            _id: "team_lead",
            name: "Team Lead",
            icon: "award",
            type: "teamLead",
          },
        ]
      : []),

    ...(!isAgent
      ? [{ _id: "agent", name: "Agent", icon: "user-plus", type: "agent" }]
      : []),
  ];

  // const ROW_SIZE = Math.ceil(bookingFilters.length / 3);
  // const row1 = bookingFilters.slice(0, ROW_SIZE);
  // const row2 = bookingFilters.slice(ROW_SIZE, ROW_SIZE * 2);
  // const row3 = bookingFilters.slice(ROW_SIZE * 2);

  const ROW_SIZE = Math.ceil(bookingFilters.length / 2);
  const row1 = bookingFilters.slice(0, ROW_SIZE);
  const row2 = bookingFilters.slice(ROW_SIZE);

  const handlePress = (item: BookingFilterItem) => {
    let queryPayload: Record<string, any> = {};

    switch (item.type) {
      case "status":
        queryPayload = { status: [item._id] };
        break;
      case "inputStatus":
        queryPayload = { inputStatus: [item._id] };
        break;
      case "paymentStatus":
        queryPayload = { paymentStatus: [item._id] };
        break;
      case "paymentMode":
        queryPayload = { paymentMode: [item._id] };
        break;
      case "token":
        queryPayload = { token: item._id === "token_paid" };
        break;
      case "summary":
        queryPayload = { businessStatus: item._id };
        break;
      case "srManager":
        queryPayload = { srManager: [item._id] };
        break;
      case "manager":
        queryPayload = { manager: [item._id] };
        break;
      case "assistantManager":
        queryPayload = { assistantManager: [item._id] };
        break;
      case "teamLead":
        queryPayload = { teamLead: [item._id] };
        break;
      case "agent":
        queryPayload = { agent: [item._id] };
        break;
    }

    dispatch(setBookingQueryKey(queryPayload));
    navigate("BookingNavigator");
  };

  const renderRow = (rows: BookingFilterItem[]) => (
    <View style={styles.row}>
      {rows.map((item) => (
        <BookingCard
          key={`${item._id}-${item.type}`}
          item={item}
          onPress={() => handlePress(item)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Bookings</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          {renderRow(row1)}
          {renderRow(row2)}
          {/* {renderRow(row3)} */}
        </View>
      </ScrollView>
    </View>
  );
};

export default BookingStatusScroller;

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E67BE",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  card: {
    width: CARD_WIDTH,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    shadowColor: color.mainTxtColor,
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 9,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E8EEF7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2F3A4A",
    textAlign: "center",
    lineHeight: 13,
  },
});
