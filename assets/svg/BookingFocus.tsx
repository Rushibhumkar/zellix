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
      fill="url(#paint0_linear_54_62)"
    />
    <Path
      d="M30 18.656V27C30 27.5304 29.7893 28.0391 29.4142 28.4142C29.0391 28.7893 28.5304 29 28 29H14C13.4696 29 12.9609 28.7893 12.5858 28.4142C12.2107 28.0391 12 27.5304 12 27V13C12 12.4696 12.2107 11.9609 12.5858 11.5858C12.9609 11.2107 13.4696 11 14 11H26.344"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 19L21 22L31 12"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_54_62"
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
