import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  StyleSheet
} from "react-native";
import Header from "../../components/Header";

const PaymentDetails = () => {
  const navigation = useNavigation()
  const [paymentMode, setPaymentMode] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null)

  const paymentModes = [
    { label: "Online", value: "Online" },
    { label: "Cash", value: "Cash" },
  ];
  return (
    <>
      <Header title={"Add Booking"} />
      {/* <ScrollView
        style={{ marginTop: 20, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#000000" }}>
              Payment Details
            </Text>
            <View style={styles.divider}></View>
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Total Price
          </Text>
        </View>
        <TextInput
          name="totalprice"
          component={TextInput}
          style={styles.input}
          placeholder="Total Price"
        />
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Payment Plan
          </Text>
        </View>
        <TextInput
          name="Paymentplan"
          component={TextInput}
          style={styles.input}
          placeholder="Payment Plan"
        />
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Payment Plan
          </Text>
        </View>
        <BasicDropdown
          selectData={paymentModes}
          setValue={setPaymentMode}
          value={paymentMode}
          placeholder={"Mode Of Payment"}
        />
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Booking Amount
          </Text>
        </View>
        <TextInput
          name="bookingamount"
          component={TextInput}
          style={styles.input}
          placeholder="Booking Amount"
        />
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Kickback/Passback
          </Text>
        </View>
        <TextInput
          name="kickbackpassback"
          component={TextInput}
          style={styles.input}
          placeholder="Kickback/Passback"
        />
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Kickback/Passback%
          </Text>
        </View>
        <TextInput
          name="kickbackpassback%"
          component={TextInput}
          style={styles.input}
          placeholder="Kickback/Passback%"
        />
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Commission
          </Text>
        </View>
        <TextInput
          name="commission"
          component={TextInput}
          style={styles.input}
          placeholder="Commission"
        />
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Commission%
          </Text>
        </View>
        <TextInput
          name="commission%"
          component={TextInput}
          style={styles.input}
          placeholder="Commission%"
        />
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#000000",
              fontWeight: "500",
            }}
          >
            Payment Proof
          </Text>
        </View>
        <BasicDocumentPicker
          onDocumentPick={setPaymentProof}
          placeholder={"Payment Proof"}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <Pressable style={styles.Previousbtn} onPress={() => navigation.navigate("DeveloperInformation")} >
            <Text style={styles.btntextpre}> Previous</Text>
          </Pressable>

          <Pressable style={styles.submitbtn}
            onPress={() => navigation.navigate("clientInformation")}
          >
            <Text style={styles.btntext}>Next</Text>
          </Pressable>
        </View>
      </ScrollView> */}
    </>
  );
};

export default PaymentDetails;

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
  divider: {
    borderBottomColor: "#2D67C6",
    width: "100%",
    borderBottomWidth: 0.5,
    marginTop: 10,
  },

  Previousbtn: {
    marginTop: 25,
    backgroundColor: "#BFBFBF",
    padding: 12,
    width: "50%",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitbtn: {
    marginTop: 25,
    backgroundColor: "#2D67C6",
    padding: 12,
    width: "40%",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  btntextpre: {
    color: "#000000",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 20,
  },
  btntext: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 20,
  },
});
