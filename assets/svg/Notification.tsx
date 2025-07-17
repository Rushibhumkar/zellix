import * as React from "react"
import Svg, { Rect, Path, Circle } from "react-native-svg"

function Notification(props) {
  return (
    <Svg
      width={38}
      height={39}
      viewBox="0 0 38 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect y={0.5} width={38} height={38} rx={19} fill="#FFC857" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.55 23.722h-.794v-5.91a6.756 6.756 0 10-13.512 0v5.91h-.751a.845.845 0 000 1.69h4.974a2.533 2.533 0 005.066 0h5.016a.844.844 0 100-1.69zM19 26.256a.844.844 0 01-.845-.845h1.69a.844.844 0 01-.845.845zm-5.067-2.534h10.134v-5.91a5.067 5.067 0 00-10.134 0v5.91z"
        fill="#fff"
      />
      <Circle cx={27.668} cy={16.1666} r={4} fill="#D80027" />
    </Svg>
  )
}

export default Notification
