import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import CustomText from "../myComponents/CustomText/CustomText";

interface Props {
  label: string;
  value?: string | number | null;
  onCopy?: () => void;
  icon?: React.ReactNode;
}

const RenderRow: React.FC<Props> = ({ label, value, onCopy, icon }) => {
  const displayValue = value ?? "—";

  return (
    <View style={styles.infoRow}>
      <View style={styles.leftContainer}>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <View>
          <CustomText style={styles.label}>{label}</CustomText>
          <CustomText style={styles.value} numberOfLines={1}>
            {displayValue}
          </CustomText>
        </View>
      </View>

      {onCopy && (
        <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
          <Feather name="copy" size={16} color="#9b9b9b" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RenderRow;

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#8C97A8",
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F3A4A",
  },
  copyButton: {
    backgroundColor: "#9b9b9b18",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
