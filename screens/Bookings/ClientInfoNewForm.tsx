import { Button, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";
import { useFormik } from "formik";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import * as Yup from 'yup';
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomText from "../../myComponents/CustomText/CustomText";
import DeleteIcon from "../../assets/svg/DeleteIcon";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { myConsole } from "../../hooks/useConsole";
import ExpoImagePicker from "../../myComponents/ExpoImagePicker/ExpoImagePicker";
import { uploadFile } from "../../utils/uploadFile";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomCheckBox from "../../myComponentsHRM/CutomCheckBox/CustomCheckBox";
import { useNavigation } from "@react-navigation/native";
import { color } from "../../const/color";
import { inputStatusOptions } from "../../utils/data";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { routeBooking } from "../../utils/routes";
import AddIcon from "../../assets/svgHRM/AddIcon";

//
const defaultClient1 = {
    clientName: '',
    clientEmail: '',
    clientMobile: '',
    passport: '',
    passport2: '',
    emiratesID: '',
    emiratesID2: '',
    visa: '',
    visa2: '',
    passportNumber: '',
    dateOfBirth: new Date(),
    address: '',
    primary: false,
};
const defaultClient2 = {
    clientName: '',
    clientEmail: '',
    clientMobile: '',
    passport: '',
    passport2: '',
    emiratesID: '',
    emiratesID2: '',
    visa: '',
    visa2: '',
    passportNumber: '',
    dateOfBirth: new Date(),
    address: '',
    primary: false,
};
const defaultClient3 = {
    clientName: '',
    clientEmail: '',
    clientMobile: '',
    passport: '',
    passport2: '',
    emiratesID: '',
    emiratesID2: '',
    visa: '',
    visa2: '',
    passportNumber: '',
    dateOfBirth: new Date(),
    address: '',
    primary: false,
};
//


const initialByOwnership = {
    single: [{ ...defaultClient1 }],
    joined: [{ ...defaultClient1 }, { ...defaultClient2 }],
    grouped: [{ ...defaultClient1 }, { ...defaultClient2 }, { ...defaultClient3 }],
};


//component
const ClientInfoNewForm = ({
    params
}: any) => {

    const { user } = useSelector(selectUser);
    const nav = useNavigation();
    const formik = useFormik({
        initialValues: {
            clients: params?.initialValues?.ownerShipDetails?.length > 0 ? params?.initialValues?.ownerShipDetails : [defaultClient1],
            ownership: params?.initialValues?.ownership ?? 'single',
            paymentProofArr: params?.initialValues?.paymentProofArr || [],
            otherDocs: params?.initialValues?.otherDocs || [],
            bookingForm: params?.initialValues?.bookingForm || '',
            inputStatus: params?.initialValues?.inputStatus,
            remarks: params?.initialValues?.remarks || '',
        },
        validationSchema,
        onSubmit: (values) => {
            // const passData = { ...params, ...values }
            const passData = {
                clients: values.clients,
                ownership: values.ownership,
                paymentProofArr: values?.paymentProofArr?.filter(el => el),
                otherDocs: values?.otherDocs?.filter(el => el),
                bookingForm: values?.bookingForm,
                inputStatus: values?.inputStatus || '',
                remarks: values?.remarks || '',
                ...params
            }
            myConsole('passData', passData)
            nav.navigate(routeBooking?.Agents, { data: passData })
        },
    });

    const addClient = () => {
        formik.setFieldValue('clients', [...formik.values.clients, { ...defaultClient1 }]);
    };

    const removeClient = (index) => {
        const updatedClients = [...formik.values.clients];
        updatedClients.splice(index, 1);
        formik.setFieldValue('clients', updatedClients);
    };
    console.log('formikerror', formik.errors)
    const handleCategoryChange = (selected) => {
        formik.setFieldValue("ownership", selected);
        //set initial clients based on ownership
        formik.setFieldValue("clients", initialByOwnership[selected]);
    };

    const addFieldPayOther = (keyName: 'paymentProofArr' | 'otherDocs') => {
        formik.setFieldValue(keyName, [...formik?.values?.[keyName], null]);
    }

    const deleteFieldPayOther = (keyName: 'paymentProofArr' | 'otherDocs', indexToRemove: number) => {
        const updatedArray = formik.values[keyName].filter((_, index) => index !== indexToRemove);
        formik.setFieldValue(keyName, updatedArray);
    }

    myConsole('bookingForm', formik.values.otherDocs)

    return (
        <View>
            <>
                <DropdownRNE
                    label="Ownership"
                    containerStyle={{ marginBottom: 15 }}
                    arrOfObj={[
                        { name: "Single", _id: 'single' },
                        { name: "Joined", _id: 'joined' },
                        { name: "Grouped", _id: 'grouped' },
                    ]}
                    keyValueGetOnSelect="_id"
                    keyValueShowInBox="name"
                    onChange={handleCategoryChange}
                    placeholder="category"
                    onBlur={formik.handleBlur("ownership")}
                    initialValue={formik.values.ownership}
                />
                <View style={{
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 20,
                    borderColor: color.grayBtn,
                }}>
                    {formik?.values?.clients?.map((client, index) => (
                        <View key={index}>
                            <MainTitle
                                title={`Client Information ${index + 1}`}
                                containerStyle={{ marginBottom: 20 }}
                            />

                            {/* Primary */}
                            <View style={{ marginBottom: 15 }}>
                                <CustomCheckBox
                                    isCheck={client.primary}
                                    title="Primary"
                                    onPress={(v) => {
                                        formik.setFieldValue(`clients[${index}].primary`, v)
                                    }}
                                />
                            </View>

                            {/* Client Name */}
                            <View style={{ marginBottom: 15 }}>
                                <CustomInput
                                    label="Client Name"
                                    value={client.clientName}
                                    onChangeText={formik.handleChange(`clients[${index}].clientName`)}
                                    onBlur={formik.handleBlur(`clients[${index}].clientName`)}
                                />
                                {formik.errors.clients?.[index]?.clientName && formik.touched.clients?.[index]?.clientName && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].clientName}</Text>
                                )}
                            </View>

                            {/* Email */}
                            <View style={{ marginBottom: 15 }}>
                                <CustomInput
                                    label="Client Email"
                                    value={client.clientEmail}
                                    onChangeText={formik.handleChange(`clients[${index}].clientEmail`)}
                                    onBlur={formik.handleBlur(`clients[${index}].clientEmail`)}
                                />
                                {formik.errors.clients?.[index]?.clientEmail && formik.touched.clients?.[index]?.clientEmail && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].clientEmail}</Text>
                                )}
                            </View>

                            {/* Mobile */}
                            <View style={{ marginBottom: 15 }}>
                                <CustomInput
                                    label="Mobile"
                                    value={client.clientMobile}
                                    onChangeText={formik.handleChange(`clients[${index}].clientMobile`)}
                                    onBlur={formik.handleBlur(`clients[${index}].clientMobile`)}
                                    props={{
                                        keyboardType: 'phone-pad'
                                    }}
                                />
                                {formik.errors.clients?.[index]?.clientMobile && formik.touched.clients?.[index]?.clientMobile && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].clientMobile}</Text>
                                )}
                            </View>

                            {/* Passport Number */}
                            <View style={{ marginBottom: 15 }}>
                                <CustomInput
                                    label="Passport Number"
                                    value={client.passportNumber}
                                    onChangeText={formik.handleChange(`clients[${index}].passportNumber`)}
                                    onBlur={formik.handleBlur(`clients[${index}].passportNumber`)}
                                />
                                {formik.errors.clients?.[index]?.passportNumber && formik.touched.clients?.[index]?.passportNumber && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].passportNumber}</Text>
                                )}
                            </View>

                            {/* Date of Birth */}
                            <View style={{ marginBottom: 15 }}>
                                <DatePickerExpo
                                    title="Date Of Birth"
                                    boxContainerStyle={{ marginBottom: 15 }}
                                    maximumDate={new Date()}
                                    initialValue={client.dateOfBirth}
                                    onSelect={(v) => {
                                        console.log('Selected date:', v);
                                        formik.setFieldValue(`clients[${index}].dateOfBirth`, v)
                                    }}
                                />
                                {formik.errors.clients?.[index]?.dateOfBirth && formik.touched.clients?.[index]?.dateOfBirth && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].dateOfBirth}</Text>
                                )}
                            </View>

                            {/* Address */}
                            <View style={{ marginBottom: 15 }}>
                                <CustomInput
                                    label="Address"
                                    value={client.address}
                                    onChangeText={formik.handleChange(`clients[${index}].address`)}
                                    onBlur={formik.handleBlur(`clients[${index}].address`)}
                                />
                                {formik.errors.clients?.[index]?.address && formik.touched.clients?.[index]?.address && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].address}</Text>
                                )}
                            </View>

                            {/* Passport */}
                            <View style={{ marginBottom: 15 }}>
                                <ExpoImagePicker
                                    label="Passport 1"
                                    onSelect={async (a) => {
                                        await uploadFile({
                                            file: a?.assets,
                                            getUrl: (v) => {
                                                formik.setFieldValue(`clients[${index}].passport`, v?.[0])
                                            },
                                            onLoading: (v) => {
                                                myConsole('onLoading', v)
                                            },
                                        })
                                    }}
                                    onBlur={formik.handleBlur(`clients[${index}].passport`)}
                                />
                                {formik.errors.clients?.[index]?.passport && formik.touched.clients?.[index]?.passport && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].passport}</Text>
                                )}
                            </View>

                            {/* Passport 2 */}
                            <View style={{ marginBottom: 15 }}>
                                <ExpoImagePicker
                                    label="Passport 2"
                                    onSelect={async (a) => {
                                        await uploadFile({
                                            file: a?.assets,
                                            getUrl: (v) => {
                                                formik.setFieldValue(`clients[${index}].passport2`, v?.[0])
                                            },
                                            onLoading: (v) => {
                                                myConsole('onLoading', v)
                                            },
                                        })
                                    }}
                                    onBlur={formik.handleBlur(`clients[${index}].passport2`)}
                                />
                                {formik.errors.clients?.[index]?.passport2 && formik.touched.clients?.[index]?.passport2 && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].passport2}</Text>
                                )}
                            </View>

                            {/* Emirates ID */}
                            <View style={{ marginBottom: 15 }}>
                                <ExpoImagePicker
                                    label="Emirates ID"
                                    onSelect={async (a) => {
                                        await uploadFile({
                                            file: a?.assets,
                                            getUrl: (v) => {
                                                formik.setFieldValue(`clients[${index}].emiratesID`, v?.[0])
                                            },
                                            onLoading: (v) => {
                                                myConsole('onLoading', v)
                                            },
                                        })
                                    }}
                                    onBlur={formik.handleBlur(`clients[${index}].emiratesID`)}
                                />
                                {formik.errors.clients?.[index]?.emiratesID && formik.touched.clients?.[index]?.emiratesID && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].emiratesID}</Text>
                                )}
                            </View>

                            {/* Emirates ID 2 */}
                            <View style={{ marginBottom: 15 }}>
                                <ExpoImagePicker
                                    label="Emirates ID 2"
                                    onSelect={async (a) => {
                                        await uploadFile({
                                            file: a?.assets,
                                            getUrl: (v) => {
                                                formik.setFieldValue(`clients[${index}].emiratesID2`, v?.[0])
                                            },
                                            onLoading: (v) => {
                                                myConsole('onLoading', v)
                                            },
                                        })
                                    }}
                                    onBlur={formik.handleBlur(`clients[${index}].emiratesID`)}
                                />
                                {formik.errors.clients?.[index]?.emiratesID2 && formik.touched.clients?.[index]?.emiratesID2 && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].emiratesID2}</Text>
                                )}
                            </View>

                            {/* Visa */}
                            <View style={{ marginBottom: 15 }}>
                                <ExpoImagePicker
                                    label="Visa"
                                    onSelect={async (a) => {
                                        await uploadFile({
                                            file: a?.assets,
                                            getUrl: (v) => {
                                                formik.setFieldValue(`clients[${index}].visa`, v?.[0])
                                            },
                                            onLoading: (v) => {
                                                myConsole('onLoading', v)
                                            },
                                        })
                                    }}
                                    onBlur={formik.handleBlur(`clients[${index}].visa`)}
                                />
                                {formik.errors.clients?.[index]?.visa && formik.touched.clients?.[index]?.visa && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].visa}</Text>
                                )}
                            </View>

                            {/* Visa 2 */}
                            <View style={{ marginBottom: 15 }}>
                                <ExpoImagePicker
                                    label="Visa 2"
                                    onSelect={async (a) => {
                                        await uploadFile({
                                            file: a?.assets,
                                            getUrl: (v) => {
                                                formik.setFieldValue(`clients[${index}].visa2`, v?.[0])
                                            },
                                            onLoading: (v) => {
                                                myConsole('onLoading', v)
                                            },
                                        })
                                    }}
                                    onBlur={formik.handleBlur(`clients[${index}].visa2`)}
                                />
                                {formik.errors.clients?.[index]?.visa2 && formik.touched.clients?.[index]?.visa2 && (
                                    <Text style={styles.errorText}>{formik.errors.clients[index].visa2}</Text>
                                )}
                            </View>





                            {/* Remove Client Button */}
                            {formik.values.clients.length > 1 && (
                                <TouchableOpacity
                                    style={{
                                        padding: 3,
                                        width: 40,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'flex-end',
                                        margin: 10,
                                    }}
                                    onPress={() => removeClient(index)}
                                >
                                    <DeleteIcon width={25} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>


                {formik.values?.ownership === 'grouped' && <CustomBtn
                    title="Add More" onPress={addClient}
                    containerStyle={{
                        width: 200,
                        alignSelf: 'center',
                        marginBottom: 25
                    }}
                    textStyle={{
                        fontSize: 14
                    }}
                />}
            </>
            <View style={{ marginBottom: 10 }}>
                <MainTitle
                    title="Payment Proof"
                    containerStyle={{ marginBottom: 20 }}
                    icon={<CustomBtn
                        title="Add Fields"
                        onPress={() => addFieldPayOther('paymentProofArr')}
                        textStyle={{ fontSize: 13 }}
                    />}
                />
                {formik?.values?.paymentProofArr?.length > 0 &&
                    formik?.values?.paymentProofArr?.map((el, i) => {
                        return <View style={{
                            marginBottom: 15,
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between'
                        }} key={i}>
                            <ExpoImagePicker
                                label={`Payment Proof ${i + 1}`}
                                onSelect={async (a) => {
                                    await uploadFile({
                                        file: a?.assets,
                                        getUrl: (v) => {
                                            formik.setFieldValue(`paymentProofArr[${i}]`, v?.[0])
                                        },
                                        onLoading: (v) => {
                                            myConsole('onLoading', v)
                                        },
                                    })
                                }}
                                boxContainerStyle={{ width: 270 }}
                            // onBlur={formik.handleBlur(`clients[${index}].passport`)}
                            />
                            <DeleteIcon
                                onPress={() => deleteFieldPayOther('paymentProofArr', i)}
                            />
                        </View>
                    })}
            </View>

            <View style={{ marginBottom: 10 }}>
                <MainTitle
                    title="Other Docs"
                    containerStyle={{ marginBottom: 20 }}
                    icon={<CustomBtn
                        title="Add Fields"
                        onPress={() => addFieldPayOther('otherDocs')}
                        textStyle={{ fontSize: 13 }}
                    />}
                />
                {formik?.values?.otherDocs?.length > 0 &&
                    formik?.values?.otherDocs?.map((el, i) => {
                        return <View style={{
                            marginBottom: 15,
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between'
                        }} key={i}>
                            <ExpoImagePicker
                                label={`Other Docs ${i + 1}`}
                                onSelect={async (a) => {
                                    await uploadFile({
                                        file: a?.assets,
                                        getUrl: (v) => {
                                            formik.setFieldValue(`otherDocs[${i}]`, v?.[0])
                                        },
                                        onLoading: (v) => {
                                            myConsole('onLoading', v)
                                        },
                                    })
                                }}
                                boxContainerStyle={{ width: 270 }}
                            // onBlur={formik.handleBlur(`clients[${index}].passport`)}
                            />
                            <DeleteIcon
                                onPress={() => deleteFieldPayOther('otherDocs', i)}
                            />
                        </View>
                    })}

                <View style={{ marginBottom: 15 }}>
                    <ExpoImagePicker
                        label="Booking Form"
                        onSelect={async (a) => {
                            await uploadFile({
                                file: a?.assets,
                                getUrl: (v) => {
                                    formik.setFieldValue(`bookingForm`, v?.[0])
                                },
                                onLoading: (v) => {
                                    myConsole('onLoading', v)
                                },
                            })
                        }}
                        onBlur={formik.handleBlur(`bookingForm`)}
                    />

                </View>
            </View>
            {/* entry status */}
            <MainTitle
                title="Entry Status"
                containerStyle={{ marginBottom: 20 }}
            />
            <DropdownRNE
                label="Status"
                containerStyle={{ marginBottom: 5 }}
                arrOfObj={inputStatusOptions}
                keyValueGetOnSelect="_id"
                keyValueShowInBox="name"
                onChange={(v) => {
                    formik.setFieldValue('inputStatus', v)
                }}
                initialValue={formik?.values?.inputStatus}
                mode="modal"
            />

            {(user?.role === "sup_admin" || user?.role === "sr_manager" || user?.role === "sub_admin") && (
                <CustomInput
                    label="Remarks"
                    containerStyle={{ marginBottom: 10, marginTop: 10 }}
                    value={formik.values.remarks}
                    onChangeText={(v) => formik.setFieldValue('remarks', v)}
                    placeholder="Remarks"
                />
            )}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginVertical: 20,
                }}
            >
                <CustomBtn
                    title="Previous"
                    onPress={nav.goBack}
                    containerStyle={{
                        width: "45%",
                        backgroundColor: color.grayBtn,
                    }}
                />
                <CustomBtn
                    title="Next"
                    containerStyle={{ width: "45%" }}
                    onPress={formik.handleSubmit}
                //  disabled={isValidateFile}
                />
            </View>
        </View>
    );
};

export default ClientInfoNewForm;

const styles = StyleSheet.create({
    errorText: {
        color: "red",
    },
});


// Yup schema for validation
const clientSchema = Yup.object().shape({
    clientName: Yup.string().required('Required'),
    clientEmail: Yup.string().email('Invalid email').required('Required'),
    clientMobile: Yup.string().required('Required'),
    // passport: Yup.string().required('Required'),
    // passport2: Yup.string().required('Required'),
    // emiratesID: Yup.string().required('Required'),
    // emiratesID2: Yup.string().required('Required'),
    // visa: Yup.string().required('Required'),
    // visa2: Yup.string().required('Required'),
    passportNumber: Yup.string().required('Required'),
    dateOfBirth: Yup.string().required('Required'),
    address: Yup.string().required('Required'),
    // primary: Yup.boolean().required(),
});

const validationSchema = Yup.object().shape({
    clients: Yup.array().of(clientSchema),
});

