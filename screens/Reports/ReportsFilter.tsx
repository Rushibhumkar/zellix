import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useFormik } from "formik";
import { useNavigation } from "@react-navigation/native";

import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomText from "../../myComponents/CustomText/CustomText";

import { color } from "../../const/color";

const ReportsFilter = () => {
  const navigation = useNavigation();

  const { values, handleChange, setFieldValue, resetForm, handleSubmit } =
    useFormik({
      initialValues: {
        reportType: "",
        status: [],
        assignedTo: "",
        startDate: "",
        endDate: "",
        keyword: "",
        sortBy: "",
      },

      onSubmit: (formValues) => {
        console.log("FILTER VALUES => ", formValues);

        navigation.goBack();
      },
    });

  return (
    <Container>
      <Header title={"Advance Search"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Report Type */}
        <DropdownRNE
          label="Report Type"
          arrOfObj={[
            { name: "Lead Report", _id: "lead_report" },
            { name: "Booking Report", _id: "booking_report" },
            { name: "Meeting Report", _id: "meeting_report" },
            { name: "Revenue Report", _id: "revenue_report" },
          ]}
          containerStyle={styles.fieldContainer}
          initialValue={values?.reportType}
          onChange={(v) => setFieldValue("reportType", v)}
        />

        {/* Status */}
        <DropdownRNE
          label="Status"
          arrOfObj={[
            { name: "Hot", _id: "hot" },
            { name: "Warm", _id: "warm" },
            { name: "Cold", _id: "cold" },
            { name: "Closed", _id: "closed" },
          ]}
          containerStyle={styles.fieldContainer}
          isMultiSelect
          initialValue={values?.status}
          onChange={(v) => setFieldValue("status", v)}
        />

        {/* Assigned To */}
        <DropdownRNE
          label="Assigned To"
          arrOfObj={[
            { name: "Amit", _id: "amit" },
            { name: "Rohit", _id: "rohit" },
            { name: "Sneha", _id: "sneha" },
            { name: "Priya", _id: "priya" },
          ]}
          containerStyle={styles.fieldContainer}
          initialValue={values?.assignedTo}
          onChange={(v) => setFieldValue("assignedTo", v)}
        />

        {/* Start Date */}
        <DatePickerExpo
          title="Start Date"
          boxContainerStyle={styles.fieldContainer}
          initialValue={values?.startDate}
          onSelect={(v) => setFieldValue("startDate", v)}
        />

        {/* End Date */}
        <DatePickerExpo
          title="End Date"
          boxContainerStyle={styles.fieldContainer}
          initialValue={values?.endDate}
          onSelect={(v) => setFieldValue("endDate", v)}
        />

        {/* Keyword */}
        <CustomInput
          label="Search Keyword"
          placeholder="Search by client, project, source..."
          containerStyle={styles.fieldContainer}
          value={values?.keyword}
          onChangeText={handleChange("keyword")}
        />

        {/* Sort By */}
        <DropdownRNE
          label="Sort By"
          arrOfObj={[
            { name: "Newest First", _id: "newest" },
            { name: "Oldest First", _id: "oldest" },
            { name: "Budget High to Low", _id: "high_to_low" },
            { name: "Budget Low to High", _id: "low_to_high" },
          ]}
          containerStyle={styles.fieldContainer}
          initialValue={values?.sortBy}
          onChange={(v) => setFieldValue("sortBy", v)}
        />

        <View style={{ height: 20 }} />
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.cancelBtn}
            onPress={() => {
              resetForm();
              navigation.goBack();
            }}
          >
            <CustomText style={styles.cancelText}>Cancel</CustomText>
          </TouchableOpacity>

          <CustomBtn
            title="Submit"
            onPress={handleSubmit}
            containerStyle={styles.submitBtn}
          />
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
    </Container>
  );
};

export default ReportsFilter;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 180,
  },

  fieldContainer: {
    marginBottom: 18,
  },

  bottomContainer: {
    // position: "absolute",
    // bottom: 100,
    // left: 16,
    // right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: color.primaryColor,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.white,
  },

  cancelText: {
    color: color.primaryColor,
    fontSize: 16,
    fontWeight: "600",
  },

  submitBtn: {
    flex: 1,
  },
});
