import React, { ReactNode } from 'react';
import { Modal, View, Text, Button, Pressable, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { shadow1 } from '../../const/globalStyle';

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
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <BlurView tint="light" intensity={20} style={{ flex: 1 }}>
                <Pressable
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => Keyboard.dismiss()}
                >
                    <Pressable
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 10,
                            width: '90%',
                            ...shadow1
                        }}
                        onPress={() => Keyboard.dismiss()}
                    >

                        {children}
                    </Pressable>
                </Pressable>
            </BlurView>
        </Modal>
    );
};

export default ModalWithBlur;