import React, { useRef, useState } from "react";
import { Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../services/authApi/axiosInstance";
import { bookingCommand, bookingError, refreshBookingQueries } from "../../../utils/bookingWorkflow";
import CustomBtn from "../../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../../myComponents/CustomInput/CustomInput";
export default function BookingReview({
  booking,
  role,
  canUpdate,
  canFinance,
  canApprove
}: {
  booking: any;
  role: string;
  canUpdate: boolean;
  canFinance: boolean;
  canApprove: boolean;
}) {
  const client = useQueryClient();
  const commands = useRef({});
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  if (!booking) return null;
  const admin = ["sup_admin", "sub_admin", "developer"].includes(role);
  const pending = booking.pendingRevision;
  const failed = booking.processing?.filter((job: any) => job.status === "failed") || [];
  if (!pending && !failed.length && booking.status !== "rejected") return null;
  async function command(action: string) {
    if (busy) return;
    setBusy(action);
    setMessage("");
    try {
      const {
        data
      } = await axiosInstance.post(`/api/booking/${action}/${booking._id}`, bookingCommand(commands.current, action, {
        expectedVersion: booking.__v ?? 0,
        reason,
        remarks: reason,
        ...(pending && {
          revisionId: pending._id
        })
      }));
      setMessage(data.message || "Booking updated.");
      refreshBookingQueries(client);
    } catch (error) {
      setMessage(bookingError(error));
      refreshBookingQueries(client);
    } finally {
      setBusy("");
    }
  }
  return <View style={{
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12
  }}>
      {pending && <>
        <Text style={{
        fontWeight: "700",
        color: "#92400E"
      }}>Changes awaiting reapproval</Text>
        <Text>{pending.reason}</Text>
        <Text>Approved values remain effective until reapproval.</Text>
        {Object.entries(pending.values || {}).filter(([key]) => JSON.stringify(booking[key]) !== JSON.stringify(pending.values[key])).map(([key, value]) => <View key={key} style={{
        gap: 4
      }}>
              <Text style={{
          fontWeight: "600"
        }}>{key.replace(/([A-Z])/g, " $1")}</Text>
              <Text>Current · {typeof booking[key] === "object" ? JSON.stringify(booking[key]) : String(booking[key] ?? "—")}</Text>
              <Text>Proposed · {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}</Text>
            </View>)}
      </>}
      {(pending || booking.status === "rejected") && <CustomInput label="Reason" value={reason} onChangeText={setReason} props={{
      editable: !busy
    }} />}
      {pending && canApprove && <>
        <CustomBtn title="Approve Correction" disabled={Boolean(busy)} isLoading={busy === "bookingApprovedById"} onPress={() => command("bookingApprovedById")} />
        <CustomBtn title="Reject Correction" disabled={Boolean(busy) || !reason.trim()} isLoading={busy === "bookingRejectedById"} onPress={() => command("bookingRejectedById")} />
      </>}
      {pending && admin && canFinance && <CustomBtn title="Record Finance Review" disabled={Boolean(busy) || !reason.trim()} isLoading={busy === "financeReview"} onPress={() => command("financeReview")} />}
      {booking.status === "rejected" && canUpdate && <CustomBtn title="Resubmit for Approval" disabled={Boolean(busy)} isLoading={busy === "resubmit"} onPress={() => command("resubmit")} />}
      {failed.length > 0 && <>
        <Text style={{
        fontWeight: "700",
        color: "#BE123C"
      }}>Processing needs attention</Text>
        {failed.map((job: any) => <Text key={job._id}>{job.kind} · {job.lastError || "Failed"}</Text>)}
        {admin && canUpdate && <CustomBtn title="Retry Processing" disabled={Boolean(busy)} isLoading={busy === "retryProcessing"} onPress={() => command("retryProcessing")} />}
      </>}
      {!!message && <Text accessibilityRole="alert">{message}</Text>}
    </View>;
}
