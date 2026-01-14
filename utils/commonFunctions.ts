export const checkPermission = (perm, module, task, userRole) => {
  return userRole === "sup_admin" || perm[module]?.[task]?.value === true;
};

export const formatCount = (value?: number | string): string => {
  try {
    if (value === null || value === undefined || value === "") return "0";

    // Convert to number safely
    const num = Number(value);
    if (isNaN(num)) return "0";

    // Format ranges
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;

    // For smaller numbers
    return num.toString();
  } catch (error) {
    console.error("Error formatting count:", error);
    return "0";
  }
};

export function truncateString(value, length = 18) {
  if (typeof value !== "string") value = String(value);
  if (value.length <= length) return value;
  return value.slice(0, length - 3) + "...";
}

type DateFormat =
  | "dd/mm/yyyy"
  | "dd/mm/yyyy hh:MM"
  | "dd-mm-yyyy hh:MM"
  | "yyyy-mm-dd"
  | "dd Mon yyyy"
  | "dd Mon yyyy hh:MM"
  | string;

export function formatDate(
  dateString: string,
  format: DateFormat = "dd/mm/yyyy"
): string {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  const pad = (n: number) => n.toString().padStart(2, "0");

  const map: Record<string, string> = {
    dd: pad(date.getDate()),
    mm: pad(date.getMonth() + 1),
    yyyy: date.getFullYear().toString(),
    yy: date.getFullYear().toString().slice(-2),
    hh: pad(date.getHours()),
    MM: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    Mon: date.toLocaleString("en-US", { month: "short" }),
  };

  let result = format;

  Object.keys(map).forEach((token) => {
    result = result.replace(new RegExp(token, "g"), map[token]);
  });

  return result;
}
