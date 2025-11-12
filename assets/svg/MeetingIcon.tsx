import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const MeetingIcon = (props) => (
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
      d="M14 8V12"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 8V12"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M25 10H11C9.89543 10 9 10.8954 9 12V26C9 27.1046 9.89543 28 11 28H25C26.1046 28 27 27.1046 27 26V12C27 10.8954 26.1046 10 25 10Z"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 16H27"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default MeetingIcon;
