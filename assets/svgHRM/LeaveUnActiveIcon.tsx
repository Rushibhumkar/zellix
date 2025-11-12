import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const LeaveUnActiveIcon = (props) => (
  <Svg
    width={36}
    height={36}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect width={36} height={36} fill="white" />
    <Path
      d="M22 17L24 19L28 15"
      stroke="#739FE1"
      strokeWidth={1.83333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 27V25C22 23.9391 21.5786 22.9217 20.8284 22.1716C20.0783 21.4214 19.0609 21 18 21H12C10.9391 21 9.92172 21.4214 9.17157 22.1716C8.42143 22.9217 8 23.9391 8 25V27"
      stroke="#739FE1"
      strokeWidth={1.83333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 17C17.2091 17 19 15.2091 19 13C19 10.7909 17.2091 9 15 9C12.7909 9 11 10.7909 11 13C11 15.2091 12.7909 17 15 17Z"
      stroke="#739FE1"
      strokeWidth={1.83333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default LeaveUnActiveIcon;
