import { Text, View } from "react-native";
import React, { useRef, useState } from "react";
import { bookingCommand, bookingError, refreshBookingQueries } from "../../../utils/bookingWorkflow";
import { useAppToast } from "../../../components/AppToast";
import CustomBtn from "../../../myComponents/CustomBtn/CustomBtn";
import CustomModal from "../../../myComponents/CustomModal/CustomModal";
import DropdownRNE from "../../../myComponents/DropdownRNE/DropdownRNE";
import useModal from "../../../hooks/useModal";
import { useFormik } from "formik";
import { axiosInstance } from "../../../services/authApi/axiosInstance";
import * as Yup from "yup";
import { myConsole } from "../../../hooks/useConsole";
import { popUpConfToast } from "../../../utils/toastModalByFunction";
import { useQueryClient } from "@tanstack/react-query";

const Payout = ({ id, expectedVersion }: { id: string; expectedVersion: number }) => {
  const commands = useRef({});
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useAppToast();
  const modal = useModal();
  const queryClient = useQueryClient();
  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: {
      paymentStatus: "",
    },
    onSubmit: async (v) => {
      setErrorMessage("");
      try {
        let res = await axiosInstance.post(
          `/api/booking/updatePayment/${id}`,
          bookingCommand(commands.current, "payment", { ...v, expectedVersion }),
        );
        queryClient.invalidateQueries({
          queryKey: ["getBookingById", id],
        });
        queryClient.invalidateQueries({
          queryKey: ["getBooking"],
        });
        refreshBookingQueries(queryClient);
        toast.success(res?.data?.message || "Payment updated.");
        modal.closeModal();
      } catch (error) {
        setErrorMessage(bookingError(error));
        refreshBookingQueries(queryClient);
      }
    },
  });
  return (
    <View>
      <CustomBtn
        title="Payout"
        onPress={modal.openModal}
        containerStyle={{
          backgroundColor: "gray",
          width: 200,
          alignSelf: "center",
          marginBottom: 70,
          marginTop: 20,
        }}
      />
      <CustomModal
        visible={modal.visible}
        hasBackdrop={true}
        onClose={modal.closeModal}
      >
        <View
          style={{
            width: 300,
            backgroundColor: "white",
            borderRadius: 8,
            padding: 20,
          }}
        >
          {!!errorMessage && <Text style={{ color: "#BE123C", marginBottom: 12 }}>{errorMessage}</Text>}
          <DropdownRNE
            label="Payment Update"
            arrOfObj={[
              { _id: "pending", name: "Pending" },
              { _id: "received", name: "Received" },
              { _id: "not_received", name: "Not Received" },
            ]}
            onChange={(v) => {
              formik.setFieldValue("paymentStatus", v);
            }}
            error={formik.errors.paymentStatus}
          />
          <View
            style={{
              flexDirection: "row",
              gap: 20,
              marginTop: 30,
              justifyContent: "center",
            }}
          >
            <CustomBtn
              title="Save"
              textStyle={{ fontSize: 14 }}
              containerStyle={{ width: 100 }}
              isLoading={formik.isSubmitting}
              onPress={formik.handleSubmit}
            />
            <CustomBtn
              title="Close"
              textStyle={{ fontSize: 14 }}
              containerStyle={{ width: 100, backgroundColor: "red" }}
              onPress={modal.closeModal}
            />
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

export default Payout;

const validationSchema = Yup.object().shape({
  paymentStatus: Yup.string().required("paymentStatus is required"), // Add custom message
});
