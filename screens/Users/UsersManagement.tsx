import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Button } from "react-native";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { color } from "../../const/color";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import CustomModal from "../../myComponents/CustomModal/CustomModal";

const UsersManagement = () => {
  const navigation = useNavigation();
  const { user } = useSelector(selectUser);

  return (
    <View>
      <Header title={"Users Management"} />
      <View style={{ marginTop: 20, padding: 20 }}>
        {(user?.role === roleEnum.sup_admin || user?.role === roleEnum?.sr_manager)
          &&
          <Pressable
            style={{
              // width: "20%",
              borderBottomWidth: 0.5,
              paddingBottom: 10,
              borderBottomColor: color.textGray,
              marginBottom: 20
            }}
            onPress={() => navigation.navigate("users")}
          >
            <Text style={{ color: "#000000", fontSize: 18, fontWeight: "600" }}>
              Users
            </Text>
          </Pressable>}
        {/* <View style={styles.divider}></View> */}
        <Pressable
          style={{
            borderBottomWidth: 0.5,
            paddingBottom: 10,
            borderBottomColor: color.textGray
          }}
          onPress={() => navigation.navigate("teamList")}
        >
          <Text
            style={{
              color: "#000000",
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Teams
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default UsersManagement;

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: "#131313",
    width: "100%",
    margin: "auto",
    alignSelf: "center",
    borderBottomWidth: 0.5,
    marginTop: 12,
  },
});
