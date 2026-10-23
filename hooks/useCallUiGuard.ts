import { useCallback, useLayoutEffect, useRef } from "react";
import { callUiGate } from "../utils/callUiGate";

export const useCallUiGuard = (hasVisibleCallUi: boolean) => {
  const callLease = useRef<(() => void) | null>(null);
  const mounted = useRef(true);
  const beginCallUi = useCallback(() => {
    if (mounted.current && !callLease.current) callLease.current = callUiGate.acquire();
  }, []);
  const endCallUi = useCallback(() => {
    callLease.current?.();
    callLease.current = null;
  }, []);

  useLayoutEffect(() => {
    if (hasVisibleCallUi) return callUiGate.acquire();
  }, [hasVisibleCallUi]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      endCallUi();
    };
  }, [endCallUi]);
  return { beginCallUi, endCallUi };
};
