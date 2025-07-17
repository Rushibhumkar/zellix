import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'
import CustomText from '../../myComponents/CustomText/CustomText'
import { roleHRM } from '../../utils/hrmKeysMatchToBE';
import moment from 'moment';


interface TRowOnLeave {
    containerStyle?: StyleProp<ViewStyle>;
    item: {
        name: string;
        role: string;
        days: number;
        createdAt: string;
        status: string;
    };
    onPress: () => void;
}
const RowOnLeave = ({
    containerStyle,
    item,
    onPress
}: TRowOnLeave) => {
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
                >{item?.name ?? 'N/A'}</CustomText>
                <CustomText style={styles.text2}>{roleHRM[item?.role]}</CustomText>
            </View>
            <View style={styles.row2}>
                <CustomText style={styles.text1}>Days</CustomText>
                <CustomText style={styles.text2}>{item?.days}</CustomText>
            </View>
            <View style={styles.row3}>
                <CustomText style={styles.text1}>Applied On</CustomText>
                <CustomText style={styles.text2}>{moment(item.createdAt).format('DD/MM/YYYY')}</CustomText>
            </View>
        </TouchableOpacity>
    )
}

export default RowOnLeave

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