import { useNavigation, useRoute } from "@react-navigation/native";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Header from "../../components/Header";
import BasicDropdown from "../../components/common/BasicDropdown";
import Button from "../../components/common/Button";
import Container from "../../myComponents/Container/Container";
import { teamLeadSchema } from "../../utils/validation";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { myConsole } from "../../hooks/useConsole";
import { addTeam, updateTeam } from "../../services/rootApi/teamApi";
import { getTeamFunc } from "../../redux/action";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import { routeTeam } from "../../utils/routes";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";

const AddTeam = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { user, allUsers } = useSelector(selectUser);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);

  const dispatch = useDispatch();
  let data = params?.data;
  const initialValues = {
    name: data?.name ?? "",
    agents: !!data ? data?.agents.map((el) => el?._id) : [],
    managerId: data?.manager?._id ?? "",
    srManagerId: data?.srManager?._id ?? "",
    teamLeadId: data?.teamLead?._id ?? "",
    assistantManagerId: data?.assistantManager?._id ?? "",
  };
  //
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (values) => {
    setIsLoading(true);
    try {
      let sendData = { ...values, createdBy: user?._id };
      if (!!data) {
        let res = await updateTeam({
          id: data?._id,
          data: sendData,
        });
        setIsVisible(true);
        setMessage(res?.data);
      } else {
        let res = await addTeam(sendData);
        setIsVisible(true);
        setMessage(res);
      }

      let b = await dispatch(getTeamFunc());
      navigation.navigate(routeTeam.teamList);
    } catch (err) {
      myConsole("errIn ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAllAgents = (allUsers) => {
    let allAgents = allUsers?.filter((user) =>
      user.role === "agent" ? { _id: user._id, name: user.name } : null
    )
      .map((user) => ({ _id: user._id, name: user.name }));
    return allAgents

  };

  filterAllAgents(allUsers)



  return (
    <Container>
      <Header title={"Add Teams"} />
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
        validationSchema={teamLeadSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          handleChange,
          handleSubmit,
          values,
          errors,
          handleBlur,
          touched,
          setFieldValue,
        }) => {
          return (
            <ScrollViewWithKeyboardAvoid>
              <View style={{ paddingBottom: 70, padding: 25 }}>
                <Text
                  style={{ fontSize: 18, color: "#000000", fontWeight: "700" }}
                >
                  Team Information
                </Text>
                <View style={[styles.divider, { marginBottom: 20 }]}></View>
                <CustomInput
                  placeholder="Team Name"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  containerStyle={{ marginBottom: 15 }}
                  label="Team Name"
                  onBlur={handleBlur("name")}
                />
                {errors.name && touched.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
                <DropdownRNE
                  keyValueShowInBox="name"
                  keyValueGetOnSelect="_id"
                  label={"Sr Manager"}
                  keyName="sr_Manager"
                  containerStyle={{ marginBottom: 15 }}
                  placeholder="Sr Manager"
                  onChange={(a) => setFieldValue("srManagerId", a)}
                  initialValue={values?.srManagerId}
                  onBlur={handleBlur("srManagerId")}
                />
                {errors.srManagerId && touched.srManagerId && (
                  <Text style={styles.errorText}>{errors.srManagerId}</Text>
                )}


                <DropdownRNE
                  keyValueShowInBox="name"
                  keyValueGetOnSelect="_id"
                  label={"Manager"}
                  keyName="manager"
                  containerStyle={{ marginBottom: 15 }}
                  placeholder="Manager"
                  onChange={(a) => setFieldValue("managerId", a)}
                  initialValue={values?.managerId}
                  onBlur={handleBlur("managerId")}
                />
                {errors.managerId && touched.managerId && (
                  <Text style={styles.errorText}>{errors.managerId}</Text>
                )}

                <DropdownRNE
                  keyValueShowInBox="name"
                  keyValueGetOnSelect="_id"
                  label={"Assistant Manager"}
                  keyName="assistant_manager"
                  containerStyle={{ marginBottom: 15 }}
                  placeholder="Assistant Manager"
                  onChange={(a) => setFieldValue("assistantManagerId", a)}
                  initialValue={values?.assistantManagerId}
                  onBlur={handleBlur("assistantManagerId")}
                />
                {errors.assistantManagerId && touched.assistantManagerId && (
                  <Text style={styles.errorText}>{errors.assistantManagerId}</Text>
                )}

                <DropdownRNE
                  keyValueShowInBox="name"
                  keyValueGetOnSelect="_id"
                  label={"Team Lead"}
                  keyName="team_lead"
                  containerStyle={{ marginBottom: 15 }}
                  placeholder="Team Lead"
                  onChange={(a) => setFieldValue("teamLeadId", a)}
                  initialValue={values?.teamLeadId}
                  onBlur={handleBlur("teamLeadId")}
                />
                {errors.teamLeadId && touched.teamLeadId && (
                  <Text style={styles.errorText}>{errors.teamLeadId}</Text>
                )}

                <DropdownRNE
                  isMultiSelect={true}
                  arrOfObj={filterAllAgents(allUsers)}
                  keyValueShowInBox="name"
                  keyValueGetOnSelect="_id"
                  label={"Agent"}
                  keyName="agent"
                  containerStyle={{ marginBottom: 15 }}
                  placeholder="Agent"
                  onChange={(a) => setFieldValue("agents", a)}
                  initialValue={values?.agents}
                  onBlur={handleBlur("agents")}
                  dropdownPosition="top"
                />
                {errors.agents && touched.agents && (
                  <Text style={styles.errorText}>{errors.agents}</Text>
                )}


                <CustomBtn
                  title="Submit"
                  isLoading={isLoading}
                  onPress={handleSubmit}
                  containerStyle={{ margin: 20 }}
                />
              </View>
            </ScrollViewWithKeyboardAvoid>
          );
        }}
      </Formik>
    </Container>
  );
};

export default AddTeam;

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: "#2D67C6",
    width: "60%",
    margin: "auto",
    borderBottomWidth: 0.3,
    marginTop: 10,
  },
  inputlable: {
    color: "#000000",
    marginTop: 20,
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
    marginBottom: 8
  },
});
