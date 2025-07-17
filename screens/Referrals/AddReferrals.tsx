import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import MobileInput from "../../myComponents/MobileInput/MobileInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import ExpoImagePicker from "../../myComponents/ExpoImagePicker/ExpoImagePicker";
import CustomText from "../../myComponents/CustomText/CustomText";
import { addReferral } from "../../services/rootApi/referralApi";
import { useNavigation, useRoute } from "@react-navigation/native";
import { myConsole } from "../../hooks/useConsole";
import { useQueryClient } from "@tanstack/react-query";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { uploadFile } from "../../utils/uploadFile";

const AddReferrals = () => {
  const { goBack, navigate } = useNavigation();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { params } = useRoute();
  const { data, type } = params;

  const formik = useFormik({
    initialValues: {
      clientName: "",
      mobile: "",
      email: "",
      passportNumber: "",
      eidNumber: "",
      nationality: "",
      address: "",
      unitName: data?.unit || "",
      projectNumber: data?.projectName || "",
      developerName: data?.developer?.name || "",
      passportDocument: "",
      visaDocument: "",
      eidDocument: "",
    },
    validationSchema: Yup.object({
      clientName: Yup.string().required("Required"),
      mobile: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      passportNumber: Yup.string().required("Required"),
      eidNumber: Yup.string().required("Required"),
      nationality: Yup.string().required("Required"),
      address: Yup.string().required("Required"),
      unitName: Yup.string().required("Required"),
      projectNumber: Yup.string().required("Required"),
      developerName: Yup.string().required("Required"),
      passportDocument: Yup.string().required("Upload required"),
      //     passport: Yup.string()
      // .matches(/^[A-Z][0-9]{7}$/, "Enter valid passport number")
      // .required("Passport number is required"),
      visaDocument: Yup.string().required("Upload required"),
      eidDocument: Yup.string().required("Upload required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        values.passport = values.passport || null;
        values.visa = values.visa || null;
        values.Eid_dcoument = values.Eid_dcoument || null;

        // Add the referral with the values
        await addReferral(values, data._id, type);
        queryClient.invalidateQueries({
          queryKey: ["getAllReferrals"],
        });
        queryClient.invalidateQueries({
          queryKey: ["getReferralById"],
        });
        goBack();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container>
      <Header title={"Add Referral"} />
      <ScrollViewWithKeyboardAvoid>
        <View
          style={{ paddingBottom: 200, paddingTop: 20, paddingHorizontal: 16 }}
        >
          <CustomInput
            label="Name"
            placeholder="Client Name"
            value={formik.values.clientName}
            onChangeText={formik.handleChange("clientName")}
            onBlur={formik.handleBlur("clientName")}
            marginBottom={12}
            errors={formik.touched.clientName && formik.errors.clientName}
          />
          <CustomText
            style={{
              marginTop: 8,
              fontSize: 16,
              fontWeight: "400",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Mobile Number
          </CustomText>
          <MobileInput
            value={formik.values.mobile}
            onChange={(v) =>
              formik.setFieldValue("mobile", `${v.countryCode}${v.number}`)
            }
            marginBottom={12}
            onBlur={formik.handleBlur("mobile")}
            error={formik.touched.mobile && formik.errors.mobile}
            isCountryPicker={true}
          />
          <CustomInput
            label="Email Address"
            placeholder="Email Address"
            marginBottom={12}
            value={formik.values.email}
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
            errors={formik.touched.email && formik.errors.email}
          />
          <CustomInput
            label="Passport Number"
            placeholder="Enter Number"
            marginBottom={12}
            value={formik.values.passportNumber}
            onChangeText={formik.handleChange("passportNumber")}
            onBlur={formik.handleBlur("passportNumber")}
            errors={
              formik.touched.passportNumber && formik.errors.passportNumber
            }
          />
          <CustomInput
            label="EID"
            placeholder="Enter EID"
            marginBottom={12}
            value={formik.values.eidNumber}
            onChangeText={formik.handleChange("eidNumber")}
            onBlur={formik.handleBlur("eidNumber")}
            errors={formik.touched.eidNumber && formik.errors.eidNumber}
          />
          <CustomInput
            label="Nationality"
            placeholder="Enter Nationality"
            marginBottom={12}
            value={formik.values.nationality}
            onChangeText={formik.handleChange("nationality")}
            onBlur={formik.handleBlur("nationality")}
            errors={formik.touched.nationality && formik.errors.nationality}
          />
          <CustomInput
            label="Address"
            placeholder="Enter Address"
            marginBottom={12}
            value={formik.values.address}
            onChangeText={formik.handleChange("address")}
            onBlur={formik.handleBlur("address")}
            errors={formik.touched.address && formik.errors.address}
          />
          <CustomInput
            label="Unit Name"
            placeholder="Enter unit name"
            marginBottom={12}
            value={formik.values.unitName}
            onChangeText={formik.handleChange("UnitName")}
            onBlur={formik.handleBlur("UnitName")}
            errors={formik.touched.unitName && formik.errors.unitName}
            editable={false}
          />
          <CustomInput
            label="Project Name"
            placeholder="Enter project name"
            marginBottom={12}
            value={formik.values.projectNumber}
            onChangeText={formik.handleChange("projectNumber")}
            onBlur={formik.handleBlur("projectNumber")}
            errors={formik.touched.projectNumber && formik.errors.projectNumber}
            editable={false}
          />
          <CustomInput
            label="Developer Name"
            placeholder="Select Developer Name"
            marginBottom={12}
            value={formik.values.developerName}
            onChangeText={formik.handleChange("developerName")}
            onBlur={formik.handleBlur("developerName")}
            errors={formik.touched.developerName && formik.errors.developerName}
            editable={false}
          />
          {/* <CustomInput
            label="Referral Amount"
            placeholder="Enter amount"
            marginBottom={12}
            value={formik.values.RefferalAmount}
            onChangeText={formik.handleChange("RefferalAmount")}
            onBlur={formik.handleBlur("RefferalAmount")}
            errors={
              formik.touched.RefferalAmount && formik.errors.RefferalAmount
            }
          /> */}

          <CustomText style={styles.label}>Document Upload</CustomText>
          <ExpoImagePicker
            label="Passport"
            onSelect={async (file) => {
              await uploadFile({
                file: file?.assets,
                getUrl: (urls) => {
                  // Set the URL of the uploaded passport file to the formik field
                  formik.setFieldValue("passportDocument", urls?.[0]);
                },
                onLoading: (isLoading) => {
                  myConsole("Uploading Passport", isLoading);
                },
              });
            }}
            onBlur={formik.handleBlur("passportDocument")}
            boxContainerStyle={{ marginTop: 12 }}
          />
          {formik.errors.passportDocument &&
            formik.touched.passportDocument && (
              <Text style={styles.errorText}>
                {formik.errors.passportDocument}
              </Text>
            )}
          <ExpoImagePicker
            label="Visa"
            onSelect={async (file) => {
              await uploadFile({
                file: file?.assets,
                getUrl: (urls) => {
                  // Set the URL of the uploaded visa file to the formik field
                  formik.setFieldValue("visaDocument", urls?.[0]);
                },
                onLoading: (isLoading) => {
                  myConsole("Uploading Visa", isLoading);
                },
              });
            }}
            onBlur={formik.handleBlur("visaDocument")}
            boxContainerStyle={{ marginTop: 12 }}
          />
          {formik.errors.visaDocument && formik.touched.visaDocument && (
            <Text style={styles.errorText}>{formik.errors.visaDocument}</Text>
          )}
          <ExpoImagePicker
            label="EID"
            onSelect={async (file) => {
              await uploadFile({
                file: file?.assets,
                getUrl: (urls) => {
                  // Set the URL of the uploaded passportNumber document file to the formik field
                  formik.setFieldValue("eidDocument", urls?.[0]);
                },
                onLoading: (isLoading) => {
                  myConsole("Uploading Eid Document", isLoading);
                },
              });
            }}
            onBlur={formik.handleBlur("eidDocument")}
            boxContainerStyle={{ marginTop: 12 }}
          />
          {formik.errors.eidDocument && formik.touched.eidDocument && (
            <Text style={styles.errorText}>{formik.errors.eidDocument}</Text>
          )}
          <CustomBtn
            title="Submit"
            onPress={formik.handleSubmit}
            isLoading={loading}
            containerStyle={{ marginTop: 20 }}
          />
        </View>
      </ScrollViewWithKeyboardAvoid>
    </Container>
  );
};

export default AddReferrals;

const styles = StyleSheet.create({
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginBottom: 10,
  },
});
