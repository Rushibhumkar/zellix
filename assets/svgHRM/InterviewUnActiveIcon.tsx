import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const InterviewUnActiveIcon = (props) => (
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
      d="M22 19L27.223 22.482C27.2983 22.5321 27.3858 22.5609 27.4761 22.5652C27.5664 22.5695 27.6563 22.5493 27.736 22.5066C27.8157 22.4639 27.8824 22.4004 27.9289 22.3228C27.9754 22.2452 28 22.1565 28 22.066V13.87C28 13.782 27.9768 13.6956 27.9328 13.6195C27.8887 13.5433 27.8253 13.4801 27.7491 13.4363C27.6728 13.3925 27.5863 13.3696 27.4983 13.3699C27.4103 13.3702 27.324 13.3937 27.248 13.438L22 16.5"
      stroke="#739FE1"
      strokeWidth={1.83333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 12H10C8.89543 12 8 12.8954 8 14V22C8 23.1046 8.89543 24 10 24H20C21.1046 24 22 23.1046 22 22V14C22 12.8954 21.1046 12 20 12Z"
      stroke="#739FE1"
      strokeWidth={1.83333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default InterviewUnActiveIcon;
