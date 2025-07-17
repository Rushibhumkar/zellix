import { FlatList, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import CustomText from '../../myComponents/CustomText/CustomText'
import CustomCheckBox from '../../myComponentsHRM/CutomCheckBox/CustomCheckBox'
import CustomInput from '../../myComponents/CustomInput/CustomInput'
import { dummySendToUpdateFields } from '../../utils/dummyData'
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useFormik } from 'formik'
import { myConsole } from '../../hooks/useConsole'
import { sendToUpdate } from '../../services/hrmApi/userHrmApi'
import { routeUser } from '../../utils/routesHRM'

const SendToUpdate = () => {
    const { navigate } = useNavigation();
    const { params } = useRoute()
    console.log('params?.item?._id', params?.item?._id)
    const [isLoading, setLoading] = useState(false);
    const {
        values,
        setFieldValue,
        handleBlur,
        handleChange,
        handleSubmit
    } = useFormik({
        initialValues: {
            remark: '',
            isEditable: []
        },
        // validationSchema: ,
        onSubmit: async (values) => {
            myConsole('SendToUpdate', values)
            try {
                setLoading(true);
                const resSendToUpdate = await sendToUpdate({
                    id: params?.item?._id,
                    data: values
                })
                myConsole('resSendToUpdate', resSendToUpdate)
                navigate(routeUser.AllUSersHRM)
            } catch (err) {
                console.log('errSendToUpdate', err)
            }
            finally {
                setLoading(false)
            }
        }
    })
    const onSelectFields = (status, fieldName) => {
        let temp = [...values?.isEditable]
        if (status) {
            temp.push(fieldName)
        } else {
            temp.splice(temp.indexOf(fieldName), 1)
        }
        setFieldValue('isEditable', temp)
    }
    return (
        <ContainerHRM
            ph={20}
            pt={20}
            isBAck={{
                title: 'Update Application'
            }}
        >
            <CustomInput
                label='Remark'
                inputStyle={{ minHeight: 120 }}
                props={{
                    multiline: true,
                    textAlignVertical: 'top'
                }}
                marginBottom={20}
                value={values.remark}
                onChangeText={handleChange('remark')}
                onBlur={handleBlur('remark')}
            />
            <CustomText
                fontSize={16}
                fontWeight='600'
                marginBottom={20}
                style={{
                    fontStyle: 'italic'
                }}
            >Enable Fields which need to be Edited
            </CustomText>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={dummySendToUpdateFields}
                renderItem={({ item }) => {
                    return (
                        <CustomCheckBox
                            title={item.title}
                            isCheck={item?.initial}
                            onPress={(v) => onSelectFields(v, item?.value)}
                            marginBottom={20}
                        />
                    )
                }
                }
            />
            <CustomBtn
                title='Submit'
                containerStyle={{
                    marginBottom: Platform.OS === 'ios' ? 20 : 50
                }}
                onPress={handleSubmit}
                isLoading={isLoading}
            />
        </ContainerHRM>
    )
}

export default SendToUpdate

const styles = StyleSheet.create({})