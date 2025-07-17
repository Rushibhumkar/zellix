import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../myComponents/CustomText/CustomText'

const HeaderRowAttendance = () => {
    return (
        <View
            style={[{
                borderWidth: 0.5,
                borderColor: 'grey',
                padding: 10,
                borderRadius: 5,
                justifyContent: 'space-between',
                flexDirection: 'row',
                backgroundColor: 'black',
            },
            ]}
        >
            <View style={styles.row1}>
                <CustomText
                    style={styles.text1}
                >
                    Name
                    {/* {item?.name} */}
                </CustomText>
                <CustomText
                    style={styles.text2}>
                    {/* {roleHRM[item?.role]} */}
                    Role
                </CustomText>
            </View>
            <View style={styles.row2}>
                <CustomText
                    style={styles.text1}>
                    P.I.T
                </CustomText>
                <CustomText
                    style={styles.text2}
                    numberOfLines={1}
                >
                    Issue
                </CustomText>
            </View>
            <View style={styles.row3}>
                <CustomText
                    style={styles.text1}
                    color={'white'}>
                    Status
                    {/* {statusAttend[item?.status]} */}
                </CustomText>
                <CustomText
                    style={styles.text2}>
                    {/* {moment(item?.createdAt).format('DD/MM/YYYY')} */}
                    Date
                </CustomText>
            </View>
        </View>
    )
}

export default HeaderRowAttendance


const styles = StyleSheet.create({
    row1: {
        width: '50%',
        gap: 5,
        // backgroundColor: 'red'
    },
    row2: {
        width: '20%',
        gap: 5,
        justifyContent: 'center',
        alignItems: 'center'
        // backgroundColor: 'green'
    },
    row3: {
        width: '30%',
        gap: 5,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'blue'
    },
    text1: {
        fontSize: 14,
        fontWeight: '400',
        color: 'white'
    },
    text2: {
        fontSize: 12,
        fontWeight: '300',
        color: 'white'
    }
})