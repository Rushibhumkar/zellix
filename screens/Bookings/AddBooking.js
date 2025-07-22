import React, { useState } from "react";
import {
  StyleSheet
} from "react-native";
import Header from "../../components/Header";

const meetingstatus = [
  { label: "Meeting Schedule", value: "Meeting Schedule" },
  { label: "Meeting Conducted", value: "Meeting Conducted" },
  { label: "Meeting Resheduled", value: "Meeting Resheduled" },
];

const AddBooking = () => {
  const [agent, setAgent] = useState(null);
  const [commission, setCommissions] = useState([{ id: 1, value: "" }]);

  const handleImagePress = () => {
    setCommissions((prevCommissions) => [
      ...prevCommissions,
      { id: prevCommissions.length + 1, value: "" },
    ]);
  };

  const handleCommissionChange = (id, text) => {
    setCommissions((prevCommissions) =>
      prevCommissions.map((commission) =>
        commission.id === id ? { ...commission, value: text } : commission
      )
    );
  };
  return (
    <>
      <Header title={"Add Bookingss"} />
      {/* <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: "500", color: "#000000" }}>
              Agents
            </Text>
            <View style={styles.divider}></View>
          </View>
        </View>
        <Text
          style={{
            color: "#000000",
            fontSize: 16,
            fontWeight: "500",
            marginTop: 20,
          }}
        >
          Add Agents
        </Text>
        <BasicDropdown
          selectData={meetingstatus}
          setValue={setAgent}
          value={agent}
          placeholder={"Select The Agent"}
        />

        <Text style={styles.inputlable}>Commission</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TextInput
            name="commission"
            component={TextInput}
            style={styles.input}
            value={commission.value}
            placeholder="Commission in AED"
            onChangeText={(text) => handleCommissionChange(commission.id, text)}
          />
          <TouchableOpacity onPress={handleImagePress}>
            <Image
              style={{ marginTop: 15 }}
              source={require("../../assets/Plus.png")}
            />
          </TouchableOpacity>
        </View>
        <Button btnText={"Submit"} />
      </View> */}
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: "#2D67C6",
    width: "100%",
    borderBottomWidth: 0.5,
    marginTop: 10,
  },
  inputlable: {
    color: "#000000",
    marginTop: 25,
    fontSize: 14,
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
    width: "80%",
  },
});

export default AddBooking;
