import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../myComponents/CustomText/CustomText'
import { color } from '../../../const/color'

const HeaderRowEmployee = () => {
    return (
        <View
            style={[{
                borderWidth: 0.5,
                borderColor: 'grey',
                padding: 10,
                borderRadius: 5,
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginBottom: 10,
                backgroundColor: color.darkBlack
            },
            ]}
        >
            <View style={styles.row1}>
                <CustomText style={styles.text1}>
                    Name
                </CustomText>
                <CustomText style={styles.text2}>
                    {'Custom Id'}
                </CustomText>
            </View>
            <View style={styles.row2}>
                <CustomText style={styles.text1}>
                    Role
                    {/* {roleHRM[item?.role]} */}
                </CustomText>
                {/* <CustomText style={styles.text2}>03</CustomText> */}
            </View>
            <View style={styles.row3}>
                <CustomText
                    color={'white'}
                    fontSize={14}
                    fontWeight='600'
                >Status
                </CustomText>
                <CustomText style={styles.text2}>{``}</CustomText>
            </View>
        </View>
    )
}

export default HeaderRowEmployee


const styles = StyleSheet.create({
    row1: {
        width: '50%',
        gap: 5
        // backgroundColor: 'red'
    },
    row2: {
        width: '20%',
        gap: 5
        // backgroundColor: 'green'
    },
    row3: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
        // backgroundColor: 'blue'
    },
    text1: {
        fontSize: 14,
        fontWeight: '400',
        color: 'white',
        // marginBottom: 5
    },
    text2: {
        fontSize: 12,
        fontWeight: '300',
        color: 'white',
        // marginBottom: 5
    }
})