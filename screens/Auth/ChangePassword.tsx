import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { changePassword } from "../../services/rootApi/userApi";
import { removeItemValue } from "../../hooks/useAsyncStorage";

import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomSnackBar from "../../myComponents/CustomSnackBar/CustomSnackBar";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomText from "../../myComponents/CustomText/CustomText";

import { Ionicons } from "@expo/vector-icons";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { LinearGradient } from "expo-linear-gradient";

const ChangePassword = () => {
  const { user } = useSelector(selectUser);
  const { navigate } = useNavigation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [snackBar, setSnackBar] = useState({
    visible: false,
    text: "",
    error: false,
  });

  // ✅ Validation check
  const isDisabled =
    !oldPassword ||
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword;

  const handleSubmit = async () => {
    if (isDisabled) {
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        oldPassword,
        newPassword,
        confirmPassword,
      };

      const data = await changePassword(user?._id, payload);

      if (data) {
        await removeItemValue("token");
        navigate("Login");
      }
    } catch (error: any) {
      setSnackBar({
        visible: true,
        text: error?.response?.data || "Something went wrong",
        error: true,
      });
    }

    setIsLoading(false);
  };

  return (
    <Container style={styles.main}>
      <Header title={"Change Password"} />
      <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
      <LinearGradient
        colors={["#2755ff", "#73aafc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: 30,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      ></LinearGradient>
      <ScrollView showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View style={styles.topCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={40} color="#3B6FD8" />
            </View>

            <CustomText style={styles.title}>Update Password</CustomText>

            <CustomText style={styles.subtitle}>
              Create a strong password with at least 8 characters, including a
              number and a symbol.
            </CustomText>
          </View>

          <View style={styles.formCard}>
            <CustomText style={styles.label}>CURRENT PASSWORD</CustomText>
            <CustomInput
              value={oldPassword}
              onChangeText={(text: string) => {
                console.log("Old Password:", text);
                setOldPassword(text);
              }}
              secureTextEntry
              containerStyle={styles.input}
            />

            <CustomText style={styles.label}>NEW PASSWORD</CustomText>
            <CustomInput
              value={newPassword}
              onChangeText={(text: string) => {
                setNewPassword(text);
              }}
              secureTextEntry
              containerStyle={styles.input}
            />

            <CustomText style={styles.label}>CONFIRM NEW PASSWORD</CustomText>
            <CustomInput
              value={confirmPassword}
              onChangeText={(text: string) => {
                setConfirmPassword(text);
              }}
              secureTextEntry
              containerStyle={styles.input}
            />

            {confirmPassword && newPassword !== confirmPassword && (
              <CustomText style={styles.errorText}>
                Passwords do not match
              </CustomText>
            )}
          </View>

          <CustomBtn
            title="Update Credentials"
            isLoading={isLoading}
            onPress={handleSubmit}
            disabled={isDisabled}
            containerStyle={styles.button}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    </Container>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },
  container: {
    padding: 20,
  },

  topCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: "#E6ECF8",
    padding: 20,
    borderRadius: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3B6FD8",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 15,
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    borderRadius: 15,
    backgroundColor: "#F2F4F7",
  },

  button: {
    marginTop: 25,
    borderRadius: 30,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 6,
  },
});
