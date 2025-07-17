import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryLine } from "victory-native";
import { shadow1 } from '../../const/globalStyle';
import DropdownRNE from '../../myComponents/DropdownRNE/DropdownRNE';
import CustomText from '../../myComponents/CustomText/CustomText';
import { WIDTH } from '../../const/deviceInfo';
import { getCommissionData } from '../../services/rootApi/api';
import { myConsole } from '../../hooks/useConsole';
import SkeletonView from '../../myComponents/SkeletonView/SkeletonView';
import { BarChart } from "react-native-gifted-charts";
import NoDataIcon from '../../assets/svg/NoDataIcon';

let commissionFilter = {
    lastWeekDailyCommission: 'dayOfWeek',
    monthlyCommission: 'month',
    yearlyCommission: 'year',
}

const CommissionGraph = ({
    isLoading,
    item
}) => {

    const [chart, setChart] = useState([]);
    // const [commission, setCommission] = useState({
    //     lastWeekDailyCommission: [],
    //     monthlyCommission: [],
    //     yearlyCommission: [],
    // })

    // const [whichGraph, setWhichGraph] = useState<"lastWeekDailyCommission" | "monthlyCommission" | 'yearlyCommission'>('lastWeekDailyCommission')

    // const [category, setCategory] = useState({
    //     lastWeekDailyCommission: [],
    //     monthlyCommission: [],
    //     yearlyCommission: [],
    // })
    // const [barChart, setBarChart] = useState({
    //     lastWeekDailyCommission: [],
    //     monthlyCommission: [],
    //     yearlyCommission: [],
    // })


    // const [isLoading, setIsLoading] = useState(false)

    // const getCommission = async () => {
    //     try {
    //         setIsLoading(true)
    //         let data = await getCommissionData()
    //         let { lastWeekDailyCommission, monthlyCommission, yearlyCommission } = data;
    //         setCommission({ ...data })
    //         setCategory((prev) => {
    //             return {
    //                 ...prev,
    //                 lastWeekDailyCommission: lastWeekDailyCommission?.map((el) => el?.dayOfWeek),
    //                 monthlyCommission: monthlyCommission?.map((el) => String(el?.month)),
    //                 yearlyCommission: yearlyCommission?.map((el) => String(el?.year)),
    //             }

    //         })
    //         setBarChart((prev) => {
    //             return {
    //                 ...prev,
    //                 lastWeekDailyCommission: lastWeekDailyCommission?.map((el) => {
    //                     return { value: el?.totalCommission, label: el?.dayOfWeek, frontColor: '#363062' }
    //                 }),
    //                 monthlyCommission: monthlyCommission?.map((el) => {
    //                     return { value: el?.totalCommission, label: el?.month, frontColor: '#363062' }
    //                 }),
    //                 yearlyCommission: yearlyCommission?.map((el) => {
    //                     return { value: el?.totalCommission, label: el?.year, frontColor: '#363062' }
    //                 }),
    //             }
    //         })
    //     }
    //     catch (err) {
    //         console.log('err in CommissionGraphScreen', err)
    //     }
    //     finally { setIsLoading(false) }
    // }
    // useEffect(() => {
    //     getCommission()
    // }, [])
    useEffect(() => {
        let temp = item?.weeklyCommission?.map(
            (el) => {
                return {
                    value: el?.totalCommission / 100000,
                    label: el?.dayOfWeek,
                    frontColor: '#177AD5',
                    topLabelComponent: () => (
                        <Text style={{ color: 'blue', marginBottom: 6, fontSize: 12 }}>{el?.totalCommission / 100000}</Text>
                    ),
                }
            })
        setChart(temp);
    }, [isLoading])

    const handleSelect = (type: 'weeklyCommission' | 'monthlyCommission' | 'yearlyCommission') => {

        if (type === 'weeklyCommission') {
            let temp = item?.weeklyCommission?.map(
                (el) => {
                    return {
                        value: el?.totalCommission / 100000,
                        label: el?.dayOfWeek,
                        frontColor: '#177AD5',
                        topLabelComponent: () => (
                            <Text style={{ color: 'blue', marginBottom: 6, fontSize: 12 }}>{el?.totalCommission / 100000}</Text>
                        ),
                    }
                })
            setChart(temp);

        } else if (type === 'monthlyCommission') {
            let temp = item?.monthlyCommission?.map(
                (el) => {
                    return {
                        value: el?.totalCommission / 100000,
                        label: el?.month,
                        frontColor: '#177AD5',
                        topLabelComponent: () => (
                            <Text style={{ color: 'blue', marginBottom: 6, fontSize: 12 }}>{el?.totalCommission / 100000}</Text>
                        ),

                    }
                })
            setChart(temp);
        } else if (type === 'yearlyCommission') {
            let temp = item?.yearlyCommission?.map(
                (el) => {
                    return {
                        value: el?.totalCommission / 100000,
                        label: el?.year,
                        frontColor: '#177AD5',
                        topLabelComponent: () => (
                            <Text style={{ color: 'blue', marginBottom: 6, fontSize: 12 }}>{el?.totalCommission / 100000}</Text>
                        ),
                    }
                })
            setChart(temp);
        }
    }

    const barData = [
        { value: 250, label: 'M' },
        { value: 500, label: 'T', frontColor: '#177AD5' },
        { value: 745, label: 'W', frontColor: '#177AD5' },
        { value: 320, label: 'T' },
        { value: 600, label: 'F', frontColor: '#177AD5' },
        { value: 256, label: 'S' },
        { value: 300, label: 'S' },
    ];
    return (
        <View
            style={{
                margin: 20,
                ...shadow1,
                backgroundColor: 'white',
                paddingHorizontal: 20,
                borderRadius: 10,
                paddingBottom: 20
            }}
        >
            {!isLoading ? <View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: 10
                }}>
                    <CustomText
                        fontSize={25}
                        marginBottom={5}
                        fontWeight="700"
                    // marginBottom={15}
                    >Commission</CustomText>
                    <View style={{ width: 120 }} >
                        {/* dropdown m label nhi dalne pr ios app crash ho jati h */}
                        <DropdownRNE
                            arrOfObj={[
                                { name: 'Weekly', _id: 'weeklyCommission' },
                                { name: 'Monthly', _id: 'monthlyCommission' },
                                { name: 'Yearly', _id: 'yearlyCommission' }
                            ]}
                            initialValue={'weeklyCommission'}
                            keyValueGetOnSelect="_id"
                            keyValueShowInBox="name"
                            label="a"
                            placeholder=" "
                            onChange={(a) => handleSelect(a)}
                            labelTextStyle={{ color: 'white' }}
                        />
                    </View>
                </View>
                {chart?.length > 0 ? <View
                    style={{
                        flex: 1,
                        justifyContent: 'center', alignItems: 'center'
                    }}
                >
                    <BarChart
                        barWidth={25}
                        barBorderRadius={4}
                        frontColor="lightgray"
                        data={chart || []}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        noOfSections={5}
                        yAxisLabelSuffix={'L'}
                        width={WIDTH - 140}

                    />
                </View> :
                    <NoDataIcon />}
                {/* <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <VictoryChart
                        width={WIDTH * 0.88}
                        domainPadding={20}
                        theme={VictoryTheme.material}
                    >
                        <VictoryBar
                            data={commission[whichGraph]}
                            x={commissionFilter[whichGraph]}
                            y={'totalCommission'}
                            barWidth={({ index }) => index * 2 + 8}
                            categories={{
                                x: [...category[whichGraph]]
                            }}
                        />
                    </VictoryChart>
                </View> */}
                {/* <View style={{ marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                    {true ? <BarChart
                        data={barData}
                        yAxisThickness={2}
                        xAxisThickness={2}
                        barWidth={15}
                        noOfSections={4}
                        barBorderRadius={4}
                        width={WIDTH * 0.6}
                        // xAxisIndicesWidth={200}
                        formatYLabel={(e) => {
                            const aa = parseInt(Number(e) / 1000);
                            return aa
                        }}
                        yAxisTextStyle={{ marginRight: 10 }}
                        yAxisLabelSuffix={'k'}
                    /> :
                        <NoDataIcon />
                    }
                </View> */}

            </View> :
                <Loader />
            }
        </View>
    )
}

export default CommissionGraph

const styles = StyleSheet.create({})

const Loader = () => {
    return <View>
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
            paddingVertical: 20
        }}>
            <SkeletonView
                wrapperStyle={{
                    width: 100,
                    height: 25,
                    borderRadius: 10
                }}
            />
            <SkeletonView
                wrapperStyle={{
                    width: 140,
                    height: 30,
                    borderRadius: 10
                }}
            />
        </View>
        <View
            style={{
                height: 70,
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <ActivityIndicator />
        </View>
    </View>
}