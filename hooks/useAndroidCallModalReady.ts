import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

// A native Android dialog must not be presented during dialer/activity resume.
// Keep requested popup state intact, but mount it only on a stable focused host.
export function useAndroidCallModalReady(focused: boolean) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = (state: string) => {
      if (timer) clearTimeout(timer);
      setReady(false);
      if (focused && state === "active") timer = setTimeout(() => {
        timer = undefined;
        if (AppState.currentState === "active") setReady(true);
      }, 500);
    };
    update(AppState.currentState);
    const subscription = AppState.addEventListener("change", update);
    return () => { if (timer) clearTimeout(timer); subscription.remove(); };
  }, [focused]);
  return Platform.OS !== "android" || (focused && ready);
}
