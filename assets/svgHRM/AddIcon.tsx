import * as React from "react";
import Svg, { G, Rect, Path, Defs, SvgProps } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const AddIcon = (props: SvgProps) => (
  <Svg
    width={70}
    height={70}
    viewBox="0 0 85 85"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G filter="url(#filter0_d_212_1343)">
      <Rect
        x={7}
        y={7}
        width={66.9121}
        height={66.91}
        rx={33.455}
        fill="#2D67C6"
        shapeRendering="crispEdges"
      />
      <Path
        d="M43.7486 35.1787C43.7486 36.2833 44.6441 37.1787 45.7486 37.1787H50.9139C52.0185 37.1787 52.9139 38.0741 52.9139 39.1787V41.8814C52.9139 42.9859 52.0185 43.8814 50.9139 43.8814H45.7486C44.6441 43.8814 43.7486 44.7768 43.7486 45.8814V50.91C43.7486 52.0146 42.8532 52.91 41.7486 52.91H39.1634C38.0588 52.91 37.1634 52.0146 37.1634 50.91V45.8814C37.1634 44.7768 36.2679 43.8814 35.1634 43.8814H29.998C28.8935 43.8814 27.998 42.9859 27.998 41.8814V39.1787C27.998 38.0741 28.8935 37.1787 29.998 37.1787H35.1634C36.2679 37.1787 37.1634 36.2833 37.1634 35.1787V30C37.1634 28.8954 38.0588 28 39.1634 28H41.7486C42.8532 28 43.7486 28.8954 43.7486 30V35.1787Z"
        fill="white"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default AddIcon;
