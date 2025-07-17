import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomText from '../CustomText/CustomText'

const IllusionBox = ({
    title = 'N/A',
    value = 'N/A',
    onPress
}) => {
    return (
        <View
            style={{
                marginBottom: 15
            }}
        >
            <CustomText
                color="#000000"
                marginBottom={10}
                fontSize={16}
                fontWeight="500"
            >{title}
            </CustomText>
            <TouchableOpacity
                onPress={onPress}
                style={{
                    borderColor: "#000000",
                    backgroundColor: "#FFFFFF",
                    borderWidth: 0.5,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
                }}
            >
                <CustomText>{value}</CustomText>
            </TouchableOpacity>
        </View>
    )
}

export default IllusionBox

const styles = StyleSheet.create({})