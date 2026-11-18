import React from "react";
import RowAttendance, { type TRowAttendance } from "./RowAttendance";

export default function RowSingleUserAtt(
  props: Omit<TRowAttendance, "action" | "personal">,
) {
  return <RowAttendance {...props} personal />;
}
