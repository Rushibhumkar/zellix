import { axiosInstance } from "../authApi/axiosInstance";

interface TSendNotification {
  leadId: string;
  message: string;
}

export const sendFollowUpNotification = (data: TSendNotification) =>
  axiosInstance.post("/api/lead/notification", data).then((res) => res?.data);
