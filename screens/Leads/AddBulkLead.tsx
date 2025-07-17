import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { excelPicker } from '../../utils/excelPicker';
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn';
import { myConsole } from '../../hooks/useConsole';
import { status } from '../../utils/data';
import { addLead } from '../../services/rootApi/leadApi';
import { getAllLeadFunc } from '../../redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { routeLead } from '../../utils/routes';
import DropdownRNE from '../../myComponents/DropdownRNE/DropdownRNE';
import { selectUser } from '../../redux/userSlice';
import { useFormik } from 'formik';
import FileIcon from '../../assets/svg/FileIcon';
import { addLeadInBulk } from '../../utils/validation';
import { queryKeyCRM } from '../../utils/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { popUpConfToast } from '../../utils/toastModalByFunction';

const leadType = [
    { value: "lead", label: "Lead" },
    { value: "calling_data", label: "Calling Data" },
];

const AddBulkLead = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const { navigate } = useNavigation();
    const { user } = useSelector(selectUser)

    const [bulkLead, setBulkLead] = useState([])
    const [isLoading, setLoading] = useState(false)

    const {
        values,
        errors,
        setFieldValue,
        handleSubmit,
        handleBlur,
        touched
    } = useFormik({
        validationSchema: addLeadInBulk,
        initialValues: {
            srManager: '',
        },
        onSubmit: async (value) => {
            setLoading(true)
            try {
                let sendData = {
                    data: bulkLead,
                    srManager: value?.srManager,
                    assign: value?.srManager,
                }
                let addLeadRes = await addLead(sendData);
                // await dispatch(getAllLeadFunc());
                queryClient.invalidateQueries({
                    queryKey: [queryKeyCRM.getLead]
                });
                popUpConfToast.successMessage('Lead Add Successfully');
                queryClient.invalidateQueries({
                    queryKey: [queryKeyCRM.getDashboardCount]
                });
                navigate(routeLead.allLead);
            }
            catch (err) {
                myConsole('error', err)
                popUpConfToast.errorMessage(err?.response?.data || err)
            }
            finally { setLoading(false) }
        }
    })

    //excel
    const handlePicker = async () => {
        let a = await excelPicker();
        if (a.length > 0) {
            const temp = await a?.map((el) => {
                return {
                    ...el,
                    comments: el?.Comments,
                    type: leadType?.filter((type) => type?.label === el?.Type)?.[0]?.value,
                    status: status?.filter((st) => st?.label === el?.Status)?.[0]?.value,
                    whatsapp: ` https://wa.me/${el.clientMobile.replace("-", "")}`,
                }
            })
            setBulkLead(temp)
        }
    }

    const validateFileSelection = () => {
        return bulkLead?.length > 0 || "Please choose a file"
    }

    const validateAll = async () => {
        await validateForm();
        setFieldValue('fileSelectionError', validateFileSelection());
    };


    return (
        <View>
            <View
                style={{ marginBottom: 15 }}
            >
                <Text
                    style={{
                        color: "#000000",
                        marginBottom: 10,
                        fontSize: 16,
                        fontWeight: "500",
                    }}
                >
                    {'Choose a File'}
                </Text>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={{
                        height: 37.5,
                        borderColor: "#000000",
                        backgroundColor: "#FCFAFA",
                        borderWidth: 0.5,
                        borderRadius: 10,
                        padding: 10,
                        width: "100%",
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingEnd: 20,
                    }}
                    onPress={handlePicker}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '400',
                        }}
                    >{bulkLead?.length > 0 ? 'You have choose file' : 'Choose a file'}
                    </Text>
                    <FileIcon />
                </TouchableOpacity>

            </View>

            {user?.isAdmin && <DropdownRNE
                keyValueShowInBox="name"
                keyValueGetOnSelect="_id"
                label={'Assign To'}
                keyName="sr_Manager"
                containerStyle={{ marginBottom: 15 }}
                placeholder="Sr Manager"
                onChange={(a) => setFieldValue('srManager', a)}
                onBlur={handleBlur("srManager")}
                initialValue={values?.srManager}
            />}
            {errors.srManager && touched.srManager && <Text style={{ color: "red", marginTop: -10 }}>{errors.srManager}</Text>}

            <CustomBtn
                title="Submit"
                containerStyle={{ margin: 20 }}
                onPress={handleSubmit}
                isLoading={isLoading}
            />
        </View>
    )
}

export default AddBulkLead