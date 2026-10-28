import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { color } from "../../const/color";
import {
  formatSelectedPhoneNumber,
  isValidPhoneNumber,
} from "../../utils/phoneNumber";

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
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("Salary must be a number")
        .min(0, "Salary must be a positive number")
        .notRequired(),
      mobile: Yup.string()
        .required("Required")
        .test("is-valid", "Invalid number", isValidPhoneNumber),
      joiningDate: Yup.string().notRequired(),
      pnl: Yup.string().notRequired(),
      manager: Yup.string().notRequired(),
      offerLetter: Yup.string().required("Required"),
      postInterviewCV: Yup.string().notRequired(),
      remark: Yup.string(),
    }).test(
      "manager-or-pnl-required",
      "Select a PNL or Reporting Manager",
      function (values) {
        return values?.pnl || values?.manager
          ? true
          : this.createError({
              path: "pnl",
              message: "Select a PNL or Reporting Manager",
            });
      }
    ),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = {
          candidateId: candidate?._id,
          offerAccepted: values.offerAccepted,
          offerLetter: values.offerLetter,
          ...(values.salary !== "" ? { salaryOffered: values.salary } : {}),
          ...(values.joiningDate ? { joiningDate: values.joiningDate } : {}),
          ...(values.manager ? { reportingManager: values.manager } : {}),
          ...(values.pnl ? { pnl: values.pnl } : {}),
          ...(values.remark.trim() ? { remarks: values.remark.trim() } : {}),
          ...(values.postInterviewCV ? { afterInterview: values.postInterviewCV } : {}),
        };
        await postInterviewProcess(payload);
        queryClient.invalidateQueries({
          queryKey: ["getAllCandidates"],
        });
        popUpConfToast.successMessage(
          "Post-interview process submitted successfully!",
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
        <View style={{ paddingBottom: 140 }}>
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
            <CustomText style={styles.errorText}>
              {formik.errors.offerAccepted}
            </CustomText>
          )}

          <CustomInput
            label="Salary Offered (Optional)"
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
            onChange={(v) => {
              const mobile =
                typeof v === "string" ? v : formatSelectedPhoneNumber(v);
              formik.setFieldValue("mobile", mobile);
            }}
            onBlur={formik.handleBlur("mobile")}
            error={formik.touched.mobile && formik.errors.mobile}
            isCountryPicker={true}
          />

          <DatePickerExpo
            title="Joining Date (Optional)"
            initialValue={formik.values.joiningDate}
            onSelect={(v) => formik.setFieldValue("joiningDate", v)}
            minimumDate={new Date()}
          />
          {formik.touched.joiningDate && formik.errors.joiningDate && (
            <CustomText style={styles.errorText}>
              {formik.errors.joiningDate}
            </CustomText>
          )}

          <DropdownRNE
            label="PNL (or Reporting Manager)"
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
            containerStyle={{ marginTop: 8 }}
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
            <CustomText style={styles.errorText}>
              {formik.errors.pnl}
            </CustomText>
          )}

          <DropdownRNE
            label="Reporting Manager (or PNL)"
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
            containerStyle={{ marginTop: 8 }}
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
            <CustomText style={styles.errorText}>
              {formik.errors.manager}
            </CustomText>
          )}

          <ExpoImagePicker
            label="Offer Letter"
            boxContainerStyle={{ marginTop: 8 }}
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
            <CustomText style={styles.errorText}>
              {formik.errors.offerLetter}
            </CustomText>
          )}
          <ExpoImagePicker
            label="CV After Interview (Optional)"
            boxContainerStyle={{ marginTop: 8 }}
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
            <CustomText style={styles.errorText}>
              {formik.errors.postInterviewCV}
            </CustomText>
          )}

          <CustomInput
            label="Remark (Optional)"
            containerStyle={{ marginTop: 8 }}
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
    color: color.mainTxtColor,
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
    color: color.mainTxtColor,
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 15,
  },
});
