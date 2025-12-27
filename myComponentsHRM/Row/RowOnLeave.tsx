import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import CustomText from "../../myComponents/CustomText/CustomText";
import { roleHRM } from "../../utils/hrmKeysMatchToBE";
import moment from "moment";
import { truncateString } from "../../utils/commonFunctions";
import { shadowPrimaryColor } from "../../const/globalStyle";
import { color } from "../../const/color";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface TRowOnLeave {
  containerStyle?: StyleProp<ViewStyle>;
  item: {
    name: string;
    role: string;
    days: number;
    createdAt: string;
    status: string;
  };
  onPress: () => void;
}

const RowOnLeave = ({ containerStyle, item, onPress }: TRowOnLeave) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, containerStyle]}>
      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <SlideFadeIn>
            <CustomText style={styles.nameText}>
              {item?.name ?? "N/A"}
            </CustomText>
          </SlideFadeIn>
          <SlideFadeIn>
            <CustomText style={styles.roleText}>
              {roleHRM[item?.role]}
            </CustomText>
          </SlideFadeIn>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <SlideFadeIn>
              <CustomText style={styles.detailLabel}>Days</CustomText>
            </SlideFadeIn>
            <View style={styles.daysBadge}>
              <SlideFadeIn>
                <CustomText style={styles.daysText}>{item?.days}</CustomText>
              </SlideFadeIn>
            </View>
          </View>

          <View style={styles.detailItem}>
            <SlideFadeIn>
              <CustomText style={styles.detailLabel}>Applied On</CustomText>
            </SlideFadeIn>
            <SlideFadeIn>
              <CustomText style={styles.dateText}>
                {moment(item.createdAt).format("DD/MM/YYYY")}
              </CustomText>
            </SlideFadeIn>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RowOnLeave;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    ...shadowPrimaryColor,
    borderLeftWidth: 4,
    borderLeftColor: "#4ECDC4",
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainInfo: {
    flex: 1,
    gap: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "400",
    color: color.strokeColor,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  detailItem: {
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#A0AEC0",
    textTransform: "uppercase",
  },
  daysBadge: {
    backgroundColor: "#4ECDC4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 30,
    alignItems: "center",
  },
  daysText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4A5568",
  },
});
