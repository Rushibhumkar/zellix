import * as React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
const InterviewActiveIcon = (props) => (
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
      fill="url(#paint0_linear_99_201)"
    />
    <Path
      d="M25 21L30.223 24.482C30.2983 24.5321 30.3858 24.5609 30.4761 24.5652C30.5664 24.5695 30.6563 24.5493 30.736 24.5066C30.8157 24.4639 30.8824 24.4004 30.9289 24.3228C30.9754 24.2452 31 24.1565 31 24.066V15.87C31 15.782 30.9768 15.6956 30.9328 15.6195C30.8887 15.5433 30.8253 15.4801 30.7491 15.4363C30.6728 15.3925 30.5863 15.3696 30.4983 15.3699C30.4103 15.3702 30.324 15.3937 30.248 15.438L25 18.5"
      stroke="white"
      strokeWidth={2.29167}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 14H13C11.8954 14 11 14.8954 11 16V24C11 25.1046 11.8954 26 13 26H23C24.1046 26 25 25.1046 25 24V16C25 14.8954 24.1046 14 23 14Z"
      stroke="white"
      strokeWidth={2.29167}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_99_201"
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
export default InterviewActiveIcon;
