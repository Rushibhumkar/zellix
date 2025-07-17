// MessagePopup.js

import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomModal from "./CustomModal/CustomModal";
import CustomBtn from "./CustomBtn/CustomBtn";
import { WIDTH } from "../const/deviceInfo";
import CustomText from "./CustomText/CustomText";

const CustomModelMessage = ({ isVisible, message, onClose, onPressBtn, setIsVisible }) => {
  return (
    <CustomModal
      visible={isVisible}
      onClose={onClose}
      message={message}
      hasBackdrop={false}
      onPressBtn
    >
      <View style={styles.modalContent}>
        {/* <MaterialIcons
          name="cancel-presentation"
          size={25}
          style={{ alignSelf: 'flex-end' }}
          onPress={() => setIsVisible(false)}
        /> */}
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              padding: 5,
              backgroundColor: "green",
              borderRadius: 60 / 2,
              height: 50,
              width: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="done" size={40} color="#fff" />
          </View>
          <View
            style={{
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CustomText
              fontWeight="700"
              fontSize={20}
              marginBottom={20}
              style={{ textAlign: "center", marginHorizontal: 10, textTransform: 'capitalize' }}
            >
              {message}
            </CustomText>
          </View>
        </View>
        <CustomBtn
          title="OKAY"
          onPress={() => !!onPressBtn ? onPressBtn() : setIsVisible(false)}
          containerStyle={{
            backgroundColor: 'green'
          }}
          textStyle={{
            fontSize: 13
          }}
        />
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    width: WIDTH * 0.6,
    borderRadius: 10,
  },
});

export default CustomModelMessage;
