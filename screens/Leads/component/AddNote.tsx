import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ModalWithBlur from "../../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import useModal from "../../../hooks/useModal";
import CustomBtn from "../../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../../myComponents/CustomInput/CustomInput";
import { useFormik } from "formik";
import MainTitle from "../../../myComponents/MainTitle/MainTitle";
import { addLeadNote } from "../../../services/rootApi/leadApi";
import { color } from "../../../const/color";
import { axiosInstance } from "../../../services/authApi/axiosInstance";
import { myConsole } from "../../../hooks/useConsole";
import { useAppToast } from "../../../components/AppToast";

// /notes/:leadId/:notesId //update notes
// /notes/:leadId/:notesId  //delete notes

interface TAddNote {
  modal: { visible: boolean; openModal: any; closeModal: any };
  refetch: any;
  leadID: string;
  notesId?: string;
  remark?: string;
}

const AddNote = ({ modal, refetch, leadID, notesId, remark }: TAddNote) => {
  const toast = useAppToast();
  const formik = useFormik({
    initialValues: { note: "" },
    onSubmit: async (v) => {
      const loader = toast.loading(
        notesId ? "Updating note..." : "Adding note...",
      );

      try {
        let res;

        if (notesId) {
          res = await axiosInstance.put(`api/lead/notes/${leadID}/${notesId}`, {
            note: v.note,
          });

          myConsole("update_note_response", res);
          modal.closeModal();
        } else {
          res = await addLeadNote({
            id: leadID,
            note: v.note,
          });

          myConsole("add_note_response", res);
        }

        loader.success(
          notesId ? "Note updated successfully" : "Note added successfully",
        );

        refetch();
        formik.resetForm();
        modal.closeModal();
      } catch (err) {
        myConsole("note_error", err);

        loader.error(
          err?.response?.data?.message || err?.message || "Failed to save note",
        );
      }
    },
  });

  useEffect(() => {
    formik.setFieldValue("note", remark || "");
  }, [remark]);

  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (modal?.visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // wait for modal animation
    }
  }, [modal?.visible]);

  return (
    <ModalWithBlur visible={modal?.visible} onClose={modal?.closeModal}>
      <MainTitle
        title={remark ? "Update Note" : "Add Note"}
        containerStyle={{ marginBottom: 20 }}
      />

      <CustomInput
        ref={inputRef}
        multiline
        placeholder=" "
        value={formik.values.note}
        onChangeText={(v) => formik.setFieldValue("note", v)}
        containerStyle={{ marginBottom: 20 }}
        inputStyle={{ height: 100, textAlignVertical: "top" }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <CustomBtn
          title="Close"
          onPress={() => {
            formik.resetForm();
            modal.closeModal();
            Keyboard.dismiss();
          }}
          containerStyle={{
            width: 100,
            padding: 0,
          }}
          textStyle={{ fontSize: 15, padding: 5 }}
          gradientContStyle={{ paddingVertical: 8 }}
        />
        <CustomBtn
          title={notesId ? "Update Note" : "Add Note"}
          onPress={formik.handleSubmit}
          isLoading={formik.isSubmitting}
          containerStyle={{ width: 150, padding: 0 }}
          textStyle={{ fontSize: 15, padding: 5 }}
          disabled={!formik.values.note?.trim()}
          gradientContStyle={{ paddingVertical: 8 }}
        />
      </View>
    </ModalWithBlur>
  );
};

export default AddNote;

const styles = StyleSheet.create({});
