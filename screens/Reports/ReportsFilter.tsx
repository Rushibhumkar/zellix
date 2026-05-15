import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useFormik } from "formik";
import { useNavigation, useRoute } from "@react-navigation/native";

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

  const route: any = useRoute();

  const filters = route?.params?.filters;

  const { values, handleChange, setFieldValue, resetForm, handleSubmit } =
    useFormik({
      initialValues: {
        leadType: filters?.leadType || "lead",
        startDate: filters?.startDate || "",
        endDate: filters?.endDate || "",
      },

      onSubmit: (formValues) => {
        const payload = {
          startDate: formValues?.startDate || null,
          endDate: formValues?.endDate || null,
          leadType: formValues?.leadType || "lead",
        };

        console.log("FILTER VALUES => ", payload);

        navigation.goBack();

        setTimeout(() => {
          navigation.navigate("ReportsListing", {
            filters: payload,
          });
        }, 100);
      },
    });

  return (
    <Container>
      <Header title={"Reports Filter"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Report Type */}
        <DropdownRNE
          label="Lead Type"
          arrOfObj={[
            { name: "Lead", _id: "lead" },
            { name: "Calling Data", _id: "calling_data" },
          ]}
          containerStyle={styles.fieldContainer}
          initialValue={values?.leadType}
          onChange={(v) => setFieldValue("leadType", v)}
        />

        {/* Start Date */}
        <DatePickerExpo
          title="Start Date"
          boxContainerStyle={styles.fieldContainer}
          initialValue={values?.startDate}
          onSelect={(v) =>
            setFieldValue(
              "startDate",
              v ? new Date(v).toISOString().split("T")[0] : "",
            )
          }
        />

        {/* End Date */}
        <DatePickerExpo
          title="End Date"
          boxContainerStyle={styles.fieldContainer}
          initialValue={values?.endDate}
          onSelect={(v) =>
            setFieldValue(
              "endDate",
              v ? new Date(v).toISOString().split("T")[0] : "",
            )
          }
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
            title="Apply"
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
