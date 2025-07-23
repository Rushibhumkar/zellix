import React, { useState } from "react";
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  StatusBar
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

const LoginScreen = () => {
  const navigation = useNavigation();
  const initialValues = {
    email: "",
    password: "",
  };
  const [isLoading, setIsLoading] = useState(false);
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  const handleFormSubmit = async (values) => {
    const deviceId = await getData('deviceId');
    setIsLoading(true);
    let data = {
      email: values?.email,
      password: values?.password,
      ...(typeof (deviceId) === 'string' && { deviceId: deviceId })
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
        myConsole('err', err)
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
      <StatusBar backgroundColor={'#fff'} barStyle="dark-content"/>
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
                {({ handleChange, handleSubmit, values, errors, handleBlur, touched }) => {
                  return (
                    <View style={styles.logincontainer}>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Image
                          source={require("../../assets/authlogo.png")}
                          style={styles.authlogo}
                        />
                      </View>
                      <View style={{ flex: 1, textAlign: "center",marginTop:12 }}>
                        <Pressable
                          onLongPress={async () => {
                            const deviceId = await getData('deviceId');
                            Alert.alert('deviceId', deviceId ?? 'null')
                          }}
                        >
                          <Text style={styles.loginheader}>Login</Text>
                        </Pressable>
                      </View>
                      <View style={styles.inputcontainer}>
                        <CustomInput
                          label=""
                          value={values.email}
                          onChangeText={handleChange("email")}
                          placeholder="Email Address "
                          onBlur={handleBlur('email')}
                        />
                        {errors.email && touched?.email && (
                          <Text style={styles.errorText}>{errors.email}</Text>
                        )}
                        <CustomInput
                          label=""
                          value={values.password}
                          onChangeText={handleChange("password")}
                          placeholder="Password "
                          containerStyle={{ marginBottom: 15 }}
                          onBlur={handleBlur('password')}

                          props={{
                            secureTextEntry: true,
                          }}
                        />
                        {errors.password && touched?.password && (
                          <Text style={{ color: "red", marginTop: -44 }}>
                            {errors.password}
                          </Text>
                        )}
                      </View>
                      <Pressable>
                        <Text
                          onPress={() => navigation.navigate("ForgetPassword")}
                          style={{
                            color: "#2D67C6",
                            fontSize: 18,
                            fontWeight: 600,
                            width: "55%",
                            marginTop: 10,
                          }}
                        >
                          Forgot Password?
                        </Text>
                      </Pressable>
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
          <Pressable
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
          </Pressable>
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
  loginheader: {
    fontSize: 35,
    marginTop: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  inputcontainer: {
    flex: 1,
    marginTop: 20,
    gap: 30,
  },
  // input: {
  //   height: 50,
  //   borderColor: "#000000",
  //   backgroundColor: "#FFFFFF",
  //   borderWidth: 0.5,
  //   borderRadius: 14,
  //   padding: 10,
  //   width: "100%",
  // },

  // loginbtn: {
  //   backgroundColor: "#2D67C6",
  //   padding: 14,
  //   marginTop: 50,
  //   width: "100%",
  //   borderRadius: 10,
  //   alignSelf: "center",
  // },
  // loginbtntext: {
  //   color: "#fff",
  //   fontWeight: "600",
  //   textAlign: "center",
  //   fontSize: 16,
  // },
  authlogo: {
    height:60,width:140
  },
  errorText: {
    color: "red",
    marginTop: -30,
  },
});
export default LoginScreen;
