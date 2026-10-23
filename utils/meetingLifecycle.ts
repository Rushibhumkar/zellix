export const meetingId = (value: any): string => String(value?._id || value || "");
export const latestMeetingEntry = (meeting: any) => meeting?.meetings?.at(-1);
export function existingOpenMeetingId(rows: any[] = [], leadId: string, responsible?: any): string | null {
  const ownerId = meetingId(responsible);
  const latestByGroup = new Map<string, any>();
  // History is returned newest-first. Older appointments in a closed group
  // must not make that group appear open (including older server histories).
  for (const row of rows) {
    const id = meetingId(row.meetingId || row._id);
    if (!id || meetingId(row.lead) !== leadId || (ownerId && meetingId(row.responsibleUserId) !== ownerId)) continue;
    if (!latestByGroup.has(id)) latestByGroup.set(id, row);
  }
  const ids = [...latestByGroup].filter(([, row]) => ["schedule", "reschedule"].includes((row.latestMeeting || row.meeting)?.status)).map(([id]) => id);
  // Never guess a meeting when multiple responsible groups are still open.
  return ids.length === 1 ? ids[0] : null;
}
export const meetingMessage = (error: any, fallback = "Unable to update meeting") => {
  const body = error?.response?.data;
  return typeof body === "string" ? body : body?.message || error?.message || fallback;
};
export const meetingSuccess = (response: any, fallback: string) =>
  typeof response?.data === "string" ? response.data : response?.data?.message || fallback;
export const isMeetingConflict = (error: any) => [409, 428].includes(error?.response?.status);
export function meetingVersion(meeting: any) {
  const entry = latestMeetingEntry(meeting);
  if (meeting?.lifecycleVersion !== 2 || meeting?.migrationBlocked || !entry?._id || !Number.isInteger(meeting?.__v)) {
    throw new Error("This meeting needs refresh or migration/admin review before making changes.");
  }
  return { expectedEntryId: meetingId(entry), expectedVersion: meeting.__v };
}
export function meetingActions(meeting: any, now = Date.now()) {
  const entry = latestMeetingEntry(meeting);
  const valid = meeting?.lifecycleVersion === 2 && !meeting?.migrationBlocked;
  const open = ["schedule", "reschedule"].includes(entry?.status);
  const manage = valid && entry?.capabilities?.manage === true;
  return { manage, edit: manage && open, reschedule: manage && open, cancel: manage && open,
    conduct: manage && open && new Date(entry?.scheduleDate).getTime() <= now,
    closed: valid && ["conducted", "cancelled"].includes(entry?.status) };
}
// The same operation retains its key after a network failure. A changed form is a new operation.
export function meetingRequestId(ref: { current: any }, payload: any) {
  const signature = JSON.stringify(payload);
  if (ref.current?.signature !== signature) ref.current = { signature, id: `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}` };
  return ref.current.id as string;
}
// Match Web: only current server-eligible users count as supporting members.
// The responsible person is added separately to the API participant list.
export function meetingSupportingMembers(responsible: any, selected: any[] = [], options: any[] = []) {
  const allowed = new Set(options.map(meetingId).filter(Boolean));
  const responsibleId = meetingId(responsible);
  return [...new Set(selected.map(meetingId))].filter(id => id && id !== responsibleId && allowed.has(id));
}

export function meetingMembers(responsible: any, selected: any[] = []) {
  return [...new Set([meetingId(responsible), ...selected.map(meetingId)].filter(Boolean))];
}
export function combineMeetingDate(date: any, time: any): string {
  const result = new Date(date);
  const clock = new Date(time);
  if (!date || !time || !Number.isFinite(result.getTime()) || !Number.isFinite(clock.getTime())) throw new Error("Select a valid meeting date and time");
  result.setHours(clock.getHours(), clock.getMinutes(), clock.getSeconds(), 0);
  return result.toISOString();
}
