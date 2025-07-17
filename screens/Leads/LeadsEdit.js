import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { List } from "react-native-paper";
import { AddLeadSchema } from "../../utils/validation";
import { Formik } from "formik";
import { useNavigation } from "@react-navigation/native";
import Header from "../../components/Header";

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

const LeadsEdit = () => {
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
    // LeadType: "",
    whatsappLink: "",
    // selectManager: "",
    // selectAgent: "",
  };

  const handleFormSubmit = (values) => {
    console.log(values);
    navigation.navigate("AllLeads");
  };

  return (
    <>
      <Header  title={"Edit Leads"}/>
       <ScrollView>
       <View style={{ padding: 20, marginBottom: 20 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={AddLeadSchema}
          onSubmit={handleFormSubmit}
        >
          {({ handleChange, handleSubmit, values, errors }) => (
            <View>
              <List.Accordion
                title="Add Single Lead"
                style={styles.addlead}
                titleStyle={styles.title}
                expanded={expanded}
                onPress={handlePress}
              >
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
                      <Text style={styles.errorText}>
                        {errors.mobileNumber}
                      </Text>
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
                    <Dropdown
                      style={[
                        styles.dropdown,
                        isFocus && { borderColor: "#000000" },
                      ]}
                      data={data}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="Lead Type"
                      value={leadType}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={(item) => {
                        setLeadType(item.value);
                        setIsFocus(false);
                      }}
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
                  <Dropdown
                    style={[styles.dropdown, { borderColor: "#000000" }]}
                    data={manager}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Sr.Manager"
                    value={srManager}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      setSrManager(item.value);
                      setIsFocus(false);
                    }}
                  />
                  <View>
                    <Text style={styles.label}>Add Agents(s)</Text>
                  </View>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocus && { borderColor: "#000000" },
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    data={agents}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select The Agent"
                    value={agent}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      setAgent(item.value);
                      setIsFocus(false);
                    }}
                  />
                </View>
              </List.Accordion>
              <Pressable style={styles.submitbtn} onPress={handleSubmit}>
                <Text style={styles.btntext}>Submit</Text>
              </Pressable>
            </View>
          )}
        </Formik>
      </View>
       </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  addlead: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFC857",
    backgroundColor: "#ECECEC",
    paddingVertical: -10,
  },
  title: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "700",
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
  submitbtn: {
    marginTop: 35,
    backgroundColor: "#FFC857",
    padding: 12,
    width: "95%",
    borderRadius: 10,
    alignSelf: "center",
  },
  btntext: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 20,
  },
  label: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "500",
    marginTop: 20,
  },
  dropdown: {
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
    marginTop: 0,
  },
});

export default LeadsEdit;
