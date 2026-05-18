import { useAppToast } from "../components/AppToast";

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
  format: DateFormat = "dd/mm/yyyy",
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

export const getTimeAgo = (dateString: any) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0) return "-";

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (diffInSeconds < 10) return "Just now";

  if (diffInSeconds < minute) return `${diffInSeconds} sec ago`;

  if (diffInSeconds < hour)
    return `${Math.floor(diffInSeconds / minute)} min ago`;

  if (diffInSeconds < day)
    return `${Math.floor(diffInSeconds / hour)} hour ago`;

  if (diffInSeconds < week) return `${Math.floor(diffInSeconds / day)} day ago`;

  if (diffInSeconds < month)
    return `${Math.floor(diffInSeconds / week)} week ago`;

  // 🔥 After 1 month → show full date
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

export const getInitials = (name = "") => {
  const words = name
    .trim()
    .split(/\s+/) // remove extra spaces
    .filter(Boolean);

  return words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : (words[0]?.[0] || "").toUpperCase();
};

export const getInitialsUsingTwoNames = (name = "", lastName = "") => {
  const fullName = `${name} ${lastName}`.trim();
  if (!fullName) return "";

  const words = fullName.split(/\s+/);

  const first = words[0][0].toUpperCase();
  const last = words.length > 1 ? words[words.length - 1][0].toUpperCase() : "";

  return first + last;
};

export const truncateText = (value: unknown, length: number = 8): string => {
  try {
    if (value === null || value === undefined) return "";

    // Convert safely to string
    const str = String(value);

    if (!str.trim()) return "";

    // Invalid length fallback
    if (!length || length <= 0) return str;

    // If already within limit
    if (str.length <= length) return str;

    // Truncate + add dots
    return str.slice(0, length) + "...";
  } catch (error) {
    console.error("truncateText error:", error);
    return "";
  }
};

// <----------------- foramt second common function ----------------->

// formatSeconds(182, "short")
// 3m 2s

// formatSeconds(182, "clock")
// 00:03:02

// formatSeconds(3782, "short")
// 1h 3m 2s

// formatSeconds(3782, "long")
// 1 hour 3 minutes 2 seconds

export const formatSeconds = (
  value: number = 0,
  format:
    | "short"
    | "long"
    | "clock"
    | "minute-second"
    | "hour-minute-second" = "short",
) => {
  const totalSeconds = Math.max(0, Math.floor(value));

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  switch (format) {
    // 1h 3m 2s
    case "short":
      return [
        hours > 0 ? `${hours}h` : null,
        minutes > 0 ? `${minutes}m` : null,
        `${seconds}s`,
      ]
        .filter(Boolean)
        .join(" ");

    // 1 hour 3 minutes 2 seconds
    case "long":
      return [
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : null,

        minutes > 0
          ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
          : null,

        `${seconds} ${seconds === 1 ? "second" : "seconds"}`,
      ]
        .filter(Boolean)
        .join(" ");

    // 01:03:02
    case "clock":
      return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ].join(":");

    // 3m 2s
    case "minute-second":
      return `${minutes + hours * 60}m ${seconds}s`;

    // 1h 3m 2s
    case "hour-minute-second":
      return `${hours}h ${minutes}m ${seconds}s`;

    default:
      return `${seconds}s`;
  }
};
