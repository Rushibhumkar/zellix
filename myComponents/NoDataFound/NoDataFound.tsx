import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../CustomText/CustomText'
import { shadow2 } from '../../const/globalStyle'
import NoDataIcon from '../../assets/svg/NoDataIcon'

interface TNoDataFound {
    height?: number;
    width?: number;
}
const NoDataFound = ({
    height,
    width
}: TNoDataFound) => {
    return (
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height ?? 400
            }}
        >
            <NoDataIcon
                height={height}
                width={width}
            />
        </View>
    )
}

export default NoDataFound

const styles = StyleSheet.create({})