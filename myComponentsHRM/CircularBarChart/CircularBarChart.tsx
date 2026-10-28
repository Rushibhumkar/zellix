//CircularBarChart
import { View, Text } from "react-native";
import React from "react";
import { getHRMChartValues } from "../../utils/hrmChartData";
import { PieChart } from "react-native-gifted-charts";
import CustomText from "../../myComponents/CustomText/CustomText";
import { color } from "../../const/color";
import {
  shadowPrimaryColor,
  shadowSecondaryColor,
} from "../../const/globalStyle";
import {
  useGetAttendanceChart,
  useGetLeaveChart,
  useGetUserStatusChart,
} from "../../hooks/useGetQuerryHRM";
import { myConsole } from "../../hooks/useConsole";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

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

const titleH = {
  leavesChart: "Leaves Status",
  attendanceChart: "Attendance",
  userChart: "Total Employee",
};

const CircularBarChart = ({ type = "leavesChart" }: TCircularBarChart) => {
  //
  //
  const { data: userCount, isLoading: userLoading, isError: userError, refetch: retryUsers } = useGetUserStatusChart({
    isEnable: type === "userChart" && true,
  });
  const { data: leaveCount } = useGetLeaveChart({
    isEnable: type === "leavesChart" && true,
  });
  const { data: attendanceCount, isLoading: attendanceLoading, isError: attendanceError, refetch: retryAttendance } = useGetAttendanceChart({
    isEnable: type === "attendanceChart" && true,
  });

  // myConsole('userCouns', userCount)
  // myConsole('leaveCount', leaveCount)
  // myConsole('attendanceCount', attendanceCount)
  //
  const definitions = type === "userChart" ? userSegments : type === "leavesChart" ? leaveSegments : attendanceSegments;
  const counts = type === "userChart" ? userCount : type === "leavesChart" ? leaveCount : attendanceCount;
  const pieCirData = getHRMChartValues(definitions, counts);
  const hasData = pieCirData.some(item => item.value > 0);
  const chartData = hasData ? pieCirData : [{ value: 1, color: "#D1D5DB" }];

  const RenderDot = ({ color, text, value }) => {
    const displayCount = type === "userChart" && !userCount && (userLoading || userError) ? "—" : value;
    return (
      <View
        accessible
        accessibilityLabel={`${text}: ${displayCount}`}
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
            backgroundColor: color,
          }}
        />
        <SlideFadeIn>
          <CustomText
            fontSize={12}
            fontWeight="400"
            style={{ textTransform: "uppercase", color: "#2E67BE" }}
          >
            {text}
            <CustomText color={color} fontSize={11}>{`(${displayCount})`}</CustomText>
          </CustomText>
        </SlideFadeIn>
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
        borderRadius: 16,
        backgroundColor: color.listCardBg,
        borderWidth: 1.2,
        borderColor: color.borderColor,
        marginBottom: 15,
        ...shadowPrimaryColor,
      }}
    >
      <SlideFadeIn>
        <CustomText
          fontSize={16}
          fontWeight="600"
          marginBottom={10}
          color={color.mainTxtColor}
        >
          {titleH[type]}
        </CustomText>
      </SlideFadeIn>
      <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
        <PieChart
          data={chartData}
          donut
          showGradient={hasData}
          sectionAutoFocus={hasData}
          radius={20}
          innerRadius={15}
          // innerCircleColor={'#232B5D'}
          // centerLabelComponent={() => {
          //     return (
          //         <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          //             <CustomText
          //                 style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>
          //                 47%
          //             </CustomText>
          //             <CustomText style={{ fontSize: 14, color: 'white' }}>Excellent</CustomText>
          //         </View>
          //     );
          // }}
        />
        {renderLegendComponent()}
      </View>
      {type === "userChart" && (userLoading || userError) && (
        <Text accessibilityRole={userError ? "button" : undefined}
          onPress={userError ? () => retryUsers() : undefined}
          style={{ color: userError ? "#B42318" : "#667085", fontSize: 12, marginTop: 8 }}>
          {userError ? "Unable to load employee counts. Tap to retry." : "Loading employee counts…"}
        </Text>
      )}
      {type === "attendanceChart" && (attendanceLoading || attendanceError) && (
        <Text
          accessibilityRole={attendanceError ? "button" : undefined}
          onPress={attendanceError ? () => retryAttendance() : undefined}
          style={{ color: attendanceError ? "#B42318" : "#667085", fontSize: 12, marginTop: 8 }}
        >
          {attendanceError ? "Unable to load attendance. Tap to retry." : "Loading attendance…"}
        </Text>
      )}
    </View>
  );
};

export default CircularBarChart;

//
const userSegments = [
  {
    value: 0,
    color: color.approve,
    // gradientCenterColor: 'red',
    text: "Approve",
    key: "approved",
    // focused: true,
  },
  {
    value: 0,
    color: color.reject,
    // gradientCenterColor: '#3BE9DE',
    text: "Reject",
    key: "rejected",
  },
  {
    value: 0,
    color: color.pending,
    // gradientCenterColor: '#8F80F3',
    text: "Pending",
    key: "pending",
  },
  {
    value: 0,
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

const leaveSegments = [
  {
    value: 0,
    color: color.approve,
    // gradientCenterColor: 'red',
    text: "Approve",
    key: "approved",
    // focused: true,
  },
  {
    value: 0,
    color: color.reject,
    // gradientCenterColor: '#3BE9DE',
    text: "Reject",
    key: "rejected",
  },
  {
    value: 0,
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

const attendanceSegments = [
  {
    value: 0,
    color: color.approve,
    text: "Present",
    key: "present",
  },
  {
    value: 0,
    color: color.pending,
    text: "On Leave",
    key: "leave",
  },
  {
    value: 0,
    color: color.saffronMango,
    text: "Half Day",
    key: "halfDay",
  },
  {
    value: 0,
    color: color.reject,
    text: "Absent",
    key: "absent",
  },
];
