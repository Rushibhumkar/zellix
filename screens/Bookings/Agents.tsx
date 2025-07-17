import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import mime from "mime";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import Header from "../../components/Header";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import { addBooking, updateBooking } from "../../services/rootApi/bookingApi";
import { queryKeyCRM } from "../../utils/queryKeys";
import { routeBooking } from "../../utils/routes";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import { popUpConfToast } from "../../utils/toastModalByFunction";

function percent(total = 1, value = 0) {
  // if (typeof value !== "number" || typeof total !== "number" || total === 0) {
  //   throw new Error(
  //     "Invalid input. Both value and total must be non-zero numbers."
  //   );
  // }
  if (typeof value === "number" || typeof total === "number" || total !== 0) {
    return (value / total) * 100;
  } else {
    return 0;
  }
  // return (value / total) * 100;
}

const aasa = {
  "developer": "65d2ecb72a78bb71bbe5b99b",
  "relationshipManager": "Revari",
  "meeting": "67efb9dcdac8c307353ca6f6",
  "projectName": "bhiwani",
  "clientName": "shukla ji",
  "clientMobile": "917838131522",
  "clientEmail": "dev4@swavishtek.com",
  "ownership": "single",
  "unit": "32",
  "areaSQFT": 43334,
  "total": 54333,
  "propertyDetails": "Just for testing",
  "paymentPlan": "cash",
  "paymentMode": "cheque",
  "token": false,
  "bookingAmount": 0,
  "clientLoyalty": 2173.32,
  "clientLoyaltyPerc": 4,
  "brokerReferral": 1629.99,
  "brokerReferralPerc": 3,
  "commission": -1086.66,
  "commissionPerc": -2,
  "netCommission": -4889.97,
  "date": "2025-03-11T06:14:03.802Z",
  "inputStatus": "deal_cancelled",
  "paymentStatus": "",
  "remarks": "hii i have received",
  "passportNumber": "98765567876543",
  "dateOfBirth": "2025-03-11T06:14:03.802Z",
  "typeOfProperty": "Individual",
  "address": "",
  "agents": [
    {
      "_id": "663c964c2478c575ec463175",
      "commission": -146.7,
      "commissionPerc": 3
    }
  ],
  "paymentProofArr": [
    "https://res.cloudinary.com/dlq7quc4f/image/upload/v1744006955/Payment_proof/dtrhqekjqv6vjejww0xo.pdf",
    "https://res.cloudinary.com/dlq7quc4f/image/upload/v1744006955/Payment_proof/dtrhqekjqv6vjejww0xo.pdf"
  ],
  "passport": "https://res.cloudinary.com/dlq7quc4f/image/upload/v1744006955/Payment_proof/dtrhqekjqv6vjejww0xo.pdf",
  "visa": "https://res.cloudinary.com/dlq7quc4f/image/upload/v1744006955/Payment_proof/dtrhqekjqv6vjejww0xo.pdf",
  "visa2": "https://res.cloudinary.com/dlq7quc4f/image/upload/v1744006955/Payment_proof/dtrhqekjqv6vjejww0xo.pdf",
  "emiratesID": "https://res.cloudinary.com/dlq7quc4f/image/upload/v1744006955/Payment_proof/dtrhqekjqv6vjejww0xo.pdf",
  "bookingForm": "https://res.cloudinary.com/dlq7quc4f/image/upload/v1744006955/Payment_proof/dtrhqekjqv6vjejww0xo.pdf",
  "otherDocs": ["https://res.cloudinary.com/dlq7quc4f/image/upload/v1744006955/Payment_proof/dtrhqekjqv6vjejww0xo.pdf"]
}

