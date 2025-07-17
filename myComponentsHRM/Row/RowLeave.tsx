import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import React from 'react'
import CustomText from '../../myComponents/CustomText/CustomText'
import { color } from '../../const/color';


interface TRowLeave {
    containerStyle?: StyleProp<ViewStyle>;
}
const RowLeave = ({
    containerStyle
}: TRowLeave) => {
    return (
        <View
            style={[{
                borderWidth: 0.5,
                borderColor: 'grey',
                padding: 10,
                borderRadius: 5,
                justifyContent: 'space-between',
                flexDirection: 'row'
            },
                containerStyle
            ]}
        >
            <View style={styles.row1}>
                <CustomText
                    style={styles.text1}
                >Shubhangi Upreti</CustomText>
                <CustomText style={styles.text2}>ID</CustomText>
            </View>
            <View style={styles.row2}>
                <CustomText style={styles.text1}>Agent</CustomText>
                {/* <CustomText style={styles.text2}>03</CustomText> */}
            </View>
            <View style={styles.row3}>
                <CustomText
                    color={color.approve}
                    fontSize={14}
                    fontWeight='600'
                >Approved</CustomText>
                <CustomText style={styles.text2}>10/10/2023</CustomText>
            </View>
        </View>
    )
}

export default RowLeave

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
        // marginBottom: 5
    },
    text2: {
        fontSize: 12,
        fontWeight: '300',
        // marginBottom: 5
    }
})