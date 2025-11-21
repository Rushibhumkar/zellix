import { useNavigation, useRoute } from "@react-navigation/native";
import { Formik } from "formik";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { AddUsersSchema } from "../../utils/validation";
import { roleList, roleListArr } from "../../utils/data";
import { addUser, updateUser } from "../../services/rootApi/userApi";
import { useDispatch } from "react-redux";
import { getUserFunc } from "../../redux/action";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";

const AddUsers = () => {
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const { params } = useRoute();
  const data = params?.data;
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);

  const initialValues = {
    name: data?.name ?? "",
    email: data?.email ?? "",
    role: data?.role ?? "",
  };

  const handleFormSubmit = async (values) => {
    setIsLoading(true);

    try {
      if (!!data) {
        const res = await updateUser({
          id: data?._id,
          data: { ...values },
        });

        setIsVisible(true);
        setMessage(res?.data);
        await dispatch(getUserFunc());
        navigate("users");
      } else {
        const res = await addUser({ ...values });
        setIsVisible(true);
        setMessage(res?.data);
        await dispatch(getUserFunc());
        navigate("users");
      }
    } catch (error) {
      setIsVisible(true);
      setMessage(error?.response?.data || error?.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header title={"Add Users"} />
      <ScrollViewWithKeyboardAvoid>
        <View style={{ paddingBottom: 20 }}>
          <CustomModelMessage
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            message={message}
            onClose={() => {
              setIsVisible(false);
              setMessage(null);
            }}
          />
          <Formik
            initialValues={initialValues}
            validationSchema={AddUsersSchema}
            onSubmit={handleFormSubmit}
            // validateOnChange={false}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              handleBlur,
              touched,
              errors,
              setFieldValue,
            }) => {
              return (
                <View style={{ padding: 20 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <View>
                      <CustomText
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: color.mainTxtColor,
                        }}
                      >
                        User Information
                      </CustomText>
                      <View style={styles.divider}></View>
                    </View>
                  </View>
                  <CustomInput
                    label="Name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    containerStyle={{ marginBottom: 10 }}
                  />
                  {errors.name && touched.name && (
                    <CustomText style={styles.errorText}>
                      {errors.name}
                    </CustomText>
                  )}
                  <CustomInput
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    containerStyle={{ marginBottom: 10 }}
                  />
                  {errors.email && touched.email && (
                    <CustomText style={styles.errorText}>
                      {errors.email}
                    </CustomText>
                  )}

                  <DropdownRNE
                    label="Role"
                    arrOfObj={roleListArr}
                    placeholder="Select Role"
                    keyValueGetOnSelect="_id"
                    keyValueShowInBox="name"
                    initialValue={values?.role}
                    onChange={(v) => setFieldValue("role", v)}
                    onBlur={handleBlur("role")}
                  />
                  {errors.role && touched.role && (
                    <CustomText style={{ color: "red" }}>
                      {errors.role}
                    </CustomText>
                  )}

                  <CustomBtn
                    containerStyle={{ marginTop: 50, marginHorizontal: 10 }}
                    title="Submit"
                    onPress={handleSubmit}
                    isLoading={isLoading}
                  />
                </View>
              );
            }}
          </Formik>
        </View>
      </ScrollViewWithKeyboardAvoid>
    </Container>
  );
};

export default AddUsers;

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: color.mainTxtColor,
    width: "100%",
    borderBottomWidth: 1,
    marginTop: 10,
  },
  inputlable: {
    color: "#000000",
    // marginTop: 20,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    marginTop: 10,
    height: 37.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
  errorText: {
    color: "red",
    marginTop: -10,
  },
});
