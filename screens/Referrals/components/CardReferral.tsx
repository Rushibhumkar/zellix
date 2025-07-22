import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { shadow1 } from "../../../const/globalStyle";
import moment from "moment";
import { myConsole } from "../../../hooks/useConsole";

const CardReferral = ({
  item,
  onPress,
  index,
  selected,
  bgColor,
  onLongPress,
}) => {
  return (
    <TouchableOpacity
      key={index}
      style={[
        styles.mainlistcontainer,
        {
          backgroundColor: selected
            ? "rgba(252, 244, 227, 1)"
            : bgColor || "white",
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Left Column: Client Info */}
        <View style={{ width: "40%", paddingEnd: 3 }}>
          <Text numberOfLines={1} style={styles.labelText}>
            {item?.clientName || "N/A"}
          </Text>
          <Text numberOfLines={1} style={styles.valueText}>
            {item?.email || "N/A"}
          </Text>
        </View>

        {/* Middle Column: Amount and Status */}
        <View style={{ width: "40%", paddingEnd: 3, paddingStart: 12 }}>
          <Text numberOfLines={1} style={styles.labelText}>
            ₹ {item?.referralAmount || 0}
          </Text>
          <Text numberOfLines={1} style={styles.valueText}>
            {item?.status || "N/A"}
          </Text>
        </View>

        {/* Right Column: Date */}
        <View
          style={{
            width: "25%",
            alignItems: "flex-end",
          }}
        >
          <Text numberOfLines={1} style={styles.dateText}>
            {moment(item?.createdAt).format("DD/MM/YYYY") || "N/A"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CardReferral;

// ✅ Header component export
export const HeaderReferralList = () => {
  return (
    <View style={styles.headingContainer}>
      <View style={{ width: "40%", paddingEnd: 3 }}>
        <Text style={styles.headingText}>Client</Text>
        <Text style={styles.headingText}>Email</Text>
      </View>
      <View style={{ width: "40%", paddingEnd: 3 }}>
        <Text style={styles.headingText}>Amount</Text>
        <Text style={styles.headingText}>Status</Text>
      </View>
      <View style={{ width: "20%" }}>
        <Text style={styles.headingText}>Date</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainlistcontainer: {
    marginTop: 25,
    borderWidth: 1,
    padding: 13,
    borderRadius: 10,
    borderColor: "#2D67C6",
    marginHorizontal: 20,
    ...shadow1,
  },
  headingContainer: {
    backgroundColor: "#3E3E3E",
    flexDirection: "row",
    padding: 10,
    borderRadius: 11,
    marginBottom: -8,
    marginTop: 25,
    marginHorizontal: 20,
  },
  headingText: {
    color: "white",
    fontSize: 13,
    marginBottom: 5,
  },
  labelText: {
    color: "#000",
    fontSize: 16,
    textTransform: "capitalize",
  },
  valueText: {
    color: "#000",
    fontSize: 14,
    marginTop: 5,
    textTransform: "capitalize",
  },
  dateText: {
    color: "#000",
    fontSize: 14,
    marginTop: 10,
    marginRight: 12,
  },
});
