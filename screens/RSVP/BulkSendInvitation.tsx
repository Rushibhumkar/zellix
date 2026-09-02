import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Dropdown } from "react-native-element-dropdown";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import CustomText from "../../myComponents/CustomText/CustomText";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import { useAppToast } from "../../components/AppToast";

const BulkSendInvitation = ({ navigation }: any) => {
  const toast = useAppToast();
  const [events, setEvents] = useState<any[]>([]);
  const [eventId, setEventId] = useState("");
  const [file, setFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const loadEvents = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/event/upcoming");
      setEvents(response?.data?.data || []);
    } catch {
      toast.error("Unable to load upcoming events");
    }
  }, [toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const chooseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setFile(result.assets[0]);
      setErrors([]);
    }
  };

  const downloadTemplate = async () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet([
        {
          clientName: "John Doe",
          clientEmail: "john@example.com",
          clientMobile: "971501234567",
          whatsappNum: "",
          company: "Example Company",
          source: "Website",
          comment: "",
        },
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invitations");
      const binary = XLSX.write(workbook, { type: "binary", bookType: "xlsx" });
      const fileUri = `${FileSystem.documentDirectory}rsvp-invitations-template.xlsx`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(binary, "binary").toString("base64"),
        { encoding: "base64" },
      );
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(fileUri);
      else toast.success("Excel template created successfully");
    } catch {
      toast.error("Unable to create the Excel template");
    }
  };

  const send = async () => {
    const validationErrors: string[] = [];
    if (!eventId) validationErrors.push("Select an upcoming event.");
    if (!file) validationErrors.push("Choose an Excel (.xlsx) file.");
    if (validationErrors.length) return setErrors(validationErrors);
    try {
      setSubmitting(true);
      setErrors([]);
      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("file", {
        uri: file.uri,
        type:
          file.mimeType ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        name: file.name || "rsvp-invitations.xlsx",
      } as any);
      const response = await axiosInstance.post(
        "/api/invitation/bulk",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const failures = response?.data?.failures || [];
      if (failures.length) {
        setErrors(
          failures.map((item: any) => `Row ${item.row}: ${item.message}`),
        );
        toast.success(
          `${response?.data?.createdCount || 0} invitation(s) sent. Fix the remaining rows and try again.`,
        );
        return;
      }
      toast.success(response?.data?.message || "Invitations sent successfully");
      navigation.goBack();
    } catch (error: any) {
      const responseErrors = error?.response?.data?.errors;
      setErrors(
        Array.isArray(responseErrors)
          ? responseErrors.map((item: any) =>
              typeof item === "string"
                ? item
                : item?.message || JSON.stringify(item),
            )
          : [
              error?.response?.data?.message ||
                "Unable to send invitations. Please check the Excel data.",
            ],
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Header title="Bulk Send Invitations" />
      <View style={styles.content}>
        <Dropdown
          style={styles.dropdown}
          data={events}
          labelField="title"
          valueField="_id"
          value={eventId}
          placeholder="Select upcoming event"
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          onChange={(event: any) => {
            setEventId(event._id);
            setErrors([]);
          }}
        />
        <CustomText style={styles.label}>Excel file (.xlsx)</CustomText>
        <TouchableOpacity style={styles.filePicker} onPress={chooseFile}>
          <CustomText style={styles.fileText}>
            {file?.name || "Choose Excel file"}
          </CustomText>
        </TouchableOpacity>
        <CustomText style={styles.help}>
          Required: clientName. Every row must include at least one contact:
          clientEmail, clientMobile, or whatsappNum. The client selects their
          preferred attending date and time from the RSVP link.
        </CustomText>
        <TouchableOpacity
          onPress={downloadTemplate}
          style={styles.templateLink}
        >
          <CustomText style={styles.templateText}>
            Download Excel template
          </CustomText>
        </TouchableOpacity>
        {errors.length > 0 && (
          <View style={styles.errorBox}>
            <CustomText style={styles.errorTitle}>
              Please fix the following:
            </CustomText>
            {errors.map((error, index) => (
              <CustomText key={`${error}-${index}`} style={styles.errorText}>
                • {error}
              </CustomText>
            ))}
          </View>
        )}
        <CustomBtn
          title="Send Invitations"
          onPress={send}
          isLoading={submitting}
          containerStyle={styles.button}
        />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: { padding: 18 },
  dropdown: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E2F3",
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
  },
  placeholder: { color: "#8C97A8" },
  selectedText: { color: "#2F3A4A", fontSize: 15 },
  label: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 8,
  },
  filePicker: {
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2E67BE",
    borderStyle: "dashed",
    backgroundColor: "#F8FBFF",
  },
  fileText: { color: "#2E67BE", fontWeight: "600" },
  help: { color: "#64748B", fontSize: 13, lineHeight: 20, marginTop: 14 },
  templateLink: { alignSelf: "flex-start", paddingVertical: 14 },
  templateText: { color: "#2E67BE", fontWeight: "700", fontSize: 14 },
  errorBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorTitle: { color: "#B91C1C", fontWeight: "700", marginBottom: 6 },
  errorText: { color: "#B91C1C", lineHeight: 19 },
  button: { marginTop: 26 },
});

export default BulkSendInvitation;
