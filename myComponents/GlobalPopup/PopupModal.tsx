import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { color } from "../../const/color";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onRead: () => void;
  onOpen?: () => void;
}

const PopupModal = ({
  visible,
  title,
  message,
  loading,
  onRead,
  onOpen,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      hardwareAccelerated
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>
          <View style={styles.btnRow}>
            {/* Read Button */}
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={onRead}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>READ</Text>
              )}
            </TouchableOpacity>

            {/* External Link Icon */}
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.8}
              onPress={onOpen}
            >
              {/* <Feather name="external-link" size={20} color="#2563EB" /> */}
              {loading ? (
                <ActivityIndicator color={color.mainTxtColor} />
              ) : (
                <Text style={{ color: color.mainTxtColor }}>OPEN</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PopupModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111",
  },
  message: {
    fontSize: 15,
    color: "#444",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    height: 40,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // keep gap for spacing
    marginTop: 8,
  },

  outlineBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2563EB",
  },

  iconBtn: {
    flex: 1, // ✅ add this
    height: 40, // ✅ same height as button
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
});
