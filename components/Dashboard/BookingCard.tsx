import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from 'react-native-progress';
import { shadow1 } from "../../const/globalStyle";
import CustomText from "../../myComponents/CustomText/CustomText";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import moment from "moment";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { myConsole } from "../../hooks/useConsole";

const BookingCard = ({
    item
}) => {
    // const { bookings } = useSelector(selectUser);
    //
    const [bookingCount, setBookingCount] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    })

    const handleSelectInterval = (interval: 'weekly' | 'monthly' | 'yearly') => {
        let temp = {
            pending: 0,
            approved: 0,
            rejected: 0
        }
        temp.pending = item?.[interval]?.data?.find((el) => el.status === 'pending')?.fraction;
        temp.approved = item?.[interval]?.data?.find((el) => el.status === 'approved')?.fraction;
        temp.rejected = item?.[interval]?.data?.find((el) => el.status === 'rejected')?.fraction;
        setBookingCount(temp);
    }

    useEffect(() => {
        let temp = {
            pending: 0,
            approved: 0,
            rejected: 0
        }
        temp.pending = item?.['weekly']?.data?.find((el) => el.status === 'pending')?.fraction;  //item?.[interval];
        temp.approved = item?.['weekly']?.data?.find((el) => el.status === 'approved')?.fraction;
        temp.rejected = item?.['weekly']?.data?.find((el) => el.status === 'rejected')?.fraction;
        setBookingCount(temp);
    }, [!!item?.weekly]);

    // const [filteredData, setFilteredData] = useState({
    //     week: [],
    //     month: [],
    //     year: [],
    // });

    // const handleFilter = (interval: 'week' | 'month' | 'year') => {
    //     let tempStatus = {
    //         approved: 0,
    //         rejected: 0,
    //         pending: 0,
    //     }
    //     if (bookings?.length > 0) {
    //         filteredData?.[interval]?.forEach((el, i, arr) => {
    //             tempStatus[el?.status]++;
    //         });
    //         for (const key in tempStatus) {
    //             if (tempStatus.hasOwnProperty(key)) {
    //                 const value = tempStatus[key];
    //                 tempStatus[key] = typeof value === 'number'
    //                     ? (value / filteredData?.[interval]?.length) : value;
    //             }
    //         }
    //         setBookingCount(tempStatus)
    //     }
    // }

    // useEffect(() => {
    //     if (bookings?.length > 0) {
    //         let temp = {
    //             week: bookings?.filter((el) => moment(el.createdAt, 'YYYY-MM-DD').diff(moment(), 'weeks') === 0),
    //             month: bookings?.filter((el) => moment(el.createdAt, 'YYYY-MM-DD').diff(moment(), 'months') === 0),
    //             year: [...bookings]
    //         }
    //         setFilteredData(temp)
    //     }
    // }, [bookings])

    // useEffect(() => {
    //     if (filteredData?.week?.length > 0) {
    //         handleFilter('week')
    //     }
    // }, [filteredData?.week])
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
            <View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: 10
                }}>
                    <CustomText
                        fontSize={25}
                        fontWeight="700"
                        marginBottom={15}
                    >Bookings</CustomText>
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
                            // progress={!isNaN(bookingCount?.approved) ? bookingCount?.approved : 0}
                            progress={bookingCount?.approved || 0}
                            borderWidth={0}
                            color={'rgb(27,195,36)'}
                            thickness={8}
                            showsText={true}
                            textStyle={styles.textProg}
                        // borderColor={20}
                        />
                        <CustomText>Approved</CustomText>
                    </View>
                    <View style={styles.center}>
                        <Progress.Circle
                            size={60}
                            indeterminate={false}
                            // progress={!isNaN(bookingCount?.rejected) ? bookingCount?.rejected : 0}
                            progress={bookingCount?.rejected || 0}
                            borderWidth={0}
                            color={'rgb(207,0,1)'}
                            thickness={8}
                            showsText={true}
                            textStyle={styles.textProg}
                        // borderColor={20}
                        />
                        <CustomText>Rejected</CustomText>
                    </View>
                    <View style={styles.center}>
                        <Progress.Circle
                            size={60}
                            indeterminate={false}
                            // progress={!isNaN(bookingCount?.pending) ? bookingCount?.pending : 0}
                            // progress={0.10}
                            progress={bookingCount?.pending || 0}
                            borderWidth={0}
                            color={'rgb(254,219,50)'}
                            thickness={8}
                            showsText={true}
                            textStyle={styles.textProg}
                        // borderColor={20}
                        />
                        <CustomText >Pending</CustomText>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default BookingCard

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
});