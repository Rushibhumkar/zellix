import { StyleSheet, View } from "react-native";
import React, { useState, useEffect } from "react";
import CustomText from "../../myComponents/CustomText/CustomText";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { color } from "../../const/color";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

const MeetingCard = ({ item, isLoading }: any) => {
  const [meetingCount, setMeetingCount] = useState({
    schedule: 0,
    conducted: 0,
    reschedule: 0,
  });

  const handleSelectInterval = (interval) => {
    let temp = {
      schedule: 0,
      conducted: 0,
      reschedule: 0,
    };
    temp.schedule = item?.[interval]?.data?.find(
      (el) => el.status === "schedule",
    )?.fraction;
    temp.conducted = item?.[interval]?.data?.find(
      (el) => el.status === "conducted",
    )?.fraction;
    temp.reschedule = item?.[interval]?.data?.find(
      (el) => el.status === "reschedule",
    )?.fraction;
    setMeetingCount(temp);
  };

  useEffect(() => {
    if (!!item?.weekly) {
      let temp = {
        schedule: 0,
        conducted: 0,
        reschedule: 0,
      };
      temp.schedule = item?.["weekly"]?.data?.find(
        (el) => el.status === "schedule",
      )?.fraction;
      temp.conducted = item?.["weekly"]?.data?.find(
        (el) => el.status === "conducted",
      )?.fraction;
      temp.reschedule = item?.["weekly"]?.data?.find(
        (el) => el.status === "reschedule",
      )?.fraction;
      setMeetingCount(temp);
    }
  }, [!!item?.weekly]);

  return (
    <View style={styles.card}>
      {/* ---------- Header ---------- */}
      <SlideFadeIn>
        <CustomText style={styles.title}>Meetings</CustomText>
      </SlideFadeIn>

      {/* ---------- Dropdown ---------- */}
      <View style={styles.dropdownBox}>
        <SlideFadeIn>
          <DropdownRNE
            arrOfObj={[
              { name: "Weekly", _id: "weekly" },
              { name: "Monthly", _id: "monthly" },
              { name: "Yearly", _id: "yearly" },
            ]}
            initialValue={"weekly"}
            keyValueGetOnSelect="_id"
            keyValueShowInBox="name"
            label=""
            placeholder=" "
            onChange={(a) => handleSelectInterval(a)}
            labelTextStyle={{ color: "white" }}
          />
        </SlideFadeIn>
      </View>

      {/* ---------- Status Boxes ---------- */}
      <View style={styles.row}>
        {/* Scheduled */}
        <View style={[styles.statusBox, { backgroundColor: "#3B82F6" }]}>
          <SlideFadeIn>
            <CustomText style={styles.statusTitle}>Scheduled</CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText style={styles.statusValue}>
              {Math.round((meetingCount?.schedule || 0) * 100)}%
            </CustomText>
          </SlideFadeIn>
        </View>

        {/* Conducted */}
        <View style={[styles.statusBox, { backgroundColor: "#22C55E" }]}>
          <SlideFadeIn>
            <CustomText style={styles.statusTitle}>Conducted</CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText style={styles.statusValue}>
              {Math.round((meetingCount?.conducted || 0) * 100)}%
            </CustomText>
          </SlideFadeIn>
        </View>

        {/* Rescheduled */}
        <View style={[styles.statusBox, { backgroundColor: "#F97316" }]}>
          <SlideFadeIn>
            <CustomText style={styles.statusTitle}>Rescheduled</CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText style={styles.statusValue}>
              {Math.round((meetingCount?.reschedule || 0) * 100)}%
            </CustomText>
          </SlideFadeIn>
        </View>
      </View>
    </View>
  );
};

export default MeetingCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderLeftColor: color.mainTxtColorFade,
    borderLeftWidth: 4,
    ...shadowPrimaryColor,
  },
  title: {
    fontSize: 20,
    color: "#1E3A8A",
    marginBottom: 14,
  },
  dropdownBox: {
    marginBottom: 22,
    backgroundColor: "#F9FAFB",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statusBox: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statusTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  statusValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
});
