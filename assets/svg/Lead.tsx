import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const SVGComponent = (props) => (
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
      d="M22 27V25C22 23.9391 21.5786 22.9217 20.8284 22.1716C20.0783 21.4214 19.0609 21 18 21H12C10.9391 21 9.92172 21.4214 9.17157 22.1716C8.42143 22.9217 8 23.9391 8 25V27"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 9.12793C22.8578 9.3503 23.6174 9.85119 24.1597 10.552C24.702 11.2528 24.9962 12.1138 24.9962 12.9999C24.9962 13.886 24.702 14.7471 24.1597 15.4479C23.6174 16.1487 22.8578 16.6496 22 16.8719"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M28 27V25C27.9993 24.1137 27.7044 23.2528 27.1614 22.5523C26.6184 21.8519 25.8581 21.3516 25 21.13"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 17C17.2091 17 19 15.2091 19 13C19 10.7909 17.2091 9 15 9C12.7909 9 11 10.7909 11 13C11 15.2091 12.7909 17 15 17Z"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
