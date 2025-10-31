import React, { useState } from "react";
import { Pressable, View, Text, Image,StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import CustomText from "../../myComponents/CustomText/CustomText";

const BasicDocumentPicker = ({ onDocumentPick,placeholder }) => {
  const [pickedDocument, setPickedDocument] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (result.assets && result.assets.length > 0) {
        const firstAsset = result.assets[0];
        setPickedDocument(firstAsset?.name);
        onDocumentPick(firstAsset?.name);
      } else {
        setPickedDocument(null);
        onDocumentPick(null);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

 

  return (
    <Pressable onPress={pickDocument} style={styles.input}>
      {pickedDocument ? (
        <CustomText>{pickedDocument}</CustomText>
      ) : (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <CustomText>{placeholder}</CustomText>
          <Image source={require("../../assets/fileicon.png")} />
        </View>
      )}
    </Pressable>
  );
};

export default BasicDocumentPicker;

const styles = StyleSheet.create({
  input: {
    marginTop: 10,
    height: 37.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
});
