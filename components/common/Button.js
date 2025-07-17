import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";

const Button = ({ btnText, onPress }) => {
  return (
    <Pressable style={styles.submitbtn} onPress={onPress}>
      <Text style={styles.btntext}>{btnText}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  submitbtn: {
    marginTop: 25,
    backgroundColor: "#FFC857",
    padding: 10,
    width: "95%",
    borderRadius: 11.7,
    alignSelf: "center",
    elevation: 7,
    shadowColor: "#000000",
    shadowOffset: {
      //width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  btntext: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 20,
  },
});

export default Button;
