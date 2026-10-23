import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AppState } from "react-native";
import PopupModal from "./PopupModal";
import { navigationRef } from "../../navigation/navigationRef";
import { socket } from "../../screens/Dashboard/Dashboard";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { callUiGate } from "../../utils/callUiGate";

// Give native call/alert/modal windows time to finish dismissing.
const MODAL_SETTLE_MS = 500;

const GlobalPopupManager = () => {
  const { user } = useSelector(selectUser);
  const userId = user?._id;
  const [queue, setQueue] = useState<any[]>([]);
  const current = queue[0];
  const [isForeground, setIsForeground] = useState(AppState.currentState === "active");
  const callUiBlocked = useSyncExternalStore(callUiGate.subscribe, callUiGate.getSnapshot);
  const [isPaused, setIsPaused] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpeningLeadRef = useRef(false);

  const canPresent = Boolean(userId && current && isForeground && !callUiBlocked && !isPaused);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setIsForeground(state === "active");
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setIsSettled(false);
    if (!canPresent) return;
    const timeout = setTimeout(() => setIsSettled(true), MODAL_SETTLE_MS);
    return () => clearTimeout(timeout);
  }, [canPresent, current?._id]);

  useEffect(() => {
    setQueue([]);
    setIsPaused(false);
    setIsSettled(false);
    isOpeningLeadRef.current = false;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    if (!userId) return;
    const handleReminderDue = (data: any) => {
      if (!data?._id) return;
      setQueue((previous) => previous.some((item) => item._id === data._id)
        ? previous : [...previous, data]);
    };
    socket.on("reminder:due", handleReminderDue);
    return () => { socket.off("reminder:due", handleReminderDue); };
  }, [userId]);

  useEffect(() => navigationRef.addListener("state", () => {
    if (!isOpeningLeadRef.current && navigationRef.getCurrentRoute()?.name !== "LeadsDetails") {
      setIsPaused(false);
    }
  }), []);

  useEffect(() => () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
  }, []);

  const pauseReminders = (duration: number) => {
    setIsPaused(true);
    setIsSettled(false);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      pauseTimeoutRef.current = null;
      setIsPaused(false);
    }, duration);
  };

  const handleOpenLead = () => {
    const leadId = current?.leadId?._id || current?.leadId;
    if (!leadId || !navigationRef.isReady() || isOpeningLeadRef.current) return;
    isOpeningLeadRef.current = true;
    pauseReminders(15000);
    const reminderId = current._id;
    // Dismiss the reminder before changing the underlying navigation.
    navigationTimeoutRef.current = setTimeout(() => {
      navigationTimeoutRef.current = null;
      try {
        if (navigationRef.isReady() && AppState.currentState === "active" && !callUiGate.getSnapshot()) {
          (navigationRef as any).navigate("Dashboard", {
            screen: "allLead2",
            params: { screen: "LeadsDetails", params: { item: { _id: leadId } } },
          });
          setQueue((previous) => previous.filter((item) => item._id !== reminderId));
        } else {
          setIsPaused(false);
        }
      } catch (error) {
        console.error("Unable to open reminder lead", error);
        setIsPaused(false);
      } finally {
        isOpeningLeadRef.current = false;
      }
    }, MODAL_SETTLE_MS);
  };

  const handleIgnore = () => {
    if (!current) return;
    pauseReminders(MODAL_SETTLE_MS);
    const reminderId = current._id;
    setQueue((previous) => previous.filter((item) => item._id !== reminderId));
  };

  // Hidden/queued reminders do not install a hardware-back handler.
  if (!canPresent || !isSettled) return null;
  return <PopupModal visible title={current.title || ""} message={current.message || ""}
    loading={false} onOpen={handleOpenLead} onIgnore={handleIgnore} />;
};

export default GlobalPopupManager;
