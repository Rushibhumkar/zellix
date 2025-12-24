import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onRead: () => void;
}

const PopupModal = ({ visible, title, message, loading, onRead }: Props) => {
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
    height: 46,
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
});
