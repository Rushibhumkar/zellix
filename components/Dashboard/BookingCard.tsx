import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as Progress from "react-native-progress";
import CustomText from "../../myComponents/CustomText/CustomText";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { color } from "../../const/color";

const BookingCard = ({ item }) => {
  const [bookingCount, setBookingCount] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const handleSelectInterval = (interval) => {
    let temp = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    temp.pending = item?.[interval]?.data?.find(
      (el) => el.status === "pending"
    )?.fraction;
    temp.approved = item?.[interval]?.data?.find(
      (el) => el.status === "approved"
    )?.fraction;
    temp.rejected = item?.[interval]?.data?.find(
      (el) => el.status === "rejected"
    )?.fraction;
    setBookingCount(temp);
  };

  useEffect(() => {
    let temp = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    temp.pending = item?.["weekly"]?.data?.find(
      (el) => el.status === "pending"
    )?.fraction;
    temp.approved = item?.["weekly"]?.data?.find(
      (el) => el.status === "approved"
    )?.fraction;
    temp.rejected = item?.["weekly"]?.data?.find(
      (el) => el.status === "rejected"
    )?.fraction;
    setBookingCount(temp);
  }, [!!item?.weekly]);

  return (
    <View style={styles.card}>
      {/* ---------- Header ---------- */}
      <CustomText style={styles.title}>Booking</CustomText>

      {/* ---------- Dropdown ---------- */}
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
        containerStyle={styles.dropdownBox}
      />

      {/* ---------- Status Blocks ---------- */}
      <View style={styles.row}>
        {/* Approved */}
        <View style={[styles.statusBox, { backgroundColor: "#22C55E" }]}>
          <CustomText style={styles.statusTitle}>Approved</CustomText>
          <CustomText style={styles.statusValue}>
            {Math.round((bookingCount?.approved || 0) * 100)}%
          </CustomText>
        </View>

        {/* Rejected */}
        <View style={[styles.statusBox, { backgroundColor: "#EF4444" }]}>
          <CustomText style={styles.statusTitle}>Rejected</CustomText>
          <CustomText style={styles.statusValue}>
            {Math.round((bookingCount?.rejected || 0) * 100)}%
          </CustomText>
        </View>

        {/* Pending */}
        <View style={[styles.statusBox, { backgroundColor: "#3B82F6" }]}>
          <CustomText style={styles.statusTitle}>Pending</CustomText>
          <CustomText style={styles.statusValue}>
            {Math.round((bookingCount?.pending || 0) * 100)}%
          </CustomText>
        </View>
      </View>
    </View>
  );
};

export default BookingCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    ...shadowPrimaryColor,
    shadowColor: color.primaryColor,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
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
