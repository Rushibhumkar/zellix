import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { excelPicker } from "../../utils/excelPicker";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { myConsole } from "../../hooks/useConsole";
import { status } from "../../utils/data";
import { addLead } from "../../services/rootApi/leadApi";
import { getAllLeadFunc } from "../../redux/action";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { routeLead } from "../../utils/routes";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { selectUser } from "../../redux/userSlice";
import { useFormik } from "formik";
import FileIcon from "../../assets/svg/FileIcon";
import { addLeadInBulk } from "../../utils/validation";
import { queryKeyCRM } from "../../utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import { useAppToast } from "../../components/AppToast";

const leadType = [
  { value: "lead", label: "Lead" },
  { value: "calling_data", label: "Calling Data" },
];

const getCellValue = (row: any, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null) return String(value).trim();
  }
  return "";
};

const normalizeBulkLead = (row: any) => {
  const source = getCellValue(row, ["source", "Source", "name", "Name"]);
  const clientName = getCellValue(row, [
    "clientName",
    "Client Name",
    "ClientName",
  ]);
  const clientMobile = getCellValue(row, [
    "clientMobile",
    "Client Mobile",
    "Mobile Number",
    "Mobile",
  ]);
  const clientEmail = getCellValue(row, [
    "clientEmail",
    "Client Email",
    "Email Address",
    "Email",
  ]);
  const whatsappNumber = getCellValue(row, [
    "whatsapp",
    "WhatsApp Number",
    "Whatsapp Number",
    "WhatsApp",
    "Whatsapp",
  ]);
  const whatsappDigits = whatsappNumber.replace(/\D/g, "");
  const typeValue = getCellValue(row, ["type", "Type"]);
  const statusValue = getCellValue(row, ["status", "Status"]);

  return {
    ...row,
    name: source,
    clientName,
    clientMobile,
    clientEmail,
    comments: getCellValue(row, ["comments", "Comments"]),
    type:
      leadType.find(
        (item) =>
          item.value === typeValue ||
          item.label.toLowerCase() === typeValue.toLowerCase(),
      )?.value || typeValue,
    status:
      status.find(
        (item) =>
          item.value === statusValue ||
          item.label?.toLowerCase() === statusValue.toLowerCase(),
      )?.value || statusValue,
    whatsapp: whatsappDigits ? `https://wa.me/${whatsappDigits}` : "",
  };
};

const validateBulkLeadRows = (rows: any[]) => {
  const emailPattern = /^\S+@\S+\.\S+$/;

  return rows.flatMap((row, index) => {
    const rowNumber = index + 2;
    const mobileDigits = String(row.clientMobile || "").replace(/\D/g, "");
    const whatsappDigits = String(row.whatsapp || "").replace(/\D/g, "");
    const email = String(row.clientEmail || "").trim();

    if (!String(row.clientName || "").trim()) {
      return [`Row ${rowNumber}: Client Name is required`];
    }
    if (!mobileDigits && !whatsappDigits && !email) {
      return [
        `Row ${rowNumber}: Enter at least one mobile number, WhatsApp number, or email address`,
      ];
    }
    if (email && !emailPattern.test(email)) {
      return [`Row ${rowNumber}: Enter a valid email address`];
    }
    if (row.clientMobile && mobileDigits.length < 5) {
      return [`Row ${rowNumber}: Enter a valid mobile number`];
    }
    if (row.whatsapp && whatsappDigits.length < 5) {
      return [`Row ${rowNumber}: Enter a valid WhatsApp number`];
    }
    return [];
  });
};

const AddBulkLead = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const { user } = useSelector(selectUser);

  const [bulkLead, setBulkLead] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const toast = useAppToast();

  const { values, errors, setFieldValue, handleSubmit, handleBlur, touched } =
    useFormik({
      validationSchema: addLeadInBulk,
      initialValues: {
        srManager: "",
        fileSelectionError: "",
      },
      onSubmit: async (value) => {
        if (bulkLead.length === 0) {
          setFieldValue("fileSelectionError", "Please choose a file");
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          let sendData = {
            data: bulkLead,
            srManager: value?.srManager,
            assign: value?.srManager,
          };
          let addLeadRes = await addLead(sendData, toast);
          // await dispatch(getAllLeadFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLead],
          });
          toast.success("Lead Added Successfully");
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getDashboardCount],
          });
          navigate(routeLead.allLead);
        } catch (err) {
          myConsole("error", err);
          toast.error(err?.response?.data || err);
        } finally {
          setLoading(false);
        }
      },
    });

  //excel
  const handlePicker = async () => {
    const selectedRows = await excelPicker();
    if (!selectedRows?.length) return;

    const normalizedRows = selectedRows.map(normalizeBulkLead);
    const rowErrors = validateBulkLeadRows(normalizedRows);
    if (rowErrors.length) {
      setBulkLead([]);
      setFieldValue("fileSelectionError", rowErrors[0]);
      toast.error(rowErrors[0]);
      return;
    }

    setFieldValue("fileSelectionError", "");
    setBulkLead(normalizedRows);
  };

  const validateFileSelection = () => {
    return bulkLead?.length > 0 || "Please choose a file";
  };

  const validateAll = async () => {
    await validateForm();
    setFieldValue("fileSelectionError", validateFileSelection());
  };

  return (
    <View>
      <View style={{ marginBottom: 15 }}>
        <CustomText
          style={{
            color: color.mainTxtColor,
            marginBottom: 10,
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          {"Choose a File"}
        </CustomText>
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            height: 37.5,
            borderColor: color.borderColor,
            backgroundColor: color.white,
            borderWidth: 1.8,
            borderRadius: 14,
            padding: 10,
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            paddingEnd: 20,
          }}
          onPress={handlePicker}
        >
          <CustomText
            style={{
              fontSize: 14,
              fontWeight: "400",
              color: color.strokeColor,
            }}
          >
            {bulkLead?.length > 0 ? "You have choose file" : "Choose a file"}
          </CustomText>
          <FileIcon />
        </TouchableOpacity>
        {values.fileSelectionError ? (
          <CustomText style={{ color: "red", marginTop: 5 }}>
            {values.fileSelectionError}
          </CustomText>
        ) : null}
      </View>

      {user?.isAdmin && (
        <DropdownRNE
          keyValueShowInBox="name"
          keyValueGetOnSelect="_id"
          label={"Assign To"}
          keyName="sr_Manager"
          containerStyle={{ marginBottom: 15 }}
          placeholder="Sr Manager"
          onChange={(a) => setFieldValue("srManager", a)}
          onBlur={handleBlur("srManager")}
          initialValue={values?.srManager}
        />
      )}
      {errors.srManager && touched.srManager && (
        <CustomText style={{ color: "red", marginTop: -10 }}>
          {errors.srManager}
        </CustomText>
      )}

      <CustomBtn
        title="Submit"
        containerStyle={{ margin: 20 }}
        onPress={handleSubmit}
        isLoading={isLoading}
      />
    </View>
  );
};

export default AddBulkLead;
