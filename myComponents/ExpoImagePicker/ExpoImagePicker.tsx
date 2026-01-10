import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import Modal from "react-native-modal";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";

import CameraIcon from "../../assets/svg/CameraIcon";
import FileIcon from "../../assets/svg/FileIcon";
import GalleryIcon from "../../assets/svg/GalleryIcon";
import PdfPickIcon from "../../assets/svg/PdfPickIcon";

import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import CustomText from "../CustomText/CustomText";

export interface TOnSelect {
  canceled: boolean;
  assets: Array<{
    width: number;
    height: number;
    uri: string;
    base64?: string;
    type: string;
    fileSize?: number;
    fileName?: string;
  }>;
}

interface TExpoImagePicker {
  onSelect: (data: TOnSelect) => void;
  boxContainerStyle?: StyleProp<ViewStyle>;
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
  const [imageName, setImageName] = useState("");

  const handleModal = () => setOpen(!open);

  const uploadImage = async (mode) => {
    try {
      let result = null;

      /** --------------------------------------------------
       * 📄 PDF PICKER
       * -------------------------------------------------- */
      if (mode === "pdf") {
        result = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
        });

        if (!result.canceled) {
          const asset = result.assets[0];
          const temp = {
            ...result,
            assets: [
              {
                ...asset,
                uri: asset.uri,
                type: "pdf",
                fileName: asset.name,
                fileSize: asset.size,
              },
            ],
          };

          setImageName(asset.name);
          onSelect(temp);
        }

        return;
      }

      /** --------------------------------------------------
       * 🖼 GALLERY PICKER
       * -------------------------------------------------- */
      if (mode === "gallery") {
        // await ImagePicker.requestMediaLibraryPermissionsAsync();

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.5,
          allowsMultipleSelection: isMultiplePick,
        });

        if (!result.canceled) {
          // For multiple selection, process all assets
          if (isMultiplePick) {
            const processedAssets = await Promise.all(
              result.assets.map(async (asset) => {
                const info = await FileSystem.getInfoAsync(asset.uri);
                return {
                  ...asset,
                  fileSize: info.size,
                };
              })
            );

            const temp = {
              ...result,
              assets: processedAssets,
            };

            myConsole("Multiple files selected:", {
              count: processedAssets.length,
              files: processedAssets.map((asset) => ({
                fileName: asset.fileName || asset.uri.split("/").pop(),
                fileSize: asset.fileSize,
                type: asset.type,
                uri: asset.uri,
                width: asset.width,
                height: asset.height,
              })),
            });

            setImageName(`${processedAssets.length} files selected`);
            onSelect(temp);
          } else {
            // Single selection - original logic
            const asset = result.assets[0];
            const info = await FileSystem.getInfoAsync(asset.uri);
            const temp = {
              ...result,
              assets: [{ ...asset, fileSize: info.size }],
            };
            setImageName(asset.uri.split("/").pop());
            onSelect(temp);
          }
          handleModal(); // ✅ Move this outside the if/else
        }
        return;
      }

      /** --------------------------------------------------
       * 📷 CAMERA
       * -------------------------------------------------- */
      await ImagePicker.requestCameraPermissionsAsync();

      result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.back,
        quality: 0.5,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const info = await FileSystem.getInfoAsync(asset.uri);

        const temp = {
          ...result,
          assets: [{ ...asset, fileSize: info.size }],
        };

        setImageName(asset.uri.split("/").pop());
        onSelect(temp);
      }
    } catch (error) {
      myConsole("expoPickerError", error);
    }
  };

  return (
    <View>
      {/* Label */}
      <View style={boxContainerStyle}>
        {label ? (
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
        ) : null}

        {/* Picker Button */}
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
            {imageName ? imageName : "Choose a file"}
          </CustomText>
          <FileIcon />
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        isVisible={open}
        hasBackdrop
        onBackdropPress={handleModal}
        animationOut="zoomOut"
      >
        <View>
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 20,
              padding: 24,
              borderRadius: 24,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
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
              }}
            >
              Choose File
            </CustomText>

            <View
              style={{
                flexDirection: "row",
                gap: 16,
                width: 240,
              }}
            >
              {/* Gallery */}
              <TouchableOpacity
                onPress={() => uploadImage("gallery")}
                style={pickerBtnStyle}
              >
                <GalleryIcon />
              </TouchableOpacity>

              {/* PDF */}
              <TouchableOpacity
                onPress={() => uploadImage("pdf")}
                style={pickerBtnStyle}
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

const pickerBtnStyle = {
  paddingHorizontal: 20,
  paddingVertical: 16,
  backgroundColor: color.gray,
  borderRadius: 12,
  flex: 1,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  borderWidth: 1,
  borderColor: "#E2E8F0",
};

export default ExpoImagePicker;
