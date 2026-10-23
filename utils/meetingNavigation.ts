// Support both AddMeeting inside MeetingsNavigator and AddMeetingFromLead in
// the lead stack. Do not dispatch a route the active navigator cannot handle.
export function openExistingMeeting(navigation: any, meetingId: string): boolean {
  if (!meetingId) return false;
  let current = navigation;
  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    const names = current.getState?.()?.routeNames || [];
    if (names.includes("MeetingDetails")) {
      const params = { item: { _id: meetingId } };
      if (typeof current.push === "function") current.push("MeetingDetails", params);
      else current.navigate("MeetingDetails", params);
      return true;
    }
    if (names.includes("MeetingsNavigator")) {
      current.navigate("MeetingsNavigator", { screen: "MeetingDetails", params: { item: { _id: meetingId } }, initial: false });
      return true;
    }
    current = current.getParent?.();
  }
  return false;
}
