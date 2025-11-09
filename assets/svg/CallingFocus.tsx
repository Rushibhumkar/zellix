import * as React from "react";
import Svg, {
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Rect,
} from "react-native-svg";
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
      fill="url(#paint0_linear_54_47)"
    />
    <G clipPath="url(#clip0_54_47)">
      <Path
        d="M22.5265 24.568C22.6986 24.6628 22.8925 24.6845 23.0762 24.6294C23.26 24.5744 23.4226 24.4458 23.5373 24.265L23.8332 23.8C23.9884 23.5516 24.1897 23.35 24.4211 23.2111C24.6526 23.0723 24.9078 23 25.1665 23H27.6665C28.1085 23 28.5325 23.2107 28.845 23.5858C29.1576 23.9609 29.3332 24.4696 29.3332 25V28C29.3332 28.5304 29.1576 29.0391 28.845 29.4142C28.5325 29.7893 28.1085 30 27.6665 30C23.6883 30 19.8729 28.1036 17.0599 24.7279C14.2469 21.3523 12.6665 16.7739 12.6665 12C12.6665 11.4696 12.8421 10.9609 13.1547 10.5858C13.4672 10.2107 13.8911 10 14.3332 10H16.8332C17.2752 10 17.6991 10.2107 18.0117 10.5858C18.3242 10.9609 18.4998 11.4696 18.4998 12V15C18.4998 15.3105 18.4396 15.6167 18.3239 15.8944C18.2082 16.1721 18.0402 16.4137 17.8332 16.6L17.4432 16.951C17.2902 17.0912 17.1824 17.2906 17.138 17.5154C17.0936 17.7401 17.1155 17.9764 17.1998 18.184C18.3387 20.9599 20.2119 23.2048 22.5265 24.568Z"
        stroke="white"
        strokeWidth={2.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <LinearGradient
        id="paint0_linear_54_47"
        x1={21}
        y1={0}
        x2={21}
        y2={40}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#2E67BE" />
        <Stop offset={1} stopColor="#4985F2" />
      </LinearGradient>
      <ClipPath id="clip0_54_47">
        <Rect width={20} height={24} fill="white" transform="translate(11 8)" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SVGComponent;
