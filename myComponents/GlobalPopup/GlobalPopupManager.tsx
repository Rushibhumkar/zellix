import React, { useEffect, useMemo, useState } from "react";
import { BackHandler } from "react-native";
import PopupModal from "./PopupModal";
import {
  useGetUserReminders,
  useMarkReminderAsRead,
} from "../../services/remainderPopup/remainderPopupApi";

const GlobalPopupManager = () => {
  const { data, isFetching } = useGetUserReminders();
  const { mutateAsync: markAsRead, isPending } = useMarkReminderAsRead();

  const [queue, setQueue] = useState<any[]>([]);
  const [current, setCurrent] = useState<any | null>(null);

  /* 🔒 Disable back button when popup is visible */
  useEffect(() => {
    if (!current) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );

    return () => backHandler.remove();
  }, [current]);

  /* 📥 Sync API data into queue */
  useEffect(() => {
    if (!data?.data || !Array.isArray(data.data)) return;

    const unread = data.data.filter((item: any) => !item.isRead);

    if (unread.length > 0) {
      setQueue(unread);
      setCurrent(unread[0]);
    } else {
      setQueue([]);
      setCurrent(null);
    }
  }, [data]);

  /* 📌 Read button handler */
  const handleRead = async () => {
    if (!current?._id || isPending) return;

    try {
      await markAsRead(current._id);

      setQueue((prev) => {
        const remaining = prev.slice(1);
        setCurrent(remaining.length > 0 ? remaining[0] : null);
        return remaining;
      });
    } catch (e) {
      // popup must stay if API fails
      console.log("Mark read failed", e);
    }
  };

  if (!current) return null;

  return (
    <PopupModal
      visible={true}
      title={current.title}
      message={current.message}
      loading={isPending || isFetching}
      onRead={handleRead}
    />
  );
};

export default GlobalPopupManager;
