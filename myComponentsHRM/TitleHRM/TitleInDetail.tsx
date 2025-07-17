import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'
import React from 'react'
import CustomText from '../../myComponents/CustomText/CustomText'
import { color } from '../../const/color';

interface TTitleInDetail {
    title: string;
    boxStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}
const TitleInDetail = ({
    title,
    boxStyle
}: TTitleInDetail) => {
    return (
        <View
            style={[{ marginBottom: 15 }, boxStyle]}
        >
            <CustomText
                fontSize={16}
                fontWeight='600'
                color={color.hrmYellowText}
                style={{
                    fontStyle: 'italic'
                }}
            >{title ?? 'N/A'}</CustomText>
        </View>
    )
}

export default TitleInDetail

const styles = StyleSheet.create({})