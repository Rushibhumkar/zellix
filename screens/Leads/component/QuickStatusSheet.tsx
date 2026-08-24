import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import { useQueryClient } from "@tanstack/react-query";
import ModalWithBlur from "../../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import CustomModal from "../../../myComponents/CustomModal/CustomModal";
import DropdownRNE from "../../../myComponents/DropdownRNE/DropdownRNE";
import CustomInput from "../../../myComponents/CustomInput/CustomInput";
import CustomBtn from "../../../myComponents/CustomBtn/CustomBtn";
import CustomText from "../../../myComponents/CustomText/CustomText";
import MainTitle from "../../../myComponents/MainTitle/MainTitle";
import DatePickerExpo from "../../../myComponents/DatePickerExpo/DatePickerExpo";
import useModal from "../../../hooks/useModal";
import { useAppToast } from "../../../components/AppToast";
import { leadStatusUpdate } from "../../../services/rootApi/leadApi";
import {
  FOLLOWUP_REQUIRED_STATUSES,
  inLeadStatus,
  NOTE_REQUIRED_STATUSES,
} from "../../../utils/data";
import { queryKeyCRM } from "../../../utils/queryKeys";
import { color } from "../../../const/color";

interface TQuickStatusSheet {
  visible: boolean;
  leadId: string | null;
  initialStatus?: string;
  selectLeadType: string;
  onClose: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

const filteredLeadStatus = inLeadStatus
  .filter((s) => s._id !== "assign" && s._id !== "re_assigned")
  .sort((a, b) => a.name.localeCompare(b.name));

const formatDateTime = (date: any, time: any) => {
  if (!date || !time) return "";
  return `${moment(date).format("DD MMM YYYY")}, ${moment(time).format("hh:mm A")}`;
};

const combineDateAndTime = (dateStr: any, timeStr: any) => {
  const date = moment(dateStr);
  const time = moment(timeStr);
  return date
    .set({
      hour: time.get("hour"),
      minute: time.get("minute"),
      second: 0,
      millisecond: 0,
    })
    .toISOString();
};

const roundToNext5Min = (date: Date) => {
  const d = new Date(date);
  const minutes = d.getMinutes();
  const remainder = minutes % 5;
  if (remainder !== 0) {
    d.setMinutes(minutes + (5 - remainder));
  }
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

const QuickStatusSheet = ({
  visible,
  leadId,
  initialStatus,
  selectLeadType,
  onClose,
  isPinned,
  onTogglePin,
}: TQuickStatusSheet) => {
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const FUTModal = useModal();

  const [status, setStatus] = useState(initialStatus || "");
  const [note, setNote] = useState("");
  const [tdForFUT, setTdForFUT] = useState<{ date: any; time: any }>({
    date: null,
    time: null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setStatus(initialStatus || "");
      setNote("");
      setTdForFUT({ date: null, time: null });
    }
  }, [visible, initialStatus]);

  const isFUTSubmitDisabled = !tdForFUT?.date || !tdForFUT?.time;

  const handleClose = () => {
    FUTModal.closeModal();
    onClose();
  };

  const handleSubmit = async () => {
    if (!status) {
      toast.error("Please select status.");
      return;
    }

    if (selectLeadType !== "calling_data") {
      if (NOTE_REQUIRED_STATUSES.includes(status) && !note.trim()) {
        toast.error("Note is required for this status.");
        return;
      }
      if (
        FOLLOWUP_REQUIRED_STATUSES.includes(status) &&
        (!tdForFUT?.date || !tdForFUT?.time)
      ) {
        toast.error("Follow up time is required for this status.");
        return;
      }
    }

    try {
      setSubmitLoading(true);

      const payload = {
        status,
        ...(note.trim() && { note: note.trim() }),
        ...(tdForFUT?.date &&
          tdForFUT?.time && {
            followUpTime: combineDateAndTime(tdForFUT.date, tdForFUT.time),
          }),
      };

      const res = await leadStatusUpdate({ id: leadId, data: payload });

      toast.success(res?.data?.message || "Status updated successfully");

      queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getLead] });
      queryClient.invalidateQueries({ queryKey: ["all-reminders"] });

      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <ModalWithBlur visible={visible} onClose={handleClose} minHeight="55%">
      <View style={{ paddingBottom: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <CustomText
            style={{ fontSize: 18, fontWeight: "600", color: color.mainTxtColor }}
          >
            Change Status
          </CustomText>

          {!!onTogglePin && (
            <TouchableOpacity
              onPress={onTogglePin}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
            >
              <MaterialIcons
                name={isPinned ? "bookmark" : "bookmark-border"}
                size={20}
                color={isPinned ? "#F2A93B" : color.borderColor}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginTop: 16 }}>
          <DropdownRNE
            placeholder="Select Status"
            arrOfObj={filteredLeadStatus}
            keyValueGetOnSelect="_id"
            keyValueShowInBox="name"
            initialValue={status}
            onChange={(v: any) => setStatus(v)}
            mode="auto"
            dropdownStyle={{ height: 45 }}
            disabledItems={["claimed", "assign", "re_assigned"]}
          />
        </View>

        {!!status && status !== "claimed" && (
          <>
            <View style={{ marginTop: 15 }}>
              <CustomText style={{ fontSize: 16, fontWeight: "500", color: color.mainTxtColor }}>
                Follow Up Time{" "}
                {FOLLOWUP_REQUIRED_STATUSES.includes(status) && (
                  <CustomText style={{ color: "red" }}> *</CustomText>
                )}
              </CustomText>

              <TouchableOpacity
                onPress={() => FUTModal.openModal()}
                style={{
                  borderWidth: 1,
                  borderColor: color.borderColor,
                  borderRadius: 12,
                  padding: 12,
                  marginTop: 6,
                }}
              >
                <CustomText style={{ color: color.mainTxtColor }}>
                  {tdForFUT?.date && tdForFUT?.time
                    ? formatDateTime(tdForFUT.date, tdForFUT.time)
                    : "Select Date & Time"}
                </CustomText>
              </TouchableOpacity>
            </View>

            <CustomInput
              label={
                <>
                  Notes
                  {NOTE_REQUIRED_STATUSES.includes(status) && (
                    <CustomText style={{ color: "red" }}> *</CustomText>
                  )}
                </>
              }
              value={note}
              onChangeText={setNote}
              placeholder="Add note"
              multiline
              numberOfLines={3}
              marginBottom={10}
              containerStyle={{ marginTop: 8 }}
              inputStyle={{ height: 140 }}
            />

            <CustomModal visible={FUTModal.visible} onClose={FUTModal.closeModal} hasBackdrop>
              <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
                <MainTitle title="Select Date and Time" />
                <View style={{ height: 15 }} />
                <DatePickerExpo
                  title="Date"
                  minimumDate={new Date()}
                  boxContainerStyle={{ marginBottom: 15 }}
                  onSelect={(v) =>
                    setTdForFUT((prev) => ({ ...prev, date: v || null }))
                  }
                  initialValue={tdForFUT.date}
                />
                <DatePickerExpo
                  title="Time"
                  mode="time"
                  minuteInterval={5}
                  minimumDate={
                    moment(tdForFUT.date).isSame(new Date(), "day")
                      ? new Date()
                      : undefined
                  }
                  boxContainerStyle={{ marginBottom: 20 }}
                  onSelect={(v) =>
                    setTdForFUT((prev) => ({
                      ...prev,
                      time: v ? roundToNext5Min(new Date(v)) : null,
                    }))
                  }
                  initialValue={tdForFUT.time}
                />
                <CustomBtn
                  title="Submit"
                  containerStyle={{ marginBottom: 20, marginTop: 20 }}
                  onPress={() => FUTModal.closeModal()}
                  textStyle={{ fontSize: 14 }}
                  disabled={isFUTSubmitDisabled}
                />
              </View>
            </CustomModal>
          </>
        )}

        <CustomBtn
          title="Update Status"
          containerStyle={{ marginTop: 20 }}
          onPress={handleSubmit}
          isLoading={submitLoading}
          disabled={submitLoading}
        />
      </View>
    </ModalWithBlur>
  );
};

export default QuickStatusSheet;
