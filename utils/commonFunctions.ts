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
