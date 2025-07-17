import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'
import React from 'react'
import CustomBtn from '../CustomBtn/CustomBtn'
import { color } from '../../const/color'

interface TOutlineBtn {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}
const OutlineBtn = ({
    title,
    onPress,
    isLoading,
    disabled,
    containerStyle,
    textStyle
}: TOutlineBtn) => {
    return (
        <CustomBtn
            title={title}
            containerStyle={[{
                backgroundColor: 'white',
                borderWidth: 2,
                borderColor: color.saffronMango
            }, containerStyle]}
            textStyle={[{
                color: color.saffronMango,
            }, textStyle]}
            onPress={onPress}
            isLoading={isLoading}
            disabled={disabled}
            isLoaderColor={color.saffronMango}
        />
    )
}

export default OutlineBtn

const styles = StyleSheet.create({})