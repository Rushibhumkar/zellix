import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import Header from "../../components/Header";
import { color } from "../../const/color";
import { myConsole } from "../../hooks/useConsole";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import ExpoImagePicker from "../../myComponents/ExpoImagePicker/ExpoImagePicker";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { selectUser } from "../../redux/userSlice";
import { useSelector } from "react-redux";
import { PaymentStatus, inputStatusOptions } from "../../utils/data";
import { routeBooking, routeMeeting } from "../../utils/routes";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import ClientInfoNewForm from "./ClientInfoNewForm";

function isImageMoreThanTwoMb(imageSize) {
  const imageSizeInMB = imageSize / (1024 * 1024);
  if (imageSizeInMB > 2) {
    return 'File should be smaller than 2 MB';
  } else {
    return ''
  }
}

const ClientInformation = () => {
  const { goBack, navigate } = useNavigation();
  const { params } = useRoute();

  const [passport, setPassport] = useState({});
  const [passport2, setPassport2] = useState({});
  const [emiratesID, setEmiratesID] = useState({});
  const [emiratesID2, setEmiratesID2] = useState({});
  const [visa, setVisa] = useState({});
  const [visa2, setVisa2] = useState({});
  const [date, setDate] = useState(params?.initialValues?.createdAt || new Date());
  const { user } = useSelector(selectUser);
  ////
  const [inputStatus, setInputStatus] = useState('');
  const [remarks, setRemarks] = useState(params?.initialValues?.remarks ?? "");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentImgArr, setPaymentImgArr] = useState([]);
  const [paymentImgIndex, setPaymentImgIndex] = useState([]);
  const [otherDocs, setOtherDocs] = useState([]);
  const [otherDocsIndex, setOtherDocsIndex] = useState([]);
  //
  const [isValidateFile, setIsValidateFile] = useState(false);
  // ... other code

  // const handleStatusChange = (inputStatus) => {
  //   setInputStatus(inputStatus);
  // };

  useEffect(() => {
    if (params?.initialValues?.paymentProofArr?.length > 0) {
      setPaymentImgArr(params?.initialValues?.paymentProofArr?.map((el) => {
        return {}
      }))
    }
    if (params?.initialValues?.otherDocs?.length > 0) {
      setOtherDocs(params?.initialValues?.otherDocs?.map((el) => {
        return {}
      }))
    }
  }, [params?.initialValues?.paymentProofArr])

  const handleRemarksChange = (text) => {
    setRemarks(text);
  };

  const [errors, setErrors] = useState({
    passport: "",
    emiratesID: "",
    visa: "",
    date: "",
    remarks: "",
    inputStatus: "",
    paymentStatus: "",
    payment: [],
    otherDoc: []
  });

  const handleStatusChange = (inputStatus) => {
    setInputStatus(inputStatus);
    setErrors((prevErrors) => ({ ...prevErrors, paymentStatus: "" }));
    if (inputStatus === "executed") {
      setPaymentStatus("");
    }
  };

  //const validateInputs = () => {
  //   let isValid = true;
  //   if (!passport?.uri) {
  //     setErrors((prevErrors) => ({
  //       ...prevErrors,
  //       passport: "Passport is required",
  //     }));
  //     isValid = false;
  //   } else {
  //     setErrors((prevErrors) => ({ ...prevErrors, passport: "" }));
  //   }

  //   if (!emiratesID?.uri) {
  //     setErrors((prevErrors) => ({
  //       ...prevErrors,
  //       emiratesID: "Emirates ID is required",
  //     }));
  //     isValid = false;
  //   } else {
  //     setErrors((prevErrors) => ({ ...prevErrors, emiratesID: "" }));
  //   }

  //   if (!visa?.uri) {
  //     setErrors((prevErrors) => ({ ...prevErrors, visa: "Visa is required" }));
  //     isValid = false;
  //   } else {
  //     setErrors((prevErrors) => ({ ...prevErrors, visa: "" }));
  //   }

  //   if (!date) {
  //     setErrors((prevErrors) => ({ ...prevErrors, date: "Required" }));
  //     isValid = false;
  //   } else {
  //     setErrors((prevErrors) => ({ ...prevErrors, date: "" }));
  //   }

  //   return isValid;
  //  };



  const handleNextPage = () => {
    let paymentProofArr = paymentImgArr.filter((el) => el?.uri);
    let otherDocsArr = otherDocs.filter((el) => el?.uri);
    if (true) {
      navigate(routeBooking?.Agents, {
        data: { ...params, inputStatus, paymentStatus, remarks },
        passport,
        emiratesID,
        visa,
        passport2,
        emiratesID2,
        visa2,
        date,
        paymentProofArr,
        paymentImgIndex,
        otherDocs: otherDocsArr,
        otherDocsIndex
      });
    }
  };

  const onSelectMultiplePayment = (img, index, key) => {
    if (key === 'payment') {
      setPaymentImgArr((prev) => {
        let temp = [...prev]
        temp[index] = img;
        return temp;
      })
      setPaymentImgIndex((prev) => {
        return [...new Set([...prev, index])]
      })
    };
    if (key === 'otherDoc') {
      setOtherDocs((prev) => {
        let temp = [...prev]
        temp[index] = img;
        return temp;
      })
      setOtherDocsIndex((prev) => {
        return [...new Set([...prev, index])]
      })
    };
    setErrors((prevErrors) => ({
      ...prevErrors,
      [key]: [...prevErrors?.[key], isImageMoreThanTwoMb(img?.fileSize)]
    }));
  }

  const addFieldForPayment = (key) => {
    if (key === 'payment') {
      setPaymentImgArr((prev) => {
        return [...prev, {}]
      })
    }
    if (key === 'otherDoc') {
      setOtherDocs((prev) => {
        return [...prev, {}]
      })
    }
  }

  // myConsole('paymentImgIndex', paymentImgIndex)
  const handleFileError = (key, fileSize) => {
    setErrors((prevErrors) => ({ ...prevErrors, [key]: isImageMoreThanTwoMb(fileSize) }));
  }
  useEffect(() => {
    for (const key in errors) {
      if (typeof (errors?.[key]) === 'object' && errors?.[key]?.length > 0) {
        let a = errors?.[key]?.some(el => el === 'File should be smaller than 2 MB');
        if (a) {
          setIsValidateFile(true);
          break;
        }
      } else if (errors?.[key] === 'File should be smaller than 2 MB') {
        setIsValidateFile(true);
        break;
      }
    }
  }, [errors])

  let forUpdate = !!params?.initialValues?._id
  return (
    <>
      <Header title={forUpdate ? "Update Booking" : "Add Booking"} />
      <Container>
        <ScrollViewWithKeyboardAvoid>
          <View style={{ padding: 20, paddingBottom: 100 }}>
            {false ? <>
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
              // onChange={(a) => setFieldValue("category", a)}
              // placeholder="category"
              // onBlur={handleBlur("category")}
              // initialValue={values?.category}
              />
              <MainTitle
                title="Client Information"
                containerStyle={{ marginBottom: 20 }}
              />
              <ExpoImagePicker
                label="Passport"
                boxContainerStyle={{ marginBottom: 15 }}
                onSelect={(a) => {
                  setPassport(a.assets[0])
                  handleFileError('passport', a.assets[0]?.fileSize)
                }}
              />
              {errors.passport && (
                <Text style={styles.errorText}>{errors.passport}</Text>
              )}
              <ExpoImagePicker
                label="Passport 2"
                boxContainerStyle={{ marginBottom: 15 }}
                onSelect={(a) => {
                  setPassport2(a.assets[0])
                  handleFileError('passport2', a.assets[0]?.fileSize)
                }}
              />
              {errors.passport2 && (
                <Text style={styles.errorText}>{errors.passport2}</Text>
              )}
              <ExpoImagePicker
                label="Emirates ID"
                boxContainerStyle={{ marginBottom: 15 }}
                onSelect={(a) => {
                  setEmiratesID(a.assets[0])
                  handleFileError('emiratesID', a.assets[0]?.fileSize)
                }}
              />
              {errors.emiratesID && (
                <Text style={styles.errorText}>{errors.emiratesID}</Text>
              )}
              <ExpoImagePicker
                label="Emirates ID 2"
                boxContainerStyle={{ marginBottom: 15 }}
                onSelect={(a) => {
                  setEmiratesID2(a.assets[0])
                  handleFileError('emiratesID2', a?.assets[0]?.fileSize)
                }}
              />
              {errors.emiratesID2 && (
                <Text style={styles.errorText}>{errors.emiratesID2}</Text>
              )}
              <ExpoImagePicker
                label="Visa"
                boxContainerStyle={{ marginBottom: 15 }}
                onSelect={(a) => {
                  setVisa(a.assets[0])
                  handleFileError('visa', a?.assets[0]?.fileSize)
                }}
              />
              {errors.visa && <Text style={styles.errorText}>{errors.visa}</Text>}
              <ExpoImagePicker
                label="Visa 2"
                boxContainerStyle={{ marginBottom: 15 }}
                onSelect={(a) => {
                  setVisa2(a.assets[0])
                  handleFileError('visa2', a?.assets[0]?.fileSize)
                }}
              />
              {errors?.visa2 && <Text style={styles.errorText}>{errors.visa2}</Text>}
              <DatePickerExpo
                title={"Booking Date"}
                boxContainerStyle={{ marginBottom: 25 }}
                onSelect={(a) => setDate(a)}
                initialValue={date}
              />
              {errors.date && (
                <Text style={{ color: "red", marginTop: -20 }}>
                  {errors.date}
                </Text>
              )}
              <>
                {/* docs */}
                <View style={{ marginBottom: 10, marginTop: 20 }}>
                  <MainTitle
                    title="Payment Proof"
                    containerStyle={{ marginBottom: 20 }}
                    icon={paymentImgArr?.length < 5 && <CustomBtn
                      title="Add Fields"
                      onPress={() => addFieldForPayment('payment')}
                      textStyle={{ fontSize: 13 }}
                    />}
                  />
                  {paymentImgArr.map((el, i) => {
                    return <View
                      key={i}
                    >
                      <ExpoImagePicker
                        key={i}
                        label={`Payment Proof ${i + 1}`}
                        boxContainerStyle={{ marginBottom: 15 }}
                        onSelect={(a) => onSelectMultiplePayment(a.assets[0], i, 'payment')}
                      />
                      {errors?.payment?.[i] && (
                        <Text style={styles.errorText}>{errors?.payment?.[0]}</Text>
                      )}
                    </View>
                  })}
                </View>
                <View style={{ marginBottom: 10 }}>
                  <MainTitle
                    title="Other Docs"
                    containerStyle={{ marginBottom: 20 }}
                    icon={otherDocs?.length < 4 && <CustomBtn
                      title="Add Fields"
                      onPress={() => addFieldForPayment('otherDoc')}
                      textStyle={{ fontSize: 13 }}
                    />}
                  />
                  {otherDocs.map((el, i) => {
                    return <View
                      key={i}
                    >
                      <ExpoImagePicker
                        key={i}
                        label={`Other Docs ${i + 1}`}
                        boxContainerStyle={{ marginBottom: 15 }}
                        onSelect={(a) => onSelectMultiplePayment(a.assets[0], i, 'otherDoc')}
                      />
                      {errors?.otherDoc?.[i] && (
                        <Text style={styles.errorText}>{errors?.otherDoc?.[0]}</Text>
                      )}
                    </View>
                  })}
                </View>
                <ExpoImagePicker
                  label={`Booking Form`}
                  boxContainerStyle={{ marginBottom: 35 }}
                // onSelect={(a) => onSelectMultiplePayment(a.assets[0], i, 'otherDoc')}
                />
              </>
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
                onChange={handleStatusChange}
                initialValue={params?.initialValues?.inputStatus}
                mode="modal"
              />

              {(user?.role === "sup_admin" || user?.role === "sr_manager" || user?.role === "sub_admin") && (
                <CustomInput
                  label="Remarks"
                  containerStyle={{ marginBottom: 10, marginTop: 10 }}
                  value={remarks}
                  onChangeText={(v) => setRemarks(v)}
                  placeholder="Remarks"
                />
              )}

              {/* {(user?.role === "sup_admin" || user?.role === "sr_manager") &&
              inputStatus === "Executed" && (
                <DropdownRNE
                  label="Payment Status"
                  containerStyle={{ marginBottom: 15 }}
                  arrOfObj={[
                    { name: "Pending", _id: "Pending" },
                    { name: "Recieved", _id: "Recieved" },
                    { name: "NotRecieved", _id: "NotRecieved" },
                  ]}
                  keyValueGetOnSelect="_id"
                  keyValueShowInBox="name"
                  initialValue={params?.initialValues?.paymentStatus}
                  onChange={(value) => setPaymentStatus(value)}
                />
              )} */}

              {/* {(params?.initialValues?.status === "executed" ||
              inputStatus === "executed") &&
              (user?.role === "sup_admin" || user?.role === "sr_manager") && (
                <DropdownRNE
                  label="Payment Status"
                  containerStyle={{ marginBottom: 15 }}
                  arrOfObj={PaymentStatus}
                  keyValueGetOnSelect="_id"
                  keyValueShowInBox="name"
                  initialValue={params?.initialValues?.paymentStatus}
                  onChange={(value) => setPaymentStatus(value)}
                />
              )} */}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 20,
                }}
              >
                <CustomBtn
                  title="Previous"
                  onPress={goBack}
                  containerStyle={{
                    width: "45%",
                    backgroundColor: color.grayBtn,
                  }}
                />
                <CustomBtn
                  title="Next"
                  containerStyle={{ width: "45%" }}
                  onPress={handleNextPage}
                  disabled={isValidateFile}
                />
              </View>
            </> : <ClientInfoNewForm params={params} />}
          </View>
        </ScrollViewWithKeyboardAvoid>
      </Container>
    </>
  );
};

export default ClientInformation;

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

  Previousbtn: {
    marginTop: 25,
    backgroundColor: "#BFBFBF",
    padding: 12,
    width: "50%",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitbtn: {
    marginTop: 25,
    backgroundColor: "#2D67C6",
    padding: 12,
    width: "40%",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  btntextpre: {
    color: "#000000",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 20,
  },
  btntext: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 20,
  },
  errorText: {
    color: "red",
    marginTop: -15,
    marginBottom: 15,
  },
});
