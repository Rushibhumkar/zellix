import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const CRMLogoIcon = (props) => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clipPath="url(#clip0_68_1573)">
      <Path
        d="M10.6667 13.3333V2.66659C10.6667 2.31296 10.5262 1.97382 10.2761 1.72378C10.0261 1.47373 9.68696 1.33325 9.33334 1.33325H6.66667C6.31305 1.33325 5.97391 1.47373 5.72386 1.72378C5.47381 1.97382 5.33334 2.31296 5.33334 2.66659V13.3333"
        stroke="white"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.3333 4H2.66667C1.93029 4 1.33334 4.59695 1.33334 5.33333V12C1.33334 12.7364 1.93029 13.3333 2.66667 13.3333H13.3333C14.0697 13.3333 14.6667 12.7364 14.6667 12V5.33333C14.6667 4.59695 14.0697 4 13.3333 4Z"
        stroke="white"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_68_1573">
        <Rect width={16} height={16} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default CRMLogoIcon;
