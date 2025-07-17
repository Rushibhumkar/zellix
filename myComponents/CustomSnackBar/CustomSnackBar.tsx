import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text } from "react-native";
import * as Animatable from "react-native-animatable";


const CustomSnackBar = ({
  snackbar,
  setSnackbar,

}: any) => {
  useEffect(() => {
    if (snackbar?.visible ) {
      setTimeout(() => {
        setSnackbar({ visible: false, text: "", error: false });
      }, 1000);
    }
  }, [snackbar?.visible]);
  if (snackbar.visible) {
    return (
      <Animatable.View
        easing="ease-out"
        animation="fadeIn"
        duration={200}
        style={[
          styles.body,
          {
            backgroundColor: snackbar.error ? "#FF5C5C" : "green",
          },
        ]}
      >
        <Ionicons
          name={snackbar?.error ? "close" : "checkmark-circle-outline"}
          color={snackbar.error ? "#000" : "#fff"}
          size={20}
        />
        <Text
          style={{
            letterSpacing: 1,
            marginLeft: 10,
            fontSize: 12,
            color: snackbar.error ? "#000" : "#fff",
          }}
        >
          {snackbar?.text}
         
        </Text>
      </Animatable.View>
    );
  }
  return <></>;
};

export default CustomSnackBar;

const styles = StyleSheet.create({
  body: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 50,
    borderRadius: 5,
    width: "90%",
    alignSelf: "center",
    position: 'absolute'
  },
});
