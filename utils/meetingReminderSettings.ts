export const canManageMeetingReminders = (role?: string) =>
  ["sup_admin", "sub_admin", "developer"].includes(role || "");

export type MeetingReminderSettings = {
  offsets: number[];
  email: boolean;
  push: boolean;
};

export function parseMeetingReminderOffsets(text: string): number[] {
  const parts = text.split(",").map((value) => value.trim());
  if (
    parts.length < 1 ||
    parts.length > 10 ||
    parts.some((value) => !/^\d+$/.test(value))
  ) {
    throw new Error(
      "Enter 1-10 comma-separated whole minutes, for example 0, 30, 120.",
    );
  }
  const values = parts.map(Number);
  if (
    values.some(
      (value) => !Number.isInteger(value) || value < 0 || value > 10080,
    )
  ) {
    throw new Error(
      "Reminder times must be between 0 and 10080 minutes (7 days).",
    );
  }
  if (new Set(values).size !== values.length)
    throw new Error("Each reminder time must be unique.");
  return values.sort((a, b) => a - b);
}

export const meetingReminderTimeLabel = (minutes: number) =>
  minutes === 0
    ? "At meeting time"
    : minutes % 60 === 0
      ? `${minutes / 60} hr later`
      : `${minutes} min later`;

export function reminderSettingsPayload(
  offsets: string,
  email: boolean,
  push: boolean,
): MeetingReminderSettings {
  if (typeof email !== "boolean" || typeof push !== "boolean")
    throw new Error("Choose valid delivery channels.");
  return { offsets: parseMeetingReminderOffsets(offsets), email, push };
}
