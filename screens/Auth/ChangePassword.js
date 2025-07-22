import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,

} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { ChangePasswordSchema } from "../../utils/validation";
import { changePassword } from "../../services/rootApi/userApi";
import { removeItemValue } from "../../hooks/useAsyncStorage";
import Header from "../../components/Header";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import CustomInput from "../../myComponents/CustomInput/CustomInput";

const ChangePassword = () => {
  const { user } = useSelector(selectUser);
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNavigation();
  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  return (
    <View>
      <Header title={"Change Password"} />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? 30 : 30}
          style={styles.container}
        >

          <Formik
            initialValues={initialValues}
            validationSchema={ChangePasswordSchema}
            onSubmit={async (values) => {
              try {
                setIsLoading(true);
                const data = await changePassword(user?._id, values);
                if (data) {
                  await removeItemValue("token");
                  navigate("Login");
                }
              } catch (error) {
                setSnackBar({
                  visible: true,
                  text: error?.response?.data,
                  error: true,
                });
              }
              setIsLoading(false);
            }}
          >
            {({ handleChange, handleSubmit, values, errors, touched, handleBlur }) => (
              <View>
                <View>

                  <CustomInput
                    label="OldPassword"
                    value={values.oldPassword}
                    onChangeText={handleChange("oldPassword")}
                    placeholder="Enter the old Password "
                    onBlur={handleBlur('oldPassword')}
                  />
                  {errors.oldPassword && touched?.oldPassword && (
                    <Text style={styles.errorText}>{errors.oldPassword}</Text>
                  )}
                </View>
                <View style={{ marginTop: 17 }}>

                  <CustomInput
                    label="NewPassword"
                    value={values.newPassword}
                    onChangeText={handleChange("newPassword")}
                    placeholder="Enter new password "
                    onBlur={handleBlur('newPassword')}
                  />
                  {errors.newPassword && touched?.newPassword && (
                    <Text style={styles.errorText}>{errors.newPassword}</Text>
                  )}
                </View>
                <View style={{ marginTop: 17 }}>

                  <CustomInput
                    label="ConfirmPassword"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    placeholder="Confirm your password "
                  />
                  {errors.confirmPassword && touched?.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>
                <CustomBtn
                  title="Submit"
                  isLoading={isLoading}
                  onPress={handleSubmit}
                  containerStyle={{ marginTop: 50 }}
                />
              </View>
            )}
          </Formik>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 20,
    flex: 1,
  },
  inpulable: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  // input: {
  //   height: 45,
  //   marginTop: 10,
  //   borderColor: "#000000",
  //   borderWidth: 0.5,
  //   borderRadius: 15,
  //   padding: 10,
  //   width: "100%",
  // },
  // submitbtn: {
  //   marginTop: 50,
  //   backgroundColor: "#2D67C6",
  //   padding: 12,
  //   width: "95%",
  //   borderRadius: 10,
  //   alignSelf: "center",
  // },
  // btntext: {
  //   color: "#fff",
  //   fontWeight: "600",
  //   textAlign: "center",
  //   fontSize: 20,
  // },
  errorText: {
    color: "red",
    marginTop: 0,
  },
});
export default ChangePassword;
