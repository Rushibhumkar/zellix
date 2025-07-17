import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const UserUnActiveIcon = (props: SvgProps) => (
    <Svg
        width={54}
        height={54}
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M27 24.6C29.651 24.6 31.8 22.451 31.8 19.8C31.8 17.149 29.651 15 27 15C24.3491 15 22.2 17.149 22.2 19.8C22.2 22.451 24.3491 24.6 27 24.6Z"
            fill="#8F9BB3"
        />
        <Path
            d="M36.6 33.6C36.6 36.582 36.6 39 27 39C17.4 39 17.4 36.582 17.4 33.6C17.4 30.618 21.6984 28.2 27 28.2C32.3016 28.2 36.6 30.618 36.6 33.6Z"
            fill="#8F9BB3"
        />
    </Svg>
);
export default UserUnActiveIcon;
