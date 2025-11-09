import * as React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={42}
    height={40}
    viewBox="0 0 42 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M0 16C0 7.16344 7.16344 0 16 0H26C34.8366 0 42 7.16344 42 16V24C42 32.8366 34.8366 40 26 40H16C7.16344 40 0 32.8366 0 24V16Z"
      fill="url(#paint0_linear_54_53)"
    />
    <Path
      d="M25 29V27C25 25.9391 24.5786 24.9217 23.8284 24.1716C23.0783 23.4214 22.0609 23 21 23H15C13.9391 23 12.9217 23.4214 12.1716 24.1716C11.4214 24.9217 11 25.9391 11 27V29"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M25 11.1279C25.8578 11.3503 26.6174 11.8512 27.1597 12.552C27.702 13.2528 27.9962 14.1138 27.9962 14.9999C27.9962 15.886 27.702 16.7471 27.1597 17.4479C26.6174 18.1487 25.8578 18.6496 25 18.8719"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M31 29V27C30.9993 26.1137 30.7044 25.2528 30.1614 24.5523C29.6184 23.8519 28.8581 23.3516 28 23.13"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 19C20.2091 19 22 17.2091 22 15C22 12.7909 20.2091 11 18 11C15.7909 11 14 12.7909 14 15C14 17.2091 15.7909 19 18 19Z"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_54_53"
        x1={21}
        y1={0}
        x2={21}
        y2={40}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#2E67BE" />
        <Stop offset={1} stopColor="#4985F2" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SVGComponent;
