import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TopMenuModalProps = {
  visible: boolean;
  onClose: () => void;
  heightRatio: number;
  children: React.ReactNode;
};

const TopMenuModal = ({ visible, onClose, heightRatio, children }: TopMenuModalProps) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(-height);
    const animation = Animated.timing(translateY, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [visible, height, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.panel,
            {
              height: Math.min(height * heightRatio, height - insets.bottom),
              transform: [{ translateY }],
            },
          ]}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{
              paddingTop: insets.top + 16,
              paddingHorizontal: 18,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" },
  panel: {
    width: "100%",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: "hidden",
  },
  scroll: { flex: 1 },
});

export default TopMenuModal;
