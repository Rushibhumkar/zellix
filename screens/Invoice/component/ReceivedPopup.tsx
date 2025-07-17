import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import DatePickerExpo from "../../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomInput from "../../../myComponents/CustomInput/CustomInput";
import DropdownRNE from "../../../myComponents/DropdownRNE/DropdownRNE";
import ExpoImagePicker from "../../../myComponents/ExpoImagePicker/ExpoImagePicker";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { useFormik } from "formik";
import mime from "mime";
import { invoiceReceived, usePersonNameList } from "../query/useInvoice";
import { myConsole } from "../../../hooks/useConsole";

const CustomModalInvoice = ({ invoiceId, isVisible, onClose, title }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState("");
  const [closeModal, setCloseModal] = useState(onClose);
  const [cheque, setChequeData] = useState<{
    uri: string;
    type?: string;
    fileName?: string;
  } | null>(null);

  //   const formik = useFormik({

  //     initialValues: {

  //       qqqqq: "",
  //     },
  //     onSubmit: (v) => {
  //             const ios = Platform.OS === "ios" ? true : false;
  //         const formData = new FormData();
  //         let inputFields;
  //         formData.append("data", JSON.stringify(inputFields)),
  //         formData.append("receipt", {
  //             uri: ios ? visa?.uri : visa?.uri,
  //             type: ios ? visa?.type : mime.getType(visa?.uri),
  //             name: ios ? visa?.fileName : visa?.uri?.split("/").pop(),
  //           }),
  //         try{
  //             receivedSubmit({
  //                 id:'asdafds',
  //                 data:formData
  //             })
  //         }
  //         catch{
  //             console.log('eeee',e)
  //         }
  //     },
  //   });
  //   const ios = Platform.OS === "ios";
  //   const formData = new FormData();
  //   formData.append("data", JSON.stringify(initialValues));

  //   if (cheque.hasOwnProperty("uri")) {
  //     formData.append("cheque", {
  //       uri: cheque?.uri,
  //       type: ios ? cheque?.type : mime.getType(cheque?.uri),
  //       name: ios ? cheque?.fileName : cheque?.uri?.split("/").pop(),
  //     });
  //   }

  const individualIncentive = usePersonNameList({
    search: "",
  });
  const namesList =
    individualIncentive?.data?.map((item) => ({
      _id: item._id, // ID for selection
      name: item.name, // Name to display
    })) || [];

  console.log("dataListOfReceived", namesList);
  usePersonNameList;
  function initialValues() {
    return {
      paymentMode: "",
      receivedBy: "",
      receiptDate: "",
      receipt: "",
      cheque: "",
    };
  }

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: {
      receipt: null,
      cheque: null,
      paymentMode: "",
      receivedBy: "",
      receiptDate: null,
    },
    onSubmit: async (values) => {
      myConsole("valuesData", values);

      const ios = Platform.OS === "ios";
      const formData = new FormData();

      // Extract file fields separately
      const { receipt, cheque, ...jsonData } = values;
      myConsole("jsonData", jsonData);

      // Append JSON data as a single key-value pair
      formData.append("data", JSON.stringify(jsonData));

      // Append cheque if available
      if (cheque?.uri) {
        formData.append("cheque", {
          uri: cheque.uri,
          type: mime.getType(cheque.uri) || "image/jpeg",
          name: cheque.uri.split("/").pop(),
        });
      }

      // Append receipt if available
      if (receipt?.uri) {
        formData.append("receipt", {
          uri: receipt.uri,
          type: mime.getType(receipt.uri) || "image/jpeg",
          name: receipt.uri.split("/").pop(),
        });
      }

      myConsole("formdata", formData);

      try {
        const response = await invoiceReceived({
          data: formData,
          id: invoiceId,
          onSuccess: (e) => {
            myConsole("asdfasdfJav", e);
          },
        }); // Ensure this function returns a Promise
        // if (response?.success) {
        //   myConsole("Success:", response);
        //   alert("Data submitted successfully!");
        //   onClose(); // Close modal after success
        // } else {
        //   throw new Error(response?.message || "Submission failed");
        // }
      } catch (error) {
        myConsole("Error:", error);
        alert("Failed to submit data. Please try again.");
      }
    },
  });

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{title}</Text>

        {/* Text Input */}
        <CustomInput
          containerStyle={styles.inputField}
          placeholder="Payment Mode"
          value={values.paymentMode}
          onChangeText={(v) => {
            setFieldValue("paymentMode", v);
          }}
        />

        {/* Dropdown Label */}
        <DropdownRNE
          placeholder="Select Responsible Person"
          containerStyle={{ width: "100%", marginBottom: 15 }}
          arrOfObj={namesList}
          onChange={(a) => setFieldValue("receivedBy", a)}
          isSearch
          mode="modal"
          keyValueShowInBox="name"
          keyValueGetOnSelect="_id"
          initialValue={values.receivedBy}
        />
        {/* Date Picker */}
        <View style={{ width: "100%" }}>
          <DatePickerExpo
            mode="date"
            maximumDate={new Date()}
            minimumDate={new Date(2020, 0, 1)}
            onSelect={(v) => {
              setSelectedDate(v);
              setFieldValue("receiptDate", v);
            }}
          />

          <ExpoImagePicker
            boxContainerStyle={{ marginVertical: 15 }}
            label="Upload Receipt"
            onSelect={(a) => {
              const selectedImageReceipt = a.assets[0];
              setFieldValue("receipt", selectedImageReceipt); // Update Formik state
              setFieldValue("cheque", null); // Clear cheque field
            }}
          />
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <CustomText>OR</CustomText>
          </View>

          <ExpoImagePicker
            boxContainerStyle={{ marginVertical: 15 }}
            label="Upload Cheque"
            onSelect={(a) => {
              const selectedImageCheque = a.assets[0];
              setFieldValue("cheque", selectedImageCheque); // Update Formik state
              setFieldValue("receipt", null); // Clear receipt field
            }}
          />
        </View>
        {/* Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCloseModal(onClose)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.closeButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputField: {
    width: "100%",
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  dropdownButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownList: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    maxHeight: 150,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  closeButton: {
    backgroundColor: "#D01C13",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#00A4D6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
    justifyContent: "center",
  },
});

export default CustomModalInvoice;
