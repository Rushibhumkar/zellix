import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { addLead, updateLead } from "../../services/rootApi/leadApi";
import { useNavigation } from "@react-navigation/native";
import { selectUser } from "../../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  addSingleLeadSchema,
  addSingleLeadWithSrManagerSchema,
} from "../../utils/validation";
import MobileInput from "../../myComponents/MobileInput/MobileInput";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import { myConsole } from "../../hooks/useConsole";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyCRM } from "../../utils/queryKeys";
import { useAppToast } from "../../components/AppToast";
import { useAssigningUser } from "../../hooks/useCRMgetQuerry";

const AddSingleLead = ({ data, tabType }: any) => {
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const { user, team } = useSelector(selectUser);
  const [isLoading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [isWhatsappManuallyEdited, setIsWhatsappManuallyEdited] =
    useState(false);
  const mobileDebounceRef = React.useRef<any>(null);
  const lastMobileRef = React.useRef({ countryCode: "", phone: "" }); // 👈 naya

  const { data: assignUsersData, isLoading: isAssignUsersLoading } =
    useAssigningUser({ srManager: undefined });

  // myConsole("assignUsersDatadddd", assignUsersData);
  const parseMobile = (val: string) => {
    if (!val) {
      return {
        countryCode: "",
        phone: "",
      };
    }

    if (!val.includes("-")) {
      return {
        countryCode: "",
        phone: val.replace(/\D/g, ""),
      };
    }

    const [code, phone] = val.split("-");

    return {
      countryCode: code.replace(/\D/g, ""),
      phone: phone.replace(/\D/g, ""),
    };
  };

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    validationSchema: user?.isAdmin
      ? addSingleLeadWithSrManagerSchema
      : addSingleLeadSchema,
    initialValues: {
      name: data?.name ?? "",
      clientName: data?.clientName ?? "",
      clientMobile: data?.clientMobile ?? "",
      clientEmail: data?.clientEmail ?? "",
      type:
        data?.type ?? (tabType === "calling_data" ? "calling_data" : "lead"),
      whatsapp: data?.whatsapp?.slice(14) ?? "",
      // name: data?.name ?? "sdfsdfdsf",
      // clientName: data?.clientName ?? "lksjdlkfjd",
      // clientMobile: data?.clientMobile ?? "91 383928121",
      // clientEmail: data?.clientEmail ?? "sdfsdf@gmail.com",
      // type: data?.type ?? "",
      // whatsapp: data?.whatsapp?.slice(14) ?? "9183736272",

      ...(user?.isAdmin && { srManager: data?.team?.srManager ?? "" }),
    },
    onSubmit: async (values) => {
      // myConsole("formik_values", values);
      // myConsole("formik_values", errors);
      let isUpdate = !!data?._id;
      setLoading(true);
      try {
        let { whatsapp, srManager, ...restData } = values;
        const sendData = {
          ...restData,
          whatsapp: `https://wa.me/${whatsapp}`,
        };
        if (isUpdate) {
          let updateLeadRes = await updateLead(
            {
              id: data?._id,
              data: {
                data: sendData,
                srManager,
                assign: srManager,
              },
            },
            toast,
          );

          // setIsVisible(true);
          // setMessage("Updated Successfully");
          // await dispatch(getAllLeadFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLeadDetailById, data?._id],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLead],
          });
          toast.success(updateLeadRes);
          goBack();
        } else {
          let addLeadRes = await addLead(
            {
              data: sendData,
              srManager,
              assign: srManager,
            },
            toast,
          );
          // setIsVisible(true);
          // setMessage("Lead saved successfully");
          // await dispatch(getAllLeadFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getLead],
          });
          toast.success("Lead Added Successfully");
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getDashboardCount],
          });
          navigate("allLead");
        }
      } catch (err) {
        toast.error(err?.response?.data || err);
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
    if (!data?.assign?._id) return; // koi assign hi nahi hai to kuch mat karo

    let srManager = "";
    team?.forEach((tm: any) => {
      if (tm.srManager?._id === data?.assign?._id) {
        srManager = tm.srManager?._id;
      } else if (tm.manager?._id === data?.assign?._id) {
        srManager = tm.srManager?._id;
      } else if (tm?.assistantManager?._id === data?.assign?._id) {
        srManager = tm.srManager?._id;
      } else if (tm?.teamLead?._id === data?.assign?._id) {
        srManager = tm.srManager?._id;
      } else if (tm?.agents && tm?.agents?.length > 0) {
        tm.agents.forEach((ag: any) => {
          if (ag._id === data?.assign?._id) {
            srManager = tm.srManager?._id;
          }
        });
      }
    });

    if (srManager) {
      setFieldValue("srManager", srManager);
    }
  }, [!!data, team]);

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
        <CustomText style={styles.errorText}>{errors.name}</CustomText>
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
        <CustomText style={styles.errorText}>{errors.clientName}</CustomText>
      )}
      <CustomText
        style={{ fontSize: 16, fontWeight: 500, color: color.mainTxtColor }}
      >
        Client Mobile Number
      </CustomText>
      <MobileInput
        value={values.clientMobile} // ✅ default 971
        onChange={(a) => {
          const { countryCode, phone } = parseMobile(a);
          lastMobileRef.current = { countryCode, phone }; // 👈 latest value track karo

          setFieldValue(
            "clientMobile",
            countryCode ? `${countryCode}-${phone}` : phone, // 👈 dash add kiya (bug fix)
          );

          if (mobileDebounceRef.current) {
            clearTimeout(mobileDebounceRef.current);
          }
          // console.log("MOBILE INPUT =>", a);
          // console.log("PARSED =>", { countryCode, phone });
          mobileDebounceRef.current = setTimeout(() => {
            if (!isWhatsappManuallyEdited && phone.length >= 8 && countryCode) {
              const whatsappValue = `+${countryCode}${phone}`;
              setFieldValue("whatsapp", whatsappValue);
            }
          }, 600);
        }}
        onBlur={() => {
          // 👇 Field se bahar jaate hi turant whatsapp number fill karo
          if (mobileDebounceRef.current) {
            clearTimeout(mobileDebounceRef.current);
          }
          const { countryCode, phone } = lastMobileRef.current;
          if (!isWhatsappManuallyEdited && phone) {
            const whatsappValue = countryCode
              ? `+${countryCode}${phone}`
              : phone;
            setFieldValue("whatsapp", whatsappValue);
          }
        }}
      />

      {errors.clientMobile && touched.clientMobile && (
        <CustomText style={styles.errorText}>{errors.clientMobile}</CustomText>
      )}
      <CustomInput
        label="Client Email"
        placeholder="Client Email"
        containerStyle={{ marginBottom: 15 }}
        onChangeText={handleChange("clientEmail")}
        value={values?.clientEmail}
        onBlur={handleBlur("clientEmail")}
        props={{
          autoCapitalize: "none",
          autoCorrect: false,
        }}
      />
      {errors.clientEmail && touched.clientEmail && (
        <CustomText style={styles.errorText}>{errors.clientEmail}</CustomText>
      )}

      {/* <DropdownRNE
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
        disabled={!data}
      />
      {errors.type && touched.type && (
        <CustomText style={styles.errorText}>{errors.type}</CustomText>
      )} */}
      <CustomText
        fontSize={16}
        fontWeight="500"
        marginBottom={6}
        color={color.mainTxtColor}
      >
        WhatsApp number
        <CustomText
          fontSize={12}
          fontWeight="400"
          color={color.mainTxtColor}
        >{`  (with country code)`}</CustomText>
      </CustomText>
      <CustomInput
        label=""
        placeholder="eg: +9719878765789"
        containerStyle={{ marginBottom: 15 }}
        value={values?.whatsapp}
        onChangeText={(text) => {
          // console.log("✏️ WhatsApp manual edit:", text);
          setIsWhatsappManuallyEdited(true);
          setSelectAll(false);
          handleChange("whatsapp")(text);
        }}
        onBlur={() => {
          setSelectAll(false);
          handleBlur("whatsapp");
        }}
        props={{
          selection: selectAll
            ? { start: 0, end: values?.whatsapp?.length || 0 }
            : undefined,
          onFocus: () => {
            if (!selectAll && values?.whatsapp) {
              setSelectAll(true);
            }
          },
        }}
      />

      {errors.whatsapp && touched.whatsapp && (
        <CustomText style={styles.errorText}>{errors.whatsapp}</CustomText>
      )}

      {user?.isAdmin && (
        <DropdownRNE
          arrOfObj={assignUsersData?.data || []}
          keyValueShowInBox="label"
          keyValueGetOnSelect="_id"
          label={"Assign To"}
          containerStyle={{ marginBottom: 15 }}
          placeholder="Select User"
          onChange={(a) => setFieldValue("srManager", a)}
          dropdownPosition="top"
          initialValue={values?.srManager}
          isLoading={isAssignUsersLoading}
          isSearch
        />
      )}
      {user?.isAdmin && errors.srManager && touched.srManager && (
        <CustomText style={styles.errorText}>{errors.srManager}</CustomText>
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
