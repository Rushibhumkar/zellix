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
import CustomText from "../../myComponents/CustomText/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { color } from "../../const/color";
import { Entypo, Feather } from "@expo/vector-icons";
import { iconWrapperStyle } from "../../const/globalStyle";
import * as LocalAuthentication from "expo-local-authentication";

const LoginScreen = () => {
  const navigation = useNavigation();
  const initialValues = {
    // email: "vishal@skgestates.com",
    // password: "Application@2025*!",
    // email: "suurajkummargupta@gmail.com",
    // password: "123456789",
    // email: "kashif22@mailinator.com",
    // password: "123456789",
    // dev : agent
    // email: "dev1@swavishtek.com",
    // password: "",
    // dev : agent
    // email: "abhishek@swavishsoftware.com",
    // password: "",
    // dev : agent ( Rushikesh Bhumkar )
    // email: "test1@swavishtek.com",
    // password: "",
    // dev :
    // email: "test@test.com",
    // password: "123456789",
    // dev : super admin
    // email: "mohdkashif1008@gmail.com",
    // password: "",
    // dev  : sr manager ( Rohit Barate )
    // email: "dev20@swavishtek.com",
    // password: "",
    // dev  : team lead( pradeep shukla )
    // email: "pradeep@swavishsoftware.com",
    // password: "",
    // <=========== LIVE =============>
    // live : seo
    // email: "marketing@skgestates.com",
    // password: "1234567890",
    // live : sr manager
    // email: "amit.singh@skgestates.com",
    // password: "",
    // live : Team lead
    // email: "shivam.sourabh@skgestates.com",
    // password: "",
    // live : Agent
    // email: "farakhuddin.khan@skgestatesmail.com",
    // password: "",
    // live : super admin
    // email: "tech@skgestates.com",
    // password: "Rohit@311001",
    email: "",
    password: "",
  };
  const [isLoading, setIsLoading] = useState(false);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  const handleBiometricLogin = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();

      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log("Supported types:", types);

      if (!compatible) {
        Alert.alert("Biometric not supported");
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!enrolled) {
        Alert.alert("No biometrics enrolled");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with Face ID",
        fallbackLabel: "",
        disableDeviceFallback: true,
      });

      console.log("AUTH RESULT:", result);

      if (result.success) {
        const savedEmail = await getData("bio_email");
        const savedPassword = await getData("bio_password");

        if (savedEmail && savedPassword) {
          handleFormSubmit({
            email: savedEmail,
            password: savedPassword,
          });
        } else {
          Alert.alert("Please login once manually");
        }
      } else {
        Alert.alert("Face ID failed", "Please enter password manually");
      }
    } catch (e) {
      console.log("Biometric error:", e);
    }
  };

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
        console.log("res?.token", res?.token);
        await storeData("token", res?.token);
        await storeDataJson("userDetail", { ...res, isAdmin });

        await storeData("bio_email", values?.email);
        await storeData("bio_password", values?.password);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          }),
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
                      <View>
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#E6ECF560",
                            paddingVertical: 10,
                            paddingHorizontal: 18,
                            borderRadius: 18,
                            marginTop: 20,
                            gap: 12,
                            borderColor: color.borderColor,
                            borderWidth: 1,
                          }}
                          onPress={handleBiometricLogin}
                        >
                          <View style={styles.iconWrapper}>
                            <Entypo name="fingerprint" size={26} color="#fff" />
                          </View>

                          <Text style={styles.text}>
                            Sign in with Face ID / Touch ID
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.inputcontainer}>
                        <CustomInput
                          label=""
                          value={values.email}
                          onChangeText={handleChange("email")}
                          placeholder="Email Address "
                          props={{
                            autoCapitalize: "none",
                            autoCorrect: false,
                          }}
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
                          showPasswordToggle
                        />
                        {errors.password && touched?.password && (
                          <CustomText style={{ color: "red", marginTop: -44 }}>
                            {errors.password}
                          </CustomText>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("ForgetPassword", {
                            email: values.email,
                          })
                        }
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
    marginTop: 40,
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
    backgroundColor: color.mainTxtColor,
    borderWidth: 1,
    borderColor: "#739fe13a",
    padding: 6,
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    color: color.mainTxtColor,
  },
});
export default LoginScreen;
