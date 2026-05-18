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
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { myConsole } from "../../hooks/useConsole";
import { roleEnum } from "../../utils/data";
import { useGetAllUserHRM } from "../../hooks/useGetQuerryHRM";
import { useGetMyAllTeamMembers } from "../../services/rootApi/api";

const ReportsFilter = () => {
  const navigation = useNavigation();

  const { user: reduxUser, team } = useSelector(selectUser);

  const { data: users, isLoading, isError } = useGetMyAllTeamMembers();

  // myConsole("userssssdataas", users);
  // myConsole("userssdatalength", users?.data?.length);

  // myConsole("reduxUserrrr", reduxUser);
  // myConsole("allUserssss", allUsers);
  // myConsole("teammmmm", team);

  const route: any = useRoute();

  const filters = route?.params?.filters;

  const { values, handleChange, setFieldValue, resetForm, handleSubmit } =
    useFormik({
      initialValues: {
        leadType: filters?.leadType || "",
        startDate: filters?.startDate || "",
        endDate: filters?.endDate || "",
        pnls: filters?.pnls || [],
        teams: filters?.teams || [],
        agents: filters?.agents || [],
      },

      onSubmit: (formValues) => {
        const payload = {
          startDate: formValues?.startDate || null,
          endDate: formValues?.endDate || null,
          leadType: formValues?.leadType || "",

          pnls: formValues?.pnls?.length > 0 ? formValues?.pnls : [],
          teams: formValues?.teams?.length > 0 ? formValues?.teams : [],
          agents: formValues?.agents?.length > 0 ? formValues?.agents : [],
        };

        myConsole("FILTER VALUES => ", payload);

        navigation.goBack();

        setTimeout(() => {
          navigation.navigate("ReportsListing", {
            filters: payload,
          });
        }, 100);
      },
    });

  const userRole = reduxUser?.role;

  const srManagersList = (team || [])
    ?.map((el: any) => el?.srManager)
    ?.filter(
      (value: any, index: number, self: any[]) =>
        value?._id &&
        index === self.findIndex((t: any) => t?._id === value?._id),
    )
    ?.map((el: any) => ({
      name: el?.name,
      _id: el?._id,
    }));

  const filteredTeams =
    userRole === roleEnum.sr_manager
      ? (team || [])?.filter((el: any) => el?.srManager?._id === reduxUser?._id)
      : values?.pnls?.length > 0
        ? (team || [])?.filter((el: any) =>
            values?.pnls?.includes(el?.srManager?._id),
          )
        : team || [];

  const teamOptions = filteredTeams?.map((el: any) => ({
    name: el?.name,
    _id: el?._id,
  }));

  // myConsole("teammmmm", team);
  const usersOptions = users?.agent || [];

  myConsole("usersOptions", usersOptions?.length);
  // myConsole("userRolerrr", reduxUser);

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
            { name: "All", _id: "" },
            { name: "Lead", _id: "lead" },
            { name: "Calling Data", _id: "calling_data" },
          ]}
          containerStyle={styles.fieldContainer}
          initialValue={values?.leadType}
          onChange={(v) => setFieldValue("leadType", v)}
        />

        {[roleEnum.sup_admin, roleEnum.sub_admin].includes(userRole) && (
          <DropdownRNE
            label="Pnl's"
            arrOfObj={srManagersList}
            containerStyle={styles.fieldContainer}
            initialValue={values?.pnls}
            onChange={(v) => {
              setFieldValue("pnls", v);
              setFieldValue("teams", []);
              setFieldValue("agents", []);
            }}
            isMultiSelect
            isSearch
          />
        )}

        {[
          roleEnum.sup_admin,
          roleEnum.sub_admin,
          roleEnum.sr_manager,
          roleEnum.team_lead,
        ].includes(userRole) && (
          <DropdownRNE
            label="Teams"
            arrOfObj={teamOptions}
            containerStyle={styles.fieldContainer}
            initialValue={values?.teams}
            onChange={(v) => {
              setFieldValue("teams", v);
              setFieldValue("agents", []);
            }}
            isMultiSelect
            isSearch
          />
        )}

        {[
          roleEnum.team_lead,
          roleEnum.sup_admin,
          roleEnum.sub_admin,
          roleEnum.sr_manager,
        ].includes(userRole) && (
          <DropdownRNE
            label="Agents"
            arrOfObj={(usersOptions || [])?.map((el: any) => ({
              name: el?.label,
              _id: el?.value,
            }))}
            containerStyle={styles.fieldContainer}
            initialValue={values?.agents}
            onChange={(v) => setFieldValue("agents", v)}
            isMultiSelect
            isSearch
          />
        )}

        {/* Start Date */}
        <DatePickerExpo
          title="Start Date"
          boxContainerStyle={styles.fieldContainer}
          initialValue={values?.startDate}
          maximumDate={new Date()}
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
          minimumDate={
            values?.startDate ? new Date(values?.startDate) : undefined
          }
          maximumDate={new Date()}
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
