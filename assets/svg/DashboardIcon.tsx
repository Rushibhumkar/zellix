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
      d="M21.5 28.5V19.1667C21.5 18.8572 21.3771 18.5605 21.1583 18.3417C20.9395 18.1229 20.6428 18 20.3333 18H15.6667C15.3572 18 15.0605 18.1229 14.8417 18.3417C14.6229 18.5605 14.5 18.8572 14.5 19.1667V28.5"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.5 15.6667C7.49992 15.3272 7.57389 14.9919 7.71675 14.684C7.85962 14.3761 8.06793 14.1031 8.32717 13.884L16.4938 6.88399C16.915 6.52805 17.4486 6.33276 18 6.33276C18.5514 6.33276 19.085 6.52805 19.5062 6.88399L27.6728 13.884C27.9321 14.1031 28.1404 14.3761 28.2832 14.684C28.4261 14.9919 28.5001 15.3272 28.5 15.6667V26.1667C28.5 26.7855 28.2542 27.379 27.8166 27.8166C27.379 28.2542 26.7855 28.5 26.1667 28.5H9.83333C9.21449 28.5 8.621 28.2542 8.18342 27.8166C7.74583 27.379 7.5 26.7855 7.5 26.1667V15.6667Z"
      stroke="#739FE1"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
