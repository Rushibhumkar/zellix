import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import React, { useState } from "react";
import { excelPicker } from "../../utils/excelPicker";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { myConsole } from "../../hooks/useConsole";
import { status } from "../../utils/data";
import { addLead } from "../../services/rootApi/leadApi";
import { createCallingData } from "../../services/rootApi/callingDataApi";
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
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";

const importFields: { _id: string; name: string; aliases?: string[] }[] = [
  { _id: "clientName", name: "Client Name" },
  {
    _id: "clientMobile",
    name: "Mobile Number",
    aliases: ["Mobile No.", "Phone Number", "Client Mobile"],
  },
  {
    _id: "whatsapp",
    name: "WhatsApp Number",
    aliases: ["WhatsApp No.", "Whatsapp"],
  },
  { _id: "clientEmail", name: "Email Address" },
  { _id: "source", name: "Source" },
  { _id: "name", name: "Project" },
  { _id: "status", name: "Status" },
  { _id: "comments", name: "Comments" },
  { _id: "type", name: "Type" },
];
const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

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
  const source = getCellValue(row, ["source", "Source"]);
  const project = getCellValue(row, [
    "name",
    "Name",
    "project",
    "Project",
    "projectName",
  ]);
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
    source,
    name: project,
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

const validateBulkLeadRows = (
  rows: any[],
  sourceRows: any[],
  mapping: Record<string, string>,
) => {
  const emailPattern = /^\S+@\S+\.\S+$/;

  return rows.flatMap((row, index) => {
    const rowNumber = sourceRows[index]?.__rowNum__ != null ? sourceRows[index].__rowNum__ + 1 : index + 2;
    const originalRow = sourceRows[index] || {};
    const mobile = String(
      originalRow[mapping.clientMobile] ?? row.clientMobile ?? "",
    ).trim();
    const whatsapp = String(
      originalRow[mapping.whatsapp] ?? row.whatsapp ?? "",
    ).trim();
    const whatsappNumber = whatsapp.replace(
      /^(?:https?:\/\/)?(?:www\.)?wa\.me\//i,
      "",
    );
    const name = String(row.clientName || "").trim();
    const email = String(row.clientEmail || "").trim();
    const errors: string[] = [];
    if (!name) errors.push("Client Name is required");
    else if (!/\p{L}/u.test(name) || name.includes("@")) {
      errors.push(
        "Client Name looks like a number or email. Check the mapped column",
      );
    }
    if (!mobile && !whatsapp && !email) {
      errors.push(
        "At least one contact is required: Mobile Number, WhatsApp Number, or Email Address",
      );
    }
    if (email && !emailPattern.test(email))
      errors.push("Email Address is invalid. Check the mapped column");
    if (
      mobile &&
      (mobile.replace(/\D/g, "").length < 5 || /[\p{L}@]/u.test(mobile))
    ) {
      errors.push(
        "Mobile Number needs at least 5 digits and no letters. Check the mapped column",
      );
    }
    if (
      whatsapp &&
      (whatsappNumber.replace(/\D/g, "").length < 5 ||
        /[\p{L}@]/u.test(whatsappNumber))
    ) {
      errors.push(
        "WhatsApp Number needs at least 5 digits and no letters. Check the mapped column",
      );
    }
    return errors.length ? [`Row ${rowNumber}: ${errors.join(". ")}`] : [];
  });
};

const mapBulkLeadRows = (rows: any[], mapping: Record<string, string>) =>
  rows.map((row) => {
    const mapped: Record<string, any> = {};
    Object.entries(mapping).forEach(([field, header]) => {
      if (header) mapped[field] = row[header];
    });
    return normalizeBulkLead(mapped);
  });

