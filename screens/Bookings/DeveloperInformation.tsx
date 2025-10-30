import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import Header from "../../components/Header";
import { useGetMeetingById, useGetMeetingForBooking } from "../../hooks/useCRMgetQuerry";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import IllusionBox from "../../myComponents/IllusionBoxForUpdate/IllusionBox";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import { selectUser } from "../../redux/userSlice";
import { debounce } from "../../utils/debounce";
import { queryKeyCRM } from "../../utils/queryKeys";
import { routeBooking } from "../../utils/routes";
import { addBookingSchema } from "../../utils/validation";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import { myConsole } from "../../hooks/useConsole";

// function percent(total, amount) {
//   return (amount * 100) / total
// }
function percent(total, value) {
  if (typeof value !== "number" || typeof total !== "number" || total === 0) {
    throw new Error(
      "Invalid input. Both value and total must be non-zero numbers."
    );
  }

  return (value / total) * 100;
}

function initialValues(data) {

  return {
    developer: data?.developer?._id ?? "",
    relationshipManager: data?.relationshipManager ?? "",
    meeting: data?.meeting?._id ?? "",
    projectName: data?.projectName ?? "",
    unit: data?.unit ?? "",
    areaSQFT: data?.areaSQFT ?? "",
    total: data?.total ?? "",
    propertyDetails: data?.propertyDetails ?? "",
    paymentPlan: data?.paymentPlan ?? "",
    paymentMode: data?.paymentMode ?? "",
    token: data?.token ?? "",
    bookingAmount: data?.bookingAmount ?? "",
    // passback: data?.passback ?? "",
    // passbackPerc: data?.passback ? percent(data?.total, data?.passback) : "",
    commission: data?.commission ?? "",
    commissionPerc: data?.commissionPerc ?? '',
    clientLoyalty: data?.clientLoyalty ?? "",
    clientLoyaltyPerc: data?.clientLoyaltyPerc ?? "",
    brokerReferralPerc: data?.brokerReferralPerc ?? "",
    brokerReferral: data?.brokerReferral ?? "",
    // address: data?.address ?? "",hataya
    // passportNumber: data?.passportNumber ?? "", hataya
    typeOfProperty: data?.typeOfProperty ?? "",
    // dateOfBirth: data?.dateOfBirth ?? "" hataya
    // commissionPecr: data?.commission
    //   ? percent(data?.total, data?.commission)
    //   : "",
    // commission: data?.commission ?? "",
    // commission: data?.commission ?? '',
    category: data?.category ?? "",
  };
}

// 
const dummyInData = {
  "developer": { _id: "662a01b3d4026cd0412b05bb" },
  "relationshipManager": "managersaud",
  "meeting": { _id: "6683cb006c13ff751036b667" },
  "projectName": "",
  "unit": "9887987",
  "areaSQFT": 874568,
  "total": 763456,
  "propertyDetails": "qwertyuioplkjhgfdsazxcvbnm,",
  "paymentPlan": "uywetr",
  "paymentMode": "cheque",
  "token": true,
  "bookingAmount": 0,
  "commission": 7653741,
  "commissionPerc": 1002.51,
  "clientLoyalty": 8745,
  "clientLoyaltyPerc": 1.15,
  "brokerReferralPerc": 0.61,
  "brokerReferral": 4654,
  "typeOfProperty": "hjewgtyger",
  "category": "primary"
}

