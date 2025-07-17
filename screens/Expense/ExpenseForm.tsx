import { useFormik } from "formik";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";
import Header from "../../components/Header";
import { myConsole } from "../../hooks/useConsole";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import ExpoImagePicker from "../../myComponents/ExpoImagePicker/ExpoImagePicker";
import IllusionBox from "../../myComponents/IllusionBoxForUpdate/IllusionBox";
import {
  useGetApprovedUsers,
  useGetExpenseCategoryList,
  useGetUserByRole,
} from "./query/useExpense";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import mime from "mime";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { addExpenseSchema } from "../../utils/validation";
import CustomText from "../../myComponents/CustomText/CustomText";
import { updateExpanse } from "../../services/rootApi/ExpenseApi";
import { useQueryClient } from "@tanstack/react-query";

const initialValue = {
  expenseCategory: "6750467febc691a3441442d4",
  expenseSubCategory: "6750467febc691a3441442d5",
  team: "65c9a523994811b242dd091b",
  expenseAmount: 0,
  vatPercent: 0,
  vatAmount: 0, //
  amountExcludedVat: 0, //
  officeName: "wwwwww",
  expenseDate: "",
  responsiblePerson: "6715ed249f8a0290851e390b",
  remarks: "wewrw",
};

const initialVal = (v) => {
  let aa = {
    expenseCategory: v?.expenseCategory?._id || "",
    expenseSubCategory: v?.expenseSubCategory?._id || "",
    team: v?.team?._id || "",
    expenseAmount: v?.expenseAmount || 0,
    vatPercent: v?.vatPercent || 0,
    vatAmount: v?.vatAmount || 0, //
    amountExcludedVat: v?.amountExcludedVat || 0, //
    officeName: v?.officeName || "",
    expenseDate: v?.expenseDate || "",
    responsiblePerson: v?.responsiblePerson || "",
    remarks: v?.remarks || "",
    receipt: v?.receipt?.[0] || null,
  };

  return aa;
};

