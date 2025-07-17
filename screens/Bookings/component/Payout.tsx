import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomBtn from '../../../myComponents/CustomBtn/CustomBtn'
import CustomModal from '../../../myComponents/CustomModal/CustomModal'
import DropdownRNE from '../../../myComponents/DropdownRNE/DropdownRNE'
import useModal from '../../../hooks/useModal'
import { useFormik } from 'formik'
import { axiosInstance } from '../../../services/authApi/axiosInstance'
import * as Yup from 'yup';
import { myConsole } from '../../../hooks/useConsole'
import { popUpConfToast } from '../../../utils/toastModalByFunction'
import { useQueryClient } from '@tanstack/react-query'

const Payout = ({ id }) => {
    const modal = useModal();
    const queryClient = useQueryClient();
    const formik = useFormik({
        validationSchema: validationSchema,
        initialValues: {
            paymentStatus: ''
        },
        onSubmit: async (v) => {
            try {
                let res = await axiosInstance.post(`/api/booking/updatePayment/${id}`, v)
                queryClient.invalidateQueries({
                    queryKey: ['getBookingById', id],
                })
                queryClient.invalidateQueries({
                    queryKey: ['getBooking'],
                })
                popUpConfToast.successMessage(res?.data || 'Successfully')
                modal.closeModal()
            } catch (error) {
                myConsole('errorBookingPayout', error)
            }
            finally {
                modal.closeModal()
            }
        }
    })
    return (
        <View>
            <CustomBtn
                title="Payout"
                onPress={modal.openModal}
                containerStyle={{
                    backgroundColor: 'gray',
                    width: 200,
                    alignSelf: 'center',
                    marginBottom: 70,
                    marginTop: 20
                }}
            />
            <CustomModal
                visible={modal.visible}
                hasBackdrop={true}
                onClose={modal.closeModal}
            >
                <View
                    style={{
                        width: 300,
                        backgroundColor: 'white',
                        borderRadius: 8,
                        padding: 20,
                    }}
                >
                    <DropdownRNE
                        label="Payment Update"
                        arrOfObj={[
                            { _id: 'pending', name: 'Pending' },
                            { _id: 'received', name: 'Received' },
                            { _id: 'not_received', name: 'Not Received' }
                        ]}
                        onChange={(v) => {
                            formik.setFieldValue('paymentStatus', v)
                        }}
                        error={formik.errors.paymentStatus}
                    />
                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 30, justifyContent: 'center' }}>
                        <CustomBtn
                            title="Save"
                            textStyle={{ fontSize: 14 }}
                            containerStyle={{ width: 100 }}
                            isLoading={formik.isSubmitting}
                            onPress={formik.handleSubmit}
                        />
                        <CustomBtn
                            title="Close"
                            textStyle={{ fontSize: 14 }}
                            containerStyle={{ width: 100, backgroundColor: 'red' }}
                            onPress={modal.closeModal}
                        />
                    </View>
                </View>
            </CustomModal>
        </View>
    )
}

export default Payout

const validationSchema = Yup.object().shape({
    paymentStatus: Yup.string()
        .required('paymentStatus is required'), // Add custom message
});