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
import { routeLead } from "../../utils/routes";
import { color } from "../../const/color";
import { selectUser, setLeadQueryKey } from "../../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { roleEnum } from "../../utils/data";

const allLeadsFilterStatuses = [
  { _id: "my_leads", name: "My Leads", icon: "user" },
  {
    _id: "my_calling_data",
    name: "My Calling Data",
    icon: "phone",
  },

  // { _id: "createdAt", name: "Creation Time", icon: "plus-circle" },
  // { _id: "updatedAt", name: "Updation Time", icon: "edit" },
  // { _id: "assignedAt", name: "Assign Time", icon: "user-plus" },

  { _id: "followUp_required", name: "Follow Up Leads", icon: "clock" },
  { _id: "not_interested", name: "Not Interested", icon: "thumbs-down" },
  {
    _id: "not_able_to_connect",
    name: "Not Able to Connect",
    icon: "phone-missed",
  },

  { _id: "disqualified", name: "Disqualified Leads", icon: "slash" },

  { _id: "meeting_scheduled", name: "Meeting Scheduled", icon: "calendar" },

  { _id: "meeting_done", name: "Meeting Done", icon: "check-square" },

  { _id: "wrong_details", name: "Spam/Wrong Details", icon: "alert-triangle" },

  { _id: "active_cold", name: "Active Cold Leads", icon: "thermometer" },

  { _id: "broker", name: "Broker", icon: "briefcase" },
  { _id: "call_back", name: "Call Back Leads", icon: "phone-call" },
  { _id: "claimed", name: "Claimed Leads", icon: "check-circle" },
  { _id: "assign", name: "Assigned Leads", icon: "user-check" },
  { _id: "re_assigned", name: "Re-assigned", icon: "refresh-cw" },

  { _id: "no_response", name: "No Response", icon: "phone-off" },

  {
    _id: "not_interested_buy_later",
    name: "Not Interested May Buy Later",
    icon: "clock",
  },

  { _id: "deal_booked", name: "Deal Booked", icon: "star" },
  { _id: "deal_cancelled", name: "Deal Cancelled", icon: "x-octagon" },
  { _id: "nr_event", name: "NR Event", icon: "flag" },
  { _id: "active_hot", name: "Active Hot Leads", icon: "zap" },
  { _id: "lost", name: "Lost Leads", icon: "x-circle" },
];

const CARD_WIDTH = 80;

const StatusCard = ({
  item,
  onPress,
}: {
  item: (typeof allLeadsFilterStatuses)[0];
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

const LeadStatusScroller = () => {
  const { navigate } = useNavigation<any>();
  const { user, leadQueryKey } = useSelector(selectUser);
  const dispatch = useDispatch();

  const isAgent = user?.role === "agent" || user?.role === roleEnum.seo;

  const filteredStatuses = isAgent
    ? allLeadsFilterStatuses.filter(
        (s) => s._id !== "my_leads" && s._id !== "my_calling_data",
      )
    : allLeadsFilterStatuses;

  const ROW = Math.ceil(filteredStatuses.length / 2);
  const row1 = filteredStatuses.slice(0, ROW);
  const row2 = filteredStatuses.slice(ROW);

  const handlePress = (status: string) => {
    if (status === "my_leads") {
      dispatch(setLeadQueryKey({ individual: true }));

      navigate("allLead2", {
        screen: "allLead",
        params: {
          tabType: "lead",
          filterMyLeads: true,
          fromDashboard: true,
        },
      });
    } else if (status === "my_calling_data") {
      dispatch(setLeadQueryKey({ individual: true }));

      navigate("allLead2", {
        screen: "allLead",
        params: {
          tabType: "calling_data",
          filterMyLeads: true,
          fromDashboard: true,
        },
      });
    } else if (
      status === "createdAt" ||
      status === "updatedAt" ||
      status === "assignedAt"
    ) {
      dispatch(setLeadQueryKey({ dateKey: status }));
      navigate("allLead2", {
        screen: "allLead",
        params: {
          tabType: "lead",
          dateFilterType: status,
        },
      });
    } else {
      dispatch(setLeadQueryKey({ status: [status] }));
      navigate("allLead2", {
        screen: "allLead",
        params: {
          tabType: "lead",
          filterStatus: status,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Data Filters</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          {/* Row 1 */}
          <View style={styles.row}>
            {row1.map((item) => (
              <StatusCard
                key={item._id}
                item={item}
                onPress={() => handlePress(item._id)}
              />
            ))}
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            {row2.map((item) => (
              <StatusCard
                key={item._id}
                item={item}
                onPress={() => handlePress(item._id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LeadStatusScroller;

const styles = StyleSheet.create({
  container: {
    // marginBottom: 4,
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
      height: 3, // ← positive value = shadow niche
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
