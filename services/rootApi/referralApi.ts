import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { axiosInstance } from "../authApi/axiosInstance";

export const addReferral = async (
  data: Record<string, any>,
  bookingId: string,
  type: string,
  toast: any
) => {
  try {
    const response = await axiosInstance.post(
      `/api/refferal/${bookingId}/${type}`,
      data
    );

    toast.success(response?.data?.message || "Referral added successfully");
    return response.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Internal Server Error";
    toast.error(msg);
    throw new Error(msg);
  }
};

// Get All Referrals
export const getAllReferrals = (toast) =>
  axiosInstance
    .get("/api/refferal")
    .then((res) => res?.data)
    .catch((err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to fetch referrals";
      toast.error(msg);
      throw new Error(msg);
    });

// Get Referral by ID
export const getReferralById = ({ id }: { id: string }, toast) =>
  axiosInstance
    .get(`/api/refferal/${id}`)
    .then((res) => res?.data)
    .catch((err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to fetch referral details";
      toast.error(msg);
      throw new Error(msg);
    });

export const deleteReferral = async ({ idArr }: { idArr: string[] }, toast) => {
  try {
    const response = await axiosInstance.post("/api/refferal/delete", {
      refferal_ids: idArr,
    });
    popUpConfToast.successMessage(
      response?.data?.message || "Referral(s) deleted"
    );
    return response?.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Failed to delete referrals";
    popUpConfToast.errorMessage(msg);
    throw new Error(msg);
  }
};

export const updateReferralStatus = async ({
  refferal_id,
  status,
}: {
  refferal_id: string;
  status: "Paid" | "UnPaid";
}) => {
  try {
    const response = await axiosInstance.post(
      `/api/refferal/update_status?refferal_id=${refferal_id}`,
      { Status: status }
    );
    popUpConfToast.successMessage(
      response?.data?.message || "Referral status updated"
    );
    return response.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Failed to update referral status";
    popUpConfToast.errorMessage(msg);
    throw new Error(msg);
  }
};
