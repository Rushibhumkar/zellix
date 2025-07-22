//CircularBarChart
import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { PieChart } from "react-native-gifted-charts";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import { shadow1, shadow2, shadowLight } from "../../const/globalStyle";
import {
  useGetAttendanceChart,
  useGetLeaveChart,
  useGetUserStatusChart,
} from "../../hooks/useGetQuerryHRM";
import { myConsole } from "../../hooks/useConsole";

interface TCircularBarChart {
  // pieData: [{
  //     value: number;
  //     color: string;
  //     // gradientCenterColor: string;
  //     text: string;
  // }],
  // title: string;
  type?: "userChart" | "leavesChart" | "attendanceChart";
}

const initial = {
  leavesChart: dummyUser,
  attendanceChart: dummyLeave,
  userChart: dummyAttendance,
};

const titleH = {
  leavesChart: "Leaves Status",
  attendanceChart: "Attendance",
  userChart: "Total Employee",
};

const CircularBarChart = ({ type = "leavesChart" }: TCircularBarChart) => {
  //
  const [pieCirData, setPieCirData] = useState(initial[type]);
  //
  const { data: userCount } = useGetUserStatusChart({
    isEnable: type === "userChart" && true,
  });
  const { data: leaveCount } = useGetLeaveChart({
    isEnable: type === "leavesChart" && true,
  });
  const { data: attendanceCount } = useGetAttendanceChart({
    isEnable: type === "attendanceChart" && true,
  });

  // myConsole('userCouns', userCount)
  // myConsole('leaveCount', leaveCount)
  // myConsole('attendanceCount', attendanceCount)
  //
  useEffect(() => {
    // if (pieData?.length > 0) {
    //     setPieCirData(pieData)
    // } else {
    //     setPieCirData(dummyPieData)
    // }
    if (type === "userChart") {
      // let temp = dummyUser?.map((el) => { return { ...el, value: leaveCount[el?.key] } })
      let temp = dummyUser?.map((el) => {
        let val =
          typeof userCount?.[el?.key] === "number" ? userCount?.[el?.key] : 0;
        return { ...el, value: val };
      });
      setPieCirData(temp);
    }
    if (type === "leavesChart") {
      let temp = dummyLeave?.map((el) => {
        let val =
          typeof leaveCount?.[el?.key] === "number" ? leaveCount?.[el?.key] : 0;
        return { ...el, value: val };
      });
      setPieCirData(temp);
    }
    if (type === "attendanceChart") {
      let temp = dummyAttendance?.map((el) => {
        let val =
          typeof attendanceCount?.[el?.key] === "number"
            ? attendanceCount?.[el?.key]
            : 0;
        return { ...el, value: val };
      });
      setPieCirData(temp);
    }
  }, [leaveCount, attendanceCount, userCount, type]);

  const RenderDot = ({ color, text, value }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
        }}
      >
        <View
          style={{
            height: 10,
            width: 10,
            borderRadius: 5,
            backgroundColor: color,
            // marginRight: 10,
          }}
        />
        {/* <Text style={{ color: 'white' }}>{text}</Text> */}
        <CustomText
          fontSize={12}
          fontWeight="300"
          style={{ textTransform: "uppercase" }}
        >
          {text}
          <CustomText color={color} fontSize={11}>{`(${value})`}</CustomText>
        </CustomText>
      </View>
    );
  };
  //
  const renderLegendComponent = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          width: "75%",
        }}
      >
        {pieCirData?.map((el, i) => {
          return (
            <RenderDot
              color={el?.color}
              text={el?.text}
              value={el?.value}
              key={i}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={{
        // margin: 20,
        padding: 16,
        borderRadius: 10,
        backgroundColor: color.listCardBg,
        borderWidth: 0.5,
        borderColor: color.saffronMango,
        marginBottom: 15,
        ...shadow2,
      }}
    >
      <CustomText
        fontSize={16}
        fontWeight="600"
        style={{ fontStyle: "italic" }}
        marginBottom={10}
      >
        {titleH[type]}
      </CustomText>
      <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
        <PieChart
          data={pieCirData ?? []}
          donut
          showGradient
          sectionAutoFocus
          radius={20}
          innerRadius={15}
          // innerCircleColor={'#232B5D'}
          // centerLabelComponent={() => {
          //     return (
          //         <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          //             <Text
          //                 style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>
          //                 47%
          //             </Text>
          //             <Text style={{ fontSize: 14, color: 'white' }}>Excellent</Text>
          //         </View>
          //     );
          // }}
        />
        {renderLegendComponent()}
      </View>
    </View>
  );
};

export default CircularBarChart;

//
var dummyUser = [
  {
    value: 47,
    color: color.approve,
    // gradientCenterColor: 'red',
    text: "Approve",
    key: "approved",
    // focused: true,
  },
  {
    value: 40,
    color: color.reject,
    // gradientCenterColor: '#3BE9DE',
    text: "Reject",
    key: "rejected",
  },
  {
    value: 16,
    color: color.pending,
    // gradientCenterColor: '#8F80F3',
    text: "Pending",
    key: "pending",
  },
  {
    value: 16,
    color: color.new,
    // gradientCenterColor: '#8F80F3',
    text: "New",
    key: "new",
  },
  // {
  //     value: 3,
  //     color: '#FFA5BA',
  //     // gradientCenterColor: '#FF7F97',
  //     text: 'Absent'
  // },
];

var dummyLeave = [
  {
    value: 47,
    color: color.approve,
    // gradientCenterColor: 'red',
    text: "Approve",
    key: "approved",
    // focused: true,
  },
  {
    value: 40,
    color: color.reject,
    // gradientCenterColor: '#3BE9DE',
    text: "Reject",
    key: "rejected",
  },
  {
    value: 16,
    color: color.pending,
    // gradientCenterColor: '#8F80F3',
    text: "Pending",
    key: "pending",
  },
  // {
  //     value: 3,
  //     color: '#FFA5BA',
  //     // gradientCenterColor: '#FF7F97',
  //     text: 'Absent'
  // },
];

var dummyAttendance = [
  {
    value: 47,
    color: color.approve,
    text: "Present",
    key: "present",
  },
  {
    value: 40,
    color: color.pending,
    text: "On Leave",
    key: "leave",
  },
  {
    value: 16,
    color: color.saffronMango,
    text: "Half Day",
    key: "halfDay",
  },
  {
    value: 3,
    color: color.reject,
    text: "Absent",
    key: "absent",
  },
];
