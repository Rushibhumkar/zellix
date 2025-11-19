import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import { roleHRM, statusAttend, statusHRM } from "../../utils/hrmKeysMatchToBE";
import {
  shadowPrimaryColor,
  shadowSecondaryColor,
} from "../../const/globalStyle";

interface TRowAbsent {
  containerStyle: StyleProp<ViewStyle>;
  item: {
    name: string;
    role: string;
    status: string;
  };
  onPress: () => void;
}

const RowAbsent = ({ containerStyle, item, onPress }: TRowAbsent) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, containerStyle]}>
      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <CustomText style={styles.nameText}>{item?.name}</CustomText>
          <CustomText style={styles.roleText}>{roleHRM[item?.role]}</CustomText>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <CustomText style={styles.statusText}>
              {statusAttend[item?.status]}
            </CustomText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RowAbsent;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    ...shadowPrimaryColor,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
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
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FED7D7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    // Shadow for status badge
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E53E3E",
    textTransform: "uppercase",
  },
});
