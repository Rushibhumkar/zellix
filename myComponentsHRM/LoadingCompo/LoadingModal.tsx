import { Modal, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import PleaseWait from '../PleaseWait/PleaseWait';

interface TLoadingModal {
    isVisible: boolean;
}
const LoadingModal = ({
    isVisible
}: TLoadingModal) => {
    const [isOpen, setIsOpen] = useState(false)
    useEffect(() => {
        setIsOpen(isVisible)
    }, [isVisible])
    return (
        <Modal
            visible={isOpen}
            transparent
            statusBarTranslucent
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    padding: 10,
                }}
            >
                <PleaseWait />
            </View>
        </Modal>
    )
}

export default LoadingModal

const styles = StyleSheet.create({})