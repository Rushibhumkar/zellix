import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import CustomInput from '../../myComponents/CustomInput/CustomInput'
import DropdownRNE from '../../myComponents/DropdownRNE/DropdownRNE'
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn'
import ExpoImagePicker from '../../myComponents/ExpoImagePicker/ExpoImagePicker'
import { myConsole } from '../../hooks/useConsole'
import { useFormik } from 'formik'
import DatePickerExpo from '../../myComponents/DatePickerExpo/DatePickerExpo'
import { useSelector } from 'react-redux'
import { selectUser } from '../../redux/userSlice'
import { roleHRM } from '../../utils/hrmKeysMatchToBE'
import mime from "mime";
import { addLeave } from '../../services/hrmApi/leaveHrmApi'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import { popUpConfToast } from '../../utils/toastModalByFunction'
import PleaseWait from '../../myComponentsHRM/PleaseWait/PleaseWait'
import moment from 'moment'
import CustomText from '../../myComponents/CustomText/CustomText'
import CustomCheckBox from '../../myComponentsHRM/CutomCheckBox/CustomCheckBox'
import ScrollViewWithKeyboardAvoid from '../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid'

const ios = Platform.OS === "ios" ? true : false;
const LeaveApplication = () => {
    const queryClient = useQueryClient()
    const { goBack } = useNavigation()
    const { user } = useSelector(selectUser);
    const [isLoading, setIsLoading] = useState(false)
    const {
        values,
        touched,
        errors,
        handleChange,
        handleBlur,
        setFieldValue,
        handleSubmit
    } = useFormik({
        initialValues: {
            reason: '',
            startDate: new Date(),
            endDate: new Date(),
            remarks: '',
            payType: 'paid',
            attachments: []
        },
        // validationSchema: 
        onSubmit: async (value) => {
            popUpConfToast.plzWait({
                bodyComponent: () => <PleaseWait />
            })
            try {
                setIsLoading(true)
                const { attachments, ...resData } = value;
                const formData = new FormData();
                formData.append('data', JSON.stringify(resData))
                attachments?.assets?.forEach((el) => {
                    formData.append('attachments', {
                        uri: ios ? el?.uri : el?.uri,
                        type: ios ? el?.type : mime.getType(el?.uri),
                        name: ios
                            ? el?.fileName
                            : el?.uri?.split("/").pop(),
                    })
                })
                let resAddLeave = await addLeave(formData)
                myConsole('resAddLeave', resAddLeave?.message)
                queryClient.invalidateQueries({
                    queryKey: ['getAllLeave']
                })
                goBack();
                popUpConfToast.successMessage(resAddLeave?.message)
            }
            catch (err) {
                console.log('errAddLeave', err)
                // popUpConfToast.errorMessage('[AxiosError: Request failed with status code 403]');
            }
            finally { setIsLoading(false) }
        },
    })

    return (
        <ContainerHRM
            isBAck={{
                title: 'Leave Application',
            }}
        >
            <ScrollViewWithKeyboardAvoid >
                <View style={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 100
                }}>
                    <CustomInput
                        label='First Name'
                        marginBottom={15}
                        value={user?.name}
                        props={{
                            editable: false,
                        }}
                    />
                    <CustomInput
                        label='Last Name'
                        marginBottom={15}
                        value={user?.lastName ?? 'N/A'}
                        props={{
                            editable: false,
                        }}
                    />
                    <CustomInput
                        label='Role'
                        marginBottom={15}
                        value={roleHRM[user?.role]}
                        props={{
                            editable: false,
                        }}
                    />
                    {/* forms yha se */}
                    <DatePickerExpo
                        title='Start Date'
                        boxContainerStyle={{ marginBottom: 15 }}
                        onSelect={(d) => setFieldValue('startDate', d)}
                        initialValue={values?.startDate}
                    />
                    <DatePickerExpo
                        title='End Date'
                        boxContainerStyle={{ marginBottom: 15 }}
                        // minimumDate={new Date()}
                        onSelect={(d) => setFieldValue('endDate', d)}
                        initialValue={values?.endDate}
                    // onSelect={(v) => console.log('sds', v)}
                    />
                    <CustomText
                        marginBottom={15}
                        fontSize={16}
                        fontWeight="500"
                    >
                        Pay Type
                    </CustomText>
                    <View
                        style={{ flexDirection: 'row', gap: 20, marginBottom: 15 }}
                    >
                        <CustomCheckBox
                            title='Paid'
                            onPress={(v) => v && setFieldValue('payType', 'paid')}
                            isCheck={values?.payType === 'paid'}
                        />
                        <CustomCheckBox
                            title='Un Paid'
                            onPress={(v) => v && setFieldValue('payType', 'unpaid')}
                            isCheck={values?.payType === 'unpaid'}
                        />
                    </View>
                    <CustomInput
                        label='Reason For Leave '
                        marginBottom={15}
                        props={{
                            multiline: true,
                            textAlignVertical: 'top',
                        }}
                        inputStyle={{ height: 120 }}
                        value={values.reason}
                        onChangeText={handleChange('reason')}
                        onBlur={handleBlur('reason')}
                    />
                    <ExpoImagePicker
                        label='Attach Supported Documents'
                        boxContainerStyle={{ marginBottom: 15 }}
                        onSelect={(v) => setFieldValue('attachments', v)}
                        isMultiplePick={true}
                    />
                    <CustomInput
                        label='Special Remark'
                        marginBottom={15}
                        props={{
                            multiline: true,
                            textAlignVertical: 'top',
                        }}
                        inputStyle={{ height: 120 }}
                        value={values.remarks}
                        onChangeText={handleChange('remarks')}
                        onBlur={handleBlur('remarks')}
                    />

                    <CustomBtn
                        title='Submit'
                        containerStyle={{
                            margin: 20,
                        }}
                        onPress={handleSubmit}
                        isLoading={isLoading}
                    />
                </View>

            </ScrollViewWithKeyboardAvoid>

        </ContainerHRM>
    )
}

export default LeaveApplication

const styles = StyleSheet.create({})