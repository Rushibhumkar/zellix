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
      fill="url(#paint0_linear_54_12)"
    />
    <Path
      d="M24 29V21C24 20.7348 23.8946 20.4804 23.7071 20.2929C23.5196 20.1054 23.2652 20 23 20H19C18.7348 20 18.4804 20.1054 18.2929 20.2929C18.1054 20.4804 18 20.7348 18 21V29"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 18C11.9999 17.7091 12.0633 17.4216 12.1858 17.1577C12.3082 16.8938 12.4868 16.6598 12.709 16.472L19.709 10.472C20.07 10.1669 20.5274 9.99951 21 9.99951C21.4726 9.99951 21.93 10.1669 22.291 10.472L29.291 16.472C29.5132 16.6598 29.6918 16.8938 29.8142 17.1577C29.9367 17.4216 30.0001 17.7091 30 18V27C30 27.5304 29.7893 28.0391 29.4142 28.4142C29.0391 28.7893 28.5304 29 28 29H14C13.4696 29 12.9609 28.7893 12.5858 28.4142C12.2107 28.0391 12 27.5304 12 27V18Z"
      stroke="white"
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_54_12"
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
