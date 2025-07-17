import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from "react-native";

import BasicDocumentPicker from "../common/BasicDocumentPicker";
import ListAccordion from "../common/ListAccordion";
import Button from "../common/Button";

const AddLeadsBulk = () => {
  const [expanded, setExpanded] = React.useState(true);
  const [selectFile, setSelectFile] = useState(null);
  const handlePress = () => setExpanded(!expanded);

 
  return (
    <>
      <ListAccordion
        title="Add Leads in Bulk"
      >
        <View style={{ marginTop: 20 }}>
          <View>
            <Text style={{ fontSize: 16, color: "#000000", fontWeight: "500" }}>
              Choose a File
            </Text>
          </View>
         <BasicDocumentPicker
           onDocumentPick={setSelectFile}
           placeholder={"Choose a file"}
          />
        </View>
         <View style={{marginTop: 10}}>
         <Button  btnText={"Submit"}/>
         </View>
      </ListAccordion>
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
});

export default AddLeadsBulk;
