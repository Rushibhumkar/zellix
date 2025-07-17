import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'
import CustomText from '../../myComponents/CustomText/CustomText'
import { color } from '../../const/color';
import { roleHRM, statusAttend, statusHRM } from '../../utils/hrmKeysMatchToBE';

interface TRowAbsent {
    containerStyle: StyleProp<ViewStyle>;
    item: {
        name: string;
        role: string;
        status: string;
    },
    onPress: () => void;
}
const RowAbsent = ({
    containerStyle,
    item,
    onPress
}: TRowAbsent) => {
    return (
        <TouchableOpacity
            onPress={onPress}
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
                >{item?.name}</CustomText>
                <CustomText style={styles.text2}>ID</CustomText>
            </View>
            <View style={styles.row2}>
                <CustomText style={styles.text1}>{roleHRM[item?.role]}</CustomText>
                {/* <CustomText style={styles.text2}>03</CustomText> */}
            </View>
            <View style={styles.row3}>
                <CustomText
                    color={color.red}
                    fontWeight='600'
                    fontSize={14}
                >{statusAttend[item?.status]}</CustomText>
                <CustomText style={styles.text2}>{ }</CustomText>
            </View>
        </TouchableOpacity>
    )
}

export default RowAbsent

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
    },
    text2: {
        fontSize: 12,
        fontWeight: '300',
    }
})