const Agents = () => {
  const queryClient = useQueryClient();
  const { params } = useRoute();
  const { navigate } = useNavigation();
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const [isValidate, setIsValidate] = useState(false);

  let agentUpdateArr = params?.data?.initialValues?.agents?.map((el) => {
    let total = params?.data?.initialValues?.commission;
    return { ...el, commissionPerc: percent(total, el?.commission) };
  });
  //
  const [values, setValues] = useState(
    !!agentUpdateArr
      ? agentUpdateArr
      : []
  );
  const [loader, setLoader] = useState(false);

  const handleFormChange = (index, key, value) => {
    let temp = [...values];
    temp[index][key] = value;
    setValues(temp);
    for (const obj of temp) {
      if (!obj._id || !obj.commission || !obj.commissionPerc) {
        setIsValidate(false);
        break;
      } else {
        setIsValidate(true);
      }
    }
  };

  const addFields = () => {
    let newfield = { _id: "", commission: "0", commissionPerc: "0" };
    setValues([...values, newfield]);
  };
  const removeField = (i: number) => {
    let temp = [...values];
    temp.splice(i, 1);
    setValues(temp);
  };

  const handlePercentage = (index, value, type: "per" | "amount") => {
    let total = !!params?.data?.commission
      ? parseFloat(params?.data.commission)
      : 0;
    if (type === "amount") {
      let percent = total === 0 ? 0 : (parseFloat(value) / total) * 100;
      handleFormChange(index, "commission", value);
      handleFormChange(index, "commissionPerc", percent.toFixed(2));
    } else {
      let amount = total === 0 ? 0 : (parseFloat(value) / 100) * total;
      handleFormChange(index, "commission", amount.toFixed(2));
      handleFormChange(index, "commissionPerc", value);
    }
  };



  const handleSubmit = async () => {
    const ios = Platform.OS === "ios" ? true : false;
    setLoader(true);
    try {
      const {
        data,
        emiratesID,
        visa,
        passport,
        emiratesID2,
        visa2,
        passport2,
        date,
        paymentProofArr,
        paymentImgIndex,
        otherDocs,
        otherDocsIndex
      } = params;
      const { initialValues, paymentProof, paymentProof2, ...restObj } = data;
      const isUpdate = !!initialValues?._id;
      let sendData = { ...restObj, date, agents: values };

      // myConsole("otherDocsIndex@@", otherDocsIndex);


      //////////////
      const formData = new FormData();
      formData.append("data", JSON.stringify(sendData));
      // visa
      if (visa.hasOwnProperty("uri")) {
        formData.append("visa", {
          uri: ios ? visa?.uri : visa?.uri,
          type: ios ? visa?.type : mime.getType(visa?.uri),
          name: ios ? visa?.fileName : visa?.uri?.split("/").pop(),
        });
      }
      //////
      if (visa2.hasOwnProperty("uri")) {
        formData.append("visa2", {
          uri: ios ? visa2?.uri : visa2?.uri,
          type: ios ? visa2?.type : mime.getType(visa2?.uri),
          name: ios ? visa2?.fileName : visa2?.uri?.split("/").pop(),
        });
      }

      //paymentProof
      if (paymentProof.hasOwnProperty("uri")) {
        formData.append("paymentProof", {
          uri: ios ? paymentProof?.uri : paymentProof?.uri,
          type: ios ? paymentProof?.type : mime.getType(paymentProof?.uri),
          name: ios ? paymentProof?.fileName : paymentProof?.uri?.split("/").pop(),
        });
      }

      ///
      if (paymentProof2.hasOwnProperty("uri")) {
        formData.append("paymentProof2", {
          uri: ios ? paymentProof2?.uri : paymentProof2?.uri,
          type: ios ? paymentProof2?.type : mime.getType(paymentProof2?.uri),
          name: ios ? paymentProof2?.fileName : paymentProof2?.uri?.split("/").pop(),
        });
      }

      //passport
      if (passport.hasOwnProperty("uri")) {
        formData.append("passport", {
          uri: ios ? passport?.uri : passport?.uri,
          type: ios ? passport?.type : mime.getType(passport?.uri),
          name: ios ? passport?.fileName : passport?.uri?.split("/").pop(),
        });
      }

      ////
      if (passport2.hasOwnProperty("uri")) {
        formData.append("passport2", {
          uri: ios ? passport2?.uri : passport2?.uri,
          type: ios ? passport2?.type : mime.getType(passport2?.uri),
          name: ios ? passport2?.fileName : passport2?.uri?.split("/").pop(),
        });
      }

      //emiratesID
      if (emiratesID.hasOwnProperty("uri")) {
        formData.append("emiratesID", {
          uri: ios ? emiratesID?.uri : emiratesID?.uri,
          type: ios ? emiratesID?.type : mime.getType(emiratesID?.uri),
          name: ios ? emiratesID?.fileName : emiratesID?.uri?.split("/").pop(),
        });
      }

      /////
      if (emiratesID2.hasOwnProperty("uri")) {
        formData.append("emiratesID2", {
          uri: ios ? emiratesID2?.uri : emiratesID2?.uri,
          type: ios ? emiratesID2?.type : mime.getType(emiratesID2?.uri),
          name: ios
            ? emiratesID2?.fileName
            : emiratesID2?.uri?.split("/").pop(),
        });
      }

      if (!!paymentProofArr && paymentProofArr?.length > 0) {
        paymentProofArr.forEach((el) => {
          formData.append("paymentProofArr", {
            uri: ios ? el?.uri : el?.uri,
            type: ios ? el?.type : mime.getType(el?.uri),
            name: ios
              ? el?.fileName
              : el?.uri?.split("/").pop(),
          });
        })
        // paymentProofArr.forEach((el) => {
        //   formData.append("paymentProofArr", {
        //     uri: el?.uri,
        //     type: mime.getType(el?.uri),
        //     name: el?.uri?.split("/").pop(),
        //   });
        // })
      }
      if (isUpdate) {
        formData.append("imageIndex", JSON.stringify(paymentImgIndex))
      }
      // otherDocs,
      // otherDocsIndex
      if (!!otherDocs && otherDocs?.length > 0) {
        otherDocs.forEach((el) => {
          formData.append("otherDocs", {
            uri: ios ? el?.uri : el?.uri,
            type: ios ? el?.type : mime.getType(el?.uri),
            name: ios
              ? el?.fileName
              : el?.uri?.split("/").pop(),
          });
        })
      }

      if (isUpdate) {
        formData.append("otherDocsIndex", JSON.stringify(otherDocsIndex))
      }

      let isFromMeeting = params?.data?.initialValues?.isFromMeeting
      if (isUpdate) {
        await updateBooking({
          id: initialValues?._id,
          data: formData,
          onSuccess: () => {
            setLoader(false)
            queryClient.invalidateQueries({
              queryKey: [queryKeyCRM.getBooking]
            })
            navigate(isFromMeeting ? routeBooking.bookingNavigator : routeBooking?.allBookings);
          }
        });
      } else {
        await addBooking({
          data: formData,
          onSuccess: () => {
            setLoader(false)
            queryClient.invalidateQueries({
              queryKey: [queryKeyCRM.getBooking]
            })
            queryClient.invalidateQueries({
              queryKey: [queryKeyCRM.getDashboardCount]
            })
            navigate(isFromMeeting ? routeBooking.bookingNavigator : routeBooking?.allBookings);
          }
        });
      }
    } catch (error) {

    } finally {
      setLoader(false);
    }
  };

  // formData.append('image', {
  //     name: 'image',
  //     type: values?.image?.mime,
  //     uri: !IS_IOS
  //       ? values.image?.path
  //       : values.image?.path.replace('file://', ''),
  //   });
  useEffect(() => {
    if (values?.length > 0) {
      for (let i = 0; i < values.length; i++) {
        for (const key in values[i]) {
          if (!values[i][key]) {
            setIsValidate(false);
          } else {
            setIsValidate(true);
          }
        }
      }
    }
  }, [])
  let forUpdate = !!params?.data?.initialValues?._id

  const handleSubmit2 = async () => {
    setLoader(true);
    let bookingId = params?.data?.initialValues?._id;
    let paramData = { ...params?.data };
    delete paramData.initialValues;
    console.log('bookingId1', bookingId);

    try {
      if (!bookingId) {
        const sendData = {
          ...paramData,
          agents: values,
          ownerShipDetails: paramData?.clients || []
        }
        delete sendData.clients;
        myConsole('sendData2', sendData)
        const res = await axiosInstance.post('/api/booking/V2', sendData)
        popUpConfToast.successMessage(res?.data || 'Booking Added Successfully')
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getBooking]
        })
        navigate(routeBooking?.allBookings)
      } else {
        const sendData = {
          ...paramData,
          agents: values,
          _id: bookingId,
          ownerShipDetails: paramData?.clients || []
        }
        delete sendData.clients;
        myConsole('sendData2', sendData)
        const res = await axiosInstance.post(`/api/booking/updateBookingByIdV2/${bookingId}`, sendData)
        popUpConfToast.successMessage(res?.data || 'Booking Update Successfully..')
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getBooking]
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getBookingById, bookingId]
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getDashboardCount]
        })
        navigate(routeBooking?.allBookings)
      }
    }
    catch (e) {
      myConsole('eeeee', e)
      popUpConfToast.errorMessage(e?.response?.data?.message || e?.message || 'Something went wrong')
    }
    finally {
      setLoader(false);
    }
  }

  return (
    <>
      <Header title={forUpdate ? 'Update Booking' : "Add Booking"} />
      <Container>
        <ScrollViewWithKeyboardAvoid>
          <CustomModelMessage
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            message={message}
            onClose={() => {
              setIsVisible(false);
              setMessage(null);
            }}
          />
          <View style={{ padding: 20, paddingBottom: 100 }}>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 20,
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <MainTitle
                title="Agents"
              // containerStyle={{ marginBottom: 20 }}
              />
              <CustomBtn
                title="Add Agents"
                textStyle={{ fontSize: 12 }}
                onPress={addFields}
              />
            </View>
            {/* form */}
            {values.map((el, i, arr) => {
              return (
                <View key={i} style={{ marginBottom: 35 }}>
                  <DropdownRNE
                    label="Agents"
                    keyName="agent"
                    keyValueGetOnSelect="_id"
                    keyValueShowInBox="name"
                    onChange={(v) => handleFormChange(i, "_id", v)}
                    containerStyle={{ marginBottom: 15 }}
                    initialValue={values[i]._id ?? ""}
                    isSearch
                    mode="modal"
                  />
                  <CustomInput
                    label="Revenue"
                    containerStyle={{ marginBottom: 15 }}
                    value={el.commission}
                    onChangeText={(v) => handlePercentage(i, v, "amount")}
                    props={{
                      keyboardType: "numeric",
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <CustomInput
                      label="Revenue %"
                      containerStyle={{
                        flex: 1,
                        marginEnd: 20
                      }}
                      value={!!el.commissionPerc ? el.commissionPerc : 0}
                      onChangeText={(v) => handlePercentage(i, v, "per")}
                      props={{
                        keyboardType: "numeric",
                      }}
                    />
                    {
                      true && (
                        <CustomBtn
                          title="Remove"
                          textStyle={{ fontSize: 12 }}
                          onPress={removeField}
                        />
                      )
                      // <RoundAddBtn
                      //     onPress={() => removeField(i)}
                      // />
                    }
                  </View>
                  {arr.length - 1 !== i && (
                    <View
                      style={{
                        borderBottomWidth: 1,
                        marginTop: 30,
                        borderBottomColor: color.saffronMango,
                        // marginBottom: 10
                      }}
                    />
                  )}
                </View>
              );
            })}

            <CustomBtn
              title={forUpdate ? "Update" : "Submit"}
              containerStyle={{ margin: 20 }}
              onPress={handleSubmit2}
              isLoading={loader}
            // disabled={values?.length === 0 ? false : !isValidate}
            />
          </View>
        </ScrollViewWithKeyboardAvoid>
      </Container>
    </>
  );
};

export default Agents;

const RoundAddBtn = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress && onPress}
      activeOpacity={0.5}
      style={{
        width: 37.5,
        height: 37.5,
        borderWidth: 0.5,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 37.5 / 2,
      }}
    >
      <Text style={{ fontSize: 25, fontWeight: "500" }}>-</Text>
    </TouchableOpacity>
  );
};
