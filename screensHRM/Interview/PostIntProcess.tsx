import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import parsePhoneNumber from "libphonenumber-js";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import MobileInput from "../../myComponents/MobileInput/MobileInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import ExpoImagePicker from "../../myComponents/ExpoImagePicker/ExpoImagePicker";
import CustomText from "../../myComponents/CustomText/CustomText";
import CustomCheckBox from "../../myComponentsHRM/CutomCheckBox/CustomCheckBox";
import { postInterviewProcess } from "../../services/hrmApi/userHrmApi";
import { myConsole } from "../../hooks/useConsole";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAllUserHRM } from "../../hooks/useGetQuerryHRM";
import { uploadFile } from "../../utils/uploadFile";
import { popUpConfToast } from "../../utils/toastModalByFunction";

const PostIntProcess = () => {
  const { params } = useRoute();
  const candidate = params?.item;
  const { goBack } = useNavigation();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: allUsers,
    isLoading: usersLoading,
    hasNextPage: usersHasNextPage,
    fetchNextPage: usersFetchNextPage,
    isFetchingNextPage: usersIsFetchingNextPage,
  } = useGetAllUserHRM({ search: "" });

  const formik = useFormik({
    initialValues: {
      offerAccepted: null,
      salary: "",
      mobile: "",
      joiningDate: "",
      pnl: "",
      manager: "",
      offerLetter: "",
      postInterviewCV: "",
      remark: "",
    },
    validationSchema: Yup.object().shape({
      offerAccepted: Yup.boolean().required("Required"),
      salary: Yup.number()
        .typeError("Salary must be a number")
        .min(0, "Salary must be a positive number")
        .required("Required"),
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
      joiningDate: Yup.string().required("Required"),
      pnl: Yup.string().required("Required"),
      manager: Yup.string().required("Required"),
      offerLetter: Yup.string().required("Required"),
      postInterviewCV: Yup.string().required("Required"),
      remark: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = {
          candidateId: candidate?._id,
          salaryOffered: values.salary,
          offerAccepted: values.offerAccepted,
          joiningDate: values.joiningDate,
          reportingManager: values.manager,
          pnl: values.pnl,
          remarks: values.remark,
          offerLetter: values.offerLetter,
          afterInterview: values.postInterviewCV,
        };
        await postInterviewProcess(payload);
        queryClient.invalidateQueries({
          queryKey: ["getAllCandidates"],
        });
        popUpConfToast.successMessage(
          "Post-interview process submitted successfully!"
        );
        formik.resetForm();
        goBack();
      } catch (err) {
        console.error(err);
        popUpConfToast.errorMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <ContainerHRM ph={20} isBAck={{ title: "Post Interview Process" }}>
      <ScrollViewWithKeyboardAvoid>
        <View style={{ paddingBottom: 80 }}>
          <CustomText style={styles.title}>
            Confirmation of Offer Acceptance
          </CustomText>
          <View style={styles.checkboxRow}>
            <CustomCheckBox
              title="Yes"
              isCheck={formik.values.offerAccepted === true}
              onPress={() => formik.setFieldValue("offerAccepted", true)}
            />
            <CustomCheckBox
              title="No"
              isCheck={formik.values.offerAccepted === false}
              onPress={() => formik.setFieldValue("offerAccepted", false)}
            />
          </View>
          {formik.touched.offerAccepted && formik.errors.offerAccepted && (
            <Text style={styles.errorText}>{formik.errors.offerAccepted}</Text>
          )}

          <CustomInput
            label="Salary Offered"
            placeholder="Enter Salary"
            marginBottom={15}
            value={formik.values.salary}
            onChangeText={formik.handleChange("salary")}
            onBlur={formik.handleBlur("salary")}
            errors={formik.touched.salary && formik.errors.salary}
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

          <DatePickerExpo
            title="Joining Date"
            initialValue={formik.values.joiningDate}
            onSelect={(v) => formik.setFieldValue("joiningDate", v)}
            minimumDate={new Date()}
          />
          {formik.touched.joiningDate && formik.errors.joiningDate && (
            <Text style={styles.errorText}>{formik.errors.joiningDate}</Text>
          )}

          <DropdownRNE
            label="PNL"
            arrOfObj={allUsers ?? []}
            keyValueGetOnSelect="_id"
            keyValueShowInBox="name"
            onChange={(v) => formik.setFieldValue("pnl", v)}
            initialValue={formik.values.pnl}
            isSearch={true}
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
          {formik.touched.pnl && formik.errors.pnl && (
            <Text style={styles.errorText}>{formik.errors.pnl}</Text>
          )}

          <DropdownRNE
            label="Reporting Manager"
            arrOfObj={allUsers ?? []}
            keyValueGetOnSelect="_id"
            keyValueShowInBox="name"
            onChange={(v) => formik.setFieldValue("manager", v)}
            initialValue={formik.values.manager}
            isSearch={true}
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
          {formik.touched.manager && formik.errors.manager && (
            <Text style={styles.errorText}>{formik.errors.manager}</Text>
          )}

          <ExpoImagePicker
            label="Offer Letter"
            onSelect={async (file) => {
              await uploadFile({
                file: file?.assets,
                getUrl: (urls) => {
                  formik.setFieldValue("offerLetter", urls?.[0]);
                },
                onLoading: (isLoading) => {
                  myConsole("Uploading Offer Letter", isLoading);
                },
              });
            }}
            onBlur={formik.handleBlur("offerLetter")}
          />
          {formik.errors.offerLetter && formik.touched.offerLetter && (
            <Text style={styles.errorText}>{formik.errors.offerLetter}</Text>
          )}
          <ExpoImagePicker
            label="CV After Interview"
            onSelect={async (file) => {
              await uploadFile({
                file: file?.assets,
                getUrl: (urls) => {
                  formik.setFieldValue("postInterviewCV", urls?.[0]);
                },
                onLoading: (isLoading) => {
                  myConsole("Uploading Post Interview CV", isLoading);
                },
              });
            }}
            onBlur={formik.handleBlur("postInterviewCV")}
          />
          {formik.errors.postInterviewCV && formik.touched.postInterviewCV && (
            <Text style={styles.errorText}>
              {formik.errors.postInterviewCV}
            </Text>
          )}

          <CustomInput
            label="Remark"
            placeholder="Type Here...."
            marginBottom={20}
            value={formik.values.remark}
            onChangeText={formik.handleChange("remark")}
            onBlur={formik.handleBlur("remark")}
            numberOfLines={4}
            multiline
          />

          <CustomBtn
            title={loading ? "Submitting..." : "Submit"}
            onPress={formik.handleSubmit}
            disabled={loading}
            containerStyle={{ marginTop: 10 }}
          />
        </View>
      </ScrollViewWithKeyboardAvoid>
    </ContainerHRM>
  );
};

export default PostIntProcess;

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
    marginBottom: 12,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 12,
    marginTop: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 15,
  },
});
