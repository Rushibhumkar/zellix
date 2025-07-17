import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'
import CustomText from '../../myComponents/CustomText/CustomText';
import { color } from '../../const/color';
import { roleHRM, statusColor, statusHRM } from '../../utils/hrmKeysMatchToBE';

interface TRowEmployee {
    containerStyle?: StyleProp<ViewStyle>;
    onPress: () => void;
    item: {
        name: string;
        role: string;
        status: string;
        customId: string;
    }
}
const RowEmployee = ({
    containerStyle,
    onPress,
    item
}: TRowEmployee) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
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
                <CustomText style={styles.text1}>
                    {item?.name}
                </CustomText>
                <CustomText style={styles.text2}>
                    {item?.customId}
                </CustomText>
            </View>
            <View style={styles.row2}>
                <CustomText style={styles.text1}>
                    {roleHRM[item?.role]}
                </CustomText>
                {/* <CustomText style={styles.text2}>03</CustomText> */}
            </View>
            <View style={styles.row3}>
                <CustomText
                    color={statusColor[item?.status]}
                    fontSize={14}
                    fontWeight='600'
                >{statusHRM[item?.status]}
                </CustomText>
                <CustomText style={styles.text2}>{``}</CustomText>
            </View>
        </TouchableOpacity>
    )
}

export default RowEmployee

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