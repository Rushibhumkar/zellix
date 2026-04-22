import React, { useEffect, useMemo, useState } from "react";
import { BackHandler } from "react-native";
import PopupModal from "./PopupModal";
import {
  useGetUserReminders,
  useMarkReminderAsRead,
} from "../../services/remainderPopup/remainderPopupApi";
import { myConsole } from "../../hooks/useConsole";
import { navigationRef } from "../../navigation/navigationRef";
import { markReminderAsCompleted } from "../../services/rootApi/remaindersApi";
import { socket } from "../../screens/Dashboard/Dashboard";

const GlobalPopupManager = () => {
  const { data, isFetching } = useGetUserReminders();
  const { mutateAsync: markAsRead, isPending } = useMarkReminderAsRead();

  const [queue, setQueue] = useState<any[]>([]);
  const [current, setCurrent] = useState<any | null>(null);
  // myConsole("current", current);

  useEffect(() => {
    if (!current) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
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

  useEffect(() => {
    if (!socket) return;

    const handleReminderDue = (data: any) => {
      // ✅ add new reminder to queue
      console.log("🔥 reminder:due socket data =>", data);
      if (!data?.isRead) {
        setQueue((prev) => {
          const updated = [...prev, data];
          if (!current) setCurrent(updated[0]);
          return updated;
        });
      }
    };

    const handleReminderCompleted = (data: any) => {
      console.log("✅ reminder:completed socket data =>", data);
      // ✅ remove completed reminder
      setQueue((prev) => {
        const filtered = prev.filter((item) => item._id !== data?._id);
        setCurrent(filtered.length > 0 ? filtered[0] : null);
        return filtered;
      });
    };

    socket.on("reminder:due", handleReminderDue);
    socket.on("reminder:completed", handleReminderCompleted);

    return () => {
      socket.off("reminder:due", handleReminderDue);
      socket.off("reminder:completed", handleReminderCompleted);
    };
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Socket Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected");
    });
  }, []);

  const handleOpenLead = async () => {
    if (!current?.leadId) return;

    try {
      // ✅ mark as completed before navigation
      await markReminderAsCompleted(current._id);

      if (navigationRef.isReady()) {
        navigationRef.navigate("allLead2", {
          screen: "LeadsDetails",
          params: {
            item: { _id: current.leadId },
          },
        });
      }

      // ✅ remove from queue after success
      setQueue((prev) => {
        const remaining = prev.slice(1);
        setCurrent(remaining.length > 0 ? remaining[0] : null);
        return remaining;
      });
    } catch (e) {
      console.log("Mark completed failed", e);
    }
  };

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
  // myConsole("currenttt", current);
  if (!current) return null;

  return (
    <PopupModal
      visible={true}
      title={current.title}
      message={current.message}
      loading={isPending || isFetching}
      onRead={handleRead}
      onOpen={handleOpenLead}
    />
  );
};

export default GlobalPopupManager;
