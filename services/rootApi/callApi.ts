import { axiosInstance } from "../authApi/axiosInstance";
import { myConsole } from "../../hooks/useConsole";

export const initiateCall = async ({ leadId }: { leadId: string }) => {
  try {
    if (!leadId) {
      throw new Error("Lead ID is required");
    }

    const res = await axiosInstance.post("/api/call", {
      leadId,
    });

    return res?.data;
  } catch (err: any) {
    myConsole("initiateCallErr", err?.response?.data || err);

    throw err?.response?.data || new Error("Call API failed");
  }
};
