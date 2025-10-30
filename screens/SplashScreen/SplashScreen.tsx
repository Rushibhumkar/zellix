import { CommonActions, useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { getData } from "../../hooks/useAsyncStorage";
import AppLogo from "../../assets/svg/AppLogo";
import CustomText from "../../myComponents/CustomText/CustomText";

const SplashScreen = () => {
  const { dispatch } = useNavigation();
  useEffect(() => {
    setTimeout(() => {
      handleGetToken();
    }, 100);
  }, []);

  const handleGetToken = async () => {
    const token = await getData("token");
    if (typeof token !== "string") {
      dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } else {
      dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        })
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* <AppLogo width={230} height={250} /> */}
      <CustomText>sdflkdsf</CustomText>
    </View>
  );
};

export default SplashScreen;
