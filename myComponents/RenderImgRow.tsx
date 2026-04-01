import React from "react";
import { View, StyleSheet } from "react-native";
import CustomText from "../myComponents/CustomText/CustomText";
import ImgViewer from "../myComponents/ImgViewer/ImgViewer";

interface Props {
  label: string;
  uri?: string;
}

const RenderImgRow: React.FC<Props> = ({ label, uri }) => {
  if (!uri) return null;

  return (
    <View style={styles.infoRow}>
      <View style={{ flex: 1 }}>
        <CustomText style={styles.label}>{label}</CustomText>
        <ImgViewer uri={uri} />
      </View>
    </View>
  );
};

export default RenderImgRow;

const styles = StyleSheet.create({
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#8C97A8",
    letterSpacing: 1,
    marginBottom: 6,
  },
});
