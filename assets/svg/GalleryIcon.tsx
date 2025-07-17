import * as React from "react";
import Svg, { G, Path, SvgProps } from "react-native-svg";
const GalleryIcon = (props: SvgProps) => (
    <Svg
        fill="#000000"
        height="50px"
        width="50px"
        id="Filled_Icons"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 24 24"
        enableBackground="new 0 0 24 24"
        xmlSpace="preserve"
        {...props}
    >
        <G id="Gallery-Filled">
            <Path d="M8,6c0,1.1-0.9,2-2,2S4,7.1,4,6s0.9-2,2-2S8,4.9,8,6z" />
            <Path d="M0,0v19h20V0H0z M18,2v10.8L13.99,8L10,13l-3-3l-5,5.83V2H18z" />
            <Path d="M24,23H5v-2h17V5h2V23z" />
        </G>
    </Svg>
);
export default GalleryIcon;

;
