import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import MobileInput from "../../myComponents/MobileInput/MobileInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import ExpoImagePicker from "../../myComponents/ExpoImagePicker/ExpoImagePicker";
import CustomText from "../../myComponents/CustomText/CustomText";
import { useFormik } from "formik";
import * as Yup from "yup";
import parsePhoneNumber from "libphonenumber-js";
import { myConsole } from "../../hooks/useConsole";
import { scheduleInterview } from "../../services/hrmApi/userHrmApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useGetAllUserHRM } from "../../hooks/useGetQuerryHRM";
import { uploadFile } from "../../utils/uploadFile";
import { alphanumericValidation, emailValidate } from "../../utils/validation";
import { popUpConfToast } from "../../utils/toastModalByFunction";

const qualifications = [
  { _id: "12th", name: "12th" },
  { _id: "graduation", name: "Graduation" },
  { _id: "postgraduation", name: "Post Graduation" },
];

const ScheduleInterview = () => {
  const { navigate, goBack } = useNavigation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const {
    data: allUsers,
    isLoading: usersLoading,
    hasNextPage: usersHasNextPage,
    fetchNextPage: usersFetchNextPage,
    isFetchingNextPage: usersIsFetchingNextPage,
  } = useGetAllUserHRM({ search: "" });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      designation: "",
      qualification: "",
      dateTime: "",
      referredBy: "",
      experience: "",
      cvFile: "",
    },
    validationSchema: Yup.object().shape({
      firstName: alphanumericValidation(),
      lastName: alphanumericValidation(),
      mobile: Yup.string()
        .required("Required")
        .test("is-valid", "Invalid number", (value) => {
          try {
            const phoneNumber = parsePhoneNumber(value);
            return phoneNumber.isValid();
          } catch {
            return false;
          }
        }),
      email: emailValidate(),
      designation: Yup.string().required("Required"),
      qualification: Yup.string().required("Required"),
      dateTime: Yup.string().required("Required"),
      referredBy: Yup.string().required("Required"),
      experience: Yup.number()
        .typeError("Experience must be a number")
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience can't exceed 50 years")
        .required("Experience is required"),

      cvFile: Yup.string().required("Please upload a document"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          name: values.firstName,
          lastName: values.lastName,
          mobile: values.mobile,
          email: values.email,
          designation: values.designation,
          qualification: values.qualification,
          date: values.dateTime,
          referredBy: values.referredBy,
          realEstateExperience: values.experience,
          beforeInterview: values.cvFile,
        };
        await scheduleInterview(payload);
        queryClient.invalidateQueries({
          queryKey: ["getAllCandidates"],
        });
        popUpConfToast.successMessage("Interview Scheduled Successfully");
        goBack();
        formik.resetForm();
      } catch (error) {
        console.error("Submission Error:", error);
        popUpConfToast.errorMessage("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <ContainerHRM ph={20} isBAck={{ title: "Schedule Interview" }}>
      <ScrollViewWithKeyboardAvoid>
        <View style={{ paddingBottom: 80, paddingTop: 20 }}>
          <CustomInput
            label="First Name"
            placeholder="First Name"
            marginBottom={15}
            value={formik.values.firstName}
            onChangeText={formik.handleChange("firstName")}
            onBlur={formik.handleBlur("firstName")}
            errors={formik.touched.firstName && formik.errors.firstName}
          />
          <CustomInput
            label="Last Name"
            placeholder="Last Name"
            marginBottom={15}
            value={formik.values.lastName}
            onChangeText={formik.handleChange("lastName")}
            onBlur={formik.handleBlur("lastName")}
            errors={formik.touched.lastName && formik.errors.lastName}
          />

          <CustomText style={styles.label}>Mobile Number</CustomText>
          <MobileInput
            value={formik.values.mobile}
            onChange={(v) =>
              formik.setFieldValue("mobile", `${v.countryCode}${v.number}`)
            }
            onBlur={formik.handleBlur("mobile")}
            error={formik.touched.mobile && formik.errors.mobile}
            isCountryPicker={true}
          />
          <CustomInput
            label="Email Address"
            placeholder="Email Address"
            marginBottom={15}
            value={formik.values.email}
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
            errors={formik.touched.email && formik.errors.email}
          />
          <DropdownRNE
            label="Designation"
            containerStyle={{ marginBottom: 15 }}
            arrOfObj={[
              { _id: "Portfolio Manager", name: "Portfolio Manager" },
              { _id: "Sr. Portfolio Manager", name: "Sr. Portfolio Manager" },
              { _id: "Area Manager", name: "Area Manager" },
              { _id: "Sr. Area Manager", name: "Sr. Area Manager" },
              { _id: "Regional Manager", name: "Regional Manager" },
              { _id: "Sr. Regional Manager", name: "Sr. Regional Manager" },
              { _id: "Vice President Sales", name: "Vice President Sales" },
              { _id: "Director", name: "Director" },
              { _id: "CEO", name: "CEO" },
              { _id: "IT Manager", name: "IT Manager" },
              { _id: "IT Executive", name: "IT Executive" },
              { _id: "Marketing Manager", name: "Marketing Manager" },
              { _id: "Marketing Executive", name: "Marketing Executive" },
              { _id: "Accountant", name: "Accountant" },
              { _id: "Finance Executive", name: "Finance Executive" },
              { _id: "Finance Manager", name: "Finance Manager" },
              { _id: "HR Manager", name: "HR Manager" },
              { _id: "Recruiter", name: "Recruiter" },
              { _id: "Administrator", name: "Administrator" },
              { _id: "Receptionist", name: "Receptionist" },
              { _id: "Content Creator", name: "Content Creator" },
            ]}
            onChange={(v) => formik.setFieldValue("designation", v)}
            initialValue={formik.values.designation}
            error={formik.touched.designation && formik.errors.designation}
          />
          <DropdownRNE
            label="Qualification"
            containerStyle={{ marginBottom: 15 }}
            arrOfObj={qualifications}
            onChange={(v) => formik.setFieldValue("qualification", v)}
            initialValue={formik.values.qualification}
            error={formik.touched.qualification && formik.errors.qualification}
          />
          <DatePickerExpo
            title="Date & Time"
            mode="datetime"
            initialValue={formik.values.dateTime}
            onSelect={(v) => formik.setFieldValue("dateTime", v)}
            minimumDate={new Date()}
          />

          {formik.touched.dateTime && formik.errors.dateTime && (
            <Text style={[styles.errorText, { marginBottom: 14 }]}>
              {formik.errors.dateTime}
            </Text>
          )}
          <DropdownRNE
            label="Referred By"
            containerStyle={{ marginBottom: 15 }}
            arrOfObj={allUsers ?? []}
            onChange={(v) => formik.setFieldValue("referredBy", v)}
            initialValue={formik.values.referredBy}
            keyValueGetOnSelect="_id"
            keyValueShowInBox="name"
            isSearch={true}
            error={formik.touched.referredBy && formik.errors.referredBy}
            isLoading={usersLoading}
            onEndReached={() => {
              if (usersHasNextPage) usersFetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              usersIsFetchingNextPage ? (
                <ActivityIndicator
                  size="small"
                  style={{ paddingVertical: 10 }}
                />
              ) : null
            }
          />
          <CustomInput
            label="Real Estate Experience"
            placeholder="Enter Experience"
            marginBottom={15}
            value={formik.values.experience}
            onChangeText={formik.handleChange("experience")}
            onBlur={formik.handleBlur("experience")}
            errors={formik.touched.experience && formik.errors.experience}
            props={{ keyboardType: "numeric" }} // ✅ Add this
          />

          <ExpoImagePicker
            label="CV Before Interview"
            onSelect={async (file) => {
              await uploadFile({
                file: file?.assets,
                getUrl: (urls) => {
                  formik.setFieldValue("cvFile", urls?.[0]);
                },
                onLoading: (isLoading) => {
                  myConsole("Uploading CV Before Interview", isLoading);
                },
              });
            }}
            onBlur={formik.handleBlur("cvFile")}
          />
          {formik.errors.cvFile && formik.touched.cvFile && (
            <Text style={styles.errorText}>{formik.errors.cvFile}</Text>
          )}

          {loading ? (
            <ActivityIndicator
              size="large"
              color="orange"
              style={{ marginTop: 20 }}
            />
          ) : (
            <CustomBtn
              title="Submit"
              onPress={formik.handleSubmit}
              containerStyle={{ marginTop: 20 }}
            />
          )}
        </View>
      </ScrollViewWithKeyboardAvoid>
    </ContainerHRM>
  );
};

export default ScheduleInterview;

const styles = StyleSheet.create({
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginBottom: 10,
  },
});
