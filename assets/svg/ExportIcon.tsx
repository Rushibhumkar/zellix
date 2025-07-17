import * as React from "react";
import Svg, { G, Rect, Path, Defs, ClipPath } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const ExportIcon = (props) => (
  <Svg
    width={46}
    height={38}
    viewBox="0 0 46 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G filter="url(#filter0_d_1898_6892)">
      <Rect x={2.58594} y={2} width={38.75} height={32} rx={5} fill="#F2F4F8" />
      <G clipPath="url(#clip0_1898_6892)">
        <Path
          d="M9.58594 9.75C9.58594 8.2332 10.8191 7 12.3359 7H19.2109V12.5C19.2109 13.2605 19.8254 13.875 20.5859 13.875H26.0859V19.375H18.8672C18.2957 19.375 17.8359 19.8348 17.8359 20.4062C17.8359 20.9777 18.2957 21.4375 18.8672 21.4375H26.0859V26.25C26.0859 27.7668 24.8527 29 23.3359 29H12.3359C10.8191 29 9.58594 27.7668 9.58594 26.25V9.75ZM26.0859 21.4375V19.375H30.8168L29.141 17.6992C28.7371 17.2953 28.7371 16.6422 29.141 16.2426C29.5449 15.843 30.198 15.8387 30.5977 16.2426L34.0352 19.6801C34.4391 20.084 34.4391 20.7371 34.0352 21.1367L30.5977 24.5742C30.1938 24.9781 29.5406 24.9781 29.141 24.5742C28.7414 24.1703 28.7371 23.5172 29.141 23.1176L30.8168 21.4418H26.0859V21.4375ZM26.0859 12.5H20.5859V7L26.0859 12.5Z"
          fill="#BFBFBF"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0_1898_6892">
        <Rect
          width={24.75}
          height={22}
          fill="white"
          transform="translate(9.58594 7)"
        />
      </ClipPath>
    </Defs>
  </Svg>
);
export default ExportIcon;
