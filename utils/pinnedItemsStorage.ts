import { getData, storeData } from "../hooks/useAsyncStorage";

export type TPinnedModule = "lead" | "meeting" | "booking";

export interface TPinnedItem {
  id: string;
  title: string;
  subtitle?: string;
  pinnedAt: string;
}

export const PINNED_LIMIT = 5;
export const PINNED_EXPIRY_DAYS = 15;

const STORAGE_KEY: Record<TPinnedModule, string> = {
  lead: "PINNED_LEADS_V1",
  meeting: "PINNED_MEETINGS_V1",
  booking: "PINNED_BOOKINGS_V1",
};

type TPinnedMap = Record<string, TPinnedItem>;

const isExpired = (pinnedAt: string) => {
  const pinnedTime = new Date(pinnedAt).getTime();
  const expiryMs = PINNED_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - pinnedTime > expiryMs;
};

const readMap = async (module: TPinnedModule): Promise<TPinnedMap> => {
  try {
    const raw = await getData(STORAGE_KEY[module]);
    return raw ? (JSON.parse(raw) as TPinnedMap) : {};
  } catch {
    return {};
  }
};

// Full overwrite (not storeDataJson's shallow merge) — required so unpinning
// or expiring an item actually removes its key from storage instead of
// leaving it merged back in on the next write.
const writeMap = async (module: TPinnedModule, map: TPinnedMap) => {
  await storeData(STORAGE_KEY[module], JSON.stringify(map));
};

/**
 * Reads pinned items for a module, drops any older than PINNED_EXPIRY_DAYS,
 * persists the cleaned-up map back (lazy self-expiry, no cron needed), and
 * returns the remaining items sorted newest-pinned-first.
 */
export const getPinnedItems = async (
  module: TPinnedModule,
): Promise<TPinnedItem[]> => {
  const map = await readMap(module);
  const entries = Object.values(map || {});
  const valid = entries.filter((item) => !isExpired(item.pinnedAt));

  if (valid.length !== entries.length) {
    const cleaned: TPinnedMap = {};
    valid.forEach((item) => {
      cleaned[item.id] = item;
    });
    await writeMap(module, cleaned);
  }

  return valid.sort(
    (a, b) => new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime(),
  );
};

export const pinItem = async (
  module: TPinnedModule,
  item: { id: string; title: string; subtitle?: string },
): Promise<{ ok: true } | { ok: false; reason: "limit" }> => {
  const current = await getPinnedItems(module);

  if (!current.some((p) => p.id === item.id) && current.length >= PINNED_LIMIT) {
    return { ok: false, reason: "limit" };
  }

  const map: TPinnedMap = {};
  current.forEach((p) => {
    map[p.id] = p;
  });
  map[item.id] = {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    pinnedAt: new Date().toISOString(),
  };

  await writeMap(module, map);
  return { ok: true };
};

export const unpinItem = async (
  module: TPinnedModule,
  id: string,
): Promise<void> => {
  const current = await getPinnedItems(module);
  const map: TPinnedMap = {};
  current
    .filter((p) => p.id !== id)
    .forEach((p) => {
      map[p.id] = p;
    });
  await writeMap(module, map);
};
