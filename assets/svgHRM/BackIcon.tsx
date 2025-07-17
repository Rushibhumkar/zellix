import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const BackIcon = (props: SvgProps) => (
    <Svg
        width={22}
        height={22}
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M11.8438 21.8436L2 11.9999L11.8438 2.15613M3.36719 11.9999H23.3281"
            stroke="#010006"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
export default BackIcon;
