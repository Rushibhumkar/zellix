import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import SearchBar from "../../myComponents/SearchBar/SearchBar";
import CustomText from "../../myComponents/CustomText/CustomText";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { color } from "../../const/color";
import { debounce } from "../../utils/debounce";
import { statusObj } from "../../utils/data";
import { truncateText } from "../../utils/commonFunctions";
import {
  useGetLead,
  useGetMeeting,
  useGetBooking,
} from "../../hooks/useCRMgetQuerry";

type TTab = "lead" | "meeting" | "booking";

const UnifiedSearch = () => {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<TTab>("lead");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceSearch = useCallback(
    debounce((v: string) => setDebouncedSearch(v), 400),
    [],
  );

  const handleSearchChange = (v: string) => {
    setSearchValue(v);
    debounceSearch(v);
  };

  const leadResult = useGetLead({
    search: debouncedSearch,
    limit: 20,
  } as any);
  const meetingResult = useGetMeeting({
    search: debouncedSearch,
    limit: 20,
  } as any);
  const bookingResult = useGetBooking({
    search: debouncedSearch,
    limit: 20,
  } as any);

  const hasQuery = debouncedSearch.trim().length > 0;

  const activeResult =
    activeTab === "lead"
      ? leadResult
      : activeTab === "meeting"
        ? meetingResult
        : bookingResult;

  const results = activeResult?.data || [];
  const isLoading = activeResult?.isLoading || activeResult?.isFetching;

  // `initial: false` on each of these keeps the target nested stack's own
  // list screen underneath the detail screen. Without it, navigating into a
  // not-yet-visited nested navigator with a specific `screen` makes that
  // screen the stack's ONLY entry — so the back button has nothing to pop
  // to within that stack and instead pops back out to this Search screen,
  // and the module's tab is later left showing the stale detail screen
  // instead of its list. This makes the resulting stack identical to what
  // normally navigating list -> detail within that module produces.
  const handlePressLead = (item: any) => {
    if (!item?._id) return;
    navigation.navigate("allLead2", {
      screen: "LeadsDetails",
      params: { item: { _id: item._id } },
      initial: false,
    });
  };

  const handlePressMeeting = (item: any) => {
    if (!item?._id) return;
    navigation.navigate("MeetingsNavigator", {
      screen: "MeetingDetails",
      params: { item: { _id: item._id } },
      initial: false,
    });
  };

  const handlePressBooking = (item: any) => {
    if (!item?._id) return;
    navigation.navigate("BookingNavigator", {
      screen: "BookingDetail",
      params: { item: { _id: item._id } },
      initial: false,
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === "lead") {
      return (
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => handlePressLead(item)}
        >
          <View style={styles.rowLeft}>
            <CustomText style={styles.rowTitle} numberOfLines={1}>
              {item?.clientName || "N/A"}
            </CustomText>
            {!!item?.clientMobile && (
              <CustomText style={styles.rowSubtitle}>
                {item?.clientMobile}
              </CustomText>
            )}
          </View>
          {!!item?.status && (
            <View style={styles.statusPill}>
              <CustomText style={styles.statusPillText}>
                {truncateText(statusObj[item?.status] || item?.status, 16)}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (activeTab === "meeting") {
      const latestMeeting = item?.meetings?.[item?.meetings?.length - 1];
      return (
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => handlePressMeeting(item)}
        >
          <View style={styles.rowLeft}>
            <CustomText style={styles.rowTitle} numberOfLines={1}>
              {item?.lead?.clientName || "N/A"}
            </CustomText>
            {!!latestMeeting?.scheduleDate && (
              <CustomText style={styles.rowSubtitle}>
                {moment(latestMeeting.scheduleDate).format("DD MMM, hh:mm A")}
              </CustomText>
            )}
          </View>
          {!!latestMeeting?.status && (
            <View style={styles.statusPill}>
              <CustomText style={styles.statusPillText}>
                {latestMeeting.status === "conducted"
                  ? "Conducted"
                  : truncateText(latestMeeting.status, 14)}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => handlePressBooking(item)}
      >
        <View style={styles.rowLeft}>
          <CustomText style={styles.rowTitle} numberOfLines={1}>
            {item?.projectName || "N/A"}
          </CustomText>
          <CustomText style={styles.rowSubtitle} numberOfLines={1}>
            {item?.lead?.clientName || "-"}
            {item?.date ? ` • ${moment(item.date).format("DD MMM")}` : ""}
          </CustomText>
        </View>
        {!!item?.status && (
          <View style={styles.statusPill}>
            <CustomText style={styles.statusPillText}>
              {truncateText(item?.status, 14)}
            </CustomText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Container>
      <Header title="Search" />

      <SearchBar
        value={searchValue}
        onChangeText={handleSearchChange}
        onClickCancel={() => handleSearchChange("")}
        autoFocus
        isWithAnimation={false}
      />

      <View style={styles.tabContainer}>
        {(
          [
            { key: "lead", label: "Leads" },
            { key: "meeting", label: "Meetings" },
            { key: "booking", label: "Bookings" },
          ] as { key: TTab; label: string }[]
        ).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <CustomText
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeText,
              ]}
            >
              {tab.label}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>

      {!hasQuery ? (
        <View style={styles.promptWrapper}>
          <CustomText style={styles.promptText}>
            Type to search leads, meetings & bookings
          </CustomText>
        </View>
      ) : isLoading ? (
        <ActivityIndicator
          size="small"
          color={color.mainTxtColor}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item?._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          ListEmptyComponent={
            <NoDataFound style={{ marginTop: 60 }} showTxt />
          }
        />
      )}
    </Container>
  );
};

export default UnifiedSearch;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#3E6EC6",
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 12,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D6E3FF",
  },
  activeText: {
    color: "#2D5FB8",
  },
  promptWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  promptText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },
  statusPill: {
    backgroundColor: "#EEF2F7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "capitalize",
  },
});
