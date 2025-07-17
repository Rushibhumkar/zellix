import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { WIDTH } from '../../const/deviceInfo'
import { color } from '../../const/color'

const LoadingCompo = () => {
    return (
        <View
            style={{ justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: WIDTH }}
        >
            <ActivityIndicator
                color={color.saffronMango}
                size={'large'}
            />
        </View>
    )
}

export default LoadingCompo

