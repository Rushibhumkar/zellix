import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Modal from "react-native-modal";
import CameraIcon from "../../assets/svg/CameraIcon";
import FileIcon from "../../assets/svg/FileIcon";
import GalleryIcon from "../../assets/svg/GalleryIcon";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import PdfPickIcon from "../../assets/svg/PdfPickIcon";
import CustomText from "../CustomText/CustomText";

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
  onSelect: (TOnSelect) => void;
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
  const [image, setImage] = useState("");
  const handleModal = () => {
    setOpen(!open);
  };
  const uploadImage = async (mode) => {
    try {
      if (mode === "pdf") {
        const result = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          multiple: false,
        });
        // const fileSizeInBytes = await FileSystem.getInfoAsync(result?.assets[0]?.uri);
        // // result?.['fileSize'] = fileSizeInBytes?.size;
        let tempResult = {
          ...result,
          assets: [
            {
              ...result?.assets[0],
              fileSize: result?.assets[0]?.size,
              uri: result?.assets[0]?.uri,
              type: "pdf",
              fileName: result?.assets[0]?.name,
            },
          ],
        };
        if (!result.canceled) {
          await setImage(tempResult?.assets[0]?.uri);
          await onSelect(tempResult);
        }
        myConsole("resultPDwF", result);
      } else if (mode === "gallery") {
        let result = {};
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.4,
          allowsMultipleSelection: isMultiplePick,
        });
        const fileSizeInBytes = await FileSystem.getInfoAsync(
          result?.assets[0]?.uri
        );
        // result?.['fileSize'] = fileSizeInBytes?.size;
        let tempResult = {
          ...result,
          assets: [{ ...result?.assets[0], fileSize: fileSizeInBytes?.size }],
        };
        if (!result.canceled) {
          await setImage(tempResult?.assets[0]?.uri);
          await onSelect(!isMultiplePick ? tempResult : result);
        }
      } else {
        let result = {};
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.back,
          allowsEditing: false,
          quality: 0.5,
        });
        // if (!result.canceled) {
        //     await setImage(result?.assets[0]?.uri)
        //     await onSelect(result)
        // }
        const fileSizeInBytes = await FileSystem.getInfoAsync(
          result?.assets[0]?.uri
        );
        // result?.['fileSize'] = fileSizeInBytes?.size;
        let tempResult = {
          ...result,
          assets: [{ ...result?.assets[0], fileSize: fileSizeInBytes?.size }],
        };
        if (!result.canceled) {
          await setImage(tempResult?.assets[0]?.uri);
          await onSelect(tempResult);
        }
      }
    } catch (error) {
    } finally {
      handleModal();
    }
  };
  return (
    <View>
      {/* <CustomText>ExpoImagePicker</CustomText>
            <Button title='openModal gallery' onPress={handleModal} /> */}
      <View style={[boxContainerStyle]}>
        {label && (
          <CustomText
            style={{
              color: color.mainTxtColor,
              marginBottom: 10,
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            {label}
          </CustomText>
        )}
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            height: 44,
            borderColor: color.mainTxtColorFade,
            borderWidth: 1.6,
            borderRadius: 14,
            paddingHorizontal: 10,
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            paddingEnd: 20,
          }}
          onPress={handleModal}
        >
          <CustomText
            style={{
              fontSize: 14,
              fontWeight: "400",
              color: color.mainTxtColorFade,
            }}
          >
            {image ? `${label}.png` : "Choose a file"}
          </CustomText>
          <FileIcon />
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={open}
        hasBackdrop={true}
        onBackdropPress={handleModal}
        animationOut={"zoomOut"}
      >
        <View>
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 20,
              padding: 24,
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
              borderWidth: 1,
              borderColor: "#F1F5F9",
            }}
          >
            <CustomText
              style={{
                fontSize: 22,
                fontWeight: "700",
                marginBottom: 24,
                color: color.mainTxtColor,
                letterSpacing: 0.5,
              }}
            >
              Choose Image
            </CustomText>
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                width: 240,
              }}
            >
              {/* <TouchableOpacity
        onPress={() => uploadImage('')}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: color.gray,
          borderRadius: 12,
          marginHorizontal: 10,
          flex: 1,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <CameraIcon />
      </TouchableOpacity> */}
              <TouchableOpacity
                onPress={() => uploadImage("gallery")}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  backgroundColor: color.gray,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <GalleryIcon />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => uploadImage("pdf")}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  backgroundColor: color.gray,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <PdfPickIcon />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExpoImagePicker;
