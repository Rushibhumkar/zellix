import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ModalWithBlur from '../../../myComponentsHRM/ModalWithBlur/ModalWithBlur'
import useModal from '../../../hooks/useModal'
import CustomBtn from '../../../myComponents/CustomBtn/CustomBtn'
import CustomInput from '../../../myComponents/CustomInput/CustomInput'
import { useFormik } from 'formik'
import MainTitle from '../../../myComponents/MainTitle/MainTitle'
import { addLeadNote } from '../../../services/rootApi/leadApi'
import { color } from '../../../const/color'
import { axiosInstance } from '../../../services/authApi/axiosInstance'
import { myConsole } from '../../../hooks/useConsole'

// /notes/:leadId/:notesId //update notes
// /notes/:leadId/:notesId  //delete notes

interface TAddNote {
    modal: { visible: boolean; openModal: any; closeModal: any };
    refetch: any;
    leadID: string;
    notesId?: string;
    remark?: string;
}

const AddNote = ({
    modal,
    refetch,
    leadID,
    notesId,
    remark
}: TAddNote) => {
    const formik = useFormik({
        initialValues: { note: remark || '', },
        onSubmit: async (v) => {
            try {
                if (!notesId) {
                    await addLeadNote({
                        id: leadID,
                        note: v.note
                    })
                } else {
                    await axiosInstance.put(`api/notes/${leadID}/${notesId}`, {
                        note: v.note
                    });
                }
                refetch();
                formik.resetForm();
                modal.closeModal();
            }
            catch (err) { }
        }
    });

    useEffect(() => {
        if (remark) {
            formik.setFieldValue('note', remark)
        }
    }, [remark])
    return (

        <ModalWithBlur
            visible={modal?.visible}
            onClose={modal?.closeModal}
        >
            <MainTitle title={remark ? 'Update Note' : 'Add Note'} containerStyle={{ marginBottom: 20 }} />

            <CustomInput
                placeholder=" "
                value={formik.values.note}
                onChangeText={(v) => formik.setFieldValue('note', v)}
                containerStyle={{ marginBottom: 20 }}
                props={{
                    multiline: true,
                }}
                inputStyle={{ height: 100, textAlignVertical: 'top' }}
            />
            <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
                <CustomBtn
                    title='Add Note'
                    onPress={formik.handleSubmit}
                    isLoading={formik.isSubmitting}
                    containerStyle={{ width: 150, padding: 0 }}
                    textStyle={{ fontSize: 15, padding: 5 }}
                    disabled={!leadID && !formik.values.note}
                />
                <CustomBtn
                    title='Close'
                    onPress={() => {
                        formik.resetForm();
                        modal.closeModal();
                    }}
                    containerStyle={{ width: 100, padding: 0, backgroundColor: color.dullRed }}
                    textStyle={{ fontSize: 15, padding: 5 }}

                />

            </View>
        </ModalWithBlur>
    )
}

export default AddNote

const styles = StyleSheet.create({})