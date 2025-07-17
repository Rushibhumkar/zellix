import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomText from '../../myComponents/CustomText/CustomText'
import * as Progress from 'react-native-progress';
import { shadow1, shadow2 } from "../../const/globalStyle";
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/userSlice';
import moment from 'moment';
import DropdownRNE from '../../myComponents/DropdownRNE/DropdownRNE';
import { myConsole } from '../../hooks/useConsole';

const MeetingCard = ({
    item,
    isLoading
}) => {

    // myConsole('item', item)
    // const { meeting } = useSelector(selectUser);

    // const [meetingCount, setMeetingCount] = useState({
    //     schedule: 0,
    //     conducted: 0,
    //     reschedule: 0
    // })
    // const [filteredData, setFilteredData] = useState({
    //     week: [],
    //     month: [],
    //     year: [],
    // });

    // const handleFilter = (interval: 'week' | 'month' | 'year') => {
    //     let tempStatus = {
    //         schedule: 0,
    //         conducted: 0,
    //         reschedule: 0,
    //     }
    //     if (meeting?.length > 0) {
    //         filteredData?.[interval]?.forEach((el, i, arr) => {
    //             tempStatus[el?.meetings[el?.meetings?.length - 1]?.status]++;
    //         });
    //         for (const key in tempStatus) {
    //             if (tempStatus.hasOwnProperty(key)) {
    //                 const value = tempStatus[key];
    //                 tempStatus[key] = typeof value === 'number'
    //                     ? (value / filteredData?.[interval]?.length) : value;
    //             }
    //         }
    //         setMeetingCount(tempStatus)
    //     }
    // }



    // useEffect(() => {
    //     if (meeting?.length > 0) {
    //         // console.log("meetingdsfs", meeting)
    //         let temp = {
    //             week: meeting?.filter((el) => moment(el.scheduleDate, 'YYYY-MM-DD').diff(moment(), 'weeks') === 0),
    //             month: meeting?.filter((el) => moment(el.scheduleDate, 'YYYY-MM-DD').diff(moment(), 'months') === 0),
    //             year: [...meeting]
    //         }
    //         // console.log("temp", temp)
    //         setFilteredData(temp)
    //     }
    // }, [meeting])

    // useEffect(() => {
    //     if (filteredData?.week?.length > 0) {
    //         handleFilter('week')
    //     }
    // }, [filteredData?.week])
    // myConsole("meeting", meeting)

    const [bookingCount, setBookingCount] = useState({
        schedule: 0,
        conducted: 0,
        reschedule: 0
    })

    const handleSelectInterval = (interval: 'weekly' | 'monthly' | 'yearly') => {
        let temp = {
            schedule: 0,
            conducted: 0,
            reschedule: 0
        }
        // temp.schedule = item?.[interval]?.data?.[0]?.fraction;
        // temp.conducted = item?.[interval]?.data?.[1]?.fraction;
        // temp.reschedule = item?.[interval]?.data?.[2]?.fraction;
        temp.schedule = item?.[interval]?.data?.find((el) => el.status === 'schedule')?.fraction;
        temp.conducted = item?.[interval]?.data?.find((el) => el.status === 'conducted')?.fraction;
        temp.reschedule = item?.[interval]?.data?.find((el) => el.status === 'reschedule')?.fraction;
        setBookingCount(temp);
    }

    useEffect(() => {

        if (!!item?.weekly) {
            let temp = {
                schedule: 0,
                conducted: 0,
                reschedule: 0
            }
            temp.schedule = item?.['weekly']?.data?.find((el) => el.status === 'schedule')?.fraction;
            temp.conducted = item?.['weekly']?.data?.find((el) => el.status === 'conducted')?.fraction;
            temp.reschedule = item?.['weekly']?.data?.find((el) => el.status === 'reschedule')?.fraction;
            setBookingCount(temp);
        }
    }, [!!item?.weekly]);

    return (
        <View
            style={{
                marginHorizontal: 20,
                ...shadow2,
                backgroundColor: 'white',
                paddingHorizontal: 20,
                paddingBottom: 20,
                borderRadius: 10,
                marginVertical: 10
            }}
        >
            <View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: 10,

                    }}
                >
                    <CustomText
                        fontSize={25}
                        fontWeight="700"
                        marginBottom={15}

                    >Meetings</CustomText>
                    <View style={{ width: 150, marginBottom: 10 }}>
                        {/* dropdown m label nhi dalne pr ios app crash ho jati h */}
                        <DropdownRNE
                            arrOfObj={[
                                { name: 'Weekly', _id: 'weekly' },
                                { name: 'Monthly', _id: 'monthly' },
                                { name: 'Yearly', _id: 'yearly' }
                            ]}
                            initialValue={'weekly'}
                            keyValueGetOnSelect="_id"
                            keyValueShowInBox="name"
                            label="a"
                            placeholder=" "
                            onChange={(a) => handleSelectInterval(a)}
                            labelTextStyle={{ color: 'white' }}
                        />
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <View style={styles.center}>
                        <Progress.Circle
                            size={60}
                            indeterminate={false}
                            progress={bookingCount?.schedule || 0}
                            borderWidth={0}
                            color={'rgb(57,130,239)'}
                            thickness={8}
                            showsText={true}
                            textStyle={styles.textProg}
                        // borderColor={20}
                        />
                        <CustomText>Scheduled</CustomText>
                    </View>
                    <View style={styles.center}>
                        <Progress.Circle
                            size={60}
                            indeterminate={false}
                            progress={bookingCount?.conducted || 0}
                            borderWidth={0}
                            color={'rgb(29,198,36)'}
                            thickness={8}
                            showsText={true}
                            textStyle={styles.textProg}
                        // borderColor={20}
                        />
                        <CustomText>Conducted</CustomText>
                    </View>
                    <View style={styles.center}>
                        <Progress.Circle
                            size={60}
                            indeterminate={false}
                            progress={bookingCount?.reschedule || 0}
                            borderWidth={0}
                            color={'rgb(255,73,95)'}
                            thickness={8}
                            showsText={true}
                            textStyle={styles.textProg}
                        // borderColor={20}
                        />
                        <CustomText >Re-Scheduled</CustomText>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default MeetingCard

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        gap: 5,
    },
    textProg: {
        color: 'black',
        fontSize: 13,
        fontWeight: '400'
    }
})