const ExpenseForm = () => {
  const navigate = useNavigation();
  const { params } = useRoute();
  const expenseCategoryList = useGetExpenseCategoryList({ search: "" });
  const usersApprove = useGetApprovedUsers({ search: "" });
  const srManagerSubAdminList = useGetUserByRole({ search: "" });
  const [expSubCateList, setExpSubCateList] = useState([]);
  const fk = useFormik({
    validationSchema: addExpenseSchema,
    initialValues: initialVal(params?.item),
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (v) => {
      try {
        if (Object.keys(fk.errors).length > 0) {
          console.log("Validation Errors:", fk.errors);
          Alert.alert(
            "Validation Error",
            "Please correct the errors before submitting."
          );
          return;
        }

        const { receipt, ...jsonData } = v;
        const formData = new FormData();
        formData.append("data", JSON.stringify(jsonData));
        if (receipt) {
          formData.append("receipt", {
            uri: receipt?.uri,
            type: mime.getType(receipt?.uri),
            name: receipt?.uri?.split("/").pop(),
          });
        }

        if (params?.item?._id) {
          // // **Update logic**
          // const res = await axiosInstance.post(
          //   `lead/update-expenses/67b6cdfde78efb8042adf90b}`,
          //   formData,
          //   { headers: { "Content-Type": "multipart/form-data" } }
          // );
          // console.log("LeasUPDARAFSF", res);
          // popUpConfToast.successMessage(
          //   res?.data?.message || "Expense added successfully"
          // );
        } else {
          // **Add logic**
          const res = await axiosInstance.post(
            "api/lead/add-expense",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          popUpConfToast.successMessage(
            res?.data?.message || "Expense added successfully"
          );
        }

        navigate.goBack();
      } catch (err) {
        console.log("API Error:", err);
        // if (err.response) {
        //   // If the error response exists, log the details
        //   console.log("Error Response Data:", err.response.data);
        //   console.log("Error Response Status:", err.response.status);
        //   if (err.response.status === 404) {
        //     Alert.alert(
        //       "Error",
        //       "Resource not found. Please check the URL or ID."
        //     );
        //   } else {
        //     Alert.alert("Error", "Something went wrong. Please try again.");
        //   }
        // } else {
        //   // If no response (e.g., network error)
        //   Alert.alert(
        //     "Network Error",
        //     "Could not reach the server. Please try again."
        //   );
        // }
      }
    },
  });

  return (
    <>
      <Header title={"Expense Information"} />
      <Container>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView>
            <View style={{ padding: 20, paddingBottom: 70 }}>
              <DropdownRNE
                label="Select Expense Category"
                containerStyle={{ marginBottom: 15 }}
                arrOfObj={expenseCategoryList?.data || []}
                keyValueShowInBox="CategoryName"
                keyValueGetOnSelect="_id"
                onSelect={(v) => {
                  fk.setFieldValue("expenseCategory", v?._id);
                  setExpSubCateList(v?.subCategory || []);
                }}
                onBlur={() => fk.handleBlur("expenseCategory")}
                initialValue={fk.values.expenseCategory}
              />
              {fk.errors.expenseCategory && fk.touched.expenseCategory && (
                <Text style={styles.errorText}>
                  {typeof fk.errors.expenseCategory === "string"
                    ? fk.errors.expenseCategory
                    : "Invalid input"}
                </Text>
              )}
              <DropdownRNE
                label="Select Expense Sub Category"
                containerStyle={{ marginBottom: 15 }}
                arrOfObj={expSubCateList || []}
                keyValueShowInBox="subCategoryName"
                onSelect={(v) => {
                  fk.setFieldValue("expenseSubCategory", v?._id);
                }}
                onBlur={() => fk.handleBlur("expenseSubCategory")}
                initialValue={fk.values.expenseSubCategory}
              />

              {fk.errors.expenseSubCategory &&
                fk.touched.expenseSubCategory && (
                  <Text style={styles.errorText}>
                    {typeof fk.errors.expenseSubCategory === "string"
                      ? fk.errors.expenseSubCategory
                      : "Invalid input"}
                  </Text>
                )}
              <CustomInput
                label="Enter Expense Amount"
                containerStyle={{ marginBottom: 15 }}
                value={fk.values.expenseAmount}
                onBlur={() => fk.handleBlur("expenseAmount")}
                keyboardType="numeric"
                onChangeText={(v) => {
                  fk.setFieldValue("expenseAmount", v);

                  // Recalculate VAT if vatPercent is already filled
                  if (fk.values.vatPercent) {
                    const expense = parseFloat(v) || 0;
                    const vatPercent = parseFloat(fk.values.vatPercent) || 0;
                    const vatAmount = (expense * vatPercent) / 100;
                    const amountExcludedVat = expense - vatAmount;

                    fk.setFieldValue("vatAmount", vatAmount);
                    fk.setFieldValue("amountExcludedVat", amountExcludedVat);
                  }
                }}
              />
              {fk.errors.expenseAmount && fk.touched.expenseAmount && (
                <Text style={styles.errorText}>
                  {typeof fk.errors.expenseAmount === "string"
                    ? fk.errors.expenseAmount
                    : "Invalid input"}
                </Text>
              )}
              <CustomInput
                label="Enter VAT %"
                containerStyle={{ marginBottom: 15 }}
                value={fk.values.vatPercent}
                onBlur={() => fk.handleBlur("vatPercent")}
                keyboardType="numeric"
                onChangeText={(v) => {
                  const vatPercent = parseFloat(v) || 0;
                  if (vatPercent < 100) {
                    fk.setFieldValue("vatPercent", v);

                    const expense = parseFloat(fk.values.expenseAmount) || 0;
                    const vatAmount = (expense * vatPercent) / 100;
                    const amountExcludedVat = expense - vatAmount;

                    fk.setFieldValue("vatAmount", vatAmount);
                    fk.setFieldValue("amountExcludedVat", amountExcludedVat);
                  } else {
                    Alert.alert("Value should be less than 100");
                  }
                }}
              />
              {fk.errors.vatPercent && fk.touched.vatPercent && (
                <Text style={styles.errorText}>
                  {typeof fk.errors.vatPercent === "string"
                    ? fk.errors.vatPercent
                    : "Invalid input"}
                </Text>
              )}
              <IllusionBox
                title="VAT Amount"
                containerStyle={{ marginBottom: 15 }}
                value={fk.values.vatAmount?.toFixed(2)} // Show with 2 decimal places
              />

              <IllusionBox
                title="Amount Excluded VAT"
                containerStyle={{ marginBottom: 15 }}
                value={fk.values.amountExcludedVat?.toFixed(2)} // Show with 2 decimal places
              />
              <CustomInput
                label="Enter Office Name"
                containerStyle={{ marginBottom: 15 }}
                onChangeText={(v) => {
                  fk.setFieldValue("officeName", v);
                }}
                value={fk.values.officeName}
                onBlur={() => fk.handleBlur("officeName")}
              />
              {fk.errors.officeName && fk.touched.officeName && (
                <Text style={styles.errorText}>
                  {typeof fk.errors.officeName === "string"
                    ? fk.errors.officeName
                    : "Invalid input"}
                </Text>
              )}
              {/* <CustomInput
                            label='Enter Expense Date'
                            containerStyle={{ marginBottom: 15 }}
                            onChangeText={(v) => {
                                fk.setFieldValue('expenseDate', v)
                            }}
                        /> */}
              <DatePickerExpo
                title={"Enter Expense Date"}
                boxContainerStyle={{ marginBottom: 15 }}
                onSelect={(v) => fk.setFieldValue("expenseDate", v)}
                initialValue={fk.values.expenseDate}
              />
              <DropdownRNE
                label="Select Responsible Person"
                containerStyle={{ marginBottom: 15 }}
                arrOfObj={usersApprove?.data || []}
                mode="modal"
                onSelect={(v) => {
                  fk.setFieldValue("responsiblePerson", v?._id);
                }}
                onBlur={() => fk.handleBlur("responsiblePerson")}
                initialValue={fk.values.responsiblePerson}
              />
              {fk.errors.responsiblePerson && fk.touched.responsiblePerson && (
                <Text style={styles.errorText}>
                  {typeof fk.errors.responsiblePerson === "string"
                    ? fk.errors.responsiblePerson
                    : "Invalid input"}
                </Text>
              )}
              <DropdownRNE
                label="Select Team"
                containerStyle={{ marginBottom: 15 }}
                arrOfObj={srManagerSubAdminList?.data || []}
                mode="modal"
                onSelect={(v) => {
                  fk.setFieldValue("team", v?._id);
                }}
                initialValue={fk.values.team}
                onBlur={() => fk.handleBlur("team")}
              />
              {fk.errors.team && fk.touched.team && (
                <Text style={styles.errorText}>
                  {typeof fk.errors.team === "string"
                    ? fk.errors.team
                    : "Invalid input"}
                </Text>
              )}
              <ExpoImagePicker
                label="Choose File"
                boxContainerStyle={{ marginBottom: 15 }}
                onSelect={(a) => {
                  fk.setFieldValue("receipt", a.assets[0]);
                }}
              />
              <CustomInput
                label="Enter Remark"
                containerStyle={{ marginBottom: 20 }}
                onChangeText={(v) => fk.setFieldValue("remarks", v)}
                value={fk.values.remarks || ""}
                onBlur={() => fk.handleBlur("remarks")}
              />
              {fk.errors.remarks && fk.touched.remarks && (
                <Text style={styles.errorText}>
                  {typeof fk.errors.remarks === "string"
                    ? fk.errors.remarks
                    : "Invalid input"}
                </Text>
              )}

              <CustomBtn
                title="Submit"
                containerStyle={{ marginBottom: 15 }}
                onPress={fk.handleSubmit}
                isLoading={fk?.isSubmitting}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    </>
  );
};

export default ExpenseForm;

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginTop: -15,
    marginBottom: 10,
  },
});
