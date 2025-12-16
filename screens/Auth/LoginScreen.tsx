import React, { useState } from "react";
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import { LoginSchema } from "../../utils/validation";
import { login } from "../../services/authApi/auth";
import { getData, storeData, storeDataJson } from "../../hooks/useAsyncStorage";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { roleEnum } from "../../utils/data";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { myConsole } from "../../hooks/useConsole";
import { baseURL, setBaseUrl } from "../../services/authApi/axiosInstance";
import CustomText from "../../myComponents/CustomText/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { color } from "../../const/color";
import { Feather } from "@expo/vector-icons";
import { iconWrapperStyle } from "../../const/globalStyle";

const LoginScreen = () => {
  const navigation = useNavigation();
  const initialValues = {
    // email: "kumarvishalpost1@gmail.com",
    // password: "123456789",
    // email: "suurajkummargupta@gmail.com",
    // password: "123456789",
    // email: "kashif22@mailinator.com",
    // password: "123456789",
    // email: "mohdkashif1008@gmail.com",
    // password: "123456789",
    // email: "test@test.com",
    // password: "123456789",
    // email: "dev20@swavishtek.com",
    // password: "123456789",
    email: "",
    password: "",
  };
  const [isLoading, setIsLoading] = useState(false);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  const handleFormSubmit = async (values: any) => {
    const deviceId = await getData("deviceId");
    setIsLoading(true);
    let data = {
      email: values?.email,
      password: values?.password,
      ...(typeof deviceId === "string" && { deviceId: deviceId }),
    };

    login(data)
      .then(async (res) => {
        let isAdmin = res?.role === roleEnum.sup_admin;
        await storeData("token", res?.token);
        await storeDataJson("userDetail", { ...res, isAdmin });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          })
        );
      })
      .catch((err) => {
        myConsole("errssss", err);
        setSnackBar({
          visible: true,
          text: err?.response?.data,
          error: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={"#fff"} barStyle="dark-content" />
        <ImageBackground
          source={require("../../assets/AuthBack.png")}
          style={styles.background}
        >
          <ScrollView>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? 30 : 20}
              style={styles.container}
            >
              <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
              <Formik
                initialValues={initialValues}
                validationSchema={LoginSchema}
                onSubmit={handleFormSubmit}
              >
                {({
                  handleChange,
                  handleSubmit,
                  values,
                  errors,
                  handleBlur,
                  touched,
                }) => {
                  return (
                    <View style={styles.logincontainer}>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Image
                          source={require("../../assets/authlogo.png")}
                          style={styles.authlogo}
                        />
                      </View>
                      <View style={{ flex: 1, marginTop: 12 }}>
                        <Pressable
                          onLongPress={async () => {
                            const deviceId = await getData("deviceId");
                            Alert.alert("deviceId", deviceId ?? "null");
                          }}
                        >
                          <CustomText style={styles.welcomeTxt}>
                            Welcome Back
                          </CustomText>
                          <CustomText style={styles.descTxt}>
                            Sign in to your Zellix account
                          </CustomText>
                        </Pressable>
                      </View>
                      <View style={styles.inputcontainer}>
                        <CustomInput
                          label=""
                          value={values.email}
                          onChangeText={handleChange("email")}
                          placeholder="Email Address "
                          isShadow
                          onBlur={handleBlur("email")}
                          leftIcon={
                            <View style={{ ...iconWrapperStyle }}>
                              <Feather
                                name="mail"
                                size={20}
                                color={color.color1}
                              />
                            </View>
                          }
                        />
                        {errors.email && touched?.email && (
                          <CustomText style={styles.errorText}>
                            {errors.email}
                          </CustomText>
                        )}
                        <CustomInput
                          label=""
                          value={values.password}
                          onChangeText={handleChange("password")}
                          placeholder="Password "
                          containerStyle={{ marginBottom: 15 }}
                          isShadow
                          onBlur={handleBlur("password")}
                          leftIcon={
                            <View style={{ ...iconWrapperStyle }}>
                              <Feather
                                name="lock"
                                size={20}
                                color={color.color1}
                              />
                            </View>
                          }
                          props={{
                            secureTextEntry: true,
                          }}
                        />
                        {errors.password && touched?.password && (
                          <CustomText style={{ color: "red", marginTop: -44 }}>
                            {errors.password}
                          </CustomText>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => navigation.navigate("ForgetPassword")}
                      >
                        <CustomText
                          style={{
                            color: color.color1,
                            fontSize: 16,
                            marginTop: 10,
                            alignSelf: "flex-end",
                          }}
                        >
                          Forgot Password?
                        </CustomText>
                      </TouchableOpacity>
                      <CustomBtn
                        title="Login"
                        isLoading={isLoading}
                        onPress={handleSubmit}
                        containerStyle={{ marginTop: 50 }}
                      />
                    </View>
                  );
                }}
              </Formik>
            </KeyboardAvoidingView>
          </ScrollView>
          {/* <Pressable
            onLongPress={() => Alert.alert('Base URL(Plz click on Cancel)', `${baseURL}`, [
              {
                text: 'Cancel',
                onPress: () => console.log('Ask me later pressed'),
              },
              {
                text: 'Live Url',
                onPress: () => setBaseUrl('https://api.crmaxproperty.com'),
                style: 'cancel',
              },
              {
                text: 'Test Url', onPress: () =>
                  // setBaseUrl('https://axproperty-backend.onrender.com') 
                  setBaseUrl(`https://axproperty-api-new.onrender.com`)
              },

            ])}

            style={{
              // backgroundColor: 'red',
              width: 50,
              height: 50,
              position: 'absolute',
              // top: 20,
              // right: 20,
              // borderRadius: 25,
            }}
          >
          </Pressable> */}
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  logincontainer: {
    flex: 1,
    textAlign: "center",
    position: "relative",
    marginTop: 100,
    marginVertical: 120,
    padding: 25,
  },
  welcomeTxt: {
    fontSize: 28,
    marginTop: 20,
    textAlign: "center",
    color: color.mainTxtColor,
  },
  descTxt: {
    fontSize: 18,
    // marginTop: 12,
    textAlign: "center",
    fontWeight: "300",
    color: "#739FE1",
  },
  inputcontainer: {
    flex: 1,
    marginTop: 20,
    gap: 30,
  },
  authlogo: {
    height: 60,
    width: 140,
  },
  errorText: {
    color: "red",
    marginTop: -30,
  },
  iconWrapper: {
    backgroundColor: "#F9FBFD",
    borderWidth: 1,
    borderColor: "#739fe13a",
    padding: 6,
    borderRadius: 12,
  },
});
export default LoginScreen;
