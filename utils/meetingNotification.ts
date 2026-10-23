let pending: string | null = null;
const listeners = new Set<() => void>();
export const pendingMeetingNotification = () => pending;
export function queueMeetingNotification(data: any): boolean {
  const id = String(data?.id?._id || data?.id || "");
  if (data?.type !== "Meeting" || !/^[a-f\d]{24}$/i.test(id)) return false;
  pending = id;
  listeners.forEach(listener => listener());
  return true;
}
export function subscribeMeetingNotification(listener: () => void) {
  listeners.add(listener);
  listener();
  return () => { listeners.delete(listener); };
}
export function consumeMeetingNotification(id: string) {
  if (pending === id) pending = null;
}
