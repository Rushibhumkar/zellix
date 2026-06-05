import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { shadowPrimaryColor } from "../../../const/globalStyle";
import { formatSeconds } from "../../../utils/commonFunctions";

interface Props {
  item: any;
  onPress?: () => void;
}

const CallLogCard = ({ item, onPress }: Props) => {
  const getStatusColor = (type: string) => {
    switch (type) {
      case "positive":
        return "#16A34A";

      case "negative":
        return "#DC2626";

      case "connected":
        return "#2563EB";

      default:
        return "#F59E0B";
    }
  };

  const leadDetails =
    item?.leadId && typeof item?.leadId === "object" ? item.leadId : null;

  const clientName =
    leadDetails?.clientName?.trim() || item?.phoneNumber || "-";

  const clientMobile =
    leadDetails?.clientMobile?.trim() || item?.phoneNumber || "-";

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.name}>{clientName}</Text>

            {!!leadDetails?._id && (
              <Feather
                name="chevron-right"
                size={16}
                color="#64748B"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>

          <Text style={styles.date}>
            {new Date(item?.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: getStatusColor(item?.type),
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {(item?.type || "unknown").replace("_", " ")}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={styles.row}>
          <Feather name="phone-call" size={14} color="#64748B" />

          <Text style={styles.infoText}>{clientMobile}</Text>
        </View>

        <View style={styles.row}>
          <Feather name="clock" size={14} color="#64748B" />

          <Text style={styles.infoText}>
            {formatSeconds(item?.duration ?? 0)}
          </Text>
        </View>
      </View>

      {!!item?.leadStatusAfterCall && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {item.leadStatusAfterCall.replaceAll("_", " ")}
          </Text>
        </View>
      )}

      {!!item?.comment && (
        <Text numberOfLines={2} style={styles.comment}>
          {item.comment}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CallLogCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1.2,
    borderColor: "#E3E8EF",
    ...shadowPrimaryColor,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  date: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  infoText: {
    marginLeft: 8,
    color: "#475569",
    fontSize: 13,
  },

  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },

  tagText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  comment: {
    marginTop: 6,
    color: "#475569",
    fontSize: 12,
  },
});
