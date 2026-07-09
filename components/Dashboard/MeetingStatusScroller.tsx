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
import { setMeetingQueryKey } from "../../redux/userSlice";
import { color } from "../../const/color";

const meetingFilters = [
  { _id: "schedule", name: "Scheduled", icon: "calendar", type: "status" },
  { _id: "conducted", name: "Conducted", icon: "check-square", type: "status" },
  {
    _id: "reschedule",
    name: "Rescheduled",
    icon: "refresh-cw",
    type: "status",
  },
  // {
  //   _id: "createdAt",
  //   name: "Creation Time",
  //   icon: "plus-circle",
  //   type: "date",
  // },
  // { _id: "updatedAt", name: "Updation Time", icon: "edit", type: "date" },
  // { _id: "assignedAt", name: "Assign Time", icon: "user-plus", type: "date" },
];

const CARD_WIDTH = 80;

const MeetingCard = ({
  item,
  onPress,
}: {
  item: (typeof meetingFilters)[0];
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

const MeetingStatusScroller = () => {
  const { navigate } = useNavigation<any>();
  const dispatch = useDispatch();

  const handlePress = (item: (typeof meetingFilters)[0]) => {
    if (item.type === "status") {
      dispatch(setMeetingQueryKey({ status: item._id }));
    } else {
      dispatch(setMeetingQueryKey({ dateKey: item._id }));
    }
    navigate("MeetingsNavigator");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Meetings</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.row}>
          {meetingFilters.map((item) => (
            <MeetingCard
              key={item._id}
              item={item}
              onPress={() => handlePress(item)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default MeetingStatusScroller;

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
