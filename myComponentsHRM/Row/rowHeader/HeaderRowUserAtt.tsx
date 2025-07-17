import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../myComponents/CustomText/CustomText'

const HeaderRowUserAtt = () => {
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
                gap: 5
            },
            ]}
        >
            <View style={styles.row1}>
                <CustomText
                    style={styles.text1}
                >
                    Date
                </CustomText>
            </View>
            <View style={styles.row2}>
                <CustomText
                    style={styles.text1}>
                    Punch-In
                </CustomText>
            </View>
            <View style={styles.row3}>
                <CustomText
                    style={styles.text1}
                    color={'white'}>
                    Punch-Out
                </CustomText>
                {/* <CustomText
                    style={styles.text2}>
                    {moment(item?.createdAt).format('DD/MM/YYYY')}
                </CustomText> */}
            </View>
            <View style={styles.row4}>
                <CustomText
                    style={styles.text1}>
                    Status
                </CustomText>
            </View>
        </View>
    )
}

export default HeaderRowUserAtt


const styles = StyleSheet.create({
    row1: {
        width: '24%',
        // justifyContent: 'flex-start',
        // alignItems: 'center',
        gap: 5
        // backgroundColor: 'red'
    },
    row2: {
        width: '24%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
        // backgroundColor: 'blue'
    },
    row3: {
        width: '24%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
        // backgroundColor: 'green'
    },
    row4: {
        width: '24%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
        // backgroundColor: 'red'
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