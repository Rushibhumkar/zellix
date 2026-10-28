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
import { myConsole } from "../../hooks/useConsole";
import { scheduleInterview } from "../../services/hrmApi/userHrmApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useGetAllUserHRM } from "../../hooks/useGetQuerryHRM";
import { uploadFile } from "../../utils/uploadFile";
import { alphanumericValidation } from "../../utils/validation";
import { color } from "../../const/color";
import { useAppToast } from "../../components/AppToast";
import {
  formatSelectedPhoneNumber,
  isValidPhoneNumber,
} from "../../utils/phoneNumber";

const qualifications = [
  { _id: "12th", name: "12th" },
  { _id: "graduation", name: "Graduation" },
  { _id: "postgraduation", name: "Post Graduation" },
];

const ScheduleInterview = () => {
  const { navigate, goBack } = useNavigation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const toast = useAppToast();
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
      mobile: Yup.string().test(
        "is-valid-if-provided",
        "Invalid number",
        (value) => !value?.trim() || isValidPhoneNumber(value)
      ),
      email: Yup.string().email("Invalid email address").notRequired(),
      designation: Yup.string().notRequired(),
      qualification: Yup.string().notRequired(),
      dateTime: Yup.string().required("Required"),
      referredBy: Yup.string().notRequired(),
      experience: Yup.number()
        .typeError("Experience must be a number")
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience can't exceed 50 years")
        .notRequired(),
      cvFile: Yup.string().notRequired(),
    }).test(
      "contact-required",
      "Provide a valid mobile number or email address",
      function (values) {
        const hasEmail = Boolean(values?.email?.trim());
        const hasMobile = isValidPhoneNumber(values?.mobile);
        return hasEmail || hasMobile
          ? true
          : this.createError({
              path: "mobile",
              message: "Provide a valid mobile number or email address",
            });
      }
    ),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          name: values.firstName,
          lastName: values.lastName,
          ...(isValidPhoneNumber(values.mobile) ? { mobile: values.mobile } : {}),
          ...(values.email?.trim() ? { email: values.email.trim() } : {}),
          designation: values.designation,
          qualification: values.qualification,
          date: values.dateTime,
          ...(values.referredBy ? { referredBy: values.referredBy } : {}),
          realEstateExperience: values.experience,
          beforeInterview: values.cvFile,
        };
        console.log("payloaddd", payload);
        await scheduleInterview(payload);
        queryClient.invalidateQueries({
          queryKey: ["getAllCandidates"],
        });
        toast.success("Interview Scheduled Successfully");
        goBack();
        formik.resetForm();
      } catch (error) {
        console.error("Submission Error:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const minInterviewDate = new Date();
  minInterviewDate.setMinutes(minInterviewDate.getMinutes() + 5);

  return (
    <ContainerHRM ph={20} isBAck={{ title: "Schedule Interview" }}>
      <ScrollViewWithKeyboardAvoid>
        <View style={{ paddingBottom: 200, paddingTop: 20 }}>
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
            onChange={(v) => {
              const mobile =
                typeof v === "string" ? v : formatSelectedPhoneNumber(v);
              formik.setFieldValue("mobile", mobile);
            }}
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
            label="Designation (Optional)"
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
            label="Qualification (Optional)"
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
            minimumDate={minInterviewDate}
          />

          {formik.touched.dateTime && formik.errors.dateTime && (
            <CustomText style={[styles.errorText, { marginBottom: 14 }]}>
              {formik.errors.dateTime}
            </CustomText>
          )}
          <DropdownRNE
            label="Referred By (Optional)"
            containerStyle={{ marginBottom: 15, marginTop: 12 }}
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
            label="Real Estate Experience (Optional)"
            placeholder="Enter Experience"
            marginBottom={15}
            value={formik.values.experience}
            onChangeText={formik.handleChange("experience")}
            onBlur={formik.handleBlur("experience")}
            errors={formik.touched.experience && formik.errors.experience}
            props={{ keyboardType: "numeric" }} // ✅ Add this
          />

          <ExpoImagePicker
            label="CV Before Interview (Optional)"
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
            <CustomText style={styles.errorText}>
              {formik.errors.cvFile}
            </CustomText>
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
    color: color.mainTxtColor,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginBottom: 10,
  },
});
