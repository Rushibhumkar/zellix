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
            <TouchableOpacity
              style={styles.openBtn}
              activeOpacity={0.8}
              onPress={onOpen}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="external-link" size={18} color="#fff" />
                  <Text style={styles.openBtnText}>OPEN</Text>
                </>
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

  openBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  openBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
