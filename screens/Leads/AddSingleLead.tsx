import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { addLead, updateLead } from "../../services/rootApi/leadApi";
import { useNavigation } from "@react-navigation/native";
import userSlice, { selectUser } from "../../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { getAllLeadFunc } from "../../redux/action";
import { addSingleLeadSchema, addSingleLeadWithSrManagerSchema } from "../../utils/validation";
import MobileInput from "../../myComponents/MobileInput/MobileInput";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import { myConsole } from "../../hooks/useConsole";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyCRM } from "../../utils/queryKeys";
import { popUpConfToast } from "../../utils/toastModalByFunction";

const AddSingleLead = ({ data }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const { user, team } = useSelector(selectUser);
  const [isLoading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    validationSchema: user?.isAdmin ? addSingleLeadWithSrManagerSchema : addSingleLeadSchema,
    initialValues: {
      name: data?.name ?? "",
      clientName: data?.clientName ?? "",
      clientMobile: data?.clientMobile ?? "",
      clientEmail: data?.clientEmail ?? "",
      type: data?.type ?? "",
      whatsapp: data?.whatsapp?.slice(14) ?? "",
      // srManager: data?.team?.srManager ?? '',
      ...(user?.isAdmin && { srManager: data?.team?.srManager ?? "" }),
      // clientMobile: '91-9988776655',
      // name: 'Lead Name',
      // clientName: 'clientName',
      // clientEmail: 'clientEmail@gmail.com',
      // whatsapp: '7766554433',
      // srManager: '',
    },
    onSubmit: async (value) => {
      let isUpdate = !!data?._id;
      setLoading(true);
      try {
        let { whatsapp, srManager, ...restData } = values;
        const sendData = {
          ...restData,
          whatsapp: `https://wa.me/${whatsapp}`,
        };
        if (isUpdate) {
          let updateLeadRes = await updateLead({
            id: data?._id,
            data: {
              data: sendData,
              srManager,
              assign: srManager,
            },
          });

          // setIsVisible(true);
          // setMessage("Updated Successfully");
          // await dispatch(getAllLeadFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLeadDetailById, data?._id]
          })
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLead]
          })
          popUpConfToast.successMessage(updateLeadRes)
          goBack();
        } else {
          let addLeadRes = await addLead({
            data: sendData,
            srManager,
            assign: srManager,
          });
          // setIsVisible(true);
          // setMessage("Lead saved successfully");
          // await dispatch(getAllLeadFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLead]
          });
          popUpConfToast.successMessage('Lead Add Successfully');
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getDashboardCount]
          });
          navigate("allLead");
        }
      } catch (err) {
        popUpConfToast.errorMessage(err?.response?.data || err)
        // setLoading(false);
        // Alert.alert("Error ", `${err?.response?.data || err}`, [
        //   {
        //     text: "Cancel",
        //     style: "cancel",
        //   },
        //   {
        //     text: "OK",
        //   },
        // ]);
        // setIsVisible(true);
        // setMessage(err?.response?.data || err);
        // myConsole("error", err);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    let srManager = "";
    if (data?.self) {
      team?.forEach((tm) => {
        if (tm.srManager?._id === data?.assign?._id) {
          srManager = tm.srManager?._id;
          return;
        } else if (tm.manager?._id === data?.assign?._id) {
          srManager = tm.srManager?._id;
          return;
        } else if (tm?.assigntantManager?._id === data?.assign?._id) {
          srManager = tm.srManager?._id;
          return;
        } else if (tm?.tmLead?._id === data?.assign?._id) {
          srManager = tm.srManager?._id;
          return;
        } else if (!!tm?.agents && tm?.agents?.length > 0) {
          tm.agents.forEach((ag) => {
            if (ag._id === data?.assign?._id) {
              srManager = tm.srManager?._id;
              return;
            }
          });
        }
      });
      setFieldValue("srManager", srManager)
    }


  }, [!!data])

  return (
    <View>
      <CustomModelMessage
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        message={message}
        onClose={() => {
          setIsVisible(false);
          setMessage(null);
        }}
      />
      <CustomInput
        label="Source"
        // placeholder="name"
        containerStyle={{ marginBottom: 15 }}
        onChangeText={handleChange("name")}
        value={values?.name}
        onBlur={handleBlur("name")}
      />
      {errors.name && touched.name && (
        <Text style={styles.errorText}>{errors.name}</Text>
      )}
      <CustomInput
        label="Client Name"
        placeholder="Client Name"
        containerStyle={{ marginBottom: 15 }}
        onChangeText={handleChange("clientName")}
        value={values?.clientName}
        onBlur={handleBlur("clientName")}
      />
      {errors.clientName && touched.clientName && (
        <Text style={styles.errorText}>{errors.clientName}</Text>
      )}
      <Text style={{ fontSize: 16, fontWeight: 500 }}>
        Client Mobile Number
      </Text>
      <MobileInput
        onChange={(a) => setFieldValue("clientMobile", a)}
        value={values?.clientMobile}
      />
      {/* <CustomInput
        label="Client Mobile"
        placeholder="clientMobile"
        containerStyle={{ marginBottom: 15 }}
        onChangeText={handleChange("clientMobile")}
        value={values?.whatsapp}
        onBlur={handleBlur("clientMobile")}
      /> */}

      {errors.clientMobile && touched.clientMobile && (
        <Text style={styles.errorText}>{errors.clientMobile}</Text>
      )}
      <CustomInput
        label="Client Email"
        placeholder="Client Email"
        containerStyle={{ marginBottom: 15 }}
        onChangeText={handleChange("clientEmail")}
        value={values?.clientEmail}
        onBlur={handleBlur("clientEmail")}
      />
      {errors.clientEmail && touched.clientEmail && (
        <Text style={styles.errorText}>{errors.clientEmail}</Text>
      )}

      <DropdownRNE
        label="Lead Type"
        arrOfObj={[
          { name: "Lead", _id: "lead" },
          { name: "Calling Data", _id: "calling_data" },
        ]}
        keyValueGetOnSelect="_id"
        keyValueShowInBox="name"
        containerStyle={{ marginBottom: 15 }}
        placeholder="Lead Type"
        onBlur={handleBlur("type")}
        onChange={(a) => setFieldValue("type", a)}
        initialValue={values?.type}
      />
      {errors.type && touched.type && (
        <Text style={styles.errorText}>{errors.type}</Text>
      )}
      <CustomText fontSize={16} fontWeight="500"
        marginBottom={10}
      >
        WhatsApp number
        <CustomText
          fontSize={12}
          fontWeight="400"
          color={color.textGray}
        >{`  (with country code)`}</CustomText>
      </CustomText>

      <CustomInput
        label=""
        placeholder="eg: 919989767895"
        containerStyle={{ marginBottom: 15 }}
        onChangeText={handleChange("whatsapp")}
        value={values?.whatsapp}
        onBlur={handleBlur("whatsapp")}
      />
      {/* <CustomText
        fontSize={16}
        fontWeight="500"
      >WhatsApp Number</CustomText>
      <MobileInput
        onChange={(v) => setFieldValue('whatsapp', v.split('-').join(''))}
        value={values?.whatsapp}
        
      /> */}
      {errors.whatsapp && touched.whatsapp && (
        <Text style={styles.errorText}>{errors.whatsapp}</Text>
      )}

      {user?.isAdmin && (
        <DropdownRNE
          keyValueShowInBox="name"
          keyValueGetOnSelect="_id"
          label={"Assign To"}
          keyName="sr_Manager"
          containerStyle={{ marginBottom: 15 }}
          placeholder="Sr Manager"
          onChange={(a) => setFieldValue("srManager", a)}
          // onBlur={handleBlur("srManager")}
          dropdownPosition="top"
          initialValue={values?.srManager}
        />
      )}
      {user?.isAdmin && errors.srManager && touched.srManager && (
        <Text style={styles.errorText}>{errors.srManager}</Text>
      )}

      <CustomBtn
        title="Submit"
        onPress={handleSubmit}
        containerStyle={{ margin: 20 }}
        isLoading={isLoading}
      />
    </View>
  );
};

export default AddSingleLead;

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginTop: -14,
    marginBottom: 15,
  },
});