const DeveloperInformation = () => {
  const queryClient = useQueryClient();
  const { meeting, user, developer } = useSelector(selectUser);
  const { navigate } = useNavigation();
  const { params } = useRoute();
  const data = params?.data;
  let initial;
  myConsole('datadata', data)
  //
  const [modifiedMeeting, setModifiedMeeting] = useState([]);
  // const [paymentProof, setPaymentProof] = useState(!!data?.passport? { uri: data?.passport, }: {});
  // const [paymentProof2, setPaymentProof2] = useState(  !!data?.passport2 ? {uri: data?.passport2,}:{});

  const [paymentProof, setPaymentProof] = useState({});
  const [paymentProof2, setPaymentProof2] = useState({});
  // const [dateOfBirth, setDateOfBirth] = useState(data?.dateOfBirth ?? new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchValue, setSearchValue] = useState("");
  const [isUpdateFrom, setIsUpdateFrom] = useState(!!data);
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    validationSchema: addBookingSchema,
    initialValues: initialValues(data),
    onSubmit: (values) => {
      const passData = {
        ...values,
        // paymentProof,
        // paymentProof2,
        bookingAmount: values?.token ? values?.bookingAmount : "0",
        ...(params?.data?._id && { initialValues: { ...data }, })
      }
      navigate(routeBooking.clientInformation, passData);
    },
  });
  //react query
  const {
    data: meetingList,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useGetMeetingForBooking({
    search: debouncedSearch
  })

  const {
    data: meetingDetail,
    isLoading: loadingMeeting
  } = useGetMeetingById(data?.meeting?._id)

  // const handleModifiedMeeting = () => {
  //   if (user?.role === "sup_admin" || user?.role === "sub_admin") {
  //     let temp = meeting?.map((el) => {
  //       return {
  //         _id: el._id,
  //         name: `${el?.lead?.clientName} (${el?.clientAddress})`,
  //       };
  //     });
  //     setModifiedMeeting(temp);
  //   } else {
  //     let temp1 = meeting
  //       .filter((meet) => meet.createdBy?._id === user?._id)
  //       .map((el) => {
  //         return {
  //           _id: el._id,
  //           name: `${el?.lead?.clientName} (${el?.clientAddress})`,
  //         };
  //       });
  //     setModifiedMeeting(temp1);
  //   }
  // };

  // useEffect(() => {
  //   handleModifiedMeeting();
  // }, []);

  // const handleCommission = (v, type: "per" | "amount") => {
  //   let total = !!values?.total ? parseFloat(values?.total) : 0;
  //   if (type === "amount") {
  //     let percent = total === 0 ? 0 : (parseFloat(v) / total) * 100;
  //     setFieldValue("commission", v);
  //     setFieldValue("commissionPecr", percent.toFixed(2));
  //   } else {
  //     let amount = total === 0 ? 0 : (parseFloat(v) / 100) * total;
  //     setFieldValue("commissionPerc", v);
  //     setFieldValue("commission", amount.toFixed(2).toString());
  //   }
  // };

  // const habdlePassback = (v, type: "per" | "amount") => {
  //   let total = !!values?.total ? parseFloat(values?.total) : 0;
  //   if (type === "amount") {
  //     let percent = total === 0 ? 0 : (parseFloat(v) / total) * 100;
  //     setFieldValue("passback", v);
  //     setFieldValue("passbackPerc", percent.toFixed(2));
  //   } else {
  //     let amount = total === 0 ? 0 : (parseFloat(v) / 100) * total;
  //     setFieldValue("passbackPerc", v);
  //     setFieldValue("passback", amount.toFixed(2).toString());
  //   }
  // };
  let forUpdate = !!params?.data

  const onEndReach = () => {
    if (hasNextPage && !loading && meetingList?.length > 0) {
      fetchNextPage && fetchNextPage()
    }
  }

  const onRefresh = async () => {
    try {
      setRefreshing(true)
      await queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getMeetingForBooking]
      })
    }
    catch (e) {
      console.log('refreshGetAllLeave', e)
    }
    finally {
      setRefreshing(false)
    }
  }

  const debounceSearch = React.useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    []
  );

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };


  return (
    <>
      <Header title={forUpdate ? "Update Booking" : "Add Booking"} />
      <Container>
        <ScrollViewWithKeyboardAvoid>
          <View style={{ padding: 20, paddingBottom: 100 }}>
            <MainTitle
              title="Developer Information"
              containerStyle={{ marginBottom: 20 }}
            />
            <DropdownRNE
              label="Developer"
              keyName="Developer"
              containerStyle={{ marginBottom: 15 }}
              arrOfObj={developer?.length > 0 ? developer : []}
              keyValueGetOnSelect="_id"
              keyValueShowInBox="name"
              onChange={(a) => setFieldValue("developer", a)}
              initialValue={values?.developer}
              isSearch
              maxHeight={300}
            />
            {errors.developer && touched.developer && (
              <Text style={styles.errorText}>{errors.developer}</Text>
            )}
            <CustomInput
              label="Relationship Manager"
              containerStyle={{ marginBottom: 25, marginTop: 10 }}
              value={values?.relationshipManager}
              onChangeText={handleChange("relationshipManager")}
              placeholder="Relationship Manager"
              onBlur={handleBlur("relationshipManager")}
            />
            {errors.relationshipManager && touched.relationshipManager && (
              <Text style={{ color: "red", marginTop: -20 }}>
                {errors.relationshipManager}
              </Text>
            )}

            {/* Unit Information */}
            <MainTitle
              title="Unit Information"
              containerStyle={{ marginBottom: 20, marginTop: 15 }}
            />
            {!isUpdateFrom ? <DropdownRNE
              label="Meeting"
              containerStyle={{ marginBottom: 15 }}
              arrOfObj={meetingList || []}
              keyValueShowInBox="name"
              keyValueGetOnSelect="_id"
              onChange={(a) => setFieldValue("meeting", a)}
              initialValue={values?.meeting}
              onBlur={handleBlur("meeting")}
              isSearch
              mode="modal"
              //
              onEndReached={onEndReach}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage && <ActivityIndicator
                  size={'small'}
                  color={'#002E6B'}
                />
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onChangeText={(v) => handleSearchChange(v)}
              isLoading={loading}
            /> :
              <IllusionBox
                title="Meeting"
                value={meetingDetail?.lead?.clientName || meetingDetail?.lead?.name}
                onPress={() => setIsUpdateFrom(false)}
              />
            }
            {errors.meeting && touched.meeting && (
              <Text style={styles.errorText}>{errors.meeting}</Text>
            )}
            <CustomInput
              label="Project name"
              containerStyle={{ marginBottom: 15 }}
              value={values?.projectName}
              onChangeText={handleChange("projectName")}
              placeholder="Project Name"
              onBlur={handleBlur("projectName")}
            />
            {errors.projectName && touched.projectName && (
              <Text style={styles.errorText}>{errors.projectName}</Text>
            )}
            <CustomInput
              label="Unit Number"
              containerStyle={{ marginBottom: 15 }}
              value={values?.unit}
              onChangeText={handleChange("unit")}
              placeholder="Unit Number"
              onBlur={handleBlur("unit")}
            />
            {errors.unit && touched.unit && (
              <Text style={styles.errorText}>{errors.unit}</Text>
            )}
            <CustomInput
              label="Area SQFt"
              containerStyle={{ marginBottom: 15 }}
              value={values?.areaSQFT}
              onChangeText={handleChange("areaSQFT")}
              props={{
                keyboardType: "numeric",
              }}
              placeholder="Area SQFt"
              onBlur={handleBlur("areaSQFT")}
            />
            {errors.areaSQFT && touched.areaSQFT && (
              <Text style={styles.errorText}>{errors.areaSQFT}</Text>
            )}

            <CustomInput
              label="Total Price"
              containerStyle={{ marginBottom: 15 }}
              value={values?.total}
              onChangeText={handleChange("total")}
              props={{
                keyboardType: "numeric",
              }}
              placeholder="Total"
              onBlur={handleBlur("total")}
            />
            {errors.total && touched.total && (
              <Text style={styles.errorText}>{errors.total}</Text>
            )}

            <CustomInput
              label="Payment Plan"
              containerStyle={{ marginBottom: 15 }}
              value={values?.paymentPlan}
              onChangeText={handleChange("paymentPlan")}
              placeholder="Payment Plan"
              onBlur={handleBlur("paymentPlan")}
            />
            {errors.paymentPlan && touched.paymentPlan && (
              <Text style={styles.errorText}>{errors.paymentPlan}</Text>
            )}

            <DropdownRNE
              label="Select Category"
              containerStyle={{ marginBottom: 15 }}
              arrOfObj={[
                { name: "Primary", _id: 'primary' },
                { name: "Secondary", _id: 'secondary' },
              ]}
              keyValueGetOnSelect="_id"
              keyValueShowInBox="name"
              onChange={(a) => setFieldValue("category", a)}
              placeholder="category"
              onBlur={handleBlur("category")}
              initialValue={values?.category}
            />

            <CustomInput
              label="Type Of Property"
              containerStyle={{ marginBottom: 15 }}
              value={values?.typeOfProperty}
              onChangeText={handleChange("typeOfProperty")}
              placeholder="Type Of Property"
              onBlur={handleBlur("typeOfProperty")}
            />

            <DropdownRNE
              label="Payment Mode"
              containerStyle={{ marginBottom: 15 }}
              arrOfObj={[
                { name: "Cash", _id: "cash" },
                { name: "Cheque", _id: "cheque" },
                { name: "Bank Transfer", _id: "bank_transfer" },
                { name: "Online Transfer", _id: "online_transfer" },
              ]}
              keyValueGetOnSelect="_id"
              keyValueShowInBox="name"
              onChange={(a) => setFieldValue("paymentMode", a)}
              initialValue={values?.paymentMode}
              placeholder="Payment Mode"
              onBlur={handleBlur("paymentMode")}
            />
            {errors.paymentMode && touched.paymentMode && (
              <Text style={styles.errorText}>{errors.paymentMode}</Text>
            )}
            <DropdownRNE
              label="Token"
              containerStyle={{ marginBottom: 15 }}
              arrOfObj={[
                { name: "Paid", _id: true },
                { name: "Un Paid", _id: false },
              ]}
              keyValueGetOnSelect="_id"
              keyValueShowInBox="name"
              onChange={(a) => setFieldValue("token", a)}
              placeholder="Token"
              onBlur={handleBlur("token")}
              initialValue={values?.token}
            />
            {values?.token === true && (
              <CustomInput
                label="Booking Amount"
                containerStyle={{ marginBottom: 15 }}
                value={values.bookingAmount}
                onChangeText={handleChange("bookingAmount")}
                props={{
                  keyboardType: "numeric",
                }}
                onBlur={handleBlur("bookingAmount")}
              />
            )}
            {values?.token === true &&
              errors.bookingAmount &&
              touched.bookingAmount && (
                <Text style={styles.errorText}>{errors.bookingAmount}</Text>
              )}

            {/* <CustomInput
              label="Kickbak/Passback"
              containerStyle={{ marginBottom: 15 }}
              value={values?.passback}
              onChangeText={(v) => habdlePassback(v, "amount")}
              props={{
                keyboardType: "numeric",
              }}
              onBlur={handleBlur("passback")}
            />
            {errors.passback && touched.passback && (
              <Text style={styles.errorText}>{errors.passback}</Text>
            )}
            <CustomInput
              label="Kickbak/Passback %"
              containerStyle={{ marginBottom: 15 }}
              value={values?.passbackPerc}
              onChangeText={(v) => habdlePassback(v, "per")}
              props={{
                keyboardType: "numeric",
              }}
              onBlur={handleBlur("passbackPerc")}
            />
            {errors.passbackPerc && touched.passbackPerc && (
              <Text style={styles.errorText}>{errors.passbackPerc}</Text>
            )} */}
            {/* New field add start */}
            <CustomInput
              label="Client Loyalty"
              containerStyle={{ marginBottom: 15 }}
              value={values?.clientLoyalty}
              onChangeText={(v) => {
                setFieldValue('clientLoyalty', v);
                setFieldValue('clientLoyaltyPerc', !v ? 0 : parseFloat((v / values.total) * 100).toFixed(2));
              }}
              props={{
                keyboardType: "numeric",
              }}
              onBlur={handleBlur("clientLoyalty")}
            />
            {errors.clientLoyalty && touched.clientLoyalty && (
              <Text style={styles.errorText}>{errors.clientLoyalty}</Text>
            )}
            <CustomInput
              label="Client Loyalty %"
              containerStyle={{ marginBottom: 15 }}
              value={values?.clientLoyaltyPerc}
              onChangeText={(v) => {
                setFieldValue('clientLoyaltyPerc', v);
                setFieldValue('clientLoyalty', !v ? 0 : parseFloat((v / 100) * values.total).toFixed(2));
              }}
              props={{
                keyboardType: "numeric",
              }}
              onBlur={handleBlur("clientLoyaltyPerc")}
            />
            {errors.clientLoyaltyPerc && touched.clientLoyaltyPerc && (
              <Text style={styles.errorText}>{errors.clientLoyaltyPerc}</Text>
            )}

            <CustomInput
              label="Broker Referral"
              containerStyle={{ marginBottom: 15 }}
              value={values?.brokerReferral}
              onChangeText={(v) => {
                setFieldValue('brokerReferral', v);
                setFieldValue('brokerReferralPerc', !v ? 0 : parseFloat((v / values.total) * 100).toFixed(2));
              }}
              props={{
                keyboardType: "numeric",
              }}
              onBlur={handleBlur("brokerReferral")}
            />
            {errors.brokerReferral && touched.brokerReferral && (
              <Text style={styles.errorText}>{errors.brokerReferral}</Text>
            )}
            <CustomInput
              label="Broker Referral %"
              containerStyle={{ marginBottom: 15 }}
              value={values?.brokerReferralPerc}
              onChangeText={(v) => {
                setFieldValue('brokerReferralPerc', v);
                setFieldValue('brokerReferral', !v ? 0 : parseFloat((v / 100) * values.total).toFixed(2));
              }}
              props={{
                keyboardType: "numeric",
              }}
              onBlur={handleBlur("brokerReferralPerc")}
            />
            {errors.brokerReferralPerc && touched.brokerReferralPerc && (
              <Text style={styles.errorText}>{errors.brokerReferralPerc}</Text>
            )}

            {/* new field add end */}
            <CustomInput
              label="Commission"
              containerStyle={{ marginBottom: 15 }}
              value={values?.commission}
              onChangeText={(v) => {
                setFieldValue('commission', v);
                setFieldValue('commissionPerc', !v ? 0 : parseFloat((v / values.total) * 100).toFixed(2));
              }
                // handleCommission(v, "amount")
              }
              props={{
                keyboardType: "numeric",
              }}
              onBlur={handleBlur("commission")}
            />
            {errors.commission && touched.commission && (
              <Text style={styles.errorText}>{errors.commission}</Text>
            )}
            <CustomInput
              label="Commission %"
              containerStyle={{ marginBottom: 15 }}
              value={values?.commissionPerc}
              onChangeText={(v) => {
                setFieldValue('commissionPerc', v);
                setFieldValue('commission', !v ? 0 : parseFloat((v / 100) * values.total).toFixed(2));
              }}
              props={{
                keyboardType: "numeric",
              }}
              onBlur={handleBlur("commissionPerc")}
            />
            {errors.commissionPerc && touched.commissionPerc && (
              <Text style={styles.errorText}>{errors.commissionPerc}</Text>
            )}

            <IllusionBox
              title="Net Commission"
              value={`${values?.commission - values?.brokerReferral - values.clientLoyalty}`}
            />

            <CustomInput
              label="Booking Details"
              containerStyle={{ marginBottom: 15 }}
              value={values?.propertyDetails}
              onChangeText={handleChange("propertyDetails")}
              placeholder="Property Detail"
              onBlur={handleBlur("propertyDetails")}
              props={{
                multiline: true,
                textAlignVertical: 'top'
              }}
              inputStyle={{ minHeight: 80 }}
            />
            {errors.propertyDetails && touched.propertyDetails && (
              <Text style={styles.errorText}>{errors.propertyDetails}</Text>
            )}

            {/* <ExpoImagePicker
              label="Payment Proof"
              onSelect={(a) => {
                const selectedImage = a?.assets[0];
                setPaymentProof(selectedImage);
                setFieldValue("paymentProof", selectedImage);
              }}

            // onBlur={handleBlur("paymentProof")}
            /> */}
            {/* {errors.paymentProof && (
              <Text style={{ color: "red" }}>{errors.paymentProof}</Text>
            )} */}
            {/* <ExpoImagePicker
              label="Payment Proof2"
              onSelect={(a) => {
                const selectedImage = a?.assets[0];
                setPaymentProof2(selectedImage);
                setFieldValue("paymentProof2", selectedImage);
              }}
              // onBlur={handleBlur("paymentProof2")}
              boxContainerStyle={{ marginVertical: 15 }}
            /> */}
            {/* {errors.paymentProof2 && (
              <Text style={{ color: "red" }}>{errors.paymentProof2}</Text>
            )} */}

            {/* <DatePickerExpo
              title="Date Of Birth"
              boxContainerStyle={{ marginBottom: 15 }}
              maximumDate={new Date()}
              initialValue={dateOfBirth}
              onSelect={(v) => {
                setDateOfBirth(v)
                setFieldValue("dateOfBirth", v)
              }}
            /> */}
            {/* 
            <CustomInput
              label="Passport Number"
              containerStyle={{ marginBottom: 15 }}
              value={values?.passportNumber}
              onChangeText={handleChange("passportNumber")}
              placeholder="Passport Number"
              onBlur={handleBlur("passportNumber")}
            />
             */}
            {/* <CustomInput
              label="Address"
              containerStyle={{ marginBottom: 15 }}
              value={values?.address}
              onChangeText={handleChange("address")}
              props={{
                multiline: true,
                textAlignVertical: 'top'
              }}
              placeholder="Address"
              onBlur={handleBlur("address")}
              inputStyle={{ minHeight: 80 }}
            /> */}
            <CustomBtn
              title="Next"
              onPress={handleSubmit}
              containerStyle={{ margin: 20 }}
            />
          </View>

        </ScrollViewWithKeyboardAvoid>
      </Container>
    </>
  );
};

export default DeveloperInformation;
const styles = StyleSheet.create({
  input: {
    marginTop: 10,
    height: 37.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
  divider: {
    borderBottomColor: "#2D67C6",
    width: "100%",
    borderBottomWidth: 0.5,
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginTop: -10,
    marginBottom: 15,
  },
});
