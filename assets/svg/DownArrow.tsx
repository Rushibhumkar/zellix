import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { color } from "../../const/color";
const DownArrow = (props: SvgProps) => (
  <Svg
    width={12}
    height={7}
    viewBox="0 0 12 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M1.625 0.973694L6.3125 5.66119L1.625 0.973694ZM6.3125 5.66119L11 0.973694L6.3125 5.66119Z"
      fill="#424242"
    />
    <Path
      d="M1.625 0.973694L6.3125 5.66119L11 0.973694"
      stroke={color.primary200}
      strokeWidth={1.40625}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default DownArrow;
