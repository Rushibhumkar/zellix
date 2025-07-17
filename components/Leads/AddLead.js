import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { AddLeadSchema } from "../../utils/validation";
import { Formik } from "formik";
import { useNavigation } from "@react-navigation/native";
import BasicDropdown from "../common/BasicDropdown";
import ListAccordion from "../common/ListAccordion";
import Button from "../common/Button";

const data = [
  { label: "Lead", value: "Lead" },
  { label: "Calling Data", value: "Calling Data" },
];

const manager = [
  { label: "Manager", value: "Manager" },
  { label: "Deepak", value: "Deepak" },
];

const agents = [
  { label: "Ahmed", value: "Ahmed" },
  { label: "Soud", value: "Soud" },
];

const AddLead = () => {
  const [expanded, setExpanded] = React.useState(true);
  const [countryCode, setCountryCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [leadType, setLeadType] = useState(null);
  const [srManager, setSrManager] = useState(null);
  const [agent, setAgent] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const handlePress = () => setExpanded(!expanded);
  const navigation = useNavigation();

  const initialValues = {
    clientName: "",
    mobileNumber: "",
    EmailAddress: "",
    comment: "",
    LeadType: "",
    whatsappLink: "",
    selectManager: "",
    selectAgent: "",
  };

  const handleFormSubmit = (values) => {
    navigation.navigate("allLeads");
  };

  const handleButtonPress = () => {
    navigation.navigate("allLeads");
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={AddLeadSchema}
        onSubmit={handleFormSubmit}
      >
        {({ handleChange, handleSubmit, values, errors }) => (
          <View>
            <ListAccordion title="Add Single Lead">
              <View style={{ marginTop: 20 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 20,
                      color: "#000000",
                      fontWeight: "500",
                    }}
                  >
                    name
                  </Text>
                </View>
                <TextInput
                  name="clientName"
                  component={TextInput}
                  value={values.clientName}
                  onChangeText={handleChange("clientName")}
                  style={styles.input}
                  placeholder="client name"
                />
                {errors.clientName && (
                  <Text style={styles.errorText}>{errors.clientName}</Text>
                )}
                <View>
                  <Text style={styles.label}>Mobile Number</Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput
                      style={styles.countycode}
                      placeholder=" +91"
                      keyboardType="phone-pad"
                      value={countryCode}
                      onChangeText={(text) => setCountryCode(text)}
                    />
                    <TextInput
                      style={styles.mobileinput}
                      name="mobileNumber"
                      component={TextInput}
                      value={values.mobileNumber}
                      onChangeText={handleChange("mobileNumber")}
                      placeholder="Mobile Number"
                      keyboardType="phone-pad"
                    />
                  </View>
                  {errors.mobileNumber && (
                    <Text style={styles.errorText}>{errors.mobileNumber}</Text>
                  )}
                </View>
                <View>
                  <Text style={styles.label}>Email Address</Text>
                </View>
                <TextInput
                  style={styles.input}
                  name="EmailAddress"
                  component={TextInput}
                  value={values.EmailAddress}
                  onChangeText={handleChange("EmailAddress")}
                  placeholder="Email Address"
                />
                {errors.EmailAddress && (
                  <Text style={styles.errorText}>{errors.EmailAddress}</Text>
                )}
                <View>
                  <Text style={styles.label}>Comments</Text>
                </View>
                <TextInput
                  style={styles.input}
                  name="comment"
                  component={TextInput}
                  value={values.comment}
                  onChangeText={handleChange("comment")}
                  placeholder="Comments"
                />
                {errors.comment && (
                  <Text style={styles.errorText}>{errors.comment}</Text>
                )}
                <View style={styles.container}>
                  <View>
                    <Text style={styles.label}>Lead Type</Text>
                  </View>

                  <BasicDropdown
                    selectData={data}
                    setValue={setLeadType}
                    value={leadType}
                    placeholder={"Lead Type"}
                  />
                </View>
                <View>
                  <Text style={styles.label}>Whatsapp Link</Text>
                </View>
                <TextInput
                  style={styles.input}
                  name="whatsappLink"
                  component={TextInput}
                  value={values.whatsappLink}
                  onChangeText={handleChange("whatsappLink")}
                  placeholder="Whatsapp Link"
                />
                {errors.whatsappLink && (
                  <Text style={styles.errorText}>{errors.whatsappLink}</Text>
                )}
                <View>
                  <Text style={styles.label}>Add Sr.Manager</Text>
                </View>
                <BasicDropdown
                  selectData={manager}
                  setValue={setSrManager}
                  value={srManager}
                  placeholder={"Select Sr.Manager"}
                />
                <View>
                  <Text style={styles.label}>Add Agents(s)</Text>
                </View>
                <BasicDropdown
                  selectData={agents}
                  setValue={setAgent}
                  value={agent}
                  placeholder={"Select The Agent"}
                />
              </View>
            </ListAccordion>
            <View style={{ padding: 20, marginTop: -30 }}>
              <Button onPress={handleButtonPress} btnText={"Submit"} />
            </View>
          </View>
        )}
      </Formik>
    </>
  );
};

const styles = StyleSheet.create({
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
  mobileinput: {
    marginTop: 10,
    height: 37.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    width: "77%",
  },
  countycode: {
    marginTop: 10,
    height: 37.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    width: "20%",
  },
  label: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginTop: 0,
  },
});

export default AddLead;
