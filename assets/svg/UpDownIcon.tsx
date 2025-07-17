import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const UpDownIcon = (props: SvgProps) => (
    <Svg
        width={12}
        height={7}
        viewBox="0 0 12 7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M11 6L6 1L1 6"
            stroke="black"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
export default UpDownIcon;
