import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const LeadAssignIcon = (props: SvgProps) => (
    <Svg
        width="28px"
        height="28px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M18.6 3H5.4A2.4 2.4 0 0 0 3 5.4v15.2A2.4 2.4 0 0 0 5.4 23h13.2a2.4 2.4 0 0 0 2.4-2.4V5.4A2.4 2.4 0 0 0 18.6 3Z"
            fill="#000000"
            fillOpacity={0.16}
            stroke="#000000"
            strokeWidth={1.5}
            strokeMiterlimit={10}
        />
        <Path
            d="M7 14h10M7 11h10M7 17h6"
            stroke="#000000"
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
        />
        <Path
            d="M15.2 6a.8.8 0 0 0 .8-.8V3H8v2.2a.8.8 0 0 0 .8.8h6.4Z"
            fill="#ffffff"
        />
        <Path
            d="M16 3v2.2a.8.8 0 0 1-.8.8H8.8a.8.8 0 0 1-.8-.8V3"
            stroke="#000000"
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
        />
        <Path
            d="M18.6 3H5.4A2.4 2.4 0 0 0 3 5.4v15.2A2.4 2.4 0 0 0 5.4 23h13.2a2.4 2.4 0 0 0 2.4-2.4V5.4A2.4 2.4 0 0 0 18.6 3Z"
            stroke="#000000"
            strokeWidth={1.5}
            strokeMiterlimit={10}
        />
        <Path
            d="M14 3a2 2 0 1 0-4 0"
            stroke="#000000"
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
        />
    </Svg>
);
export default LeadAssignIcon;
