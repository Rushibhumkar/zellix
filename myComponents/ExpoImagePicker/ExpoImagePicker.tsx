import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Modal from "react-native-modal";
import CameraIcon from '../../assets/svg/CameraIcon';
import FileIcon from '../../assets/svg/FileIcon';
import GalleryIcon from '../../assets/svg/GalleryIcon';
import { color } from '../../const/color';
import { myConsole } from '../../hooks/useConsole';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import PdfPickIcon from '../../assets/svg/PdfPickIcon';

export interface TOnSelect {
    canceled: boolean;
    assets: [
        {
            width: number;
            rotation: any;
            height: number;
            exif: any;
            duration: any;
            type: string;
            base64: string;
            uri: string;
            assetId: any;
        }
    ];
    cancelled: boolean;
}

interface TExpoImagePicker {
    onSelect: (TOnSelect) => void,
    boxContainerStyle: StyleProp<ViewStyle>;
    label: string;
    isMultiplePick?: boolean;
}

const ExpoImagePicker = ({
    onSelect,
    boxContainerStyle,
    label,
    isMultiplePick = false,
}: TExpoImagePicker) => {
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState('');
    const handleModal = () => {
        setOpen(!open)
    }
    const uploadImage = async (mode) => {
        try {
            if (mode === 'pdf') {
                const result = await DocumentPicker.getDocumentAsync({
                    type: 'application/pdf',
                    multiple: false
                });
                // const fileSizeInBytes = await FileSystem.getInfoAsync(result?.assets[0]?.uri);
                // // result?.['fileSize'] = fileSizeInBytes?.size;
                let tempResult = {
                    ...result,
                    assets: [{
                        ...result?.assets[0],
                        fileSize: result?.assets[0]?.size,
                        uri: result?.assets[0]?.uri,
                        type: 'pdf',
                        fileName: result?.assets[0]?.name
                    }]
                }
                if (!result.canceled) {
                    await setImage(tempResult?.assets[0]?.uri)
                    await onSelect(tempResult)
                }
                myConsole('resultPDwF', result)
            }
            else if (mode === 'gallery') {
                let result = {};
                await ImagePicker
                    .requestMediaLibraryPermissionsAsync();
                result = await ImagePicker
                    .launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: false,
                        quality: 0.4,
                        allowsMultipleSelection: isMultiplePick
                    })
                const fileSizeInBytes = await FileSystem.getInfoAsync(result?.assets[0]?.uri);
                // result?.['fileSize'] = fileSizeInBytes?.size;
                let tempResult = {
                    ...result,
                    assets: [{ ...result?.assets[0], fileSize: fileSizeInBytes?.size }]
                }
                if (!result.canceled) {
                    await setImage(tempResult?.assets[0]?.uri)
                    await onSelect(!isMultiplePick ? tempResult : result)
                }
            } else {
                let result = {};
                await ImagePicker
                    .requestCameraPermissionsAsync();
                result = await ImagePicker
                    .launchCameraAsync({
                        cameraType: ImagePicker.CameraType.back,
                        allowsEditing: false,
                        quality: 0.5
                    })
                // if (!result.canceled) {
                //     await setImage(result?.assets[0]?.uri)
                //     await onSelect(result)
                // }
                const fileSizeInBytes = await FileSystem.getInfoAsync(result?.assets[0]?.uri);
                // result?.['fileSize'] = fileSizeInBytes?.size;
                let tempResult = {
                    ...result,
                    assets: [{ ...result?.assets[0], fileSize: fileSizeInBytes?.size }]
                }
                if (!result.canceled) {
                    await setImage(tempResult?.assets[0]?.uri)
                    await onSelect(tempResult)
                }
            }
        }
        catch (error) { }
        finally { handleModal() }
    }
    return (
        <View>
            {/* <Text>ExpoImagePicker</Text>
            <Button title='openModal gallery' onPress={handleModal} /> */}
            <View
                style={[boxContainerStyle]}
            >
                {label && <Text
                    style={{
                        color: "#000000",
                        marginBottom: 10,
                        fontSize: 16,
                        fontWeight: "500",
                    }}
                >
                    {label}
                </Text>}
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={{
                        height: 37.5,
                        borderColor: "#000000",
                        backgroundColor: "#FCFAFA",
                        borderWidth: 0.5,
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        width: "100%",
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingEnd: 20,
                    }}
                    onPress={handleModal}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '400',
                        }}
                    >{image ? `${label}.png` : 'Choose a file'}
                    </Text>
                    <FileIcon />
                </TouchableOpacity>
            </View>
            <Modal
                isVisible={open}
                hasBackdrop={true}
                onBackdropPress={handleModal}
                animationOut={'zoomOut'}
            >
                <View
                >
                    <View style={{
                        backgroundColor: 'white',
                        marginHorizontal: 20,
                        padding: 20,
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text
                            style={{ fontSize: 20, fontWeight: '700', marginBottom: 20 }}
                        >Choose Image
                        </Text>
                        <View
                            style={{
                                justifyContent: 'space-between',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                width: 200
                            }}
                        >
                            {/* <TouchableOpacity
                                onPress={() => uploadImage('')}
                                style={{
                                    paddingHorizontal: 15,
                                    paddingVertical: 10,
                                    backgroundColor: color.gray,
                                    borderRadius: 5,
                                    marginHorizontal: 10,
                                }}
                            >
                                <CameraIcon />
                            </TouchableOpacity> */}
                            <TouchableOpacity
                                onPress={() => uploadImage('gallery')}
                                style={{
                                    paddingHorizontal: 15,
                                    paddingVertical: 10,
                                    backgroundColor: color.gray,
                                    borderRadius: 5,
                                    // marginHorizontal: 10,
                                }}
                            >
                                <GalleryIcon />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => uploadImage('pdf')}
                                style={{
                                    paddingHorizontal: 15,
                                    paddingVertical: 10,
                                    backgroundColor: color.gray,
                                    borderRadius: 5,
                                    // marginHorizontal: 10,
                                }}
                            >
                                <PdfPickIcon />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >
        </View >
    )
}

export default ExpoImagePicker
