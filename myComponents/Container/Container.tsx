import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import React, { ReactNode } from 'react'
import { HEIGHT } from '../../const/deviceInfo';
import { color } from '../../const/color';

interface TContainer {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

const Container = ({
    children,
    style
}: TContainer) => {
    return (
        <View style={[{ flex: 1, backgroundColor: color.white }, style]}>
            {children}
        </View>
    )
}

export default Container