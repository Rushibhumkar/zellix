import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ModalWithBlur from "../ModalWithBlur/ModalWithBlur";
import NoDataFound from "../../myComponents/NoDataFound/NoDataFound";
import { WIDTH } from "../../const/deviceInfo";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import OutlineBtn from "../../myComponents/OutlineBtn/OutlineBtn";
import GalleryIcon from "../../assets/svgHRM/GalleryIcon";
import CustomText from "../../myComponents/CustomText/CustomText";

interface TImageViewModal {
  imagesUri: [string, string];
  // visible: boolean;
  // toggleModal: () => void;
}
const ImageViewModal = ({
  imagesUri,
}: // visible,
// toggleModal
TImageViewModal) => {
  const [uriList, setUriList] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [imgCount, setImgCount] = useState(0);
  const toggleModal = () => {
    setIsVisible((prev) => !prev);
  };
  useEffect(() => {
    if (Array.isArray(imagesUri)) {
      setUriList(imagesUri);
      setImgCount(imagesUri?.length);
    } else {
      setUriList([]);
      setImgCount(0);
    }
  }, [imagesUri]);
  return (
    <>
      <Pressable onPress={uriList?.length > 0 ? toggleModal : undefined}>
        <GalleryIcon />
        {imgCount > 1 && (
          <View style={{ position: "relative", left: 50, bottom: 30 }}>
            <CustomText fontSize={18}>+{imgCount}</CustomText>
          </View>
        )}
      </Pressable>
      <ModalWithBlur visible={isVisible}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <FlatList
            data={uriList}
            renderItem={({ item }) => {
              return (
                <Image
                  width={WIDTH - 100}
                  height={WIDTH - 100}
                  source={{ uri: item }}
                />
              );
            }}
            horizontal
            contentContainerStyle={{ gap: 15, paddingHorizontal: 15 }}
            ListEmptyComponent={
              <NoDataFound width={WIDTH - 100} height={WIDTH - 100} />
            }
          />
        </View>
        <OutlineBtn
          title="Close"
          onPress={toggleModal}
          containerStyle={{ marginHorizontal: 40, marginTop: 20 }}
          textStyle={{ fontSize: 15 }}
        />
      </ModalWithBlur>
    </>
  );
};

export default ImageViewModal;
