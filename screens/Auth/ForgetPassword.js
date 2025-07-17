import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ImageBackground,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import { ForgetSchema } from "../../utils/validation";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { forgetPassword } from "../../services/rootApi/api";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import CustomInput from "../../myComponents/CustomInput/CustomInput";

const ForgetPassword = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const initialValues = { email: "" };
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  return (
    <>

      <SafeAreaView style={styles.container}>

        <ImageBackground
          source={require("../../assets/AuthBack.png")}
          style={styles.background}
        >
          <ScrollView>
            <CustomSnackBar
              snackbar={snackBar}
              setSnackbar={setSnackBar}
            />
            <Formik
              initialValues={initialValues}
              validationSchema={ForgetSchema}
              onSubmit={async (values) => {
                try {
                  setIsLoading(true);
                  const { data } = await forgetPassword(values);
                  setSnackBar({
                    visible: true,
                    text: data,
                    error: false,
                  });
                } catch (error) {
                  setSnackBar({
                    visible: true,
                    text: error?.response?.data,
                    error: true,
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <View style={styles.forgetcontainer}>

                  <Text
                    style={{
                      fontSize: 30,
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Forget Password
                  </Text>
                  <Text
                    style={{ textAlign: "center", marginTop: 40, fontSize: 22 }}
                  >
                    Email Verification
                  </Text>
                  <View style={styles.divider}></View>
                  <View style={styles.forgetinput}>
                    <CustomInput
                      label="Email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      placeholder="Please Enter Your Email"
                    />
                    {(errors.email && touched?.email) && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}

                    <CustomBtn
                      title="Submit"
                      isLoading={isLoading}
                      onPress={handleSubmit}
                      containerStyle={{ marginTop: 20 }}
                    />
                  </View>

                  <Pressable
                    onPress={() => navigation.navigate("Login")}
                    style={{ marginTop: 20, width: "40%", alignSelf: "center" }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#FFC857",
                        fontSize: 20,
                        fontWeight: "600",
                      }}
                    >
                      Back To Login
                    </Text>
                  </Pressable>
                </View>
              )}
            </Formik>
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
  forgetcontainer: {
    flex: 1,
    textAlign: "center",
    marginTop: 100,
  },
  divider: {
    borderBottomColor: "#FFC857",
    width: "70%",
    margin: "auto",
    alignSelf: "center",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  forgetinput: {
    flex: 1,
    gap: 30,
    marginTop: 15,
    padding: 25,
  },

  errorText: {
    color: "red",
    marginTop: -28,
  },
});

export default ForgetPassword;
