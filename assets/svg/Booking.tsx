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
      d="M27 16.656V25C27 25.5304 26.7893 26.0391 26.4142 26.4142C26.0391 26.7893 25.5304 27 25 27H11C10.4696 27 9.96086 26.7893 9.58579 26.4142C9.21071 26.0391 9 25.5304 9 25V11C9 10.4696 9.21071 9.96086 9.58579 9.58579C9.96086 9.21071 10.4696 9 11 9H23.344"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 17L18 20L28 10"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
