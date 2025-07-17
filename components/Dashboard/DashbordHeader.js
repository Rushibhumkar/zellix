import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { color } from "../../const/color";
import { selectUser } from "../../redux/userSlice";
import { StatusBar } from "expo-status-bar";
import Notification from "../../assets/svg/Notification";
import Setting from "../../assets/svg/Setting";
import { userTypes } from "../../utils/data";

const DashbordHeader = () => {
  const { user } = useSelector(selectUser);
  const { navigate } = useNavigation();


  const types = {
    ...userTypes,
    sup_admin: "Super Admin",
    sub_admin: "Sub Admin",
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: color.darkBlack,
      }}
    >
      <StatusBar style="light" />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "ios" ? 15 : 55,
          paddingBottom: 20,
        }}
      >
        <View style={{ flex: 1, marginEnd: 7 }}>
          <View style={{ flexDirection: "row", gap: 5, alignItems: 'baseline' }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "500",
              }}
            >
              {user?.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: "rgb(191, 191, 191)",
                fontSize: 12,
                marginTop: 5,
                fontWeight: "400",
                flex: 1
              }}>{types[user?.role]}</Text>
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: "400",
            }}
          >
            {user?.email}
          </Text>
        </View>
        <View>
          <View style={styles.iconscontainer}>
            <Pressable onPress={() => navigate("Notification")}>
              <Notification />
            </Pressable>
            <Pressable onPress={() => navigate("Setting")}>
              <Setting />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  iconscontainer: {
    flexDirection: "row",
    flex: 1,
    color: "#fff",
    fontSize: 15,
    gap: 15,
  },
});

export default DashbordHeader;
