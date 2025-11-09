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
      fill="url(#paint0_linear_54_19)"
    />
    <Path
      d="M17 10V14"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M25 10V14"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M28 12H14C12.8954 12 12 12.8954 12 14V28C12 29.1046 12.8954 30 14 30H28C29.1046 30 30 29.1046 30 28V14C30 12.8954 29.1046 12 28 12Z"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 18H30"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_54_19"
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
