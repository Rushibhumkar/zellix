

import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const AppLogo = (props: SvgProps) => (
    <Svg
        width={200}
        height={186}
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M136.533 708.793L278.482 339.065C292.168 303.419 342.488 303.103 356.62 338.576L493.782 682.882C506.121 713.854 547.914 718.753 567.081 691.474L708.189 490.645M841.32 301.862L708.189 490.645M577.025 306.058L708.189 490.645"
            stroke="#020006"
            strokeWidth={83.9032}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M799.368 608.099L887.467 729.759"
            stroke="#FFC857"
            strokeWidth={83.9032}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M799.368 608.099L887.467 729.759"
            stroke="#FFC857"
            strokeWidth={83.9032}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
export default AppLogo;
