import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import GalleryIcon from '../../assets/svg/GalleryIcon'
import CustomModal from '../CustomModal/CustomModal'
import CustomText from '../CustomText/CustomText'

const ImgViewer = ({ uri }) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleModal = () => {
        setIsOpen(!isOpen)
    }
    const isPDF = () => {
        return uri.toLowerCase().endsWith('.pdf');
    };
    console.log('isPDF', isPDF())
    const handleOpenPDF = () => {
        // Opens the PDF in the browser
        Linking.openURL(uri).catch(err => console.error("Failed to open PDF:", err));
    };

    const handlePress = () => {
        if (isPDF()) {
            handleOpenPDF();
        } else {
            toggleModal()
        }
    }

    return (
        <>
            <TouchableOpacity
                style={{ alignSelf: 'flex-start' }}
                onPress={handlePress}
            >
                <GalleryIcon
                    width={25}
                    height={25}
                />
            </TouchableOpacity>
            <CustomModal
                visible={isOpen}
                hasBackdrop={true}
                onClose={toggleModal}
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        padding: 10,
                        borderRadius: 10,
                    }}
                >
                    {uri !== 'undefined' ? <Image
                        source={{ uri: uri ? uri : '' }}
                        width={300}
                        height={300}
                        resizeMode='contain'
                    /> : <CustomText fontSize={18}>No Image</CustomText>}
                </View>

            </CustomModal>
        </>
    )
}

export default ImgViewer

const styles = StyleSheet.create({})