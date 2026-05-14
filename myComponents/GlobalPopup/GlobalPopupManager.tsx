import React, { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import PopupModal from "./PopupModal";
import { navigationRef } from "../../navigation/navigationRef";
import { socket } from "../../screens/Dashboard/Dashboard";
import { CommonActions } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";

const GlobalPopupManager = () => {
  const reduxUser = useSelector(selectUser);

  const pauseTimeoutRef = React.useRef<any>(null);

  const [queue, setQueue] = useState<any[]>([]);
  const [current, setCurrent] = useState<any | null>(null);

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!current) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => backHandler.remove();
  }, [current]);

  useEffect(() => {
    if (!socket) return;

    const handleReminderDue = (data: any) => {
      console.log("🔥 reminder:due socket data =>", data);

      setQueue((prev) => {
        const updated = [...prev, data];

        if (!current) {
          setCurrent(updated[0]);
        }

        return updated;
      });
    };

    // const handleReminderCompleted = (data: any) => {
    //   console.log("✅ reminder:completed socket data =>", data);

    //   if (current?._id === data?._id) {
    //     setCurrent(null);
    //   }
    // };

    socket.on("reminder:due", handleReminderDue);

    // socket.on("reminder:completed", handleReminderCompleted);

    return () => {
      socket.off("reminder:due", handleReminderDue);

      // socket.off("reminder:completed", handleReminderCompleted);
    };
  }, [current]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("🟢 SOCKET CONNECTED =>", socket.id);

      console.log("🟢 SOCKET AUTH USER =>", reduxUser?.user?._id);

      socket.onAny((event, ...args) => {
        console.log("📡 SOCKET EVENT =>", event, args);
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected");
    });

    return () => {
      socket.off("connect");

      socket.off("disconnect");
    };
  }, [reduxUser?.user?._id]);

  const startPause = (duration = 15000) => {
    setIsPaused(true);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, duration);
  };

  const handleOpenLead = async () => {
    if (!current?.leadId) return;

    try {
      startPause(15000);

      if (navigationRef.isReady()) {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "allLead2",
                state: {
                  index: 1,
                  routes: [
                    { name: "allLead" },
                    {
                      name: "LeadsDetails",
                      params: {
                        item: {
                          _id: current?.leadId?._id || current?.leadId,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          }),
        );
      }

      setQueue((prev) => {
        const remaining = prev.filter((item) => item?._id !== current?._id);

        setCurrent(remaining.length > 0 ? remaining[0] : null);

        return remaining;
      });
    } catch (e) {
      console.log("Open lead failed", e);
    }
  };

  const handleIgnore = () => {
    setQueue((prev) => {
      const remaining = prev.filter((item) => item?._id !== current?._id);

      setCurrent(remaining.length > 0 ? remaining[0] : null);

      return remaining;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const route = navigationRef.getCurrentRoute();

      if (route?.name !== "LeadsDetails") {
        setIsPaused(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  if (!current || isPaused) return null;

  return (
    <PopupModal
      visible={true}
      title={current?.title || ""}
      message={current?.message || ""}
      loading={false}
      onOpen={handleOpenLead}
      onIgnore={handleIgnore}
    />
  );
};

export default GlobalPopupManager;
