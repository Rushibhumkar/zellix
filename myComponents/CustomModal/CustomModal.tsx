import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { ReactNode, useState } from "react";
// import Modal from "react-native-modal";
interface TCustomModal {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  hasBackdrop: boolean;
}

const CustomModal = (
    { visible, onClose, children, hasBackdrop }: TCustomModal
) => {
    const handleModalPress = () => {
        !!onClose && onClose();
    };
    const handleChildPress = (e) => {
        // Prevent the modal from closing when clicking on the child view
        e.stopPropagation();
    };

    return (
        <Modal
            transparent
            // animationType="slide"
            visible={visible}
            onRequestClose={!!onClose ? onClose : undefined}
        >
            <TouchableWithoutFeedback onPress={hasBackdrop ? handleModalPress : undefined}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        padding: 10,
                    }}
                >
                    <TouchableWithoutFeedback onPress={handleChildPress}>
                        <View>
                            {!!children && children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default CustomModal

const styles = StyleSheet.create({})