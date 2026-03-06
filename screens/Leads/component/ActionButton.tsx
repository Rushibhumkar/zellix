import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import CustomText from "../../../myComponents/CustomText/CustomText";

const ActionButton = ({ label, icon, onPress }: any) => (
  <TouchableOpacity style={styles.actionBox} onPress={onPress}>
    <View style={styles.actionIcon}>
      <Feather name={icon} size={20} color="#2E67BE" />
    </View>
    <CustomText style={styles.actionText}>{label}</CustomText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  actionBox: {
    alignItems: "center",
    width: "23%",
  },

  actionIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "#F0F4FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E67BE",
  },
});

export default ActionButton;
