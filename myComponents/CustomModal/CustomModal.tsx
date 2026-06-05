import {
  Keyboard,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Animated,
  Dimensions,
  PanResponder,
  StyleProp,
  ViewStyle,
} from "react-native";
import React, { ReactNode, useEffect, useRef } from "react";

interface TCustomModal {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  hasBackdrop?: boolean;
  modalStyle?: StyleProp<ViewStyle>;
}

const { height } = Dimensions.get("window");

const CustomModal = ({
  visible,
  onClose,
  children,
  hasBackdrop,
  modalStyle,
}: TCustomModal) => {
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 4,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          closeModal();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handleBackdropPress = () => {
    if (hasBackdrop) {
      closeModal();
    } else {
      Keyboard.dismiss();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY }],
                },
                modalStyle,
              ]}
            >
              {/* Drag Handle Only */}
              <View
                style={styles.handleContainer}
                {...panResponder.panHandlers}
              >
                <View style={styles.handle} />
              </View>

              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: height * 0.9,
  },

  handleContainer: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  handle: {
    width: 55,
    height: 5,
    borderRadius: 20,
    backgroundColor: "#D1D5DB",
  },
});
