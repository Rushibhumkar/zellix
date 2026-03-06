import { Feather } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import CustomText from "../../../myComponents/CustomText/CustomText";

const AssignmentRow = ({ icon, label, value }: any) => (
  <View style={styles.assignmentRow}>
    {!!icon && <Feather name={icon} size={18} color="#7A869A" />}
    <CustomText style={styles.assignmentLabel}>{label}</CustomText>
    <CustomText style={styles.assignmentValue}>{value || "-"}</CustomText>
  </View>
);

const styles = StyleSheet.create({
  assignmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },

  assignmentLabel: {
    flex: 1,
    marginLeft: 12,
    color: "#6B778C",
    fontSize: 15,
  },

  assignmentValue: {
    fontWeight: "600",
    fontSize: 16,
    color: "#2F3A4A",
  },
});
export default AssignmentRow;
