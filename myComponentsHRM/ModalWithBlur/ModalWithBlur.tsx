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
  DimensionValue,
  StyleSheet,
} from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { shadow1 } from "../../const/globalStyle";
import { color } from "../../const/color";

interface TModalWithBlur {
  visible: boolean;
  onClose?: () => void;
  children?: ReactNode;
  minHeight?: DimensionValue;
  // hasBackdrop?: boolean;
}
const ModalWithBlur = ({
  visible,
  onClose,
  children,
  minHeight,
}: TModalWithBlur) => {
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
        <BlurView tint="dark" intensity={35} style={{ flex: 1 }}>
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          />

          <Pressable
            style={{
              flex: 1,
              justifyContent: "flex-end",
            }}
            onPress={onClose ?? undefined}
          >
            <Pressable
              style={{
                backgroundColor: "white",
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: Platform.OS === "ios" ? 34 : 20,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                width: "100%",
                minHeight: minHeight ?? "25%",
                maxHeight: "92%",
                ...shadow1,
              }}
              onPress={() => Keyboard.dismiss()}
            >
              {!!onClose && (
                <Pressable
                  onPress={onClose}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 999,
                    width: 32,
                    height: 32,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AntDesign
                    name="close"
                    size={22}
                    color={color.mainTxtColor}
                  />
                </Pressable>
              )}
              {/* <View
                style={{
                  width: 55,
                  height: 5,
                  borderRadius: 20,
                  backgroundColor: "#D1D5DB",
                  alignSelf: "center",
                  marginBottom: 16,
                }}
              /> */}
              <View style={{ height: 10 }} />
              {children}
            </Pressable>
          </Pressable>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ModalWithBlur;
