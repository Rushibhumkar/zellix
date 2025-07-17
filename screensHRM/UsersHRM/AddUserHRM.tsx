import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import CustomText from '../../myComponents/CustomText/CustomText'
import CustomInput from '../../myComponents/CustomInput/CustomInput'
import MobileInput from '../../myComponents/MobileInput/MobileInput'
import DropdownRNE from '../../myComponents/DropdownRNE/DropdownRNE'
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn'
import { useFormik } from 'formik';
import * as Yup from "yup";
import { useGetAvailableRoles, useGetSrManagers, useGetTeamsBySrManager } from '../../hooks/useGetQuerryHRM'
import { myConsole } from '../../hooks/useConsole'
import { addUserHRM, updateUserHRM } from '../../services/hrmApi/userHrmApi'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useQueryClient } from '@tanstack/react-query'
import DatePickerExpo from '../../myComponents/DatePickerExpo/DatePickerExpo'
import { popUpConfToast } from '../../utils/toastModalByFunction'
import PleaseWait from '../../myComponentsHRM/PleaseWait/PleaseWait'
import { queryKeyHRM } from '../../utils/queryKeys'
import parsePhoneNumber from 'libphonenumber-js'
import ScrollViewWithKeyboardAvoid from '../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid'


const AddUserHRM = () => {
    const queryClient = useQueryClient();
    const { goBack } = useNavigation();
    const { params } = useRoute();
    const update = params?.item;
    const [isLoading, setIsLoading] = useState(false);
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
            name: update?.name ?? '',
            lastName: update?.lastName ?? '',
            email: update?.email ?? '',
            mobile: update?.mobile ?? '',
            empCode: update?.empCode ?? '',
            salary: update?.salary ?? '',
            dateOfJoining: update?.dateOfJoining ?? '',
            activeStatus: update?.activeStatus ?? 'onboard',
            // team: update?.team ?? '',
            // teamName: update?.teamName ?? '',
            // srManager: update?.srManager ?? '',
            // role: update?.role ?? ''
        },
        validationSchema: validationSchema,
        onSubmit: async (value) => {
            myConsole('value', value)
            try {
                // setIsLoading(true)
                popUpConfToast.plzWait({
                    bodyComponent: () => <PleaseWait />
                })
                let res;
                if (!update?._id) {
                    res = await addUserHRM({
                        data: { ...value, addedFrom: 'hrms' }
                    })
                    // popUpConfToast.successMessage(res?.message ?? '---')
                } else {
                    let formData = new FormData();
                    formData.append('data', JSON.stringify(value));
                    res = await updateUserHRM({
                        id: update?._id,
                        data: formData
                    })
                    myConsole('updateUSerHRM', res)
                    queryClient.invalidateQueries({
                        queryKey: [queryKeyHRM?.userDetailHRM, update?._id]
                    })
                    // popUpConfToast.successMessage(res?.message ?? '---')
                }
                queryClient.invalidateQueries({
                    queryKey: [queryKeyHRM?.getAllUserHRM]
                })
                goBack();
            }
            catch (err) {
                // myConsole('errUserAdded', err?.message)
                // popUpConfToast.errorMessage(err?.message ?? '---')

            }
        }
    })
    const { data: srManagerList } = useGetSrManagers()
    const { data: teamBySrMn } = useGetTeamsBySrManager({ id: values?.srManager })
    const { data: roleList } = useGetAvailableRoles({ id: values?.team })

    return (
        <ContainerHRM
            isBAck={{
                title: 'Add User',
                isGoBack: () => console.log('first')
            }}
        >
            <ScrollViewWithKeyboardAvoid >
                <View style={{ paddingBottom: 100, }}>
                    <View
                        style={{ paddingHorizontal: 20, paddingTop: 20 }}
                    >
                        <CustomInput
                            label='First Name'
                            marginBottom={15}
                            value={values.name}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            errors={(touched.name && errors.name) ? errors.name : ''}
                        />
                        <CustomInput
                            label='Last Name'
                            marginBottom={15}
                            value={values.lastName}
                            onChangeText={handleChange('lastName')}
                            onBlur={() => handleBlur('lastName')}
                        />
                        <CustomText
                            fontSize={16}
                            fontWeight='500'
                        >
                            Mobile Number
                        </CustomText>
                        <MobileInput
                            onChange={(v) => setFieldValue(
                                'mobile',
                                `${v?.countryCode}${v?.number}`)
                            }
                            value={values?.mobile}
                            error={(touched.mobile && errors.mobile) ? errors.mobile : ''}
                            isCountryPicker={true}
                            onBlur={handleBlur('mobile')}
                        />
                        <CustomInput
                            label='Email Address'
                            marginBottom={15}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            errors={(touched.email && errors.email) ? errors.email : ''}
                        />
                        <CustomInput
                            label='Salary'
                            marginBottom={15}
                            onChangeText={handleChange('salary')}
                            onBlur={handleBlur('salary')}
                            value={values.salary}
                        />
                        <CustomInput
                            label='Employee code'
                            marginBottom={15}
                            onChangeText={handleChange('empCode')}
                            onBlur={handleBlur('empCode')}
                            value={values.empCode}
                        />
                        <DatePickerExpo
                            title='Date Of Joining'
                            boxContainerStyle={{ marginBottom: 15 }}
                            onSelect={(v) => setFieldValue('dateOfJoining', v)}
                            initialValue={values?.dateOfJoining}
                        />
                        <DropdownRNE
                            label='Active Status'
                            arrOfObj={[
                                { _id: 'onboard', name: 'Onboard' },
                                { _id: 'resign', name: 'Resigned' },
                                { _id: 'terminated', name: 'Terminated' },
                            ]}
                            mode='modal'
                            isSearch
                            onChange={(v) => setFieldValue('activeStatus', v)}
                            initialValue={values?.activeStatus}
                            containerStyle={{ marginBottom: 15 }}
                        />
                        {!update?.name &&
                            <>
                                <DropdownRNE
                                    label='Select Sr. Manager'
                                    containerStyle={{
                                        marginBottom: 15
                                    }}
                                    arrOfObj={srManagerList?.data ?? []}
                                    onChange={(id) => setFieldValue('srManager', id)}
                                    mode='modal'
                                    isSearch
                                />
                                <DropdownRNE
                                    label='Select Team'
                                    containerStyle={{
                                        marginBottom: 15
                                    }}
                                    arrOfObj={teamBySrMn ?? []}
                                    onChange={(id) => {
                                        setFieldValue('teamName', '')
                                        return setFieldValue('team', id)
                                    }}
                                    mode='modal'
                                    isSearch
                                />
                                {/* jb select team new ho */}
                                {values?.team === 'new' && <CustomInput
                                    label='Team Name'
                                    onChangeText={handleChange('teamName')}
                                    onBlur={handleBlur('teamName')}
                                    value={values?.teamName}
                                    marginBottom={15}
                                />}
                                <DropdownRNE
                                    label='Select Role'
                                    containerStyle={{
                                        marginBottom: 25
                                    }}
                                    arrOfObj={roleList ?? []}
                                    onChange={(id) => setFieldValue('role', id)}
                                    mode='modal'
                                    isSearch
                                />
                            </>
                        }
                    </View>
                    <CustomBtn
                        title={!!update?.name ? 'Update' : 'Send For Completion '}
                        containerStyle={{ margin: 20 }}
                        onPress={handleSubmit}
                        isLoading={isLoading}
                    />
                </View>

            </ScrollViewWithKeyboardAvoid>
        </ContainerHRM>
    )
}

export default AddUserHRM

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('First name is required'),
    email: Yup.string()
        .required('First name is required')
        .email("Invalid Email Address"),
    mobile: Yup.string()
        .required('Phone number is required')
        .test('phone-number', 'Invalid phone number', (value) => {
            console.log('valueValidate', value)
            if (value.length < 5) {
                return false
            } else try {
                const phoneNumber = parsePhoneNumber(value)
                return phoneNumber.isValid();
            } catch (error) {
                console.error('Error validating phone number:', error.message);
                return false;
            }
        }),
});

