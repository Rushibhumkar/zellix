import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  TPinnedItem,
  TPinnedModule,
  getPinnedItems,
  pinItem,
  unpinItem,
} from "../utils/pinnedItemsStorage";

export const usePinnedItems = (module: TPinnedModule) => {
  const [pinnedItems, setPinnedItems] = useState<TPinnedItem[]>([]);

  const refreshPinned = useCallback(async () => {
    const items = await getPinnedItems(module);
    setPinnedItems(items);
  }, [module]);

  useEffect(() => {
    refreshPinned();
  }, [refreshPinned]);

  useFocusEffect(
    useCallback(() => {
      refreshPinned();
    }, [refreshPinned]),
  );

  const isPinned = useCallback(
    (id: string) => pinnedItems.some((p) => p.id === id),
    [pinnedItems],
  );

  const pin = useCallback(
    async (item: { id: string; title: string; subtitle?: string }) => {
      const res = await pinItem(module, item);
      if (res.ok) {
        await refreshPinned();
      }
      return res;
    },
    [module, refreshPinned],
  );

  const unpin = useCallback(
    async (id: string) => {
      await unpinItem(module, id);
      await refreshPinned();
    },
    [module, refreshPinned],
  );

  const togglePin = useCallback(
    async (item: { id: string; title: string; subtitle?: string }) => {
      if (isPinned(item.id)) {
        await unpin(item.id);
        return { ok: true as const, action: "unpinned" as const };
      }
      const res = await pin(item);
      return { ...res, action: "pinned" as const };
    },
    [isPinned, pin, unpin],
  );

  return { pinnedItems, refreshPinned, isPinned, pin, unpin, togglePin };
};

export default usePinnedItems;
