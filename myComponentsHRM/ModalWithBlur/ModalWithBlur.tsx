import React, { ReactNode } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  Pressable,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { BlurView } from "expo-blur";
import { shadow1 } from "../../const/globalStyle";

interface TModalWithBlur {
  visible: boolean;
  onClose?: () => void;
  children?: ReactNode;
  // hasBackdrop?: boolean;
}
const ModalWithBlur = ({ visible, onClose, children }: TModalWithBlur) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <BlurView tint="light" intensity={20} style={{ flex: 1 }}>
          <Pressable
            style={{
              flex: 1,
              justifyContent: "flex-end",
            }}
            onPress={onClose}
          >
            <Pressable
              style={{
                backgroundColor: "white",
                paddingHorizontal: 20,
                paddingTop: 14,
                paddingBottom: Platform.OS === "ios" ? 34 : 20,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                width: "100%",
                maxHeight: "92%",
                ...shadow1,
              }}
              onPress={() => Keyboard.dismiss()}
            >
              <View
                style={{
                  width: 55,
                  height: 5,
                  borderRadius: 20,
                  backgroundColor: "#D1D5DB",
                  alignSelf: "center",
                  marginBottom: 16,
                }}
              />
              {children}
            </Pressable>
          </Pressable>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ModalWithBlur;