const AddBulkLead = ({ tabType = "lead" }: { tabType?: string }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const { user } = useSelector(selectUser);

  const [bulkLead, setBulkLead] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [rowFrom, setRowFrom] = useState("1");
  const [rowTo, setRowTo] = useState("1000");
  const rangeError = rawRows.length <= 1000 ? "" :
    !/^[1-9]\d*$/.test(rowFrom) || !/^[1-9]\d*$/.test(rowTo) ? "Enter valid whole row numbers." :
    Number(rowFrom) > Number(rowTo) || Number(rowTo) > rawRows.length ? `Choose a range from 1 to ${rawRows.length}, with From row no greater than To row.` :
    Number(rowTo) - Number(rowFrom) + 1 > 1000 ? "You can import up to 1,000 rows at a time. Select a smaller range." : "";
  const selectedRows = rawRows.length > 1000 ? rawRows.slice(Number(rowFrom) - 1, Number(rowTo)) : rawRows;
  const changeRange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setAnalysisComplete(false);
    setMappingErrors([]);
    setBulkLead([]);
  };
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileVersion, setFileVersion] = useState(0);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [mappingOpen, setMappingOpen] = useState(false);
  const [mappingErrors, setMappingErrors] = useState<string[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
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
        if (rangeError || bulkLead.length > 1000) {
          toast.warning(rangeError || "You can import up to 1,000 rows at a time.");
          setMappingOpen(true);
          return;
        }
        if (bulkLead.length === 0) {
          setFieldValue("fileSelectionError", "Please choose a file");
          setLoading(false);
          return;
        }
        const rowErrors = validateBulkLeadRows(bulkLead, selectedRows, columnMap);
        if (rowErrors.length) {
          setMappingErrors(rowErrors);
          setAnalysisComplete(true);
          setMappingOpen(true);
          return;
        }

        setLoading(true);
        try {
          let sendData = {
            data: bulkLead.map((item) => ({ ...item, type: tabType })),
            srManager: value?.srManager,
            assign: value?.srManager,
          };
          let addLeadRes = await (tabType === "calling_data" ? createCallingData : addLead)(sendData, toast);
          // await dispatch(getAllLeadFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLead],
          });
          toast.success("Lead(s) Added Successfully");
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
    try {
      const selectedFile = await excelPicker();
      if (selectedFile === null) return;
      const { rows: selectedRows, fileName } = selectedFile;
      if (!selectedRows.length || !Object.keys(selectedRows[0]).length) {
        toast.warning("The spreadsheet has no data rows. Choose another file.");
        return;
      }
      const sheetHeaders = Object.keys(selectedRows[0]);
      const suggested = Object.fromEntries(
        importFields.map((field) => [
          field._id,
          sheetHeaders.find((header) =>
            [field._id, field.name, ...(field.aliases || [])].some(
              (alias) => normalizeHeader(alias) === normalizeHeader(header),
            ),
          ) || "",
        ]),
      );
      setRawRows(selectedRows);
      setRowFrom("1");
      setRowTo("1000");
      setSelectedFileName(fileName);
      setHeaders(sheetHeaders);
      setFileVersion((version) => version + 1);
      setColumnMap(suggested);
      setBulkLead([]);
      setMappingErrors([]);
      setAnalysisComplete(false);
      setFieldValue("fileSelectionError", "");
      setMappingOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to read the spreadsheet. Choose a valid Excel file.");
    }
  };

  const analyseData = () => {
    const requiredMappings = rangeError ? [rangeError] : [];
    if (!columnMap.clientName)
      requiredMappings.push("Select a spreadsheet column for Client Name.");
    if (
      !["clientMobile", "whatsapp", "clientEmail"].some(
        (field) => columnMap[field],
      )
    ) {
      requiredMappings.push(
        "Select at least one contact field: Mobile Number, WhatsApp Number, or Email Address.",
      );
    }
    if (requiredMappings.length) {
      setMappingErrors(requiredMappings);
      setAnalysisComplete(true);
      return;
    }
    const rows = mapBulkLeadRows(selectedRows, columnMap);
    setMappingErrors(validateBulkLeadRows(rows, selectedRows, columnMap));
    setAnalysisComplete(true);
  };

  const applyMapping = () => {
    if (!analysisComplete || mappingErrors.length || rangeError) return;
    setBulkLead(mapBulkLeadRows(selectedRows, columnMap));
    setMappingOpen(false);
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
      <ModalWithBlur
        visible={mappingOpen}
        onClose={() => setMappingOpen(false)}
        contentHeight="88%"
        scrollableContent
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <CustomText
            style={{
              fontSize: 19,
              fontWeight: "700",
              color: "#1E293B",
              marginBottom: 8,
            }}
          >
            Map spreadsheet columns
          </CustomText>
          <CustomText
            style={{ color: "#64748B", marginBottom: 16, width: "90%" }}
          >
            Choose a spreadsheet column for each lead field. You can use the
            same column more than once.
            {" "}The first row is treated as headers; unnamed columns use spreadsheet letters.
          </CustomText>
          {rawRows.length > 1000 && <View style={{ padding: 14, marginBottom: 16, borderRadius: 12, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" }}>
            <CustomText style={{ color: "#334155", marginBottom: 12 }}>This sheet has {rawRows.length.toLocaleString()} data rows. Import up to 1,000 at a time. Row 1 is the first data row; the header is excluded.</CustomText>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <CustomText style={{ color: "#334155", marginBottom: 6 }}>From row</CustomText>
                <TextInput accessibilityLabel="From row" keyboardType="number-pad" value={rowFrom} onChangeText={(value) => changeRange(setRowFrom, value)} style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, padding: 10, backgroundColor: "white", color: "#1E293B" }} />
              </View>
              <View style={{ flex: 1 }}>
                <CustomText style={{ color: "#334155", marginBottom: 6 }}>To row</CustomText>
                <TextInput accessibilityLabel="To row" keyboardType="number-pad" value={rowTo} onChangeText={(value) => changeRange(setRowTo, value)} style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, padding: 10, backgroundColor: "white", color: "#1E293B" }} />
              </View>
            </View>
            <CustomText style={{ marginTop: 10, color: rangeError ? "#B45309" : "#334155" }}>{rangeError || `${selectedRows.length} rows selected.`}</CustomText>
          </View>}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 10,
              paddingBottom: 8,
            }}
          >
            <CustomText
              style={{
                flex: 1,
                color: "#64748B",
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              LEAD FIELD
            </CustomText>
            <CustomText
              style={{
                flex: 1,
                color: "#64748B",
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              SPREADSHEET COLUMN
            </CustomText>
          </View>
          <View
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 12,
            }}
          >
            {importFields.map((field, index) => (
              <View
                key={field._id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderBottomWidth: index < importFields.length - 1 ? 1 : 0,
                  borderBottomColor: "#E2E8F0",
                }}
              >
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <CustomText style={{ color: "#334155", fontWeight: "600" }}>
                    {field.name}
                  </CustomText>
                  {field._id === "clientName" && (
                    <CustomText style={{ color: "#DC2626", fontWeight: "700" }}>
                      {" "}
                      *
                    </CustomText>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <DropdownRNE
                    key={`${fileVersion}-${field._id}`}
                    arrOfObj={[
                      { _id: "", name: "Select column (optional)" },
                      ...headers.map((header) => ({
                        _id: header,
                        name: header,
                      })),
                    ]}
                    initialValue={columnMap[field._id] || ""}
                    onChange={(header) => {
                      setColumnMap((prev) => ({
                        ...prev,
                        [field._id]: header,
                      }));
                      setAnalysisComplete(false);
                      setMappingErrors([]);
                    }}
                    keyValueGetOnSelect="_id"
                    keyValueShowInBox="name"
                    placeholder="Select column"
                  />
                </View>
              </View>
            ))}
          </View>
          <View
            style={{
              backgroundColor: "#FFFBEB",
              borderColor: "#FCD34D",
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              marginTop: 14,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <CustomText style={{ color: "#DC2626", fontWeight: "700" }}>
              *
            </CustomText>
            <CustomText style={{ color: "#92400E", flex: 1, marginLeft: 6 }}>
              Map Mobile, WhatsApp, or Email. Each row needs at least one.
            </CustomText>
          </View>
          <TouchableOpacity
            onPress={analyseData}
            style={{
              backgroundColor: "#EFF6FF",
              borderColor: "#93B4E8",
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              alignItems: "center",
              marginTop: 14,
            }}
          >
            <CustomText style={{ color: "#2E67BE", fontWeight: "700" }}>
              Analyse data
            </CustomText>
          </TouchableOpacity>
          {analysisComplete &&
            (mappingErrors.length ? (
              <View
                style={{
                  backgroundColor: "#FFFBEB",
                  borderColor: "#FCD34D",
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 12,
                }}
              >
                <CustomText
                  style={{
                    color: "#92400E",
                    fontWeight: "700",
                    marginBottom: 6,
                  }}
                >
                  {mappingErrors.length} issue(s) found. Fix the mapping or
                  spreadsheet, then analyse again.
                </CustomText>
                <View>
                  {mappingErrors.map((message, index) => (
                    <CustomText
                      key={index}
                      style={{ color: "#92400E", marginBottom: 6 }}
                    >
                      {message}
                    </CustomText>
                  ))}
                </View>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: "#F0FDF4",
                  borderColor: "#86EFAC",
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 12,
                }}
              >
                <CustomText style={{ color: "#166534" }}>
                  All {selectedRows.length} rows are ready to import.
                </CustomText>
              </View>
            ))}
          <TouchableOpacity
            onPress={handlePicker}
            style={{
              backgroundColor: "#EFF6FF",
              borderColor: "#93B4E8",
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              alignItems: "center",
              marginTop: 14,
            }}
          >
            <CustomText style={{ color: "#2E67BE", fontWeight: "700" }}>
              Choose another file
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={applyMapping}
            disabled={!analysisComplete || mappingErrors.length > 0}
            style={{
              backgroundColor: "#2E67BE",
              borderRadius: 10,
              padding: 13,
              alignItems: "center",
              marginTop: 14,
              opacity: !analysisComplete || mappingErrors.length ? 0.5 : 1,
            }}
          >
            <CustomText style={{ color: "#FFFFFF", fontWeight: "700" }}>
              Use mapping
            </CustomText>
          </TouchableOpacity>
        </ScrollView>
      </ModalWithBlur>
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
            {bulkLead?.length > 0 ? "Change file" : "Choose a file"}
          </CustomText>
          <FileIcon />
        </TouchableOpacity>
        {bulkLead.length > 0 && selectedFileName ? (
          <CustomText
            style={{ color: color.green, marginTop: 4, marginLeft: 4 }}
            numberOfLines={1}
          >
            {selectedFileName}
          </CustomText>
        ) : null}
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
