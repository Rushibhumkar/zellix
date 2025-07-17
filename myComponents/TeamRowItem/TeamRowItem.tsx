import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { color } from '../../const/color'
import { shadow1, shadowLight } from '../../const/globalStyle'
import { string } from 'yup'

interface TeamRowItem {
    serial: number;
    teamName: string;
    managerName: string;
    teamLeadName: string;
    onLongPress: () => void;
    isSelected: boolean;
    bgColor: string;
}

const TeamRowItem = ({
    serial,
    teamName,
    managerName,
    teamLeadName,
    onLongPress,
    isSelected,
    bgColor
}: TeamRowItem) => {
    return (

        <TouchableOpacity
            style={[styles.container, { backgroundColor: isSelected ? color.selectedBg : bgColor ? bgColor : color.listCardBg }]}
            activeOpacity={1}
            onLongPress={!!onLongPress ? onLongPress : undefined}
        >
            {typeof (serial) === 'string' ?
                <Text
                    numberOfLines={2}
                    style={styles.box1}
                >
                    {serial}
                </Text> :
                <Text
                    numberOfLines={2}
                    style={styles.box1}
                >
                    {serial < 10 && '0'}{serial}
                </Text>}
            <Text
                numberOfLines={2}
                style={styles.box2}
            >
                {teamName}
            </Text>
            <Text
                numberOfLines={2}
                style={styles.box3}
            >
                {managerName}
            </Text>
            <Text
                numberOfLines={2}
                style={styles.box4}
            >
                {teamLeadName}
            </Text>
        </TouchableOpacity>
    )
}

export default TeamRowItem

const styles = StyleSheet.create({
    container: {
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderColor: color.saffronMango,
        backgroundColor: color.white,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadow1,
        marginHorizontal: 20,
    },
    box1: {
        width: '10%',
        paddingRight: 3,
        fontSize: 14,
        fontWeight: '400',
    },
    box2: {
        width: '30%',
        paddingRight: 3,
        fontSize: 14,
        fontWeight: '700'
    },
    box3: {
        width: '30%',
        paddingRight: 3,
        fontSize: 14,
        fontWeight: '400'
    },
    box4: {
        width: '30%',
        fontSize: 14,
        fontWeight: '400'
    },

})