import * as React from "react";
import Svg, { Path } from "react-native-svg";
const MenuThreeLines = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M3.33331 4.16666H16.6666"
      stroke="white"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.33331 10H16.6666"
      stroke="white"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.33331 15.8333H16.6666"
      stroke="white"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default MenuThreeLines;
